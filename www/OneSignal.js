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

    var notificationOpenedHandler = function(json) {
        OneSignal._notificationOpenedDelegate(new OSNotificationOpenedResult(json));
    };

    var inAppMessageClickHandler = function(json) {
        OneSignal._inAppMessageClickDelegate(new OSInAppMessageAction(json));
    };

    // Pass notification received handler
    cordova.exec(foregroundParsingHandler, function(){}, "OneSignalPush", "setNotificationWillShowInForegroundHandler", []);
    cordova.exec(notificationOpenedHandler, function(){}, "OneSignalPush", "setNotificationOpenedHandler", []);
    cordova.exec(inAppMessageClickHandler, function() {}, "OneSignalPush", "setInAppMessageClickHandler", []);
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
        /// The OneSignal notification ID for this notification
        this.notificationId = receivedEvent.notificationId;
        /// The body (should contain most of the text)
        this.body = receivedEvent.body;
        /// The title for the notification
        this.title = receivedEvent.title;
        /// Any additional custom data you want to send along
        /// with this notification.
        this.additionalData = receivedEvent.additionalData;
        /// A hashmap object representing the raw key/value
        /// properties of the push notification
        this.rawPayload = receivedEvent.rawPayload;
        /// If set, he launch URL will be opened when the user
        /// taps on your push notification. You can control
        /// whether or not it opens in an in-app webview or
        /// in Safari (with iOS).
        this.launchURL = receivedEvent.launchURL;
        /// The sound file (ie. ping.aiff) that should be played
        /// when the notification is received
        this.sound = receivedEvent.sound;

        /// Any buttons you want to add to the notification.
        /// The notificationOpened handler will provide an
        /// OSNotificationAction object, which will contain
        /// the ID of the Action the user tapped.
        if (receivedEvent.actionButtons) {
            this.actionButtons = [];
            for (let btn of receivedEvent.actionButtons) {
                this.actionButtons.push(new OSActionButton(btn));
            }
        }

        // Android

        /// (Android only)
        /// All notifications with the same group key
        /// from the same app will be grouped together
        if (receivedEvent.groupKey) {
            this.groupKey = receivedEvent.groupKey;
        }
        /// (Android Only)
        /// The color to use to light up the LED (if
        /// applicable) when the notification is received
        /// Given in hex ARGB format.
        if (receivedEvent.ledColor) {
            this.ledColor = receivedEvent.ledColor;
        }
        /// (Android Only)
        /// The priority used with GCM/FCM to describe how
        /// urgent the notification is. A higher priority
        /// means the notification will be delivered faster.
        /// Default = 10.
        if (receivedEvent.priority) {
            this.priority = receivedEvent.priority;
        }
        /// (Android Only)
        /// The filename of the image to use as the small
        /// icon for the notification
        if (receivedEvent.smallIcon) {
            this.smallIcon = receivedEvent.smallIcon;
        }
        /// (Android Only)
        /// The filename for the image to use as the large
        /// icon for the notification
        if (receivedEvent.largeIcon) {
            this.largeIcon = receivedEvent.largeIcon;
        }
        /// (Android Only)
        /// The URL or filename for the image to use as
        /// the big picture for the notification
        if (receivedEvent.bigPicture) {
            this.bigPicture = receivedEvent.bigPicture;
        }
        /// (Android Only)
        /// The collapse ID for the notification
        /// As opposed to groupKey (which causes stacking),
        /// the collapse ID will completely replace any
        /// previously received push notifications that
        /// use the same collapse_id
        if (receivedEvent.collapseId) {
            this.collapseId = receivedEvent.collapseId;
        }
        /// (Android only) Android 6 and earlier only
        /// The message to display when multiple
        /// notifications have been stacked together.
        /// Note: Android 7 allows groups (stacks)
        /// to be expanded, so group message is no
        /// longer necessary
        if (receivedEvent.groupMessage) {
            this.groupMessage = receivedEvent.groupMessage;
        }
        /// (Android Only)
        /// Tells you what project number/sender ID
        /// the notification was sent from
        if (receivedEvent.fromProjectNumber) {
            this.fromProjectNumber = receivedEvent.fromProjectNumber;
        }
        /// (Android Only)
        /// The accent color to use on the notification
        /// Hex value in ARGB format (it's a normal
        /// hex color value, but it includes the alpha
        /// channel in addition to red, green, blue)
        if (receivedEvent.smallIconAccentColor) {
            this.smallIconAccentColor = receivedEvent.smallIconAccentColor;
        }
        /// (Android only) API level 21+
        /// Sets the visibility of the notification
        ///  1 = Public (default)
        ///  0 = Private (hidden from lock screen
        ///    if user set 'Hide Sensitive content')
        ///  -1 = Secret (doesn't appear at all)
        if (receivedEvent.lockScreenVisibililty) {
            this.lockScreenVisibility = receivedEvent.lockScreenVisibililty;
        }
        /// (Android Only)
        /// The android notification ID (not same as  the OneSignal
        /// notification ID)
        if (receivedEvent.androidNotificationId) {
            this.androidNotificationId = receivedEvent.androidNotificationId;
        }
        /// (Android Only)
        /// Describes the background image layout of the
        /// notification (if set)
        if (receivedEvent.backgroundImageLayout) {
            this.backgroundImageLayout = new OSAndroidBackgroundImageLayout(receivedEvent.backgroundImageLayout);
        }
        /// (Android Only)
        /// Summary notifications grouped
        /// Notification payload will have the most recent notification received.
        if (receivedEvent.groupedNotifications && receivedEvent.groupedNotifications.length) {
            this.groupedNotifications = receivedEvent.groupedNotificationss.map(function(num) {
                return new OSNotification(item);
            });
        }

        // iOS

        /// (iOS Only)
        /// If you set the badge to a specific value, this integer
        /// property will be that value
        if (receivedEvent.badge) {
            this.badge = receivedEvent.badge;
        }
        /// (iOS Only)
        /// The category for this notification. This can trigger custom
        /// behavior (ie. if this notification should display a
        /// custom Content Extension for custom UI)
        if (receivedEvent.category) {
            this.category = receivedEvent.category;
        }
        /// (iOS Only)
        /// The subtitle of the notification
        if (receivedEvent.subtitle) {
            this.subtitle = receivedEvent.subtitle;
        }
        /// If this notification was created from a Template on the
        /// OneSignal dashboard, this will be the ID of that template
        if (receivedEvent.templateId) {
            this.templateId = receivedEvent.templateId;
        }
        /// (iOS Only)
        /// Any attachments (images, sounds, videos) you want
        /// to display with this notification.
        if (receivedEvent.attachments) {
            this.attachments = receivedEvent.attachments;
        }
        /// The name of the template (if any) that was used to
        /// create this push notification
        if (receivedEvent.templateName) {
            this.templateName = receivedEvent.templateName;
        }
        /// (iOS Only)
        /// Tells the system to launch the Notification Extension Service
        if (receivedEvent.mutableContent) {
            this.mutableContent = receivedEvent.mutableContent;
        }
        /// (iOS Only)
        /// If you want to increment the badge by some value, this
        /// integer will be the increment/decrement
        if (receivedEvent.badgeIncrement) {
            this.badgeIncrement = receivedEvent.badgeIncrement;
        }
        /// (iOS Only)
        /// Tells the system to launch your app in the background (ie. if
        /// content is available to download in the background)
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
  
