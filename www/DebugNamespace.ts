// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

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

export default class Debug {
    /**
     * Enable logging to help debug if you run into an issue setting up OneSignal.
     * @param  {LogLevel} logLevel - Sets the logging level to print to the Android LogCat log or Xcode log.
     * @returns void
     */
    setLogLevel(logLevel: LogLevel): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "setLogLevel", [logLevel]);
    };

    /**
     * Enable logging to help debug if you run into an issue setting up OneSignal.
     * @param  {LogLevel} visualLogLevel - Sets the logging level to show as alert dialogs.
     * @returns void
     */
    setAlertLevel(visualLogLevel: LogLevel): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "setAlertLevel", [visualLogLevel]);
    }
}
