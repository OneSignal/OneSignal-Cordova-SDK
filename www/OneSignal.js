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

var OneSignal = function() {
    var _appID = "";
    var _notificationWillShowInForegroundDelegate = function(notificationReceived) {};
    var _notificationOpenedDelegate = function(notificationOpened) {};
    var _inAppMessageClickDelegate = function (action) {};
};

OneSignal.prototype.OSNotificationPermission = {
    NotDetermined: 0,
    Authorized: 1,
    Denied: 2
};

OneSignal._permissionObserverList = [];
OneSignal._subscriptionObserverList = [];
OneSignal._emailSubscriptionObserverList = [];


// You must call init before any other OneSignal function.
OneSignal.prototype.setAppId = function(appId) {
    OneSignal._appID = appId;

    cordova.exec(function() {}, function(){}, "OneSignalPush", "init", [OneSignal._appID]);
};

OneSignal.prototype.handleNotificationWillShowInForeground = function(handleNotificationWillShowInForegroundCallback) {
    OneSignal._notificationWillShowInForegroundDelegate = handleNotificationWillShowInForegroundCallback;
    
    var foregroundParsingHandler = function(notificationReceived) {
        console.log("foregroundParsingHandler " + JSON.stringify(notificationReceived));
        OneSignal._notificationWillShowInForegroundDelegate(OSNotificationReceivedEvent.create(notificationReceived));
    };

    cordova.exec(foregroundParsingHandler, function(){}, "OneSignalPush", "setNotificationWillShowInForegroundHandler", []);
};

OneSignal.prototype.handleNotificationOpened = function(handleNotificationOpenedCallback) {
    OneSignal._notificationOpenedDelegate = handleNotificationOpenedCallback;

    var notificationOpenedHandler = function(json) {
        OneSignal._notificationOpenedDelegate(new OSNotificationOpenedResult(json));
    };

    cordova.exec(notificationOpenedHandler, function(){}, "OneSignalPush", "setNotificationOpenedHandler", []);
};

OneSignal.prototype.handleInAppMessageClicked = function(handler) {
    OneSignal._inAppMessageClickDelegate = handler;

    var inAppMessageClickHandler = function(json) {
        OneSignal._inAppMessageClickDelegate(new OSInAppMessageAction(json));
    };

    cordova.exec(inAppMessageClickHandler, function() {}, "OneSignalPush", "setInAppMessageClickHandler", []);
};

OneSignal._processFunctionList = function(array, param) {
    for (var i = 0; i < array.length; i++)
        array[i](param);
};

OneSignal.prototype.completeNotification = function(notification, shouldDisplay) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "completeNotification", [notification.notificationId, shouldDisplay]);
};

OneSignal.prototype.getDeviceState = function(deviceStateReceivedCallBack) {
    var deviceStateCallback = function(json) {
        deviceStateReceivedCallBack(new OSDeviceState(json));
    };
    cordova.exec(deviceStateCallback, function(){}, "OneSignalPush", "getDeviceState", []);
};

OneSignal.prototype.addSubscriptionObserver = function(callback) {
    OneSignal._subscriptionObserverList.push(callback);
    var subscriptionCallBackProcessor = function(state) {
        OneSignal._processFunctionList(OneSignal._subscriptionObserverList, new OSSubscriptionStateChanges(state));
    };
    cordova.exec(subscriptionCallBackProcessor, function(){}, "OneSignalPush", "addSubscriptionObserver", []);
};

OneSignal.prototype.addEmailSubscriptionObserver = function(callback) {
    OneSignal._emailSubscriptionObserverList.push(callback);
    var emailSubscriptionCallbackProcessor = function(state) {
        OneSignal._processFunctionList(OneSignal._emailSubscriptionObserverList, new OSEmailSubscriptionStateChanges(state));
    };
    cordova.exec(emailSubscriptionCallbackProcessor, function(){}, "OneSignalPush", "addEmailSubscriptionObserver", []);
};

OneSignal.prototype.addPermissionObserver = function(callback) {
    OneSignal._permissionObserverList.push(callback);
    var permissionCallBackProcessor = function(state) {
        OneSignal._processFunctionList(OneSignal._permissionObserverList, new OSPermissionStateChanges(state));
    };
    cordova.exec(permissionCallBackProcessor, function(){}, "OneSignalPush", "addPermissionObserver", []);
};

OneSignal.prototype.getTags = function(tagsReceivedCallBack) {
    cordova.exec(tagsReceivedCallBack, function(){}, "OneSignalPush", "getTags", []);
};

