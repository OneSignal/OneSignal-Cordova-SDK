import { beforeEach, describe, expect, test, vi } from 'vite-plus/test';

import { mockCordova } from '../mocks/cordova';
import Debug, { LogLevel } from './DebugNamespace';

describe('Debug', () => {
  let debug: Debug;

  beforeEach(() => {
    debug = new Debug();
    mockCordova();
  });

  test('should instantiate Debug class', () => {
    expect(debug).toBeInstanceOf(Debug);
  });

  test.each([
    [LogLevel.None, 0],
    [LogLevel.Fatal, 1],
    [LogLevel.Error, 2],
    [LogLevel.Warn, 3],
    [LogLevel.Info, 4],
    [LogLevel.Debug, 5],
    [LogLevel.Verbose, 6],
  ])('should call cordova.exec for setLogLevel with %s', (logLevel, logLevelValue) => {
    debug.setLogLevel(logLevel);

    expect(window.cordova.exec).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      'OneSignalPush',
      'setLogLevel',
      [logLevelValue],
    );
  });

  test.each([
    [LogLevel.None, 0],
    [LogLevel.Fatal, 1],
    [LogLevel.Error, 2],
    [LogLevel.Warn, 3],
    [LogLevel.Info, 4],
    [LogLevel.Debug, 5],
    [LogLevel.Verbose, 6],
  ])('should call cordova.exec for setAlertLevel with %s', (logLevel, logLevelValue) => {
    debug.setAlertLevel(logLevel);

    expect(window.cordova.exec).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      'OneSignalPush',
      'setAlertLevel',
      [logLevelValue],
    );
  });

  test.each([-1, 7, 99, 2.5, '2', 'None', null, undefined, NaN])(
    'should not call cordova.exec for invalid log level %s',
    (level) => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      debug.setLogLevel(level as unknown as LogLevel);
      debug.setAlertLevel(level as unknown as LogLevel);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[OneSignal] setLogLevel: level must be a LogLevel value',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        '[OneSignal] setAlertLevel: level must be a LogLevel value',
      );
      expect(window.cordova.exec).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    },
  );
});
