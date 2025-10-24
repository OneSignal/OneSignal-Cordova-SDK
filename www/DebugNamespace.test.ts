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
    [LogLevel.None, 'None'],
    [LogLevel.Fatal, 'Fatal'],
    [LogLevel.Error, 'Error'],
    [LogLevel.Warn, 'Warn'],
    [LogLevel.Info, 'Info'],
    [LogLevel.Debug, 'Debug'],
    [LogLevel.Verbose, 'Verbose'],
  ])(
    'should call cordova.exec for setLogLevel with %s',
    (logLevel, levelName) => {
      debug.setLogLevel(logLevel);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'setLogLevel',
        [logLevel],
      );
    },
  );

  test.each([
    [LogLevel.None, 'None'],
    [LogLevel.Fatal, 'Fatal'],
    [LogLevel.Error, 'Error'],
    [LogLevel.Warn, 'Warn'],
    [LogLevel.Info, 'Info'],
    [LogLevel.Debug, 'Debug'],
    [LogLevel.Verbose, 'Verbose'],
  ])(
    'should call cordova.exec for setAlertLevel with %s',
    (logLevel, levelName) => {
      debug.setAlertLevel(logLevel);

      expect(window.cordova.exec).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'OneSignalPush',
        'setAlertLevel',
        [logLevel],
      );
    },
  );
});
