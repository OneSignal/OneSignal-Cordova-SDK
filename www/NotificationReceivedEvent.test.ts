import { mockCordova } from '../mocks/cordova';
import { mockNotification } from '../mocks/mockNotification';
import { NotificationWillDisplayEvent } from './NotificationReceivedEvent';
import { OSNotification } from './OSNotification';

describe('NotificationWillDisplayEvent', () => {
  let notificationData = mockNotification();
  let notificationEvent: NotificationWillDisplayEvent;

  beforeEach(() => {
    mockCordova();
    notificationEvent = new NotificationWillDisplayEvent(notificationData);
  });

  test('should instantiate NotificationWillDisplayEvent class', () => {
    expect(notificationEvent).toBeInstanceOf(NotificationWillDisplayEvent);
  });

  test('should create OSNotification instance in constructor', () => {
    const notification = notificationEvent.getNotification();

    expect(notification).toBeInstanceOf(OSNotification);
    expect(notification.notificationId).toBe(notificationData.notificationId);
    expect(notification.body).toBe(notificationData.body);
    expect(notification.title).toBe(notificationData.title);
  });

  describe('preventDefault', () => {
    test('should call cordova.exec for preventDefault with default (false)', () => {
      notificationEvent.preventDefault();

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'preventDefault',
        [notificationData.notificationId, false],
      );
    });

    test('should call cordova.exec for preventDefault with discard true', () => {
      notificationEvent.preventDefault(true);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'preventDefault',
        [notificationData.notificationId, true],
      );
    });
  });

  describe('getNotification', () => {
    test('should return the OSNotification instance', () => {
      const notification1 = notificationEvent.getNotification();
      const notification2 = notificationEvent.getNotification();

      expect(notification1).toBeInstanceOf(OSNotification);
      expect(notification1.notificationId).toBe(
        notificationData.notificationId,
      );

      expect(notification1).toBe(notification2);
    });
  });
});
