import { mockCordova } from '../mocks/cordova';
import { OSNotification } from './OSNotification';

type RequireOptional<T> = Required<T>;
type AllProperties = RequireOptional<Omit<OSNotification, 'display'>>;

describe('OSNotification', () => {
  beforeEach(() => {
    mockCordova();
  });

  describe('constructor', () => {
    const props = {
      body: 'Some body',
      sound: 'Some sound',
      title: 'Some title',
      launchURL: 'Some launch URL',
      rawPayload: '{"test": "data"}',
      actionButtons: [{ id: 'Some button', text: 'Some text' }],
      additionalData: { custom: 'value' },
      notificationId: 'test-123',
      // android only
      groupKey: 'test-group',
      groupMessage: 'Some group message',
      groupedNotifications: [
        { id: '1', body: 'Some body' },
        { id: '2', body: 'Some body' },
      ],
      ledColor: 'FFFF0000',
      priority: 0,
      smallIcon: 'ic_stat_onesignal_default',
      largeIcon: 'ic_large_icon',
      bigPicture: 'https://example.com/image.png',
      collapseId: 'collapse-123',
      fromProjectNumber: '123456789',
      smallIconAccentColor: 'FF0000FF',
      lockScreenVisibility: '1',
      androidNotificationId: 987654321,
      // ios only
      badge: '5',
      badgeIncrement: '1',
      category: 'MESSAGE_CATEGORY',
      threadId: 'thread-123',
      subtitle: 'Some subtitle',
      templateId: 'template-456',
      templateName: 'Welcome Template',
      attachments: { id: 'image.jpg', url: 'https://example.com/image.jpg' },
      mutableContent: true,
      contentAvailable: '1',
      relevanceScore: 0.75,
      interruptionLevel: 'time-sensitive',
    } satisfies AllProperties;

    describe('rawPayload', () => {
      test('should parse rawPayload when it is a string', () => {
        const notification = new OSNotification({
          ...props,
          rawPayload: JSON.stringify({ key: 'value', nested: { data: true } }),
        });

        expect(notification.rawPayload).toEqual({
          key: 'value',
          nested: { data: true },
        });
      });

      test('should keep rawPayload as-is when it is already an object', () => {
        const payloadObj = { key: 'value', nested: { data: true } };
        const notification = new OSNotification({
          ...props,
          rawPayload: payloadObj,
        });

        expect(notification.rawPayload).toEqual(payloadObj);
      });
    });

    test('should instantiate OSNotification with required properties', () => {
      const notification = new OSNotification({
        notificationId: props.notificationId,
        body: props.body,
        rawPayload: props.rawPayload,
        additionalData: props.additionalData,
      });

      expect(notification).toBeInstanceOf(OSNotification);
      expect(notification.notificationId).toBe(props.notificationId);
      expect(notification.body).toBe(props.body);
      expect(notification.additionalData).toEqual(props.additionalData);
      expect(notification.rawPayload).toEqual(JSON.parse(props.rawPayload));
    });

    test('should handle all properties', () => {
      const notification = new OSNotification(props);

      const { rawPayload, ...rest } = props;

      for (const [key, value] of Object.entries(rest)) {
        expect(notification[key as keyof OSNotification]).toBe(value);
      }

      expect(notification.rawPayload).toEqual(JSON.parse(rawPayload));
    });

    describe('display', () => {
      test('should call cordova.exec with correct parameters', () => {
        const notification = new OSNotification(props);
        notification.display();

        expect(window.cordova.exec).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function),
          'OneSignalPush',
          'displayNotification',
          [props.notificationId],
        );
      });
    });
  });
});
