import { TOKEN } from '../mocks/constants';
import { mockCordova } from '../mocks/cordova';
import LiveActivities from './LiveActivitiesNamespace';
import type { LiveActivitySetupOptions } from './types/LiveActivities';

const ACTIVITY_ID = 'test-activity-id';
const ACTIVITY_TYPE = 'test-activity-type';

describe('LiveActivities', () => {
  let liveActivities: LiveActivities;

  beforeEach(() => {
    liveActivities = new LiveActivities();
    mockCordova();
  });

  test('should instantiate LiveActivities class', () => {
    expect(liveActivities).toBeInstanceOf(LiveActivities);
  });

  describe('enter', () => {
    test('should call cordova.exec for enter with required parameters', () => {
      liveActivities.enter(ACTIVITY_ID, TOKEN);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'enterLiveActivity',
        [ACTIVITY_ID, TOKEN],
      );
    });

    test('should call cordova.exec for enter with optional onSuccess and onFailure callbacks', () => {
      const onSuccess = vi.fn();
      const onFailure = vi.fn();

      liveActivities.enter(ACTIVITY_ID, TOKEN, onSuccess, onFailure);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        onSuccess,
        onFailure,
        'OneSignalPush',
        'enterLiveActivity',
        [ACTIVITY_ID, TOKEN],
      );
    });
  });

  describe('exit', () => {
    test('should call cordova.exec for exit with required parameters', () => {
      liveActivities.exit(ACTIVITY_ID);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'exitLiveActivity',
        [ACTIVITY_ID],
      );
    });

    test('should call cordova.exec for exit with optional onSuccess and onFailure callbacks', () => {
      const onSuccess = vi.fn();
      const onFailure = vi.fn();

      liveActivities.exit(ACTIVITY_ID, onSuccess, onFailure);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        onSuccess,
        onFailure,
        'OneSignalPush',
        'exitLiveActivity',
        [ACTIVITY_ID],
      );
    });
  });

  describe('setPushToStartToken', () => {
    test('should call cordova.exec for setPushToStartToken', () => {
      liveActivities.setPushToStartToken(ACTIVITY_TYPE, TOKEN);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'setPushToStartToken',
        [ACTIVITY_TYPE, TOKEN],
      );
    });
  });

  describe('removePushToStartToken', () => {
    test('should call cordova.exec for removePushToStartToken', () => {
      liveActivities.removePushToStartToken(ACTIVITY_TYPE);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'removePushToStartToken',
        [ACTIVITY_TYPE],
      );
    });
  });

  describe('setupDefault', () => {
    test('should call cordova.exec for setupDefault without options', () => {
      liveActivities.setupDefault();

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'setupDefaultLiveActivity',
        [undefined],
      );
    });

    test('should call cordova.exec for setupDefault with options', () => {
      const options: LiveActivitySetupOptions = {
        enablePushToStart: true,
        enablePushToUpdate: false,
      };

      liveActivities.setupDefault(options);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'setupDefaultLiveActivity',
        [options],
      );
    });
  });

  describe('startDefault', () => {
    test('should call cordova.exec for startDefault', () => {
      const attributes = { key1: 'value1', key2: 'value2' };
      const content = { title: 'Test Title', message: 'Test Message' };

      liveActivities.startDefault(ACTIVITY_ID, attributes, content);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'startDefaultLiveActivity',
        [ACTIVITY_ID, attributes, content],
      );
    });
  });
});