OneSignal.prototype.sendTag = function(key, value) {
    const jsonKeyValue = {};
    jsonKeyValue[key] = value;
    cordova.exec(function(){}, function(){}, "OneSignalPush", "sendTags", [jsonKeyValue]);
};

OneSignal.prototype.sendTags = function(tags) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "sendTags", [tags]);
};

OneSignal.prototype.deleteTag = function(key) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "deleteTags", [key]);
};

OneSignal.prototype.deleteTags = function(keys) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "deleteTags", keys);
};

// Only applies to iOS (does nothing on Android as it always silently registers)
// Call only if you passed false to autoRegister
OneSignal.prototype.registerForProvisionalAuthorization = function(provisionalAuthCallback) {
    cordova.exec(provisionalAuthCallback, function(){}, "OneSignalPush", "registerForProvisionalAuthorization", []);
};

// Only applies to iOS (does nothing on Android as it always silently registers without user permission)
OneSignal.prototype.promptForPushNotificationsWithUserResponse = function(callback) {
    var internalCallback = function(data) {
        callback(data.accepted === "true");
    };
    cordova.exec(internalCallback, function(){}, "OneSignalPush", "promptForPushNotificationsWithUserResponse", []);
};

// Only applies to Android.
OneSignal.prototype.clearOneSignalNotifications = function() {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "clearOneSignalNotifications", []);
};

// Only applies to Android.
// If notifications are disabled for your app, unsubscribe the user from OneSignal.
OneSignal.prototype.unsubscribeWhenNotificationsAreDisabled = function(unsubscribe) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "unsubscribeWhenNotificationsAreDisabled", [unsubscribe]);
};

// Only applies to Android. Cancels a single OneSignal notification based on its Android notification integer ID
OneSignal.prototype.removeNotification = function(id) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "removeNotification", [id]);
};

// Only applies to Android. Cancels a single OneSignal notification based on its Android notification group ID
OneSignal.prototype.removeGroupedNotifications = function(groupId) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "removeGroupedNotifications", [groupId]);
};

OneSignal.prototype.disablePush = function(disable) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "disablePush", [disable]);
};

OneSignal.prototype.postNotification = function(jsonData, onSuccess, onFailure) {
    if (onSuccess == null)
        onSuccess = function() {};

    if (onFailure == null)
        onFailure = function() {};

    cordova.exec(onSuccess, onFailure, "OneSignalPush", "postNotification", [jsonData]);
};

OneSignal.prototype.setLogLevel = function(logLevel) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "setLogLevel", [logLevel]);
};

OneSignal.prototype.userProvidedPrivacyConsent = function(callback) {
    cordova.exec(callback, function(){}, "OneSignalPush", "userProvidedPrivacyConsent", []);
};

OneSignal.prototype.requiresUserPrivacyConsent = function(callback) {
    cordova.exec(callback, function(){}, "OneSignalPush", "requiresUserPrivacyConsent", []);
};

OneSignal.prototype.setRequiresUserPrivacyConsent = function(required) {
    cordova.exec(function() {}, function() {}, "OneSignalPush", "setRequiresUserPrivacyConsent", [required]);
};

OneSignal.prototype.provideUserConsent = function(granted) {
    cordova.exec(function() {}, function() {}, "OneSignalPush", "provideUserConsent", [granted]);
};

/**
 * Email
 */
OneSignal.prototype.setEmail = function(email, emailAuthToken, onSuccess, onFailure) {
    if (onSuccess == null)
        onSuccess = function() {};

    if (onFailure == null)
        onFailure = function() {};

    if (typeof emailAuthToken == 'function') {
        onFailure = onSuccess;
        onSuccess = emailAuthToken;

        cordova.exec(onSuccess, onFailure, "OneSignalPush", "setUnauthenticatedEmail", [email]);
    } else if (emailAuthToken == undefined) {
        cordova.exec(onSuccess, onFailure, "OneSignalPush", "setUnauthenticatedEmail", [email]);
    } else {
        cordova.exec(onSuccess, onFailure, "OneSignalPush", "setEmail", [email, emailAuthToken]);
    }
};

OneSignal.prototype.logoutEmail = function(onSuccess, onFailure) {
    if (onSuccess == null)
        onSuccess = function() {};


    if (onFailure == null)
        onFailure = function() {};

    cordova.exec(onSuccess, onFailure, "OneSignalPush", "logoutEmail", []);
};