/// Represents a button sent as part of a push notification
class OSActionButton {
  constructor(json) {
        /// The custom unique ID for this button
        this.id = json.id;
        /// The text to display for the button
        this.text = json.text;
    
        /// (Android only)
        /// The URL/filename to show as the
        /// button's icon
        if (json.icon) {
            this.icon = json.icon;
        }
    }
}
  
/// (Android Only)
/// This class represents the background image layout
/// used for push notifications that show a background image
class OSAndroidBackgroundImageLayout {
    constructor(json) {
        /// (Android Only)
        /// The image URL/filename to show as the background image
        if (json.image) {
            this.image = json.image;
        }
        /// (Android Only)
        /// The color of the title text
        if (json.titleTextColor) {
            this.titleTextColor = json.titleTextColor;
        }
        /// (Android Only)
        /// The color of the body text
        if (json.bodyTextColor) {
            this.bodyTextColor = json.bodyTextColor;
        }
    }
}

/// An instance of this class represents a user interaction with
/// your push notification, ie. if they tap a button
class OSNotificationOpenedResult {
    constructor(json) {
        this.notification = new OSNotification(json.notification);

        if (json.action) {
            this.action = new OSNotificationAction(json.action);
        }
    }
}

/// Represents an action taken on a push notification, such as
/// tapping the notification (or a button on the notification),
/// or if your `inFocusDisplayType` is set to true - if they
/// tapped 'close'.
class OSNotificationAction {
    constructor(json) {
        /// The ID of the button on your notification
        /// that the user tapped
        this.actionId = json.actionId;

        /// An int that represents whether the user `opened` or
        /// took a more specific `action` (such as tapping a button
        /// on the notification)
        this.type = json.type;
    }
}

class OSInAppMessageAction {
    constructor(json) {
        this.clickName = json.click_name;
        this.clickUrl = json.click_url;
        this.firstClick = json.first_click;
        this.closesMessage = json.closes_message;
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
