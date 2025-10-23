import {
  PREV_SUB_ID,
  PREV_SUB_TOKEN,
  SUB_ID,
  SUB_TOKEN,
} from '../mocks/constants';
import { mockCordova, mockExec } from '../mocks/cordova';
import PushSubscription, {
  type PushSubscriptionChangedState,
} from './PushSubscriptionNamespace';

const SUB_CHANGED_STATE: PushSubscriptionChangedState = {
  current: { id: SUB_ID, token: SUB_TOKEN, optedIn: true },
  previous: { id: PREV_SUB_ID, token: PREV_SUB_TOKEN, optedIn: false },
};

describe('PushSubscription', () => {
  let pushSubscription: PushSubscription;

  beforeEach(() => {
    pushSubscription = new PushSubscription();
    mockCordova();
    mockExec.mockClear();
  });

  test('should instantiate PushSubscription class', () => {
    expect(pushSubscription).toBeInstanceOf(PushSubscription);
  });

  describe('id (deprecated)', () => {
    test('should set id via getIdCallback', () => {
      pushSubscription._setPropertiesAndObserver();

      const getIdCallback = mockExec.mock.calls.find(
        (call) => call[3] === 'getPushSubscriptionId',
      )?.[0];
      getIdCallback?.(SUB_ID);
      expect(pushSubscription.id).toBe(SUB_ID);
    });

    test('should set id via addEventListener', () => {
      pushSubscription._setPropertiesAndObserver();

      const listener = mockExec.mock.calls.find(
        (call) => call[3] === 'addPushSubscriptionObserver',
      )?.[0];
      console.log(listener);
      listener?.({ current: { id: SUB_ID, token: SUB_TOKEN, optedIn: true } });
      expect(pushSubscription.id).toBe(SUB_ID);
    });
  });

  describe('token (deprecated)', () => {
    test('should set token via getTokenCallback', () => {
      pushSubscription._setPropertiesAndObserver();

      const getTokenCallback = mockExec.mock.calls.find(
        (call) => call[3] === 'getPushSubscriptionToken',
      )?.[0];
      getTokenCallback?.(SUB_TOKEN);
      expect(pushSubscription.token).toBe(SUB_TOKEN);
    });

    test('should set token via addEventListener', () => {
      pushSubscription._setPropertiesAndObserver();

      const listener = mockExec.mock.calls.find(
        (call) => call[3] === 'addPushSubscriptionObserver',
      )?.[0];
      console.log(listener);
      listener?.({ current: { id: SUB_ID, token: SUB_TOKEN, optedIn: true } });
      expect(pushSubscription.token).toBe(SUB_TOKEN);
    });
  });

  describe('optedIn (deprecated)', () => {
    test('should set optedIn via getOptedInCallback', () => {
      pushSubscription._setPropertiesAndObserver();

      const getOptedInCallback = mockExec.mock.calls.find(
        (call) => call[3] === 'getPushSubscriptionOptedIn',
      )?.[0];
      getOptedInCallback?.(true);
      expect(pushSubscription.optedIn).toBe(true);
    });

    test('should set optedIn via addEventListener', () => {
      pushSubscription._setPropertiesAndObserver();

      const listener = mockExec.mock.calls.find(
        (call) => call[3] === 'addPushSubscriptionObserver',
      )?.[0];
      listener?.({ current: { id: SUB_ID, token: SUB_TOKEN, optedIn: true } });
      expect(pushSubscription.optedIn).toBe(true);
    });
  });

  describe('getIdAsync', () => {
    test('should return a Promise and call cordova.exec', () => {
      mockExec.mockImplementation((resolve) => {
        resolve('test-id-123');
      });

      const promise = pushSubscription.getIdAsync();

      expect(promise).toBeInstanceOf(Promise);
      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'getPushSubscriptionId',
      );
    });

    test('should resolve with push subscription ID when cordova.exec succeeds', async () => {
      const testId = 'test-subscription-id-456';

      mockExec.mockImplementation((resolve) => {
        resolve(testId);
      });

      const result = await pushSubscription.getIdAsync();

      expect(result).toBe(testId);
    });

    test('should reject Promise when cordova.exec fails', async () => {
      const mockError = new Error('Failed to get subscription ID');

      mockExec.mockImplementation((resolve, reject) => {
        reject(mockError);
      });

      await expect(pushSubscription.getIdAsync()).rejects.toThrow(
        mockError.message,
      );
    });
  });

  describe('getTokenAsync', () => {
    test('should return a Promise and call cordova.exec', () => {
      mockExec.mockImplementation((resolve) => {
        resolve('test-token-abc');
      });

      const promise = pushSubscription.getTokenAsync();

      expect(promise).toBeInstanceOf(Promise);
      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'getPushSubscriptionToken',
      );
    });

    test('should resolve with push token when cordova.exec succeeds', async () => {
      const testToken = 'test-push-token-xyz';

      mockExec.mockImplementation((resolve) => {
        resolve(testToken);
      });

      const result = await pushSubscription.getTokenAsync();

      expect(result).toBe(testToken);
    });

    test('should reject Promise when cordova.exec fails', async () => {
      const mockError = new Error('Failed to get push token');

      mockExec.mockImplementation((resolve, reject) => {
        reject(mockError);
      });

      await expect(pushSubscription.getTokenAsync()).rejects.toThrow(
        mockError.message,
      );
    });
  });

  describe('getOptedInAsync', () => {
    test('should return a Promise and call cordova.exec', () => {
      mockExec.mockImplementation((resolve) => {
        resolve(true);
      });

      const promise = pushSubscription.getOptedInAsync();

      expect(promise).toBeInstanceOf(Promise);
      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'getPushSubscriptionOptedIn',
      );
    });

    test('should resolve with true when user is opted in', async () => {
      mockExec.mockImplementation((resolve) => {
        resolve(true);
      });

      const result = await pushSubscription.getOptedInAsync();

      expect(result).toBe(true);
    });

    test('should reject Promise when cordova.exec fails', async () => {
      const mockError = new Error('Failed to get opted in status');

      mockExec.mockImplementation((resolve, reject) => {
        reject(mockError);
      });

      await expect(pushSubscription.getOptedInAsync()).rejects.toThrow(
        mockError.message,
      );
    });
  });

  describe('addEventListener', () => {
    test('should add listener to observer list and call cordova.exec', () => {
      const mockListener = vi.fn();

      pushSubscription.addEventListener('change', mockListener);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addPushSubscriptionObserver',
        [],
      );
    });

    test('should call listener when subscription state changes', () => {
      const mockListener = vi.fn();
      pushSubscription.addEventListener('change', mockListener);

      // should call all listeners
      const mockListener2 = vi.fn();
      pushSubscription.addEventListener('change', mockListener2);

      mockExec.mock.calls[0][0](SUB_CHANGED_STATE);
      expect(mockListener).toHaveBeenCalledWith(SUB_CHANGED_STATE);
      expect(mockListener2).toHaveBeenCalledWith(SUB_CHANGED_STATE);
    });
  });

  describe('removeEventListener', () => {
    test('should remove listener from observer list', () => {
      const mockListener = vi.fn();

      pushSubscription.addEventListener('change', mockListener);
      pushSubscription.removeEventListener('change', mockListener);

      mockExec.mock.calls[0][0](SUB_CHANGED_STATE);
      expect(mockListener).not.toHaveBeenCalled();
    });

    test('should only remove the specified listener', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();

      pushSubscription.addEventListener('change', mockListener1);
      pushSubscription.addEventListener('change', mockListener2);
      pushSubscription.removeEventListener('change', mockListener1);
      mockExec.mock.calls[0][0](SUB_CHANGED_STATE);
      expect(mockListener1).not.toHaveBeenCalled();
      expect(mockListener2).toHaveBeenCalledWith(SUB_CHANGED_STATE);
    });
  });

  describe('optIn', () => {
    test('should call cordova.exec with correct parameters', () => {
      pushSubscription.optIn();

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'optInPushSubscription',
      );
    });
  });

  describe('optOut', () => {
    test('should call cordova.exec with correct parameters', () => {
      pushSubscription.optOut();

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'optOutPushSubscription',
      );
    });
  });
});
