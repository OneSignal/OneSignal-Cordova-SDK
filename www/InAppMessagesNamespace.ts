import {InAppMessageEventTypeMap,
    InAppMessageEventName,
    InAppMessageWillDisplayEvent, 
    InAppMessageDidDisplayEvent, 
    InAppMessageWillDismissEvent, 
    InAppMessageDidDismissEvent,
    InAppMessageClickEvent, 
    InAppMessageClickResult
} from "./models/InAppMessage";

// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export default class InAppMessages {
    private _inAppMessageClickListeners: ((action: InAppMessageClickEvent) => void)[] = [];
    private _willDisplayInAppMessageListener: ((event: InAppMessageWillDisplayEvent) => void) [] = [];
    private _didDisplayInAppMessageListener: ((event: InAppMessageDidDisplayEvent) => void) [] = [];
    private _willDismissInAppMessageListener: ((event: InAppMessageWillDismissEvent) => void) [] = [];
    private _didDismissInAppMessageListener: ((event: InAppMessageDidDismissEvent) => void) [] = [];

    private _processFunctionList(array: ((event:any)=>void)[], param: any): void {
        for (let i = 0; i < array.length; i++) {
            array[i](param);
        }
    }

    /**
     * Add event listeners for In-App Message click and/or lifecycle events.
     * @param event 
     * @param listener 
     * @returns 
     */
    addEventListener<K extends InAppMessageEventName>(event: K, listener: (event: InAppMessageEventTypeMap[K]) => void): void {
        if (event === "click") {
            this._inAppMessageClickListeners.push(listener as (event: InAppMessageClickEvent) => void);
            const inAppMessageClickListener = (json: InAppMessageClickResult) => {
                this._processFunctionList(this._inAppMessageClickListeners, json);
            };
            window.cordova.exec(inAppMessageClickListener, function() {}, "OneSignalPush", "addInAppMessageClickListener", []);
        } else {            
            if (event === "willDisplay") {
                this._willDisplayInAppMessageListener.push(listener as (event: InAppMessageWillDisplayEvent) => void);
                const willDisplayCallBackProcessor = (event: InAppMessageWillDisplayEvent) => {
                    this._processFunctionList(this._willDisplayInAppMessageListener, event);
                };
                window.cordova.exec(willDisplayCallBackProcessor, function() {}, "OneSignalPush", "setOnWillDisplayInAppMessageHandler", []);
            } else if (event === "didDisplay") {
                this._didDisplayInAppMessageListener.push(listener as (event: InAppMessageDidDisplayEvent) => void);
                const didDisplayCallBackProcessor = (event: InAppMessageDidDisplayEvent) => {
                    this._processFunctionList(this._didDisplayInAppMessageListener, event);
                };
                window.cordova.exec(didDisplayCallBackProcessor, function() {}, "OneSignalPush", "setOnDidDisplayInAppMessageHandler", []);
            } else if (event === "willDismiss") {
                this._willDismissInAppMessageListener.push(listener as (event: InAppMessageWillDismissEvent) => void);
                const willDismissInAppMessageProcessor = (event: InAppMessageWillDismissEvent) => {
                    this._processFunctionList(this._willDismissInAppMessageListener, event);
                };
                window.cordova.exec(willDismissInAppMessageProcessor, function() {}, "OneSignalPush", "setOnWillDismissInAppMessageHandler", []);
            } else if (event === "didDismiss") {
                this._didDismissInAppMessageListener.push(listener as (event: InAppMessageDidDismissEvent) => void);
                const didDismissInAppMessageCallBackProcessor = (event: InAppMessageDidDismissEvent) => {
                    this._processFunctionList(this._didDismissInAppMessageListener, event);
                };
                window.cordova.exec(didDismissInAppMessageCallBackProcessor, function() {}, "OneSignalPush", "setOnDidDismissInAppMessageHandler", []);
            
            } else {
                return; // Invalid event name
            }
            window.cordova.exec(function() {}, function() {}, "OneSignalPush", "addInAppMessageLifecycleListener", []);
        }
    }

    /**
     * Remove event listeners for In-App Message click and/or lifecycle events.
     * @param event 
     * @param listener 
     * @returns 
     */
    removeEventListener<K extends InAppMessageEventName>(event: K, listener: (obj: InAppMessageEventTypeMap[K]) => void): void {
        if (event === "click") {
            const index = this._inAppMessageClickListeners.indexOf(listener);
            if (index !== -1) {
                this._inAppMessageClickListeners.splice(index, 1);
            }
        } else {        
            if (event === "willDisplay") {
                let index = this._willDisplayInAppMessageListener.indexOf(listener as (event: InAppMessageWillDisplayEvent) => void);
                if (index !== -1) {
                    this._willDisplayInAppMessageListener.splice(index, 1);
                }
            } else if (event === "didDisplay") {
                let index = this._didDisplayInAppMessageListener.indexOf(listener as (event: InAppMessageDidDisplayEvent) => void);
                if (index !== -1) {
                    this._willDisplayInAppMessageListener.splice(index, 1);
                }
            } else if (event === "willDismiss") {
                let index = this._willDismissInAppMessageListener.indexOf(listener as (event: InAppMessageWillDismissEvent) => void);
                if (index !== -1) {
                    this._willDismissInAppMessageListener.splice(index, 1);
                }
            } else if (event === "didDismiss") {
                let index = this._didDismissInAppMessageListener.indexOf(listener as (event: InAppMessageDidDismissEvent) => void);
                if (index !== -1) {
                    this._didDismissInAppMessageListener.splice(index, 1);
                }
            } else {
                return; // Invalid event name
            }
        }
    }

    /**
     * Add a trigger for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be displayed to the user.
     * @param  {string} key
     * @param  {string} value
     * @returns void
     */
    addTrigger(key: string, value: string): void {
        const obj = {[key]: value};
        this.addTriggers(obj);
    };

    /**
     * Add multiple triggers for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be displayed to the user.
     * @param  {[key: string]: string} triggers
     * @returns void
     */

    addTriggers(triggers: {[key: string]: string}): void {
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
            console.error("OneSignal: removeTriggers: argument must be of type Array");
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
