// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export default class Location {
    /**
     * Location
     */

    /**
     * Prompts the user for location permissions to allow geotagging from the OneSignal dashboard.
     * @returns void
     */
    requestPermission(): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "requestLocationPermission", []);
    };

    /**
     * Disable or enable location collection (defaults to enabled if your app has location permission).
     * @param  {boolean} shared
     * @returns void
     */
    setShared(shared: boolean): void {
        window.cordova.exec(function() {}, function() {}, "OneSignalPush", "setLocationShared", [shared]);
    };

    /**
     * Whether location is currently shared with OneSignal.
     * @returns {Promise<boolean>}
     */
     isShared(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            window.cordova.exec(resolve, reject, "OneSignalPush", "isLocationShared", []);
        });
    };
}
