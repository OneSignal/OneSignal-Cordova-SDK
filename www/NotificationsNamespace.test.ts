import { mockCordova, mockExec } from '../mocks/cordova';
import { mockNotification, mockNotificationClickEvent } from '../mocks/data';
import { NotificationWillDisplayEvent } from './NotificationReceivedEvent';
import Notifications, {
  OSNotificationPermission,
} from './NotificationsNamespace';
import * as helpers from './helpers';

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
      mockExec.mockImplementation((resolve) => {
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
      mockExec.mockImplementation((resolve) => {
        resolve(true);
      });

      const result = await notifications.getPermissionAsync();

      expect(result).toBe(true);
    });

    test('should reject Promise when cordova.exec fails', async () => {
      const mockError = new Error('Permission check failed');

      mockExec.mockImplementation((_resolve, reject) => {
        reject(mockError);
      });

      await expect(notifications.getPermissionAsync()).rejects.toThrow(
        mockError.message,
      );
    });
  });

  describe('permissionNative', () => {
    test('should return a Promise and call cordova.exec for permissionNative', () => {
      mockExec.mockImplementation((resolve) => {
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
      mockExec.mockImplementation((resolve) => {
        resolve(OSNotificationPermission.Authorized);
      });

      const result = await notifications.permissionNative();

      expect(result).toBe(OSNotificationPermission.Authorized);
    });

    test('should reject Promise when cordova.exec fails', async () => {
      const mockError = new Error('Permission check failed');

      mockExec.mockImplementation((_resolve, reject) => {
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
        mockExec.mockImplementation((resolve) => {
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
      mockExec.mockImplementation((resolve) => {
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
      mockExec.mockImplementation((resolve) => {
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
      mockExec.mockImplementation((resolve) => {
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
      await expect(notifications.canRequestPermission()).rejects.toThrow(
        mockError.message,
      );
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

      // Capture the callback before adding second listener
      const foregroundCallback = mockExec.mock.calls[0][0];

      const mockListener2 = vi.fn();
      notifications.addEventListener('foregroundWillDisplay', mockListener2);

      // can call display event listeners
      const notificationData = mockNotification();
      foregroundCallback(notificationData);

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

    test('should not add listener for unknown event type', () => {
      const mockListener = vi.fn();
      // @ts-expect-error - we want to test the addition of an unknown event type
      notifications.addEventListener('unknown', mockListener);

      expect(window.cordova.exec).not.toHaveBeenCalled();
    });

    test('should only register native handler once for multiple click listeners', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      // Add first listener - should register native handler
      notifications.addEventListener('click', handler1);
      expect(window.cordova.exec).toHaveBeenCalledTimes(1);

      // Add second listener - should NOT register native handler again
      notifications.addEventListener('click', handler2);
      expect(window.cordova.exec).toHaveBeenCalledTimes(1);

      // Add third listener - should still be only one registration
      notifications.addEventListener('click', handler3);
      expect(window.cordova.exec).toHaveBeenCalledTimes(1);

      // Trigger the event
      const clickData = mockNotificationClickEvent();
      mockExec.mock.calls[0][0](clickData);

      // All handlers should execute exactly once
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler1).toHaveBeenCalledWith(clickData);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledWith(clickData);
      expect(handler3).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledWith(clickData);
    });

    test('should only register native handler once for multiple foregroundWillDisplay listeners', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      notifications.addEventListener('foregroundWillDisplay', handler1);
      notifications.addEventListener('foregroundWillDisplay', handler2);

      expect(window.cordova.exec).toHaveBeenCalledTimes(1);
    });

    test('should only register native handler once for multiple permissionChange listeners', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      notifications.addEventListener('permissionChange', handler1);
      notifications.addEventListener('permissionChange', handler2);

      expect(window.cordova.exec).toHaveBeenCalledTimes(1);
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

    test('should not remove listener for unknown event type', () => {
      vi.spyOn(helpers, 'removeListener').mockImplementation(() => {});
      const mockListener = vi.fn();
      // @ts-expect-error - we want to test the removal of an unknown event type
      notifications.removeEventListener('unknown', mockListener);

      expect(helpers.removeListener).not.toHaveBeenCalled();
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

    test('should return true when permission is set via permission listener', () => {
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
