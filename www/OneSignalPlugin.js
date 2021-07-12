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

var OSNotificationReceivedEvent = require('./NotificationReceived').OSNotificationReceivedEvent;
var OSNotificationOpenedResult = require('./NotificationOpened');
var OSInAppMessageAction = require('./InAppMessage');
var OSDeviceState = require('./Subscription').OSDeviceState;
var OSPermissionStateChanges = require('./Subscription').OSPermissionStateChanges;
var OSSubscriptionStateChanges = require('./Subscription').OSSubscriptionStateChanges;
var OSEmailSubscriptionStateChanges = require('./Subscription').OSEmailSubscriptionStateChanges;
var OSSMSSubscriptionStateChanges = require('./Subscription').OSSMSSubscriptionStateChanges;

var OneSignalPlugin = function() {
    var _appID = "";
    var _notificationWillShowInForegroundDelegate = function(notificationReceived) {};
    var _notificationOpenedDelegate = function(notificationOpened) {};
    var _inAppMessageClickDelegate = function (action) {};
};

OneSignalPlugin.prototype.OSNotificationPermission = {
    NotDetermined: 0,
    Authorized: 1,
    Denied: 2
};

OneSignalPlugin._permissionObserverList = [];
OneSignalPlugin._subscriptionObserverList = [];
OneSignalPlugin._emailSubscriptionObserverList = [];
OneSignalPlugin._smsSubscriptionObserverList = [];

// You must call init before any other OneSignal function.
OneSignalPlugin.prototype.setAppId = function(appId) {
    OneSignalPlugin._appID = appId;

    window.cordova.exec(function() {}, function(){}, "OneSignalPush", "init", [OneSignalPlugin._appID]);
};

OneSignalPlugin.prototype.setNotificationWillShowInForegroundHandler = function(handleNotificationWillShowInForegroundCallback) {
    OneSignalPlugin._notificationWillShowInForegroundDelegate = handleNotificationWillShowInForegroundCallback;
    
    var foregroundParsingHandler = function(notificationReceived) {
        console.log("foregroundParsingHandler " + JSON.stringify(notificationReceived));
        OneSignalPlugin._notificationWillShowInForegroundDelegate(OSNotificationReceivedEvent.create(notificationReceived));
    };

    window.cordova.exec(foregroundParsingHandler, function(){}, "OneSignalPush", "setNotificationWillShowInForegroundHandler", []);
};

OneSignalPlugin.prototype.setNotificationOpenedHandler = function(handleNotificationOpenedCallback) {
    OneSignalPlugin._notificationOpenedDelegate = handleNotificationOpenedCallback;

    var notificationOpenedHandler = function(json) {
        OneSignalPlugin._notificationOpenedDelegate(new OSNotificationOpenedResult(json));
    };

    window.cordova.exec(notificationOpenedHandler, function(){}, "OneSignalPush", "setNotificationOpenedHandler", []);
};

OneSignalPlugin.prototype.setInAppMessageClickHandler = function(handler) {
    OneSignalPlugin._inAppMessageClickDelegate = handler;

    var inAppMessageClickHandler = function(json) {
        OneSignalPlugin._inAppMessageClickDelegate(new OSInAppMessageAction(json));
    };

    window.cordova.exec(inAppMessageClickHandler, function() {}, "OneSignalPush", "setInAppMessageClickHandler", []);
};

OneSignalPlugin._processFunctionList = function(array, param) {
    for (var i = 0; i < array.length; i++)
        array[i](param);
};

OneSignalPlugin.prototype.completeNotification = function(notification, shouldDisplay) {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "completeNotification", [notification.notificationId, shouldDisplay]);
};

OneSignalPlugin.prototype.getDeviceState = function(deviceStateReceivedCallBack) {
    var deviceStateCallback = function(json) {
        deviceStateReceivedCallBack(new OSDeviceState(json));
    };
    window.cordova.exec(deviceStateCallback, function(){}, "OneSignalPush", "getDeviceState", []);
};

OneSignalPlugin.prototype.setLanguage = function(language) {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "setLanguage", [language]);
}

