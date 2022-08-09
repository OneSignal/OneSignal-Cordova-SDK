/**
 * Modified MIT License
 *
 * Copyright 2019 OneSignal
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * 1. The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * 2. All copies of substantial portions of the Software may only be used in connection
 * with services provided by OneSignal.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { InAppMessageAction, InAppMessageLifecycleHandlerObject, OSInAppMessage } from "./models/InAppMessage";
import { OpenedEvent } from "./models/NotificationOpened";
import { OutcomeEvent } from "./models/Outcomes";
import NotificationReceivedEvent from "./NotificationReceivedEvent";
import OSNotification from './OSNotification';
import {
    ChangeEvent,
    DeviceState,
    EmailSubscriptionChange,
    PermissionChange,
    SMSSubscriptionChange,
    SubscriptionChange
} from "./Subscription";

// Suppress TS warnings about window.cordova
declare global {
    interface Window {
        cordova: any; // turn off type checking
        plugins: any;
    }
}

// 0 = None, 1 = Fatal, 2 = Errors, 3 = Warnings, 4 = Info, 5 = Debug, 6 = Verbose
export type LogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export class OneSignalPlugin {
    private _appID = "";
    private _notificationWillShowInForegroundDelegate = function(notificationReceived: NotificationReceivedEvent) {};
    private _notificationOpenedDelegate = function(notificationOpened: OpenedEvent) {};
    private _inAppMessageClickDelegate = function (action: InAppMessageAction) {};
    private _onWillDisplayInAppMessageDelegate = function(message: OSInAppMessage) {};
    private _onDidDisplayInAppMessageDelegate = function(message: OSInAppMessage) {};
    private _onWillDismissInAppMessageDelegate = function(message: OSInAppMessage) {};
    private _onDidDismissInAppMessageDelegate = function(message: OSInAppMessage) {};

    private _permissionObserverList: ((event:ChangeEvent<PermissionChange>)=>void)[] = [];
    private _subscriptionObserverList: ((event:ChangeEvent<SubscriptionChange>)=>void)[] = [];
    private _emailSubscriptionObserverList: ((event:ChangeEvent<EmailSubscriptionChange>)=>void)[] = [];
    private _smsSubscriptionObserverList: ((event:ChangeEvent<SMSSubscriptionChange>)=>void)[] = [];

    private _processFunctionList<ObserverChangeEvent>(array: ((event:ChangeEvent<ObserverChangeEvent>)=>void)[], param: ChangeEvent<ObserverChangeEvent>): void {
        for (let i = 0; i < array.length; i++) {
            array[i](param);
        }
    }

    /**
     * Completes OneSignal initialization by setting the OneSignal Application ID.
     * @param  {string} appId
     * @returns void
     */
    setAppId(appId: string): void {
        this._appID = appId;

        window.cordova.exec(function() {}, function(){}, "OneSignalPush", "init", [this._appID]);
    };

    /**
     * Set the callback to run just before displaying a notification while the app is in focus.
     * @param  {(event:NotificationReceivedEvent)=>void} handler
     * @returns void
     */
    setNotificationWillShowInForegroundHandler(handler: (event: NotificationReceivedEvent) => void): void {
        this._notificationWillShowInForegroundDelegate = handler;

        const foregroundParsingHandler = (notificationReceived: OSNotification) => {
            this._notificationWillShowInForegroundDelegate(new NotificationReceivedEvent(notificationReceived));
        };

        window.cordova.exec(foregroundParsingHandler, function(){}, "OneSignalPush", "setNotificationWillShowInForegroundHandler", []);
    };

    /**
     * Set the callback to run on notification open.
     * @param  {(openedEvent:OpenedEvent) => void} handler
     * @returns void
     */
    setNotificationOpenedHandler(handler: (openedEvent: OpenedEvent) => void): void {
        this._notificationOpenedDelegate = handler;

        const notificationOpenedHandler = (json: OpenedEvent) => {
            this._notificationOpenedDelegate(json);
        };

        window.cordova.exec(notificationOpenedHandler, function(){}, "OneSignalPush", "setNotificationOpenedHandler", []);
    };

    /**
     * Sets an In-App Message click event handler.
     * @param  {(action:InAppMessageAction)=>void} handler
     * @returns void
     */
    setInAppMessageClickHandler(handler: (action: InAppMessageAction) => void): void {
        this._inAppMessageClickDelegate = handler;

        const inAppMessageClickHandler = (json: InAppMessageAction) => {
            this._inAppMessageClickDelegate(json);
        };

        window.cordova.exec(inAppMessageClickHandler, function() {}, "OneSignalPush", "setInAppMessageClickHandler", []);
    };

    /**
     * Sets the In-App Message lifecycle handler object to run on displaying and/or dismissing an In-App Message.
     * @param  {InAppMessageLifecycleHandlerObject} handlerObject
     * @returns void
     */
    setInAppMessageLifecycleHandler(handlerObject: InAppMessageLifecycleHandlerObject) : void {
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

        window.cordova.exec(function() {}, function() {}, "OneSignalPush", "setInAppMessageLifecycleHandler", []);
    };

    /**
     * This method returns a "snapshot" of the device state for when it was called.
     * @param  {(response: DeviceState) => void} handler
     * @returns void
     */
    getDeviceState(handler: (response: DeviceState) => void): void {
        const deviceStateCallback = (json: DeviceState) => {
            handler(new DeviceState(json));
        };
        window.cordova.exec(deviceStateCallback, function(){}, "OneSignalPush", "getDeviceState", []);
    };

    /**
     * Allows you to set the app defined language with the OneSignal SDK.
     * @param  {string} language
     * @param  {(success:object)=>void} onSuccess
     * @param  {(failure:object)=>void} onFailure
     * @returns void
     */
    setLanguage(language: string, onSuccess?: (success: object) => void, onFailure?: (failure: object) => void): void {
        if (onSuccess == null) {
            onSuccess = function() {};
        }

        if (onFailure == null) {
            onFailure = function() {};
        }

        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setLanguage", [language]);
    }

    /**
     * Add a callback that fires when the OneSignal subscription state changes.
     * @param  {(event:ChangeEvent<SubscriptionChange>)=>void} observer
     * @returns void
     */
    addSubscriptionObserver(observer: (event: ChangeEvent<SubscriptionChange>) => void): void {
        this._subscriptionObserverList.push(observer);
        const subscriptionCallBackProcessor = (state: ChangeEvent<SubscriptionChange>) => {
            this._processFunctionList(this._subscriptionObserverList, state);
        };
        window.cordova.exec(subscriptionCallBackProcessor, function(){}, "OneSignalPush", "addSubscriptionObserver", []);
    };

    /**
     * Add a callback that fires when the OneSignal email subscription changes.
     * @param  {(event:ChangeEvent<EmailSubscriptionChange>)=>void} observer
     * @returns void
     */
    addEmailSubscriptionObserver(observer: (event: ChangeEvent<EmailSubscriptionChange>) => void): void {
        this._emailSubscriptionObserverList.push(observer);
        const emailSubscriptionCallbackProcessor = (state: ChangeEvent<EmailSubscriptionChange>) => {
            this._processFunctionList(this._emailSubscriptionObserverList, state);
        };
        window.cordova.exec(emailSubscriptionCallbackProcessor, function(){}, "OneSignalPush", "addEmailSubscriptionObserver", []);
    };

    /**
     * Add a callback that fires when the OneSignal sms subscription changes.
     * @param  {(event:ChangeEvent<SMSSubscriptionChange>)=>void} observer
     * @returns void
     */
    addSMSSubscriptionObserver(observer: (event: ChangeEvent<SMSSubscriptionChange>) => void): void {
        this._smsSubscriptionObserverList.push(observer);
        const smsSubscriptionCallbackProcessor = (state: ChangeEvent<SMSSubscriptionChange>) => {
            this._processFunctionList(this._smsSubscriptionObserverList, state);
        };
        window.cordova.exec(smsSubscriptionCallbackProcessor, function(){}, "OneSignalPush", "addSMSSubscriptionObserver", []);
    };

    /**
     * Add a callback that fires when the native push permission changes.
     * @param  {(event:ChangeEvent<PermissionChange>)=>void} observer
     * @returns void
     */
    addPermissionObserver(observer: (event: ChangeEvent<PermissionChange>) => void): void {
        this._permissionObserverList.push(observer);
        const permissionCallBackProcessor = (state: ChangeEvent<PermissionChange>) => {
            this._processFunctionList(this._permissionObserverList, state);
        };
        window.cordova.exec(permissionCallBackProcessor, function(){}, "OneSignalPush", "addPermissionObserver", []);
    };

    /**
     * Retrieve a list of tags that have been set on the user from the OneSignal server.
     * @param  {(tags:object)=>void} handler
     * @returns void
     */
    getTags(handler: (tags: object) => void): void {
        window.cordova.exec(handler, function(){}, "OneSignalPush", "getTags", []);
    };

    /**
     * Tag a user based on an app event of your choosing so they can be targeted later via segments.
     * @param  {string} key
     * @param  {string} value
     * @returns void
     */
    sendTag(key: string, value: string): void {
        const jsonKeyValue = {[key]: value};
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "sendTags", [jsonKeyValue]);
    };

    /**
     * Tag a user wiht multiple tags based on an app event of your choosing so they can be targeted later via segments.
     * @param  {object} tags
     * @returns void
     */
    sendTags(tags: object): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "sendTags", [tags]);
    };

    /**
     * Deletes a single tag that was previously set on a user.
     * @param  {string} key
     * @returns void
     */
    deleteTag(key: string): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "deleteTags", [key]);
    };

    /**
     * Deletes multiple tags that were previously set on a user.
     * @param  {string[]} keys
     * @returns void
     */
    deleteTags(keys: string[]): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "deleteTags", keys);
    };

    /**
     * Only applies to iOS (does nothing on Android as it always silently registers)
     * Call only if you passed false to autoRegister
     * Request for Direct-To-History push notification authorization
     *
     * For more information: https://documentation.onesignal.com/docs/ios-customizations#provisional-push-notifications
     *
     * @param  {(response:{accepted:boolean})=>void} handler
     * @returns void
     */
    registerForProvisionalAuthorization(handler?: (response: { accepted: boolean }) => void): void {
        // TODO: Update the response in next major release to just boolean
        window.cordova.exec(handler, function(){}, "OneSignalPush", "registerForProvisionalAuthorization", []);
    };

    /**
     * Prompts the user for push notifications permission in iOS and Android 13+.
     * Use the fallbackToSettings parameter to prompt to open the settings app if a user has already declined push permissions.
     *
     * Call with promptForPushNotificationsWithUserResponse(fallbackToSettings?, handler?)
     *
     * @param  {boolean} fallbackToSettings
     * @param  {(response:boolean)=>void} handler
     * @returns void
     */
    promptForPushNotificationsWithUserResponse(fallbackToSettingsOrHandler?: boolean | ((response: boolean) => void), handler?: (response: boolean) => void): void {
        var fallbackToSettings = false;

        if (typeof fallbackToSettingsOrHandler === "function") {
            // Method was called like promptForPushNotificationsWithUserResponse(handler: function)
            handler = fallbackToSettingsOrHandler;
        }
        else if (typeof fallbackToSettingsOrHandler === "boolean") {
            // Method was called like promptForPushNotificationsWithUserResponse(fallbackToSettings: boolean, handler?: function)
            fallbackToSettings = fallbackToSettingsOrHandler;
        }
        // Else method was called like promptForPushNotificationsWithUserResponse(), no need to modify

        const internalCallback = (response: boolean) => {
            if (handler) {
                handler(response);
            }
        };
        window.cordova.exec(internalCallback, function(){}, "OneSignalPush", "promptForPushNotificationsWithUserResponse", [fallbackToSettings]);
    };

    /**
     * Android Only. iOS provides a standard way to clear notifications by clearing badge count.
     * @returns void
     */
    clearOneSignalNotifications(): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "clearOneSignalNotifications", []);
    };

    /**
     * Android Only. If notifications are disabled for your application, unsubscribe the user from OneSignal.
     * @param  {boolean} unsubscribe
     * @returns void
     */
    unsubscribeWhenNotificationsAreDisabled(unsubscribe: boolean): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "unsubscribeWhenNotificationsAreDisabled", [unsubscribe]);
    };

    /**
     * Removes a single OneSignal notification based on its Android notification integer id.
     * @param  {number} id - notification id to cancel
     * @returns void
     */
    removeNotification(id: number): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeNotification", [id]);
    };

    /**
     * Removes all OneSignal notifications based on its Android notification group Id.
     * @param  {string} id - notification group id to cancel
     * @returns void
     */
    removeGroupedNotifications(id: string): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeGroupedNotifications", [id]);
    };

    /**
     * Disable the push notification subscription to OneSignal.
     * @param  {boolean} disable
     * @returns void
     */
    disablePush(disable: boolean): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "disablePush", [disable]);
    };

    /**
     * Send a notification
     * @param  {object} notificationObject - JSON payload (see REST API reference)
     * @param  {(success:object)=>void} onSuccess
     * @param  {(failure:object)=>void} onFailure
     * @returns void
     */
    postNotification(notificationObject: object, onSuccess?: (success: object) => void, onFailure?: (failure: object) => void): void {
        if (onSuccess == null) {
            onSuccess = function() {};
        }

        if (onFailure == null) {
            onFailure = function() {};
        }

        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "postNotification", [notificationObject]);
    };

    /**
     * iOS only.
     * This method can be used to set if launch URLs should be opened within the application or in Safari.
     * @param  {boolean} isEnabled - false will open the link in Safari or user's default browser
     * @returns void
     */
    setLaunchURLsInApp(isEnabled: boolean): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "setLaunchURLsInApp", [isEnabled]);
    };

    /**
     * Enable logging to help debug if you run into an issue setting up OneSignal.
     * @param  {LogLevel} nsLogLevel - Sets the logging level to print to the Android LogCat log or Xcode log.
     * @param  {LogLevel} visualLogLevel - Sets the logging level to show as alert dialogs.
     * @returns void
     */
    setLogLevel(nsLogLevel: LogLevel, visualLogLevel: LogLevel): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "setLogLevel", [nsLogLevel, visualLogLevel]);
    };

    /**
     * Did the user provide privacy consent for GDPR purposes.
     * @param  {(response: boolean) => void} handler
     * @returns void
     */
    userProvidedPrivacyConsent(handler: (response: boolean) => void): void {
        window.cordova.exec(handler, function(){}, "OneSignalPush", "userProvidedPrivacyConsent", []);
    };

    /**
     * True if the application requires user privacy consent, false otherwise
     * Passes a boolean on Android and passes an object on iOS to the handler.
     *
     * @param  {(response: boolean | {value: boolean}) => void} handler
     * @returns void
     */
    requiresUserPrivacyConsent(handler: (response: boolean | { value: boolean }) => void): void {
        // TODO: Update the response in next major release to just boolean
        window.cordova.exec(handler, function(){}, "OneSignalPush", "requiresUserPrivacyConsent", []);
    };

    /**
     * For GDPR users, your application should call this method before setting the App ID.
     * @param  {boolean} required
     * @returns void
     */
    setRequiresUserPrivacyConsent(required: boolean): void {
        window.cordova.exec(function() {}, function() {}, "OneSignalPush", "setRequiresUserPrivacyConsent", [required]);
    };

    /**
     * If your application is set to require the user's privacy consent, you can provide this consent using this method.
     * @param  {boolean} granted
     * @returns void
     */
    provideUserConsent(granted: boolean): void {
        window.cordova.exec(function() {}, function() {}, "OneSignalPush", "provideUserConsent", [granted]);
    };

    /**
     * Email
     */

    /**
     * Allows you to set the user's email address with the OneSignal SDK.
     * @param  {string} email
     * @param  {string} authCode
     * @param  {Function} onSuccess
     * @param  {Function} onFailure
     * @returns void
     */
    setEmail(email: string, authCode?: string, onSuccess?: Function, onFailure?: Function): void {
        if (onSuccess == null) {
            onSuccess = function() {};
        }

        if (onFailure == null) {
            onFailure = function() {};
        }

        if (typeof authCode == 'function') {
            onFailure = onSuccess;
            onSuccess = authCode;

            window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setUnauthenticatedEmail", [email]);
        } else if (authCode == undefined) {
            window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setUnauthenticatedEmail", [email]);
        } else {
            window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setEmail", [email, authCode]);
        }
    };

    /**
     * If your app implements logout functionality, you can call logoutEmail to dissociate the email from the device.
     * @param  {Function} onSuccess
     * @param  {Function} onFailure
     * @returns void
     */
    logoutEmail(onSuccess?: Function, onFailure?: Function): void {
        if (onSuccess == null) {
            onSuccess = function() {};
        }

        if (onFailure == null) {
            onFailure = function() {};
        }

        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "logoutEmail", []);
    };

    /**
     * SMS
     */

    /**
     * Allows you to set the user's SMS number with the OneSignal SDK.
     * @param  {string} smsNumber
     * @param  {string} authCode
     * @param  {Function} onSuccess
     * @param  {Function} onFailure
     * @returns void
     */
    setSMSNumber(smsNumber: string, authCode?: string, onSuccess?: Function, onFailure?: Function): void {
        if (onSuccess == null) {
            onSuccess = function() {};
        }

        if (onFailure == null) {
            onFailure = function() {};
        }

        if (typeof authCode == 'function') {
            onFailure = onSuccess;
            onSuccess = authCode;

            window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setUnauthenticatedSMSNumber", [smsNumber]);
        } else if (authCode == undefined) {
            window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setUnauthenticatedSMSNumber", [smsNumber]);
        } else {
            window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setSMSNumber", [smsNumber, authCode]);
        }
    };

    /**
     * If your app implements logout functionality, you can call logoutSMSNumber to dissociate the SMS number from the device.
     * @param  {Function} onSuccess
     * @param  {Function} onFailure
     * @returns void
     */
    logoutSMSNumber(onSuccess?: Function, onFailure?: Function): void {
        if (onSuccess == null) {
            onSuccess = function() {};
        }

        if (onFailure == null) {
            onFailure = function() {};
        }

        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "logoutSMSNumber", []);
    };

    /**
     * Allows you to use your own system's user ID's to send push notifications to your users.
     *
     * Possible function usages:
     * setExternalUserId(externalId: string?): void
     * setExternalUserId(externalId: string?, handler: function?): void
     * setExternalUserId(externalId: string?, externalIdAuthCode: string?, handler: function?): void
     *
     * @param  {string} externalId
     * @param  {string} externalIdAuthCode
     * @param  {(results:object) => void} handler
     * @returns void
     */
    setExternalUserId(externalId: string | null, handlerOrAuth?: ((results: object) => void) | string, handler?: (results: object) => void): void {
        if (externalId == undefined) {
            externalId = null;
        }

        let externalIdAuthHash = null;
        let callback = (results: object) => {};

        if (typeof handlerOrAuth === "function") {
            // Method was called like setExternalUserId(externalId: string?, handler: function)
            callback = handlerOrAuth;
        }
        else if (typeof handlerOrAuth === "string") {
            // Method was called like setExternalUserId(externalId: string?, externalIdAuthCode: string?, handler: function)
            externalIdAuthHash = handlerOrAuth;
            if (handler) {
                callback = handler;
            }
        }
        else if (typeof handlerOrAuth === "undefined") {
            // Method was called like setExternalUserId(externalId: string?)
            // Defaults defined above for externalIdAuthHash and callback
        }
        else {
            // This does not catch all possible wrongly typed params but prevents a good number of them
            console.error("OneSignal: setExternalUserId: Invalid param types. Definition is setExternalUserId(externalId: string?, externalIdAuthCode: string?, handler: function?): void")
            return;
        }

        const passToNativeParams = [externalId];
        if (externalIdAuthHash !== null) {
            passToNativeParams.push(externalIdAuthHash)
        }
        window.cordova.exec(callback, function() {}, "OneSignalPush", "setExternalUserId", passToNativeParams);
    };

    /**
     * Removes whatever was set as the current user's external user ID.
     * @param  {(results:object)=>void} handler
     * @returns void
     */
    removeExternalUserId(handler?: (results: object) => void): void {
        if (handler == undefined) {
            handler = function() {};
        }
        window.cordova.exec(handler, function() {}, "OneSignalPush", "removeExternalUserId", []);
    };

    /**
     * In app messaging
     */

    /**
     * Adds Multiple In-App Message Triggers.
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
     * Add an In-App Message Trigger.
     * @param  {string} key
     * @param  {string | number | boolean} value
     * @returns void
     */
    addTrigger(key: string, value: string | number | boolean): void {
        const obj = {[key]: value};
        this.addTriggers(obj);
    };

    /**
     * Removes a list of triggers based on a key.
     * @param  {string} key
     * @returns void
     */
    removeTriggerForKey(key: string): void {
        this.removeTriggersForKeys([key]);
    };

    /**
     * Removes a list of triggers based on a collection of keys.
     * @param  {string[]} keys
     * @returns void
     */
    removeTriggersForKeys(keys: string[]): void {
        if (!Array.isArray(keys)) {
            console.error("OneSignal: removeTriggersForKeys: argument must be of type Array")
        }
        window.cordova.exec(function() {}, function() {}, "OneSignalPush", "removeTriggersForKeys", [keys]);
    };

    /**
     * Gets a trigger value for a provided trigger key.
     * @param  {string} key
     * @param  {(value: string) => void} handler
     * @returns void
     */
    getTriggerValueForKey(key: string, handler: (value: string) => void): void {
        const getTriggerValueForKeyCallback = (obj: {value: string}) => {
            handler(obj.value);
        };
        window.cordova.exec(getTriggerValueForKeyCallback, function() {}, "OneSignalPush", "getTriggerValueForKey", [key]);
    };

    /**
     * Pause & unpause In-App Messages
     * @param  {boolean} pause
     * @returns void
     */
    pauseInAppMessages(pause: boolean): void {
        window.cordova.exec(function() {}, function() {}, "OneSignalPush", "pauseInAppMessages", [pause]);
    };

    /**
     * Outcomes
     */

    /**
     * Increases the "Count" of this Outcome by 1 and will be counted each time sent.
     * @param  {string} name
     * @param  {(event:OutcomeEvent)=>void} handler
     * @returns void
     */
    sendOutcome(name: string, handler?: (event: OutcomeEvent) => void): void {
        const sendOutcomeCallback = (result: OutcomeEvent) => {
            if (handler) {
                handler(result);
            }
        };

        window.cordova.exec(sendOutcomeCallback, function() {}, "OneSignalPush", "sendOutcome", [name]);
    };

    /**
     * Increases "Count" by 1 only once. This can only be attributed to a single notification.
     * @param  {string} name
     * @param  {(event:OutcomeEvent)=>void} handler
     * @returns void
     */
    sendUniqueOutcome(name: string, handler?: (event: OutcomeEvent) => void): void {
        const sendUniqueOutcomeCallback = (result: OutcomeEvent) => {
            if (handler) {
                handler(result);
            }
        };

        window.cordova.exec(sendUniqueOutcomeCallback, function() {}, "OneSignalPush", "sendUniqueOutcome", [name]);
    };

    /**
     * Increases the "Count" of this Outcome by 1 and the "Sum" by the value. Will be counted each time sent.
     * If the method is called outside of an attribution window, it will be unattributed until a new session occurs.
     * @param  {string} name
     * @param  {string|number} value
     * @param  {(event:OutcomeEvent)=>void} handler
     * @returns void
     */
    sendOutcomeWithValue(name: string, value: string|number, handler?: (event: OutcomeEvent) => void): void {
        if (typeof handler === "undefined") {
            handler = function() {};
        }

        if (typeof handler !== "function") {
            console.error("OneSignal: sendOutcomeWithValue: must provide a valid callback");
            return;
        }

        const sendOutcomeWithValueCallback = (result: OutcomeEvent) => {
            if (handler) {
                handler(result);
            }
        };

        window.cordova.exec(sendOutcomeWithValueCallback, function() {}, "OneSignalPush", "sendOutcomeWithValue", [name, Number(value)]);
    };

    /**
     * Location
     */

    /**
     * Prompts the user for location permissions to allow geotagging from the OneSignal dashboard.
     * @returns void
     */
    promptLocation(): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "promptLocation", []);
    };

    /**
     * Disable or enable location collection (defaults to enabled if your app has location permission).
     * @param  {boolean} shared
     * @returns void
     */
    setLocationShared(shared: boolean): void {
        window.cordova.exec(function() {}, function() {}, "OneSignalPush", "setLocationShared", [shared]);
    };

    /**
     * True if the application has location share activated, false otherwise
     * Passes a boolean on Android and passes an object on iOS to the handler.
     *
     * @param  {(response: boolean | {value: boolean}) => void} handler
     * @returns void
     */
    isLocationShared(handler: (response: boolean | { value: boolean }) => void): void {
        // TODO: Update the response in next major release to just boolean
        window.cordova.exec(handler, function() {}, "OneSignalPush", "isLocationShared", []);
    };
}

//-------------------------------------------------------------------

const OneSignal = new OneSignalPlugin();

if (!window.plugins) {
    window.plugins = {};
}

if (!window.plugins.OneSignal) {
    window.plugins.OneSignal = OneSignal;
}

export default OneSignal;
