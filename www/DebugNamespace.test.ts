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
  ])(
    'should call cordova.exec for setLogLevel with %s',
    (logLevel, logLevelValue) => {
      debug.setLogLevel(logLevel);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'setLogLevel',
        [logLevelValue],
      );
    },
  );

  test.each([
    [LogLevel.None, 0],
    [LogLevel.Fatal, 1],
    [LogLevel.Error, 2],
    [LogLevel.Warn, 3],
    [LogLevel.Info, 4],
    [LogLevel.Debug, 5],
    [LogLevel.Verbose, 6],
  ])(
    'should call cordova.exec for setAlertLevel with %s',
    (logLevel, logLevelValue) => {
      debug.setAlertLevel(logLevel);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'setAlertLevel',
        [logLevelValue],
      );
    },
  );
});
