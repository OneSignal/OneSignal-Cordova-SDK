import { beforeEach, describe, expect, test, vi } from 'vite-plus/test';

import { APP_ID } from '../mocks/constants';
import { mockCordova, mockExec } from '../mocks/cordova';
import { OneSignalPlugin } from './index';

describe('OneSignalPlugin', () => {
  let plugin: OneSignalPlugin;

  beforeEach(() => {
    plugin = new OneSignalPlugin();
    mockCordova();
  });

  test('should instantiate OneSignalPlugin', () => {
    expect(plugin).toBeInstanceOf(OneSignalPlugin);
  });

  test('should have all required namespaces', () => {
    expect(plugin.User).toBeDefined();
    expect(plugin.Debug).toBeDefined();
    expect(plugin.Session).toBeDefined();
    expect(plugin.Location).toBeDefined();
    expect(plugin.InAppMessages).toBeDefined();
    expect(plugin.Notifications).toBeDefined();
    expect(plugin.LiveActivities).toBeDefined();
  });

  test('should initialize with appId', () => {
    plugin.initialize(APP_ID);

    expect(window.cordova.exec).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      'OneSignalPush',
      'init',
      [APP_ID],
    );
    const observerCallback = mockExec.mock.calls[0][0];
    observerCallback();

    // should call getPushSubscriptionId
    expect(window.cordova.exec).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      'OneSignalPush',
      'getPushSubscriptionId',
    );
  });

  test('should not initialize with an empty appId', () => {
    plugin.initialize('');

    expect(window.cordova.exec).not.toHaveBeenCalled();
  });

  test('should call cordova.exec for login', () => {
    const externalId = 'test-user-123';
    plugin.login(externalId);

    expect(window.cordova.exec).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      'OneSignalPush',
      'login',
      [externalId],
    );
  });

  test('should not login with an empty externalId', () => {
    plugin.login('');

    expect(window.cordova.exec).not.toHaveBeenCalled();
  });

  test('should not login with a null externalId', () => {
    plugin.login(null as unknown as string);

    expect(window.cordova.exec).not.toHaveBeenCalled();
  });

  describe('loginWithProfile', () => {
    const success = {
      success: true,
      data: { onesignalId: 'os-id', externalId: 'user-1' },
      error: null,
    };

    test('should marshal arguments and resolve with the parsed result', async () => {
      mockExec.mockImplementation((resolve: (raw: unknown) => void) => resolve(success));

      const result = await plugin.loginWithProfile(
        'user-1',
        { email: 'a@b.co', tags: { level: 5 as unknown as string } },
        'jwt',
      );

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'loginWithProfile',
        ['user-1', { email: 'a@b.co', tags: { level: '5' } }, 'jwt'],
      );
      expect(result).toEqual(success);
    });

    test('should send a null jwt when omitted', async () => {
      mockExec.mockImplementation((resolve: (raw: unknown) => void) => resolve(success));

      await plugin.loginWithProfile('user-1', {});

      expect(mockExec.mock.calls[0][4]).toEqual(['user-1', {}, null]);
    });

    test('should resolve UNKNOWN when cordova.exec throws synchronously', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockExec.mockImplementation(() => {
        throw new Error('bridge gone');
      });

      const result = await plugin.loginWithProfile('user-1', {});

      expect(result.success).toBe(false);
      expect(result.error?.[0].code).toBe('UNKNOWN');
      expect(result.error?.[0].message).toBe('bridge gone');
      consoleSpy.mockRestore();
    });

    test('should resolve a malformed native result as an UNKNOWN failure', async () => {
      mockExec.mockImplementation((resolve: (raw: unknown) => void) => resolve('garbage'));

      const result = await plugin.loginWithProfile('user-1', {});

      expect(result.success).toBe(false);
      expect(result.error?.[0].code).toBe('UNKNOWN');
    });

    test.each([
      ['a message', 'Invalid action', 'Invalid action'],
      ['no message', undefined, 'Native call failed'],
    ])('should resolve a native error with %s as an UNKNOWN failure', async (_, error, message) => {
      mockExec.mockImplementation((_resolve: unknown, reject: (error: unknown) => void) =>
        reject(error),
      );

      const result = await plugin.loginWithProfile('user-1', {});

      expect(result).toEqual({
        success: false,
        data: null,
        error: [
          {
            code: 'UNKNOWN',
            source: 'CLIENT',
            backendCode: null,
            httpStatus: null,
            message,
            meta: null,
          },
        ],
      });
    });

    test('should resolve the unsupported envelope on iOS without calling native', async () => {
      window.cordova.platformId = 'ios';

      const result = await plugin.loginWithProfile('user-1', { email: 'a@b.co' });

      expect(result).toEqual({
        success: false,
        data: null,
        error: [
          {
            code: 'UNKNOWN',
            source: 'CLIENT',
            backendCode: null,
            httpStatus: null,
            message: 'loginWithProfile is only supported on Android',
            meta: null,
          },
        ],
      });
      expect(window.cordova.exec).not.toHaveBeenCalled();
    });

    test.each([
      ['an empty externalId', '', {}, undefined],
      ['a null externalId', null, {}, undefined],
      ['a missing profile', 'user-1', undefined, undefined],
      ['a non-string email', 'user-1', { email: 1 }, undefined],
      ['an empty jwt', 'user-1', {}, ''],
      ['a non-string jwt', 'user-1', {}, 5],
      ['an unserializable tag value', 'user-1', { tags: { big: BigInt(1) } }, undefined],
    ])(
      'should resolve INVALID_ARGUMENT without calling native for %s',
      async (_, externalId, profile, jwt) => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const result = await plugin.loginWithProfile(
          externalId as unknown as string,
          profile as unknown as object,
          jwt as unknown as string,
        );

        expect(result.success).toBe(false);
        expect(result.error?.[0].code).toBe('INVALID_ARGUMENT');
        expect(consoleSpy).toHaveBeenCalled();
        expect(window.cordova.exec).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
      },
    );
  });

  test('should call cordova.exec for logout', () => {
    plugin.logout();

    expect(window.cordova.exec).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      'OneSignalPush',
      'logout',
    );
  });

  test('should call cordova.exec for setConsentRequired', () => {
    plugin.setConsentRequired(true);

    expect(window.cordova.exec).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      'OneSignalPush',
      'setPrivacyConsentRequired',
      [true],
    );
  });

  test('should call cordova.exec for setConsentGiven', () => {
    plugin.setConsentGiven(true);

    expect(window.cordova.exec).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      'OneSignalPush',
      'setPrivacyConsentGiven',
      [true],
    );
  });

  test.each([null, undefined, 'true', 1, {}])(
    'should not call cordova.exec for consent setters with %s',
    (value) => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      plugin.setConsentRequired(value as unknown as boolean);
      plugin.setConsentGiven(value as unknown as boolean);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[OneSignal] setConsentRequired: required must be a boolean',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '[OneSignal] setConsentGiven: granted must be a boolean',
      );
      expect(window.cordova.exec).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    },
  );
});