OneSignalPlugin.prototype.addSubscriptionObserver = function(callback) {
    OneSignalPlugin._subscriptionObserverList.push(callback);
    var subscriptionCallBackProcessor = function(state) {
        OneSignalPlugin._processFunctionList(OneSignalPlugin._subscriptionObserverList, new OSSubscriptionStateChanges(state));
    };
    window.cordova.exec(subscriptionCallBackProcessor, function(){}, "OneSignalPush", "addSubscriptionObserver", []);
};

OneSignalPlugin.prototype.addEmailSubscriptionObserver = function(callback) {
    OneSignalPlugin._emailSubscriptionObserverList.push(callback);
    var emailSubscriptionCallbackProcessor = function(state) {
        OneSignalPlugin._processFunctionList(OneSignalPlugin._emailSubscriptionObserverList, new OSEmailSubscriptionStateChanges(state));
    };
    window.cordova.exec(emailSubscriptionCallbackProcessor, function(){}, "OneSignalPush", "addEmailSubscriptionObserver", []);
};

OneSignalPlugin.prototype.addSMSSubscriptionObserver = function(callback) {
    OneSignalPlugin._smsSubscriptionObserverList.push(callback);
    var smsSubscriptionCallbackProcessor = function(state) {
        OneSignalPlugin._processFunctionList(OneSignalPlugin._smsSubscriptionObserverList, new OSSMSSubscriptionStateChanges(state));
    };
    window.cordova.exec(smsSubscriptionCallbackProcessor, function(){}, "OneSignalPush", "addSMSSubscriptionObserver", []);
};

OneSignalPlugin.prototype.addPermissionObserver = function(callback) {
    OneSignalPlugin._permissionObserverList.push(callback);
    var permissionCallBackProcessor = function(state) {
        OneSignalPlugin._processFunctionList(OneSignalPlugin._permissionObserverList, new OSPermissionStateChanges(state));
    };
    window.cordova.exec(permissionCallBackProcessor, function(){}, "OneSignalPush", "addPermissionObserver", []);
};

OneSignalPlugin.prototype.getTags = function(tagsReceivedCallBack) {
    window.cordova.exec(tagsReceivedCallBack, function(){}, "OneSignalPush", "getTags", []);
};

OneSignalPlugin.prototype.sendTag = function(key, value) {
    const jsonKeyValue = {};
    jsonKeyValue[key] = value;
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "sendTags", [jsonKeyValue]);
};

OneSignalPlugin.prototype.sendTags = function(tags) {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "sendTags", [tags]);
};

OneSignalPlugin.prototype.deleteTag = function(key) {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "deleteTags", [key]);
};

OneSignalPlugin.prototype.deleteTags = function(keys) {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "deleteTags", keys);
};

// Only applies to iOS (does nothing on Android as it always silently registers)
// Call only if you passed false to autoRegister
OneSignalPlugin.prototype.registerForProvisionalAuthorization = function(provisionalAuthCallback) {
    window.cordova.exec(provisionalAuthCallback, function(){}, "OneSignalPush", "registerForProvisionalAuthorization", []);
};

// Only applies to iOS (does nothing on Android as it always silently registers without user permission)
OneSignalPlugin.prototype.promptForPushNotificationsWithUserResponse = function(callback) {
    var internalCallback = function(data) {
        callback(data.accepted === "true");
    };
    window.cordova.exec(internalCallback, function(){}, "OneSignalPush", "promptForPushNotificationsWithUserResponse", []);
};

// Only applies to Android.
OneSignalPlugin.prototype.clearOneSignalNotifications = function() {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "clearOneSignalNotifications", []);
};

// Only applies to Android.
// If notifications are disabled for your app, unsubscribe the user from OneSignalPlugin.
OneSignalPlugin.prototype.unsubscribeWhenNotificationsAreDisabled = function(unsubscribe) {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "unsubscribeWhenNotificationsAreDisabled", [unsubscribe]);
};

// Only applies to Android. Cancels a single OneSignal notification based on its Android notification integer ID
OneSignalPlugin.prototype.removeNotification = function(id) {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeNotification", [id]);
};

