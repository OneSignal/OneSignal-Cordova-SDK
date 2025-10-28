import { mockCordova, mockExec } from '../mocks/cordova';
import PushSubscription from './PushSubscriptionNamespace';
import User, { type UserChangedState } from './UserNamespace';

const USER_CHANGED_STATE: UserChangedState = {
  current: { onesignalId: 'test-onesignal-id', externalId: 'test-external-id' },
};

const LABEL = 'user_id';
const EMAIL = 'test@example.com';
const SMS_NUMBER = '+1234567890';
const ONESIGNAL_ID = 'test-onesignal-id';
const EXTERNAL_ID = 'test-external-id';

describe('User', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    mockCordova();
  });

  test('should instantiate User class', () => {
    expect(user).toBeInstanceOf(User);
  });

  test('should have pushSubscription property', () => {
    expect(user.pushSubscription).toBeInstanceOf(PushSubscription);
  });

  describe('setLanguage', () => {
    test('should call cordova.exec with correct parameters', () => {
      const language = 'en';

      user.setLanguage(language);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'setLanguage',
        [language],
      );
    });
  });

  describe('addAlias', () => {
    test('should call cordova.exec with correct parameters', () => {
      const id = '12345';

      user.addAlias(LABEL, id);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addAliases',
        [{ [LABEL]: id }],
      );
    });
  });

  describe('addAliases', () => {
    test('should call cordova.exec with correct parameters', () => {
      const aliases = { [LABEL]: '12345', custom_id: 'abc-123' };

      user.addAliases(aliases);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addAliases',
        [aliases],
      );
    });

    test('should handle empty aliases object', () => {
      const aliases = {};

      user.addAliases(aliases);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addAliases',
        [aliases],
      );
    });
  });

  describe('removeAlias', () => {
    test('should call cordova.exec with correct parameters', () => {
      user.removeAlias(LABEL);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removeAliases',
        [LABEL],
      );
    });
  });

  describe('removeAliases', () => {
    test('should call cordova.exec with correct parameters', () => {
      const labels = [LABEL, 'custom_id', 'external_id'];

      user.removeAliases(labels);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removeAliases',
        labels,
      );
    });

    test('should handle empty array', () => {
      const labels: string[] = [];

      user.removeAliases(labels);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removeAliases',
        labels,
      );
    });
  });

  describe('addEmail', () => {
    test('should call cordova.exec with correct parameters', () => {
      user.addEmail(EMAIL);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addEmail',
        [EMAIL],
      );
    });
  });

  describe('removeEmail', () => {
    test('should call cordova.exec with correct parameters', () => {
      user.removeEmail(EMAIL);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removeEmail',
        [EMAIL],
      );
    });
  });

  describe('addSms', () => {
    test('should call cordova.exec with correct parameters', () => {
      user.addSms(SMS_NUMBER);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addSms',
        [SMS_NUMBER],
      );
    });
  });

  describe('removeSms', () => {
    test('should call cordova.exec with correct parameters', () => {
      user.removeSms(SMS_NUMBER);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removeSms',
        [SMS_NUMBER],
      );
    });
  });

  describe('addTag', () => {
    test('should call cordova.exec with correct parameters', () => {
      const key = 'level';
      const value = 'premium';

      user.addTag(key, value);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addTags',
        [{ [key]: value }],
      );
    });
  });

  describe('addTags', () => {
    test('should call cordova.exec with correct parameters', () => {
      const tags = { level: 'premium', status: 'active' };

      user.addTags(tags);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addTags',
        [tags],
      );
    });

    test('should convert non-string values to JSON strings', () => {
      const tags = { count: 42, active: true, data: { nested: 'value' } };

      user.addTags(tags);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addTags',
        [{ count: '42', active: 'true', data: '{"nested":"value"}' }],
      );
    });
  });

  describe('removeTag', () => {
    test('should call cordova.exec with correct parameters', () => {
      const key = 'level';

      user.removeTag(key);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removeTags',
        [key],
      );
    });
  });

  describe('removeTags', () => {
    test('should call cordova.exec with correct parameters', () => {
      const keys = ['level', 'status', 'premium'];

      user.removeTags(keys);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removeTags',
        keys,
      );
    });

    test('should handle empty array', () => {
      const keys: string[] = [];

      user.removeTags(keys);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removeTags',
        keys,
      );
    });
  });

  describe('getTags', () => {
    test('should return a Promise and call cordova.exec', () => {
      const promise = user.getTags();

      expect(promise).toBeInstanceOf(Promise);
      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'getTags',
        [],
      );
    });

    test('should resolve with tags object when cordova.exec succeeds', async () => {
      const testTags = { level: 'premium', status: 'active', count: '5' };

      mockExec.mockImplementation((resolve) => {
        resolve(testTags);
      });

      const result = await user.getTags();

      expect(result).toEqual(testTags);
    });

    test('should reject Promise when cordova.exec fails', async () => {
      mockExec.mockImplementation((resolve, reject) => {
        reject(new Error('Failed to get tags'));
      });

      const promise = user.getTags();
      await expect(promise).rejects.toThrow('Failed to get tags');
    });
  });

  describe('addEventListener', () => {
    test('should add listener to observer list and call cordova.exec', () => {
      const mockListener = vi.fn();

      user.addEventListener('change', mockListener);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'addUserStateObserver',
        [],
      );
    });

    test('should call all listeners when user state changes', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();
      const mockListener3 = vi.fn();

      user.addEventListener('change', mockListener1);
      user.addEventListener('change', mockListener2);
      user.addEventListener('change', mockListener3);

      mockExec.mock.calls[0][0](USER_CHANGED_STATE);

      expect(mockListener1).toHaveBeenCalledWith(USER_CHANGED_STATE);
      expect(mockListener2).toHaveBeenCalledWith(USER_CHANGED_STATE);
      expect(mockListener3).toHaveBeenCalledWith(USER_CHANGED_STATE);
    });
  });

  describe('removeEventListener', () => {
    test('should remove listener from observer list', () => {
      const mockListener = vi.fn();

      user.addEventListener('change', mockListener);
      user.removeEventListener('change', mockListener);

      mockExec.mock.calls[0][0](USER_CHANGED_STATE);
      expect(mockListener).not.toHaveBeenCalled();
    });

    test('should only remove the specified listener', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();

      user.addEventListener('change', mockListener1);
      user.addEventListener('change', mockListener2);
      user.removeEventListener('change', mockListener1);

      mockExec.mock.calls[0][0](USER_CHANGED_STATE);
      expect(mockListener1).not.toHaveBeenCalled();
      expect(mockListener2).toHaveBeenCalledWith(USER_CHANGED_STATE);
    });
  });

  describe('getOnesignalId', () => {
    test('should return a Promise and call cordova.exec', () => {
      const promise = user.getOnesignalId();

      expect(promise).toBeInstanceOf(Promise);
      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'getOnesignalId',
        [],
      );
    });

    test('should resolve with onesignal id when cordova.exec succeeds', async () => {
      mockExec.mockImplementation((resolve) => {
        resolve(ONESIGNAL_ID);
      });

      const result = await user.getOnesignalId();

      expect(result).toBe(ONESIGNAL_ID);
    });

    test('should reject Promise when cordova.exec fails', async () => {
      mockExec.mockImplementation((resolve, reject) => {
        reject(new Error('Failed to get onesignal id'));
      });

      const promise = user.getOnesignalId();
      await expect(promise).rejects.toThrow('Failed to get onesignal id');
    });
  });

  describe('getExternalId', () => {
    test('should return a Promise and call cordova.exec', () => {
      const promise = user.getExternalId();

      expect(promise).toBeInstanceOf(Promise);
      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'getExternalId',
        [],
      );
    });

    test('should resolve with external id when cordova.exec succeeds', async () => {
      mockExec.mockImplementation((resolve) => {
        resolve(EXTERNAL_ID);
      });

      const result = await user.getExternalId();

      expect(result).toBe(EXTERNAL_ID);
    });

    test('should reject Promise when cordova.exec fails', async () => {
      mockExec.mockImplementation((resolve, reject) => {
        reject(new Error('Failed to get external id'));
      });

      const promise = user.getExternalId();
      await expect(promise).rejects.toThrow('Failed to get external id');
    });
  });
});
