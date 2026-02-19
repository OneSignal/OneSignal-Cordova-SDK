import { NotificationType } from '../models/NotificationType';
import { userDataFromJson } from '../models/UserData';
import type { UserData } from '../models/UserData';

export const IMAGE_NOTIFICATION_URL =
  'https://media.onesignal.com/automated_push_templates/ratings_template.png';

export const IMAGE_NOTIFICATION_PAYLOAD = {
  big_picture: IMAGE_NOTIFICATION_URL,
  ios_attachments: {
    image: IMAGE_NOTIFICATION_URL,
  },
} as const;

class OneSignalApiService {
  private static instance: OneSignalApiService;

  private appId = '';

  static getInstance(): OneSignalApiService {
    if (!OneSignalApiService.instance) {
      OneSignalApiService.instance = new OneSignalApiService();
    }
    return OneSignalApiService.instance;
  }

  setAppId(appId: string): void {
    this.appId = appId;
  }

  getAppId(): string {
    return this.appId;
  }

  async sendNotification(
    type: NotificationType,
    subscriptionId: string,
  ): Promise<boolean> {
    let headings: Record<string, string>;
    let contents: Record<string, string>;
    const extra: Record<string, unknown> = {};

    if (type === NotificationType.Simple) {
      headings = { en: 'Simple Notification' };
      contents = { en: 'This is a simple push notification' };
    } else if (type === NotificationType.WithImage) {
      headings = { en: 'Image Notification' };
      contents = { en: 'This notification includes an image' };
      extra.big_picture = IMAGE_NOTIFICATION_PAYLOAD.big_picture;
      extra.ios_attachments = IMAGE_NOTIFICATION_PAYLOAD.ios_attachments;
    } else {
      return false;
    }

    return this.postNotification(headings, contents, subscriptionId, extra);
  }

  async sendCustomNotification(
    title: string,
    body: string,
    subscriptionId: string,
  ): Promise<boolean> {
    return this.postNotification(
      { en: title },
      { en: body },
      subscriptionId,
      {},
    );
  }

  private async postNotification(
    headings: Record<string, string>,
    contents: Record<string, string>,
    subscriptionId: string,
    extra: Record<string, unknown>,
  ): Promise<boolean> {
    if (!this.appId || !subscriptionId) {
      return false;
    }

    try {
      const body = {
        app_id: this.appId,
        include_subscription_ids: [subscriptionId],
        headings,
        contents,
        ...extra,
      };

      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.onesignal.v1+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchUser(onesignalId: string): Promise<UserData | null> {
    if (!this.appId || !onesignalId) {
      return null;
    }

    try {
      const url = `https://api.onesignal.com/apps/${this.appId}/users/by/onesignal_id/${onesignalId}`;
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }
      const json = (await response.json()) as Record<string, unknown>;
      return userDataFromJson(json);
    } catch {
      return null;
    }
  }
}

export default OneSignalApiService;
