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

import { InAppMessageAction, OSInAppMessage } from "./models/InAppMessage";
import { OpenedEvent } from "./models/NotificationOpened";
import NotificationReceivedEvent from "./NotificationReceivedEvent";
import {
    ChangeEvent,
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

class OneSignalPlugin {
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
        for (let i = 0; i < array.length; i++)
            array[i](param);
    }

// You must call init before any other OneSignal function.
setAppId(appId: string): void {
    this._appID = appId;

    window.cordova.exec(function() {}, function(){}, "OneSignalPush", "init", [this._appID]);
};

setNotificationWillShowInForegroundHandler(handler: (event: NotificationReceivedEvent) => void): void {
    this._notificationWillShowInForegroundDelegate = handler;
    
    const foregroundParsingHandler = (notificationReceived) => {
        console.log("foregroundParsingHandler " + JSON.stringify(notificationReceived));
        this._notificationWillShowInForegroundDelegate(OSNotificationReceivedEvent.create(notificationReceived));
    };

    window.cordova.exec(foregroundParsingHandler, function(){}, "OneSignalPush", "setNotificationWillShowInForegroundHandler", []);
};

setNotificationOpenedHandler(handler: (openedEvent: OpenedEvent) => void): void {
    this._notificationOpenedDelegate = handler;

    const notificationOpenedHandler = (json) => {
        this._notificationOpenedDelegate(new OSNotificationOpenedResult(json));
    };

    window.cordova.exec(notificationOpenedHandler, function(){}, "OneSignalPush", "setNotificationOpenedHandler", []);
};

setInAppMessageClickHandler(handler: (action: InAppMessageAction) => void): void {
    this._inAppMessageClickDelegate = handler;

    const inAppMessageClickHandler = (json) => {
        this._inAppMessageClickDelegate(new OSInAppMessageAction(json));
    };

    window.cordova.exec(inAppMessageClickHandler, function() {}, "OneSignalPush", "setInAppMessageClickHandler", []);
};

setInAppMessageLifecycleHandler(handlerObject: InAppMessageLifecycleHandlerObject) : void {
    if (handlerObject.onWillDisplayInAppMessage) {
        this._onWillDisplayInAppMessageDelegate = handlerObject.onWillDisplayInAppMessage;

        const onWillDisplayInAppMessageHandler = (json) => {
            this._onWillDisplayInAppMessageDelegate(new OSInAppMessage(json));
        };

        window.cordova.exec(onWillDisplayInAppMessageHandler, function() {}, "OneSignalPush", "setOnWillDisplayInAppMessageHandler", []);
    }
    if (handlerObject.onDidDisplayInAppMessage) {
        this._onDidDisplayInAppMessageDelegate = handlerObject.onDidDisplayInAppMessage;

        const onDidDisplayInAppMessageHandler = (json) => {
            this._onDidDisplayInAppMessageDelegate(new OSInAppMessage(json));
        };

        window.cordova.exec(onDidDisplayInAppMessageHandler, function() {}, "OneSignalPush", "setOnDidDisplayInAppMessageHandler", []);
    }
    if (handlerObject.onWillDismissInAppMessage) {
        this._onWillDismissInAppMessageDelegate = handlerObject.onWillDismissInAppMessage;

        const onWillDismissInAppMessageHandler = (json) => {
            this._onWillDismissInAppMessageDelegate(new OSInAppMessage(json));
        };

        window.cordova.exec(onWillDismissInAppMessageHandler, function() {}, "OneSignalPush", "setOnWillDismissInAppMessageHandler", []);
    }
    if (handlerObject.onDidDismissInAppMessage) {
        this._onDidDismissInAppMessageDelegate = handlerObject.onDidDismissInAppMessage;

        const onDidDismissInAppMessageHandler = (json) => {
            this._onDidDismissInAppMessageDelegate(new OSInAppMessage(json));
        };

        window.cordova.exec(onDidDismissInAppMessageHandler, function() {}, "OneSignalPush", "setOnDidDismissInAppMessageHandler", []);
    }

    window.cordova.exec(function() {}, function() {}, "OneSignalPush", "setInAppMessageLifecycleHandler", []);
};

getDeviceState(handler: (response: DeviceState) => void): void {
    const deviceStateCallback = (json) => {
        deviceStateReceivedCallBack(new OSDeviceState(json));
    };
    window.cordova.exec(deviceStateCallback, function(){}, "OneSignalPush", "getDeviceState", []);
};

setLanguage(language: string, onSuccess?: (success: object) => void, onFailure?: (failure: object) => void): void {
    if (onSuccess == null)
        onSuccess = function() {};

    if (onFailure == null)
        onFailure = function() {};

    window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setLanguage", [language]);
}

addSubscriptionObserver(observer: (event: ChangeEvent<SubscriptionChange>) => void): void {
    this._subscriptionObserverList.push(observer);
    const subscriptionCallBackProcessor = (state) => {
        this._processFunctionList(this._subscriptionObserverList, new OSSubscriptionStateChanges(state));
    };
    window.cordova.exec(subscriptionCallBackProcessor, function(){}, "OneSignalPush", "addSubscriptionObserver", []);
};

addEmailSubscriptionObserver(observer: (event: ChangeEvent<EmailSubscriptionChange>) => void): void {
    this._emailSubscriptionObserverList.push(observer);
    const emailSubscriptionCallbackProcessor = (state) => {
        this._processFunctionList(this._emailSubscriptionObserverList, new OSEmailSubscriptionStateChanges(state));
    };
    window.cordova.exec(emailSubscriptionCallbackProcessor, function(){}, "OneSignalPush", "addEmailSubscriptionObserver", []);
};

addSMSSubscriptionObserver(observer: (event: ChangeEvent<SMSSubscriptionChange>) => void): void {
    this._smsSubscriptionObserverList.push(observer);
    const smsSubscriptionCallbackProcessor = (state) => {
        this._processFunctionList(this._smsSubscriptionObserverList, new OSSMSSubscriptionStateChanges(state));
    };
    window.cordova.exec(smsSubscriptionCallbackProcessor, function(){}, "OneSignalPush", "addSMSSubscriptionObserver", []);
};

addPermissionObserver(observer: (event: ChangeEvent<PermissionChange>) => void): void {
    this._permissionObserverList.push(observer);
    const permissionCallBackProcessor = (state) => {
        this._processFunctionList(this._permissionObserverList, new OSPermissionStateChanges(state));
    };
    window.cordova.exec(permissionCallBackProcessor, function(){}, "OneSignalPush", "addPermissionObserver", []);
};

getTags(handler: (tags: object) => void): void {
    window.cordova.exec(handler, function(){}, "OneSignalPush", "getTags", []);
};

sendTag(key: string, value: string): void {
    const jsonKeyValue = {};
    jsonKeyValue[key] = value;
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "sendTags", [jsonKeyValue]);
};

