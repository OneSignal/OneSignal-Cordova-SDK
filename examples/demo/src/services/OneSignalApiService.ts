import { CapacitorHttp } from '@capacitor/core';

import { NotificationType } from '../models/NotificationType';
import { userDataFromJson } from '../models/UserData';
import type { UserData } from '../models/UserData';

export const API_KEY = import.meta.env.VITE_ONESIGNAL_API_KEY?.trim();
const ANDROID_CHANNEL_ID = import.meta.env.VITE_ONESIGNAL_ANDROID_CHANNEL_ID as string | undefined;
const DEFAULT_ANDROID_CHANNEL_ID = 'b3b015d9-c050-4042-8548-dcc34aa44aa4';

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

  async sendNotification(type: NotificationType, subscriptionId: string): Promise<boolean> {
    let headings: Record<string, string>;
    let contents: Record<string, string>;
    const extra: Record<string, unknown> = {};

    switch (type) {
      case NotificationType.Simple:
        headings = { en: 'Simple Notification' };
        contents = { en: 'This is a simple push notification' };
        break;
      case NotificationType.WithImage:
        headings = { en: 'Image Notification' };
        contents = { en: 'This notification includes an image' };
        extra.big_picture =
          'https://media.onesignal.com/automated_push_templates/ratings_template.png';
        extra.ios_attachments = {
          image: 'https://media.onesignal.com/automated_push_templates/ratings_template.png',
        };
        break;
      case NotificationType.WithSound:
        headings = { en: 'Sound Notification' };
        contents = { en: 'This notification plays a custom sound' };
        extra.ios_sound = 'vine_boom.wav';
        extra.android_channel_id = ANDROID_CHANNEL_ID?.trim() || DEFAULT_ANDROID_CHANNEL_ID;
        break;
      default:
        return false;
    }

    return this.postNotification(headings, contents, subscriptionId, extra);
  }

  async sendCustomNotification(
    title: string,
    body: string,
    subscriptionId: string,
  ): Promise<boolean> {
    return this.postNotification({ en: title }, { en: body }, subscriptionId, {});
  }

  private async postNotification(
    headings: Record<string, string>,
    contents: Record<string, string>,
    subscriptionId: string,
    extra: Record<string, unknown>,
  ): Promise<boolean> {
    const body = {
      app_id: this.appId,
      include_subscription_ids: [subscriptionId],
      headings,
      contents,
      ...extra,
    };

    const maxAttempts = 3;

    // Retry on `invalid_player_ids` to absorb the brief race where the
    // subscription has been created locally but is not yet visible to the
    // /notifications endpoint.
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await CapacitorHttp.post({
          url: 'https://onesignal.com/api/v1/notifications',
          headers: {
            Accept: 'application/vnd.onesignal.v1+json',
            'Content-Type': 'application/json',
          },
          data: body,
        });

        if (response.status < 200 || response.status >= 300) {
          console.error(`Send notification failed: ${JSON.stringify(response.data)}`);
          return false;
        }

        const invalidIds = response.data?.errors?.invalid_player_ids;
        if (Array.isArray(invalidIds) && invalidIds.length > 0) {
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 3_000 * attempt));
            continue;
          }
          console.error(
            `Send notification failed: invalid_player_ids ${JSON.stringify(invalidIds)}`,
          );
          return false;
        }

        return true;
      } catch (err) {
        console.error(`Send notification error: ${String(err)}`);
        return false;
      }
    }

    return false;
  }

  async updateLiveActivity(
    activityId: string,
    event: 'update' | 'end',
    eventUpdates: Record<string, unknown> = {},
  ): Promise<boolean> {
    try {
      const url = `https://api.onesignal.com/apps/${this.appId}/live_activities/${encodeURIComponent(activityId)}/notifications`;
      const payload: Record<string, unknown> = {
        event,
        event_updates: eventUpdates,
        name: event === 'end' ? 'End Live Activity' : 'Live Activity Update',
        priority: 10,
      };

      if (event === 'end') {
        payload.dismissal_date = Math.floor(Date.now() / 1000);
      }

      const response = await CapacitorHttp.post({
        url,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Key ${API_KEY}`,
        },
        data: payload,
      });

      if (response.status < 200 || response.status >= 300) {
        console.error(`${event} live activity failed: ${JSON.stringify(response.data)}`);
        return false;
      }

      return true;
    } catch (err) {
      console.error(`${event} live activity error: ${String(err)}`);
      return false;
    }
  }

  async fetchUser(onesignalId: string): Promise<UserData | null> {
    try {
      const url = `https://api.onesignal.com/apps/${this.appId}/users/by/onesignal_id/${onesignalId}`;
      const response = await CapacitorHttp.get({ url });
      if (response.status < 200 || response.status >= 300) {
        console.warn(`fetchUser failed: ${response.status}`);
        return null;
      }
      return userDataFromJson(response.data as Record<string, unknown>);
    } catch (err) {
      console.error(`fetchUser error: ${String(err)}`);
      return null;
    }
  }
}

export default OneSignalApiService;