// Only applies to Android. Cancels a single OneSignal notification based on its Android notification group ID
OneSignalPlugin.prototype.removeGroupedNotifications = function(groupId) {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeGroupedNotifications", [groupId]);
};

OneSignalPlugin.prototype.disablePush = function(disable) {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "disablePush", [disable]);
};

OneSignalPlugin.prototype.postNotification = function(jsonData, onSuccess, onFailure) {
    if (onSuccess == null)
        onSuccess = function() {};

    if (onFailure == null)
        onFailure = function() {};

    window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "postNotification", [jsonData]);
};

OneSignalPlugin.prototype.setLogLevel = function(nsLogLevel, visualLogLevel) {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "setLogLevel", [nsLogLevel, visualLogLevel]);
};

OneSignalPlugin.prototype.userProvidedPrivacyConsent = function(callback) {
    window.cordova.exec(callback, function(){}, "OneSignalPush", "userProvidedPrivacyConsent", []);
};

OneSignalPlugin.prototype.requiresUserPrivacyConsent = function(callback) {
    window.cordova.exec(callback, function(){}, "OneSignalPush", "requiresUserPrivacyConsent", []);
};

OneSignalPlugin.prototype.setRequiresUserPrivacyConsent = function(required) {
    window.cordova.exec(function() {}, function() {}, "OneSignalPush", "setRequiresUserPrivacyConsent", [required]);
};

OneSignalPlugin.prototype.provideUserConsent = function(granted) {
    window.cordova.exec(function() {}, function() {}, "OneSignalPush", "provideUserConsent", [granted]);
};

/**
 * Email
 */
OneSignalPlugin.prototype.setEmail = function(email, emailAuthToken, onSuccess, onFailure) {
    if (onSuccess == null)
        onSuccess = function() {};

    if (onFailure == null)
        onFailure = function() {};

    if (typeof emailAuthToken == 'function') {
        onFailure = onSuccess;
        onSuccess = emailAuthToken;

        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setUnauthenticatedEmail", [email]);
    } else if (emailAuthToken == undefined) {
        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setUnauthenticatedEmail", [email]);
    } else {
        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setEmail", [email, emailAuthToken]);
    }
};

OneSignalPlugin.prototype.logoutEmail = function(onSuccess, onFailure) {
    if (onSuccess == null)
        onSuccess = function() {};


    if (onFailure == null)
        onFailure = function() {};

    window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "logoutEmail", []);
};

/**
 * SMS
 */
OneSignalPlugin.prototype.setSMSNumber = function(smsNumber, smsAuthToken, onSuccess, onFailure) {
    if (onSuccess == null)
        onSuccess = function() {};

    if (onFailure == null)
        onFailure = function() {};

    if (typeof smsAuthToken == 'function') {
        onFailure = onSuccess;
        onSuccess = smsAuthToken;

        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setUnauthenticatedSMSNumber", [smsNumber]);
    } else if (smsAuthToken == undefined) {
        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setUnauthenticatedSMSNumber", [smsNumber]);
    } else {
        window.cordova.exec(onSuccess, onFailure, "OneSignalPush", "setSMSNumber", [smsNumber, smsAuthToken]);
    }
};