sendTags(tags: object): void {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "sendTags", [tags]);
};

deleteTag(key: string): void {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "deleteTags", [key]);
};

deleteTags(keys: string[]): void {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "deleteTags", keys);
};

// Only applies to iOS (does nothing on Android as it always silently registers)
// Call only if you passed false to autoRegister
registerForProvisionalAuthorization(handler?: (response: boolean) => void): void {
    window.cordova.exec(handler, function(){}, "OneSignalPush", "registerForProvisionalAuthorization", []);
};

// Only applies to iOS (does nothing on Android as it always silently registers without user permission)
promptForPushNotificationsWithUserResponse(handler?: (response: boolean) => void): void {
    const internalCallback = (data) => {
        handler(data.accepted === "true");
    };
    window.cordova.exec(internalCallback, function(){}, "OneSignalPush", "promptForPushNotificationsWithUserResponse", []);
};

// Only applies to Android.
clearOneSignalNotifications(): void {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "clearOneSignalNotifications", []);
};

// Only applies to Android.
// If notifications are disabled for your app, unsubscribe the user from OneSignalPlugin.
unsubscribeWhenNotificationsAreDisabled(unsubscribe: boolean): void {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "unsubscribeWhenNotificationsAreDisabled", [unsubscribe]);
};

// Only applies to Android. Cancels a single OneSignal notification based on its Android notification integer ID
removeNotification(id: number): void {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeNotification", [id]);
};

