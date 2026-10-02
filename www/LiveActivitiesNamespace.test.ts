import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test';

import { SUB_TOKEN } from '../mocks/constants';
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
      liveActivities.enter(ACTIVITY_ID, SUB_TOKEN);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'enterLiveActivity',
        [ACTIVITY_ID, SUB_TOKEN],
      );
    });

    test('should call cordova.exec for enter with optional onSuccess and onFailure callbacks', () => {
      const onSuccess = vi.fn();
      const onFailure = vi.fn();

      liveActivities.enter(ACTIVITY_ID, SUB_TOKEN, onSuccess, onFailure);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        onSuccess,
        onFailure,
        'OneSignalPush',
        'enterLiveActivity',
        [ACTIVITY_ID, SUB_TOKEN],
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
      liveActivities.setPushToStartToken(ACTIVITY_TYPE, SUB_TOKEN);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'setPushToStartToken',
        [ACTIVITY_TYPE, SUB_TOKEN],
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

  describe('invalid input', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test.each([null, undefined, '', 1, {}])('does not call native for string arg %s', (value) => {
      const bad = value as unknown as string;

      liveActivities.enter(bad, SUB_TOKEN);
      liveActivities.enter(ACTIVITY_ID, bad);
      liveActivities.exit(bad);
      liveActivities.setPushToStartToken(bad, SUB_TOKEN);
      liveActivities.setPushToStartToken('Attrs', bad);
      liveActivities.removePushToStartToken(bad);
      liveActivities.startDefault(bad, {}, {});

      expect(consoleSpy).toHaveBeenCalledWith('[OneSignal] enter: activityId is required');
      expect(consoleSpy).toHaveBeenCalledWith('[OneSignal] enter: token is required');
      expect(consoleSpy).toHaveBeenCalledWith('[OneSignal] exit: activityId is required');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[OneSignal] setPushToStartToken: activityType is required',
      );
      expect(consoleSpy).toHaveBeenCalledWith('[OneSignal] setPushToStartToken: token is required');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[OneSignal] removePushToStartToken: activityType is required',
      );
      expect(consoleSpy).toHaveBeenCalledWith('[OneSignal] startDefault: activityId is required');
      expect(window.cordova.exec).not.toHaveBeenCalled();
    });

    test.each([null, 'x', 1, []])('does not call native for startDefault object %s', (value) => {
      const bad = value as unknown as object;

      liveActivities.startDefault(ACTIVITY_ID, bad, {});
      liveActivities.startDefault(ACTIVITY_ID, {}, bad);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[OneSignal] startDefault: attributes must be an object',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '[OneSignal] startDefault: content must be an object',
      );
      expect(window.cordova.exec).not.toHaveBeenCalled();
    });

    test.each([null, 'x', 1, []])('does not call native for setupDefault options %s', (value) => {
      liveActivities.setupDefault(value as unknown as LiveActivitySetupOptions);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[OneSignal] setupDefault: options must be an object',
      );
      expect(window.cordova.exec).not.toHaveBeenCalled();
    });

    test.each([null, 'true', 1, {}])('does not call native for setupDefault flag %s', (value) => {
      liveActivities.setupDefault({
        enablePushToStart: value,
      } as unknown as LiveActivitySetupOptions);
      liveActivities.setupDefault({
        enablePushToUpdate: value,
      } as unknown as LiveActivitySetupOptions);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[OneSignal] setupDefault: enablePushToStart must be a boolean',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '[OneSignal] setupDefault: enablePushToUpdate must be a boolean',
      );
      expect(window.cordova.exec).not.toHaveBeenCalled();
    });

    test('allows setupDefault with omitted flags', () => {
      liveActivities.setupDefault({ enablePushToStart: true } as LiveActivitySetupOptions);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'setupDefaultLiveActivity',
        [{ enablePushToStart: true }],
      );
    });
  });
});