/** Possible function usages
  setExternalUserId(externalId: string?): void
  setExternalUserId(externalId: string?, callback: function): void
  setExternalUserId(externalId: string?, externalIdAuthHash: string?, callback: function): void
*/
OneSignal.prototype.setExternalUserId = function(externalId, varArg1, varArg2) {
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
      console.error("Invalid param types passed to OneSignal.setExternalUserId(). Definition is setExternalUserId(externalId: string?, externalIdAuthHash: string?, callback?: function): void")
      return;
    }

    var passToNativeParams = [externalId];
    if (externalIdAuthHash !== null)
        passToNativeParams.push(externalIdAuthHash)
    cordova.exec(callback, function() {}, "OneSignalPush", "setExternalUserId", passToNativeParams);
};

OneSignal.prototype.removeExternalUserId = function(externalUserIdCallback) {
    if (externalUserIdCallback == undefined)
        externalUserIdCallback = function() {};

    cordova.exec(externalUserIdCallback, function() {}, "OneSignalPush", "removeExternalUserId", []);
};

/**
 * In app messaging
 */
OneSignal.prototype.addTriggers = function(triggers) {
    Object.keys(triggers).forEach(function(key){
        // forces values to be string types
        if (typeof triggers[key] !== "string") {
            triggers[key] = JSON.stringify(triggers[key]);
        }
    });
    cordova.exec(function() {}, function() {}, "OneSignalPush", "addTriggers", [triggers]);
};

OneSignal.prototype.addTrigger = function(key, value) {
    var obj = {};
    obj[key] = value;
    OneSignal.prototype.addTriggers(obj);
};

OneSignal.prototype.removeTriggerForKey = function(key) {
    OneSignal.prototype.removeTriggersForKeys([key]);
};

OneSignal.prototype.removeTriggersForKeys = function(keys) {
    if (!Array.isArray(keys)){
        console.error("OneSignal: removeTriggersForKeys: argument must be of type Array")
    }
    cordova.exec(function() {}, function() {}, "OneSignalPush", "removeTriggersForKeys", [keys]);
};

OneSignal.prototype.getTriggerValueForKey = function(key, callback) {
    var getTriggerValueForKeyCallback = function(obj) {
        callback(obj.value);
    };
    cordova.exec(getTriggerValueForKeyCallback, function() {}, "OneSignalPush", "getTriggerValueForKey", [key]);
};

OneSignal.prototype.pauseInAppMessages = function(pause) {
    cordova.exec(function() {}, function() {}, "OneSignalPush", "pauseInAppMessages", [pause]);
};

/**
 * Outcomes
 */
OneSignal.prototype.sendOutcome = function(name, callback) {
    if (typeof callback === "undefined")
        callback = function() {};

    if (typeof callback !== "function") {
        console.error("OneSignal: sendOutcome: must provide a valid callback");
        return;
    }

    const sendOutcomeCallback = function(result) {
        callback(result);
    };

    cordova.exec(sendOutcomeCallback, function() {}, "OneSignalPush", "sendOutcome", [name]);
};

OneSignal.prototype.sendUniqueOutcome = function(name, callback) {
    if (typeof callback === "undefined")
        callback = function() {};

    if (typeof callback !== "function") {
        console.error("OneSignal: sendUniqueOutcome: must provide a valid callback");
        return;
    }

    const sendUniqueOutcomeCallback = function(result) {
        callback(result);
    };

    cordova.exec(sendUniqueOutcomeCallback, function() {}, "OneSignalPush", "sendUniqueOutcome", [name]);
};

OneSignal.prototype.sendOutcomeWithValue = function(name, value, callback) {
    if (typeof callback === "undefined")
        callback = function() {};

    if (typeof callback !== "function") {
        console.error("OneSignal: sendOutcomeWithValue: must provide a valid callback");
        return;
    }

    const sendOutcomeWithValueCallback = function(result) {
        callback(result);
    };

    cordova.exec(sendOutcomeWithValueCallback, function() {}, "OneSignalPush", "sendOutcomeWithValue", [name, Number(value)]);
};

/**
 * Location
 */

OneSignal.prototype.promptLocation = function() {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "promptLocation", []);
};

OneSignal.prototype.setLocationShared = function(shared) {
    cordova.exec(function() {}, function() {}, "OneSignalPush", "setLocationShared", [shared]);
};

OneSignal.prototype.isLocationShared = function(callback) {
    cordova.exec(callback, function() {}, "OneSignalPush", "isLocationShared", []);
};

//-------------------------------------------------------------------

if(!window.plugins)
    window.plugins = {};

if (!window.plugins.OneSignal)
    window.plugins.OneSignal = new OneSignal();

if (typeof module != 'undefined' && module.exports) {
    module.exports = OneSignal;
}