// Only applies to Android. Cancels a single OneSignal notification based on its Android notification group ID
removeGroupedNotifications(id: string): void {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeGroupedNotifications", [groupId]);
};

disablePush(disable: boolean): void {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "disablePush", [disable]);
};

postNotification(notificationObjectString: string, onSuccess?: (success: object) => void, onFailure?: (failure: object) => void): void {
    if (onSuccess == null)
        onSuccess = function() {};

    if (onFailure == null)
        onFailure = function() {};

    window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "postNotification", [jsonData]);
};

// Only applies to iOS
setLaunchURLsInApp(isEnabled: boolean): void {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "setLaunchURLsInApp", [isEnabled]);
};

setLogLevel(nsLogLevel: LogLevel, visualLogLevel: LogLevel): void {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "setLogLevel", [nsLogLevel, visualLogLevel]);
};

userProvidedPrivacyConsent(handler: (response: boolean) => void): void {
    window.cordova.exec(handler, function(){}, "OneSignalPush", "userProvidedPrivacyConsent", []);
};

requiresUserPrivacyConsent(handler: (response: boolean) => void): void {
    window.cordova.exec(handler, function(){}, "OneSignalPush", "requiresUserPrivacyConsent", []);
};

setRequiresUserPrivacyConsent(required: boolean): void {
    window.cordova.exec(function() {}, function() {}, "OneSignalPush", "setRequiresUserPrivacyConsent", [required]);
};

provideUserConsent(granted: boolean): void {
    window.cordova.exec(function() {}, function() {}, "OneSignalPush", "provideUserConsent", [granted]);
};

/**
 * Email
 */

setEmail(email: string, authCode?: string, onSuccess?: Function, onFailure?: Function): void {
    if (onSuccess == null)
        onSuccess = function() {};

    if (onFailure == null)
        onFailure = function() {};

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

logoutEmail(onSuccess?: Function, onFailure?: Function): void {
    if (onSuccess == null)
        onSuccess = function() {};


    if (onFailure == null)
        onFailure = function() {};

    window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "logoutEmail", []);
};

/**
 * SMS
 */

setSMSNumber(smsNumber: string, authCode?: string, onSuccess?: Function, onFailure?: Function): void {
    if (onSuccess == null)
        onSuccess = function() {};

    if (onFailure == null)
        onFailure = function() {};

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

logoutSMSNumber(onSuccess?: Function, onFailure?: Function): void {
    if (onSuccess == null)
        onSuccess = function() {};


    if (onFailure == null)
        onFailure = function() {};

    window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "logoutSMSNumber", []);
};

/** Possible function usages
  setExternalUserId(externalId: string?): void
  setExternalUserId(externalId: string?, callback: function): void
  setExternalUserId(externalId: string?, externalIdAuthHash: string?, callback: function): void
*/
setExternalUserId(externalId: string, handlerOrAuth?: ((results: object) => void) | string, handler?: (results: object) => void): void {
    if (externalId == undefined)
        externalId = null;

    var externalIdAuthHash = null;
    var callback = function() {};

    if (typeof handlerOrAuth === "function") {
        // Method was called like setExternalUserId(externalId: string?, callback: function)
        callback = handlerOrAuth;
    }
    else if (typeof handlerOrAuth === "string") {
        // Method was called like setExternalUserId(externalId: string?, externalIdAuthHash: string?, callback: function)
        externalIdAuthHash = handlerOrAuth;
        callback = handler;
    }
    else if (typeof handlerOrAuth === "undefined") {
        // Method was called like setExternalUserId(externalId: string?)
        // Defaults defined above for externalIdAuthHash and callback
    }
    else {
      // This does not catch all possible wrongly typed params but prevents a good number of them
      console.error("Invalid param types passed to OneSignalPlugin.setExternalUserId(). Definition is setExternalUserId(externalId: string?, externalIdAuthHash: string?, callback?: function): void")
      return;
    }

    var passToNativeParams = [externalId];
    if (externalIdAuthHash !== null)
        passToNativeParams.push(externalIdAuthHash)
    window.cordova.exec(callback, function() {}, "OneSignalPush", "setExternalUserId", passToNativeParams);
};

