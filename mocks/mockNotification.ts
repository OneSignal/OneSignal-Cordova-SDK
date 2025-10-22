import { OSNotification } from '../www/OSNotification';
import { deepMerge } from './deepmerge';

type OSNotificationProps = Partial<Omit<OSNotification, 'display'>>;

export const mockNotification = (props: OSNotificationProps = {}) => {
  return new OSNotification(
    deepMerge(
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
