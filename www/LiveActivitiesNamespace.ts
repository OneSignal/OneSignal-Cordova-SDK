import { LiveActivitySetupOptions } from "./models/LiveActivities";

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

   
    /**
     * Indicate this device is capable of receiving pushToStart live activities for the
     * `activityType`. The `activityType` **must** be the name of the struct conforming
     * to `ActivityAttributes` that will be used to start the live activity.
     *
     * Only applies to iOS
     *
     * @param {string} activityType: The name of the specific `ActivityAttributes` structure tied
     * to the live activity.
     * @param {string} token: The activity type's pushToStart token.
     */
    setPushToStartToken(activityType: string, token: string) {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "setPushToStartToken", [activityType, token]);
    }
  
    /**
     * Indicate this device is no longer capable of receiving pushToStart live activities
     * for the `activityType`. The `activityType` **must** be the name of the struct conforming
     * to `ActivityAttributes` that will be used to start the live activity.
     *
     * Only applies to iOS
     *
     * @param {string} activityType: The name of the specific `ActivityAttributes` structure tied
     * to the live activity.
     */
    removePushToStartToken(activityType: string) {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removePushToStartToken", [activityType]);
    }
  
    /**
     * Enable the OneSignalSDK to setup the default`DefaultLiveActivityAttributes` structure,
     * which conforms to the `OneSignalLiveActivityAttributes`. When using this function, the
     * widget attributes are owned by the OneSignal SDK, which will allow the SDK to handle the
     * entire lifecycle of the live activity.  All that is needed from an app-perspective is to
     * create a Live Activity widget in a widget extension, with a `ActivityConfiguration` for
     * `DefaultLiveActivityAttributes`. This is most useful for users that (1) only have one Live
     * Activity widget and (2) are using a cross-platform framework and do not want to create the
     * cross-platform <-> iOS native bindings to manage ActivityKit.
     *
     * Only applies to iOS
     *
     * @param {LiveActivitySetupOptions} options: An optional structure to provide for more granular setup options.
     */
    setupDefault(options?: LiveActivitySetupOptions) {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "setupDefaultLiveActivity", [options]);
    }
  
      /**
       * Start a new LiveActivity that is modelled by the default`DefaultLiveActivityAttributes`
       * structure. The `DefaultLiveActivityAttributes` is initialized with the dynamic `attributes`
       * and `content` passed in.
       *
       * Only applies to iOS
       *
       * @param {string} activityId: The activity identifier the live activity on this device will be started
       * and eligible to receive updates for.
       * @param {object} attributes: A dynamic type containing the static attributes passed into `DefaultLiveActivityAttributes`.
       * @param {object} content: A dynamic type containing the content attributes passed into `DefaultLiveActivityAttributes`.
       */
    startDefault(activityId: string, attributes: object, content: object,) {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "startDefaultLiveActivity", [activityId, attributes, content]);
    }
}
