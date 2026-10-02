import { noop } from './helpers';

// An enum that declares different types of log levels you can use with the OneSignal SDK, going from the least verbose (none) to verbose (print all comments).
export enum LogLevel {
  None = 0,
  Fatal,
  Error,
  Warn,
  Info,
  Debug,
  Verbose,
}

function isValidLogLevel(level: unknown, api: string): boolean {
  if (typeof level === 'number' && LogLevel[level] !== undefined) return true;
  console.error(`[OneSignal] ${api}: level must be a LogLevel value`);
  return false;
}

export default class Debug {
  /**
   * Enable logging to help debug if you run into an issue setting up OneSignal.
   * @param  {LogLevel} logLevel - Sets the logging level to print to the Android LogCat log or Xcode log.
   * @returns void
   */
  setLogLevel(logLevel: LogLevel): void {
    if (!isValidLogLevel(logLevel, 'setLogLevel')) return;
    window.cordova.exec(noop, noop, 'OneSignalPush', 'setLogLevel', [logLevel]);
  }

  /**
   * Enable logging to help debug if you run into an issue setting up OneSignal.
   * @param  {LogLevel} visualLogLevel - Sets the logging level to show as alert dialogs.
   * @returns void
   */
  setAlertLevel(visualLogLevel: LogLevel): void {
    if (!isValidLogLevel(visualLogLevel, 'setAlertLevel')) return;
    window.cordova.exec(noop, noop, 'OneSignalPush', 'setAlertLevel', [visualLogLevel]);
  }
}
