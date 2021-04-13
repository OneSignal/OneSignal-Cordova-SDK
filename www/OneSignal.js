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
OneSignal.prototype.startInit = function(appId) {
    OneSignal._appID = appId;
    return this;
};

OneSignal.prototype.handleNotificationWillShowInForeground = function(handleNotificationWillShowInForegroundCallback) {
    OneSignal._notificationWillShowInForegroundDelegate = handleNotificationWillShowInForegroundCallback;
    return this;
};

OneSignal.prototype.handleNotificationOpened = function(handleNotificationOpenedCallback) {
    OneSignal._notificationOpenedDelegate = handleNotificationOpenedCallback;
    return this;
};

OneSignal.prototype.handleInAppMessageClicked = function(handler) {
    OneSignal._inAppMessageClickDelegate = handler;
    return this;
};

OneSignal.prototype.endInit = function() {

    var foregroundParsingHandler = function(notificationReceived) {
        OneSignal._notificationWillShowInForegroundDelegate(new NotificationReceivedEvent(notificationReceived));
    };

    // Pass notification received handler
    cordova.exec(foregroundParsingHandler, function(){}, "OneSignalPush", "setNotificationWillShowInForegroundHandler", []);
    cordova.exec(OneSignal._notificationOpenedDelegate, function(){}, "OneSignalPush", "setNotificationOpenedHandler", []);
    cordova.exec(OneSignal._inAppMessageClickDelegate, function() {}, "OneSignalPush", "setInAppMessageClickHandler", []);
    // Call Init
    cordova.exec(function() {}, function(){}, "OneSignalPush", "init", [OneSignal._appID]);
};

OneSignal._processFunctionList = function(array, param) {
    for (var i = 0; i < array.length; i++)
        array[i](param);
};

OneSignal._formatPermissionObj = function(state) {
    // If Android format, match it to the iOS format
    if ("undefined" !== typeof state.enabled) {
        state.hasPrompted = true;
        state.state = state.enabled ? OneSignal.prototype.OSNotificationPermission.Authorized : OneSignal.prototype.OSNotificationPermission.Denied;
        delete state.enabled
    }
};

OneSignal.prototype.completeNotification = function(notification, shouldDisplay) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "completeNotification", [notification.notificationId, shouldDisplay]);
};

OneSignal.prototype.getDeviceState = function(deviceStateReceivedCallBack) {
    cordova.exec(deviceStateReceivedCallBack, function(){}, "OneSignalPush", "getDeviceState", []);
};

OneSignal.prototype.addSubscriptionObserver = function(callback) {
    OneSignal._subscriptionObserverList.push(callback);
    var subscriptionCallBackProcessor = function(state) {
        OneSignal._processFunctionList(OneSignal._subscriptionObserverList, state);
    };
    cordova.exec(subscriptionCallBackProcessor, function(){}, "OneSignalPush", "addSubscriptionObserver", []);
};

OneSignal.prototype.addEmailSubscriptionObserver = function(callback) {
    OneSignal._emailSubscriptionObserverList.push(callback);
    var emailSubscriptionCallbackProcessor = function(state) {
        OneSignal._processFunctionList(OneSignal._emailSubscriptionObserverList, state);
    };
    cordova.exec(emailSubscriptionCallbackProcessor, function(){}, "OneSignalPush", "addEmailSubscriptionObserver", []);
};

OneSignal.prototype.addPermissionObserver = function(callback) {
    OneSignal._permissionObserverList.push(callback);
    var permissionCallBackProcessor = function(state) {
        OneSignal._formatPermissionObj(state.to);
        OneSignal._formatPermissionObj(state.from);
        OneSignal._processFunctionList(OneSignal._permissionObserverList, state);
    };
    cordova.exec(permissionCallBackProcessor, function(){}, "OneSignalPush", "addPermissionObserver", []);
};

OneSignal.prototype.getTags = function(tagsReceivedCallBack) {
    cordova.exec(tagsReceivedCallBack, function(){}, "OneSignalPush", "getTags", []);
};

