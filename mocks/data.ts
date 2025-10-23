import type { NotificationClickEvent } from '../www/models/NotificationClicked';
import { OSNotification } from '../www/OSNotification';
import { deepMerge } from './deepmerge';

type OSNotificationProps = Omit<OSNotification, 'display'>;

export const mockNotification = (
  props: Partial<OSNotificationProps> = {},
): OSNotification => {
  return new OSNotification(
    deepMerge<OSNotificationProps>(
      {
        body: 'Test Notification',
        rawPayload: '{"test": "payload"}',
        additionalData: {},
        notificationId: '123',
        title: 'Test Title',
      },
      props,
    ),
  );
};

export const mockNotificationClickEvent = (
  props: Partial<NotificationClickEvent> = {},
): NotificationClickEvent => {
  return deepMerge<NotificationClickEvent>(
    {
      result: {
        actionId: 'test',
        url: 'https://test.com',
      },
      notification: mockNotification(),
    },
    props,
  );
};
