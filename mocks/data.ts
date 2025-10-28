import { OSNotification, type ReceivedEvent } from '../www/OSNotification';
import type { NotificationClickEvent } from '../www/types/NotificationClicked';
import { deepMerge } from './deepmerge';

export const mockNotification = (
  props: Partial<ReceivedEvent> = {},
): OSNotification => {
  return new OSNotification(
    deepMerge<ReceivedEvent>(
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