OneSignal.prototype.sendTag = function(key, value) {
    var jsonKeyValue = {};
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
OneSignal.prototype.registerForProvisionalAuthorization = function() {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "registerForProvisionalAuthorization", []);
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

class OSNotification {
    constructor(receivedEvent) {
        this.notificationId = receivedEvent.notificationId;
        this.body = receivedEvent.body;
        this.title = receivedEvent.title;
        
        this.actionButtons = receivedEvent.actionButtons;
        this.additionalData = receivedEvent.additionalData;
        this.rawPayload = receivedEvent.rawPayload;
        this.launchURL = receivedEvent.launchURL;
        this.sound = receivedEvent.sound;

        // Android
        if (receivedEvent.groupKey) {
            this.groupKey = receivedEvent.groupKey;
        }
        if (receivedEvent.ledColor) {
            this.ledColor = receivedEvent.ledColor;
        }
        if (receivedEvent.priority) {
            this.priority = receivedEvent.priority;
        }
        if (receivedEvent.smallIcon) {
            this.smallIcon = receivedEvent.smallIcon;
        }
        if (receivedEvent.largeIcon) {
            this.largeIcon = receivedEvent.largeIcon;
        }
        if (receivedEvent.bigPicture) {
            this.bigPicture = receivedEvent.bigPicture;
        }
        if (receivedEvent.collapseId) {
            this.collapseId = receivedEvent.collapseId;
        }
        if (receivedEvent.groupMessage) {
            this.groupMessage = receivedEvent.groupMessage;
        }
        if (receivedEvent.fromProjectNumber) {
            this.fromProjectNumber = receivedEvent.fromProjectNumber;
        }
        if (receivedEvent.smallIconAccentColor) {
            this.smallIconAccentColor = receivedEvent.smallIconAccentColor;
        }
        if (receivedEvent.lockScreenVisibililty) {
            this.lockScreenVisibility = receivedEvent.lockScreenVisibililty;
        }
        if (receivedEvent.androidNotificationId) {
            this.androidNotificationId = receivedEvent.androidNotificationId;
        }

        // iOS
        if (receivedEvent.badge) {
            this.badge = receivedEvent.badge;
        }
        if (receivedEvent.category) {
            this.category = receivedEvent.category;
        }
        if (receivedEvent.threadId) {
            this.threadId = receivedEvent.threadId;
        }
        if (receivedEvent.subtitle) {
            this.subtitle = receivedEvent.subtitle;
        }
        if (receivedEvent.templateId) {
            this.templateId = receivedEvent.templateId;
        }
        if (receivedEvent.attachments) {
            this.attachments = receivedEvent.attachments;
        }
        if (receivedEvent.templateName) {
            this.templateName = receivedEvent.templateName;
        }
        if (receivedEvent.mutableContent) {
            this.mutableContent = receivedEvent.mutableContent;
        }
        if (receivedEvent.badgeIncrement) {
            this.badgeIncrement = receivedEvent.badgeIncrement;
        }
        if (receivedEvent.contentAvailable) {
            this.contentAvailable = receivedEvent.contentAvailable;
        }
    }
}

class NotificationReceivedEvent {
    constructor(receivedEvent) {
        if (receivedEvent.notification) {
            // Android case
            this.notification = new OSNotification(receivedEvent.notification);
        } else {
            // iOS case
            this.notification = new OSNotification(receivedEvent);
        }
    }

    complete(notification) {
        if (!notification) {
            // if the notificationReceivedEvent is null, we want to call the native-side
            // complete/completion with null to silence the notification
            cordova.exec(function(){}, function(){}, "OneSignalPush", "completeNotification", [this.notification.notificationId, false]);
            return;
        }

        // if the notificationReceivedEvent is not null, we want to pass the specific event
        // future: Android side: make the notification modifiable
        // iOS & Android: the notification id is associated with the native-side complete handler / completion block
        cordova.exec(function(){}, function(){}, "OneSignalPush", "completeNotification", [this.notification.notificationId, true]);
    }

    getNotification() {
        return this.notification;
    }
}

//-------------------------------------------------------------------

if(!window.plugins)
    window.plugins = {};

if (!window.plugins.OneSignal)
    window.plugins.OneSignal = new OneSignal();

if (typeof module != 'undefined' && module.exports) {
    module.exports = OneSignal;
}
