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

import { OpenedEvent } from "./models/NotificationOpened";
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

import User from "./UserNamespace";
import Debug from "./DebugNamespace";
import Session from "./SessionNamespace";
import Location from "./LocationNamespace";
import InAppMessages from "./InAppMessagesNamespace";

// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export class OneSignalPlugin {
    User: User = new User();
    Debug: Debug = new Debug();
    Session: Session = new Session();
    Location: Location = new Location();
    InAppMessages: InAppMessages = new InAppMessages();

    private _appID = "";
    private _notificationWillShowInForegroundDelegate = function(notificationReceived: NotificationReceivedEvent) {};
    private _notificationOpenedDelegate = function(notificationOpened: OpenedEvent) {};

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

        const observerCallback = () => {
            this.User.pushSubscription.setPropertiesAndObserver();
        }

        window.cordova.exec(observerCallback, function(){}, "OneSignalPush", "init", [this._appID]);
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
     * Live Activities
     */

    /**
     * Enter a live activity
     * @param  {string} activityId
     * @param  {string} token
     * @param  {Function} onSuccess
     * @param  {Function} onFailure
     * @returns void
     */
    enterLiveActivity(activityId: string, token: string, onSuccess?: Function, onFailure?: Function): void {
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
     exitLiveActivity(activityId: string, onSuccess?: Function, onFailure?: Function): void {
        if (onSuccess == null) {
            onSuccess = function() {};
        }

        if (onFailure == null) {
            onFailure = function() {};
        }

        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "exitLiveActivity", [activityId]);
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