removeExternalUserId(handler?: (results: object) => void): void {
    if (handler == undefined) {
        handler = function() {};
    }
    window.cordova.exec(handler, function() {}, "OneSignalPush", "removeExternalUserId", []);
};

/**
 * In app messaging
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

addTrigger(key: string, value: string): void {
    var obj = {};
    obj[key] = value;
    this.addTriggers(obj);
};

removeTriggerForKey(key: string): void {
    this.removeTriggersForKeys([key]);
};

removeTriggersForKeys(keys: string[]): void {
    if (!Array.isArray(keys)){
        console.error("OneSignal: removeTriggersForKeys: argument must be of type Array")
    }
    window.cordova.exec(function() {}, function() {}, "OneSignalPush", "removeTriggersForKeys", [keys]);
};

getTriggerValueForKey(key: string, handler: (value: string) => void): void {
    const getTriggerValueForKeyCallback = (obj) => {
        handler(obj.value);
    };
    window.cordova.exec(getTriggerValueForKeyCallback, function() {}, "OneSignalPush", "getTriggerValueForKey", [key]);
};

pauseInAppMessages(pause: boolean): void {
    window.cordova.exec(function() {}, function() {}, "OneSignalPush", "pauseInAppMessages", [pause]);
};

/**
 * Outcomes
 */

sendOutcome(name: string, handler?: (event: OutcomeEvent) => void): void {
    if (typeof handler === "undefined") {
        handler = function() {};
    }

    if (typeof handler !== "function") {
        console.error("OneSignal: sendOutcome: must provide a valid callback");
        return;
    }

    const sendOutcomeCallback = (result) => {
        handler(result);
    };

    window.cordova.exec(sendOutcomeCallback, function() {}, "OneSignalPush", "sendOutcome", [name]);
};

sendUniqueOutcome(name: string, handler?: (event: OutcomeEvent) => void): void {
    if (typeof handler === "undefined") {
        handler = function() {};
    }

    if (typeof handler !== "function") {
        console.error("OneSignal: sendUniqueOutcome: must provide a valid callback");
        return;
    }

    const sendUniqueOutcomeCallback = (result) => {
        handler(result);
    };

    window.cordova.exec(sendUniqueOutcomeCallback, function() {}, "OneSignalPush", "sendUniqueOutcome", [name]);
};

sendOutcomeWithValue(name: string, value: string|number, handler?: (event: OutcomeEvent) => void): void {
    if (typeof handler === "undefined") {
        handler = function() {};
    }

    if (typeof handler !== "function") {
        console.error("OneSignal: sendOutcomeWithValue: must provide a valid callback");
        return;
    }

    const sendOutcomeWithValueCallback = (result) => {
        handler(result);
    };

    window.cordova.exec(sendOutcomeWithValueCallback, function() {}, "OneSignalPush", "sendOutcomeWithValue", [name, Number(value)]);
};

/**
 * Location
 */

promptLocation(): void {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "promptLocation", []);
};

setLocationShared(shared: boolean): void {
    window.cordova.exec(function() {}, function() {}, "OneSignalPush", "setLocationShared", [shared]);
};

isLocationShared(handler: (response: boolean) => void): void {
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
