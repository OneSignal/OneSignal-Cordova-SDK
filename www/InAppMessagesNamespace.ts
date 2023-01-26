import { InAppMessageAction, InAppMessageLifecycleHandlerObject, OSInAppMessage } from "./models/InAppMessage";

// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export default class InAppMessages {
    private _inAppMessageClickDelegate = function (action: InAppMessageAction) {};
    private _onWillDisplayInAppMessageDelegate = function(message: OSInAppMessage) {};
    private _onDidDisplayInAppMessageDelegate = function(message: OSInAppMessage) {};
    private _onWillDismissInAppMessageDelegate = function(message: OSInAppMessage) {};
    private _onDidDismissInAppMessageDelegate = function(message: OSInAppMessage) {};
    
    /**
     * Set the in-app message click handler.
     * @param  {(action:InAppMessageAction)=>void} handler
     * @returns void
     */
    setClickHandler(handler: (action: InAppMessageAction) => void): void {
        this._inAppMessageClickDelegate = handler;

        const inAppMessageClickHandler = (json: InAppMessageAction) => {
            this._inAppMessageClickDelegate(json);
        };

        window.cordova.exec(inAppMessageClickHandler, function() {}, "OneSignalPush", "setClickHandler", []);
    };

    /**
     * Set the in-app message lifecycle handler.
     * @param  {InAppMessageLifecycleHandlerObject} handlerObject
     * @returns void
     */
    setLifecycleHandler(handlerObject: InAppMessageLifecycleHandlerObject) : void {
        if (handlerObject.onWillDisplayInAppMessage) {
            this._onWillDisplayInAppMessageDelegate = handlerObject.onWillDisplayInAppMessage;

            const onWillDisplayInAppMessageHandler = (json: OSInAppMessage) => {
                this._onWillDisplayInAppMessageDelegate(json);
            };

            window.cordova.exec(onWillDisplayInAppMessageHandler, function() {}, "OneSignalPush", "setOnWillDisplayInAppMessageHandler", []);
        }
        if (handlerObject.onDidDisplayInAppMessage) {
            this._onDidDisplayInAppMessageDelegate = handlerObject.onDidDisplayInAppMessage;

            const onDidDisplayInAppMessageHandler = (json: OSInAppMessage) => {
                this._onDidDisplayInAppMessageDelegate(json);
            };

            window.cordova.exec(onDidDisplayInAppMessageHandler, function() {}, "OneSignalPush", "setOnDidDisplayInAppMessageHandler", []);
        }
        if (handlerObject.onWillDismissInAppMessage) {
            this._onWillDismissInAppMessageDelegate = handlerObject.onWillDismissInAppMessage;

            const onWillDismissInAppMessageHandler = (json: OSInAppMessage) => {
                this._onWillDismissInAppMessageDelegate(json);
            };

            window.cordova.exec(onWillDismissInAppMessageHandler, function() {}, "OneSignalPush", "setOnWillDismissInAppMessageHandler", []);
        }
        if (handlerObject.onDidDismissInAppMessage) {
            this._onDidDismissInAppMessageDelegate = handlerObject.onDidDismissInAppMessage;

            const onDidDismissInAppMessageHandler = (json: OSInAppMessage) => {
                this._onDidDismissInAppMessageDelegate(json);
            };

            window.cordova.exec(onDidDismissInAppMessageHandler, function() {}, "OneSignalPush", "setOnDidDismissInAppMessageHandler", []);
        }

        window.cordova.exec(function() {}, function() {}, "OneSignalPush", "setLifecycleHandler", []);
    };

    /**
     * Add a trigger for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be displayed to the user.
     * @param  {string} key
     * @param  {string | number | boolean} value
     * @returns void
     */
    addTrigger(key: string, value: string | number | boolean): void {
        const obj = {[key]: value};
        this.addTriggers(obj);
    };

    /**
     * Add multiple triggers for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be displayed to the user.
     * @param  {[key: string]: string | number | boolean} triggers
     * @returns void
     */

    addTriggers(triggers: {[key: string]: string | number | boolean}): void {
      Object.keys(triggers).forEach(function(key){
          // forces values to be string types
          if (typeof triggers[key] !== "string") {
              triggers[key] = JSON.stringify(triggers[key]);
          }
      });
      
      window.cordova.exec(function() {}, function() {}, "OneSignalPush", "addTriggers", [triggers]);
    };

    /**
     * Remove the trigger with the provided key from the current user.
     * @param  {string} key
     * @returns void
     */
    removeTrigger(key: string): void {
        this.removeTriggers([key]);
    };

    /**
     * Remove multiple triggers from the current user.
     * @param  {string[]} keys
     * @returns void
     */
    removeTriggers(keys: string[]): void {
        if (!Array.isArray(keys)) {
            console.error("OneSignal: removeTriggers: argument must be of type Array")
        }
        
        window.cordova.exec(function() {}, function() {}, "OneSignalPush", "removeTriggers", [keys]);
    };
    
    /**
     * Clear all triggers from the current user.
     * @returns void
     */
    clearTriggers(): void {
        window.cordova.exec(function() {}, function() {}, "OneSignalPush", "clearTriggers");
    }

    /**
     * Set whether in-app messaging is currently paused. 
     * When set to true no IAM will be presented to the user regardless of whether they qualify for them. 
     * When set to 'false` any IAMs the user qualifies for will be presented to the user at the appropriate time.
     * @param  {boolean} pause
     * @returns void
     */
    setPaused(pause: boolean): void {
        window.cordova.exec(function() {}, function() {}, "OneSignalPush", "setPaused", [pause]);
    };

    /**
     * Whether in-app messaging is currently paused.
     * @param  {(value: boolean) => void} handler
     * @returns void
     */
    isPaused(handler: (value: boolean) => void): void {
        const isPausedCallback = (obj: {value: boolean}) => {
            handler(obj.value);
        };
        
        window.cordova.exec(isPausedCallback, function(){}, "OneSignalPush", "isPaused", []);
    };
}
