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
});
