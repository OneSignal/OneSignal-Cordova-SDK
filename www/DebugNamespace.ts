// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

// 0 = None, 1 = Fatal, 2 = Errors, 3 = Warnings, 4 = Info, 5 = Debug, 6 = Verbose
export type LogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export default class Debug {
    /**
     * Enable logging to help debug if you run into an issue setting up OneSignal.
     * @param  {LogLevel} nsLogLevel - Sets the logging level to print to the Android LogCat log or Xcode log.
     * @returns void
     */
    setLogLevel(nsLogLevel: LogLevel): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "setLogLevel", [nsLogLevel]);
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
