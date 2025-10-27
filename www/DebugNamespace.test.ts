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
    [LogLevel.None],
    [LogLevel.Fatal],
    [LogLevel.Error],
    [LogLevel.Warn],
    [LogLevel.Info],
    [LogLevel.Debug],
    [LogLevel.Verbose],
  ])('should call cordova.exec for setLogLevel with %s', (logLevel) => {
    debug.setLogLevel(logLevel);

    expect(window.cordova.exec).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      'OneSignalPush',
      'setLogLevel',
      [logLevel],
    );
  });

  test.each([
    [LogLevel.None],
    [LogLevel.Fatal],
    [LogLevel.Error],
    [LogLevel.Warn],
    [LogLevel.Info],
    [LogLevel.Debug],
    [LogLevel.Verbose],
  ])('should call cordova.exec for setAlertLevel with %s', (logLevel) => {
    debug.setAlertLevel(logLevel);

    expect(window.cordova.exec).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      'OneSignalPush',
      'setAlertLevel',
      [logLevel],
    );
  });
});
