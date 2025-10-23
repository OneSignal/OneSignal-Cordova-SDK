import { mockCordova, mockExec } from '../mocks/cordova';
import { mockNotification, mockNotificationClickEvent } from '../mocks/data';
import { NotificationWillDisplayEvent } from './NotificationReceivedEvent';
import Notifications, {
  OSNotificationPermission,
} from './NotificationsNamespace';

describe('Notifications', () => {
  let notifications: Notifications;

  beforeEach(() => {
    notifications = new Notifications();
    mockCordova();
  });

  test('should instantiate Notifications class', () => {
    expect(notifications).toBeInstanceOf(Notifications);
  });

  describe('getPermissionAsync', () => {
    test('should return a Promise and call cordova.exec for getPermissionAsync', () => {
      mockExec.mockImplementation((resolve, reject) => {
        resolve(true);
      });

      const promise = notifications.getPermissionAsync();

      expect(promise).toBeInstanceOf(Promise);
      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'getPermissionInternal',
      );

      return promise;
    });

    test('should resolve Promise when cordova.exec succeeds', async () => {
      mockExec.mockImplementation((resolve, reject) => {
        resolve(true);
      });

      const result = await notifications.getPermissionAsync();

      expect(result).toBe(true);
    });

    test('should reject Promise when cordova.exec fails', async () => {
      const mockError = new Error('Permission check failed');

      mockExec.mockImplementation((resolve, reject) => {
        reject(mockError);
      });

      await expect(notifications.getPermissionAsync()).rejects.toThrow(
        mockError.message,
      );
    });
  });

  describe('permissionNative', () => {
    test('should return a Promise and call cordova.exec for permissionNative', () => {
      mockExec.mockImplementation((resolve, reject) => {
        resolve(OSNotificationPermission.Authorized);
      });

      const promise = notifications.permissionNative();

      expect(promise).toBeInstanceOf(Promise);
      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'permissionNative',
        [],
      );

      return promise;
    });

    test('should resolve with OSNotificationPermission enum value', async () => {
      mockExec.mockImplementation((resolve, reject) => {
        resolve(OSNotificationPermission.Authorized);
      });

      const result = await notifications.permissionNative();

      expect(result).toBe(OSNotificationPermission.Authorized);
    });

    test('should reject Promise when cordova.exec fails', async () => {
      const mockError = new Error('Permission check failed');

      mockExec.mockImplementation((resolve, reject) => {
        reject(mockError);
      });
      await expect(notifications.permissionNative()).rejects.toThrow(
        mockError.message,
      );
    });
  });

  describe('requestPermission', () => {
    test.each([[true], [false]])(
      'should call cordova.exec for requestPermission with fallbackToSettings %s',
      async (fallback) => {
        mockExec.mockImplementation((resolve, reject) => {
          resolve(true);
        });

        await notifications.requestPermission(fallback);

        expect(window.cordova.exec).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function),
          'OneSignalPush',
          'requestPermission',
          [fallback],
        );
      },
    );

    test('should use default fallbackToSettings of false when not provided', () => {
      mockExec.mockImplementation((resolve, reject) => {
        resolve(true);
      });

      const promise = notifications.requestPermission();

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'requestPermission',
        [false],
      );

      return promise;
    });
  });

  describe('canRequestPermission', () => {
    test('should return a Promise and call cordova.exec for canRequestPermission', () => {
      mockExec.mockImplementation((resolve, reject) => {
        resolve(true);
      });

      const promise = notifications.canRequestPermission();

      expect(promise).toBeInstanceOf(Promise);
      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'canRequestPermission',
        [],
      );

      return promise;
    });

    test('should resolve with boolean value', async () => {
      mockExec.mockImplementation((resolve, reject) => {
        resolve(false);
      });

      const result = await notifications.canRequestPermission();

      expect(result).toBe(false);
    });

    test('should reject Promise when cordova.exec fails', async () => {
      const mockError = new Error('Permission check failed');

      mockExec.mockImplementation((resolve, reject) => {
        reject(mockError);
      });
    });
  });

  describe('registerForProvisionalAuthorization', () => {
    test('should call cordova.exec with default handler', () => {
      notifications.registerForProvisionalAuthorization();

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'registerForProvisionalAuthorization',
        [],
      );
    });

    test('should call cordova.exec with custom handler', () => {
      const handler = vi.fn();
      notifications.registerForProvisionalAuthorization(handler);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        handler,
        expect.any(Function),
        'OneSignalPush',
        'registerForProvisionalAuthorization',
        [],
      );
      mockExec.mock.calls[0][0](true);
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  describe('addEventListener', () => {
    test('should call cordova.exec for click event listener', () => {
      const mockListener = vi.fn();
      notifications.addEventListener('click', mockListener);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addNotificationClickListener',
        [],
      );

      const mockListener2 = vi.fn();
      const clickEventData = mockNotificationClickEvent();
      notifications.addEventListener('click', mockListener2);

      // should call all listeners
      mockExec.mock.calls[0][0](clickEventData);
      expect(mockListener).toHaveBeenCalledWith(clickEventData);
      expect(mockListener2).toHaveBeenCalledWith(clickEventData);
    });

    test('should call cordova.exec for foregroundWillDisplay event listener', () => {
      const mockListener = vi.fn();
      notifications.addEventListener('foregroundWillDisplay', mockListener);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addForegroundLifecycleListener',
        [],
      );

      mockExec.mockClear();
      const mockListener2 = vi.fn();
      notifications.addEventListener('foregroundWillDisplay', mockListener2);

      // can call display event listeners
      const notificationData = mockNotification();
      mockExec.mock.calls[0][0](notificationData);

      const displayEvent = new NotificationWillDisplayEvent(notificationData);
      expect(mockListener).toHaveBeenCalledWith(displayEvent);
      expect(mockListener2).toHaveBeenCalledWith(displayEvent);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'proceedWithWillDisplay',
        [notificationData.notificationId],
      );
    });

    test('should call cordova.exec for permissionChange event listener', () => {
      const mockListener = vi.fn();
      notifications.addEventListener('permissionChange', mockListener);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addPermissionObserver',
        [],
      );

      const mockListener2 = vi.fn();
      notifications.addEventListener('permissionChange', mockListener2);

      // should call all listeners
      mockExec.mock.calls[0][0](true);
      expect(mockListener).toHaveBeenCalledWith(true);
      expect(mockListener2).toHaveBeenCalledWith(true);
    });
  });

  describe('removeEventListener', () => {
    test.each([
      ['click'],
      ['foregroundWillDisplay'],
      ['permissionChange'],
    ] as const)('should remove %s event listener', (eventType) => {
      const mockListener = vi.fn();
      notifications.addEventListener(eventType, mockListener);
      notifications.removeEventListener(eventType, mockListener);

      // No cordova.exec call for removeEventListener, just internal array manipulation
      expect(window.cordova.exec).toHaveBeenCalledTimes(1); // Only the addEventListener call

      mockExec.mock.calls[0][0]('some-data');
      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('clearAll', () => {
    test('should call cordova.exec for clearAll', () => {
      notifications.clearAll();

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'clearAllNotifications',
        [],
      );
    });
  });

  describe('removeNotification', () => {
    test('should call cordova.exec for removeNotification', () => {
      const notificationId = 123;
      notifications.removeNotification(notificationId);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removeNotification',
        [notificationId],
      );
    });

    test('should call cordova.exec for removeNotification with different IDs', () => {
      notifications.removeNotification(456);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removeNotification',
        [456],
      );
    });
  });

  describe('removeGroupedNotifications', () => {
    test('should call cordova.exec for removeGroupedNotifications', () => {
      const groupId = 'test-group-id';
      notifications.removeGroupedNotifications(groupId);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removeGroupedNotifications',
        [groupId],
      );
    });
  });

  describe('hasPermission (deprecated)', () => {
    test('should return false when _permission is undefined', () => {
      const result = notifications.hasPermission();
      expect(result).toBe(false);
    });

    test('should return true when permission is set via permission callback', () => {
      notifications._setPropertyAndObserver();
      mockExec.mock.calls[0][0](true);

      const result = notifications.hasPermission();
      expect(result).toBe(true);
    });

    test('should return test when permission is set via permission listener', () => {
      notifications._setPropertyAndObserver();
      const callback = mockExec.mock.calls.find(
        (call) => call[3] === 'addPermissionObserver',
      )?.[0];
      callback?.(true);

      const result = notifications.hasPermission();
      expect(result).toBe(true);
    });
  });
});