OneSignalPlugin.prototype.logoutSMSNumber = function(onSuccess, onFailure) {
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
OneSignalPlugin.prototype.setExternalUserId = function(externalId, varArg1, varArg2) {
    if (externalId == undefined)
        externalId = null;

    var externalIdAuthHash = null;
    var callback = function() {};

    if (typeof varArg1 === "function") {
        // Method was called like setExternalUserId(externalId: string?, callback: function)
        callback = varArg1;
    }
    else if (typeof varArg1 === "string") {
        // Method was called like setExternalUserId(externalId: string?, externalIdAuthHash: string?, callback: function)
        externalIdAuthHash = varArg1;
        callback = varArg2;
    }
    else if (typeof varArg1 === "undefined") {
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

OneSignalPlugin.prototype.removeExternalUserId = function(externalUserIdCallback) {
    if (externalUserIdCallback == undefined)
        externalUserIdCallback = function() {};

    window.cordova.exec(externalUserIdCallback, function() {}, "OneSignalPush", "removeExternalUserId", []);
};

/**
 * In app messaging
 */
OneSignalPlugin.prototype.addTriggers = function(triggers) {
    Object.keys(triggers).forEach(function(key){
        // forces values to be string types
        if (typeof triggers[key] !== "string") {
            triggers[key] = JSON.stringify(triggers[key]);
        }
    });
    window.cordova.exec(function() {}, function() {}, "OneSignalPush", "addTriggers", [triggers]);
};

OneSignalPlugin.prototype.addTrigger = function(key, value) {
    var obj = {};
    obj[key] = value;
    OneSignalPlugin.prototype.addTriggers(obj);
};

OneSignalPlugin.prototype.removeTriggerForKey = function(key) {
    OneSignalPlugin.prototype.removeTriggersForKeys([key]);
};

OneSignalPlugin.prototype.removeTriggersForKeys = function(keys) {
    if (!Array.isArray(keys)){
        console.error("OneSignal: removeTriggersForKeys: argument must be of type Array")
    }
    window.cordova.exec(function() {}, function() {}, "OneSignalPush", "removeTriggersForKeys", [keys]);
};

OneSignalPlugin.prototype.getTriggerValueForKey = function(key, callback) {
    var getTriggerValueForKeyCallback = function(obj) {
        callback(obj.value);
    };
    window.cordova.exec(getTriggerValueForKeyCallback, function() {}, "OneSignalPush", "getTriggerValueForKey", [key]);
};

OneSignalPlugin.prototype.pauseInAppMessages = function(pause) {
    window.cordova.exec(function() {}, function() {}, "OneSignalPush", "pauseInAppMessages", [pause]);
};

/**
 * Outcomes
 */
OneSignalPlugin.prototype.sendOutcome = function(name, callback) {
    if (typeof callback === "undefined")
        callback = function() {};

    if (typeof callback !== "function") {
        console.error("OneSignal: sendOutcome: must provide a valid callback");
        return;
    }

    const sendOutcomeCallback = function(result) {
        callback(result);
    };

    window.cordova.exec(sendOutcomeCallback, function() {}, "OneSignalPush", "sendOutcome", [name]);
};

OneSignalPlugin.prototype.sendUniqueOutcome = function(name, callback) {
    if (typeof callback === "undefined")
        callback = function() {};

    if (typeof callback !== "function") {
        console.error("OneSignal: sendUniqueOutcome: must provide a valid callback");
        return;
    }

    const sendUniqueOutcomeCallback = function(result) {
        callback(result);
    };

    window.cordova.exec(sendUniqueOutcomeCallback, function() {}, "OneSignalPush", "sendUniqueOutcome", [name]);
};

OneSignalPlugin.prototype.sendOutcomeWithValue = function(name, value, callback) {
    if (typeof callback === "undefined")
        callback = function() {};

    if (typeof callback !== "function") {
        console.error("OneSignal: sendOutcomeWithValue: must provide a valid callback");
        return;
    }

    const sendOutcomeWithValueCallback = function(result) {
        callback(result);
    };

    window.cordova.exec(sendOutcomeWithValueCallback, function() {}, "OneSignalPush", "sendOutcomeWithValue", [name, Number(value)]);
};

/**
 * Location
 */

OneSignalPlugin.prototype.promptLocation = function() {
    window.cordova.exec(function(){}, function(){}, "OneSignalPush", "promptLocation", []);
};

OneSignalPlugin.prototype.setLocationShared = function(shared) {
    window.cordova.exec(function() {}, function() {}, "OneSignalPush", "setLocationShared", [shared]);
};

OneSignalPlugin.prototype.isLocationShared = function(callback) {
    window.cordova.exec(callback, function() {}, "OneSignalPush", "isLocationShared", []);
};

//-------------------------------------------------------------------

var OneSignal = new OneSignalPlugin();
module.exports = OneSignal;

if(!window.plugins)
    window.plugins = {};

if (!window.plugins.OneSignal)
    window.plugins.OneSignal = OneSignal;