// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export default class LiveActivities {
    /**
     * Enter a live activity
     * @param  {string} activityId
     * @param  {string} token
     * @param  {Function} onSuccess
     * @param  {Function} onFailure
     * @returns void
     */
    enter(activityId: string, token: string, onSuccess?: Function, onFailure?: Function): void {
        if (onSuccess == null) {
            onSuccess = function() {};
        }
    
        if (onFailure == null) {
            onFailure = function() {};
        }

        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "enterLiveActivity", [activityId, token]);
    };

    /**
     * Exit a live activity
     * @param  {string} activityId
     * @param  {Function} onSuccess
     * @param  {Function} onFailure
     * @returns void
     */
     exit(activityId: string, onSuccess?: Function, onFailure?: Function): void {
        if (onSuccess == null) {
            onSuccess = function() {};
        }

        if (onFailure == null) {
            onFailure = function() {};
        }

        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "exitLiveActivity", [activityId]);
    };
}
