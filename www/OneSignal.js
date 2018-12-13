/**
 * Modified MIT License
 * 
 * Copyright 2017 OneSignal
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
    var _googleProjectNumber = "";
    var _iOSSettings = {};
    var _notificationReceivedDelegate = function() {};
    var _notificationOpenedDelegate = function() {};
};

OneSignal.prototype.OSInFocusDisplayOption = {
    None: 0,
    InAppAlert : 1,
    Notification : 2
};

OneSignal.prototype.OSNotificationPermission = {
    NotDetermined: 0,
    Authorized: 1,
    Denied: 2
};

OneSignal._displayOption = OneSignal.prototype.OSInFocusDisplayOption.InAppAlert;

OneSignal._permissionObserverList = [];
OneSignal._subscriptionObserverList = [];
OneSignal._emailSubscriptionObserverList = [];


// You must call init before any other OneSignal function.
//  Android - googleProjectNumber: Deprecated; pulled from dashboard, local value is ignored
OneSignal.prototype.startInit = function(appId, googleProjectNumber) {
    OneSignal._appID = appId;
    OneSignal._googleProjectNumber = googleProjectNumber;
    return this;
};

OneSignal.prototype.handleNotificationReceived = function(handleNotificationReceivedCallback) {
    OneSignal._notificationReceivedDelegate = handleNotificationReceivedCallback;
    return this;
};

OneSignal.prototype.handleNotificationOpened = function(handleNotificationOpenedCallback) {
    OneSignal._notificationOpenedDelegate = handleNotificationOpenedCallback;
    return this;
};

OneSignal.prototype.inFocusDisplaying = function(display) {
    OneSignal._displayOption = display;
    return this;
};

//Possible settings keys:
// kOSSettingsKeyInAppLaunchURL: Bool. Enable in-app webviews for urls. Default: Enabled
// kOSSettingsKeyAutoPrompt: Bool. Enable automatic prompting for notifications. Default: Enabled
OneSignal.prototype.iOSSettings = function(settings) {
    OneSignal._iOSSettings = settings;
    return this;
};

OneSignal.prototype.endInit = function() {

    //Pass notification received handler
    cordova.exec(OneSignal._notificationReceivedDelegate, function(){}, "OneSignalPush", "setNotificationReceivedHandler", []);
    cordova.exec(OneSignal._notificationOpenedDelegate, function(){}, "OneSignalPush", "setNotificationOpenedHandler", []);

    //Call Init
    cordova.exec(function() {}, function(){}, "OneSignalPush", "init", [OneSignal._appID, OneSignal._googleProjectNumber, OneSignal._iOSSettings, OneSignal._displayOption]);
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

OneSignal.prototype.addPermissionObserver = function(callback) {
  OneSignal._permissionObserverList.push(callback);
  var permissionCallBackProcessor = function(state) {
    OneSignal._formatPermissionObj(state.to);
    OneSignal._formatPermissionObj(state.from);
    OneSignal._processFunctionList(OneSignal._permissionObserverList, state);
  };
  cordova.exec(permissionCallBackProcessor, function(){}, "OneSignalPush", "addPermissionObserver", []);
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
}

OneSignal.prototype.setInFocusDisplaying = function(displayType) {
  OneSignal._displayOption = displayType;
  cordova.exec(function(){}, function(){}, "OneSignalPush", "setInFocusDisplaying", [displayType]);
};

OneSignal.prototype.getPermissionSubscriptionState = function(callback) {
  var internalCallBackProcessor = function(state) {
    OneSignal._formatPermissionObj(state.permissionStatus);
    callback(state);
  };
  cordova.exec(internalCallBackProcessor, function(){}, "OneSignalPush", "getPermissionSubscriptionState", []);
};

OneSignal.prototype.getIds = function(IdsReceivedCallBack) {
  cordova.exec(IdsReceivedCallBack, function(){}, "OneSignalPush", "getIds", []);
};

OneSignal.prototype.getTags = function(tagsReceivedCallBack) {
    cordova.exec(tagsReceivedCallBack, function(){}, "OneSignalPush", "getTags", []);
};

OneSignal.prototype.sendTag = function(key, value) {
    jsonKeyValue = {};
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

// Only applies to iOS(does nothing on Android as it always silently registers)
// Call only if you passed false to autoRegister
OneSignal.prototype.registerForPushNotifications = function() {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "registerForPushNotifications", []);
};

OneSignal.prototype.promptForPushNotificationsWithUserResponse = function(callback) {
    var internalCallback = function(data) {
        callback(data.accepted === "true");
    };
    cordova.exec(internalCallback, function(){}, "OneSignalPush", "promptForPushNotificationsWithUserResponse", []);
};

OneSignal.prototype.clearOneSignalNotifications = function() {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "clearOneSignalNotifications", []);
};

// Only applies to Android, vibrate is on by default but can be disabled by passing in false.
OneSignal.prototype.enableVibrate = function(enable) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "enableVibrate", [enable]);
};

// Only applies to Android, sound is on by default but can be disabled by passing in false.
OneSignal.prototype.enableSound = function(enable) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "enableSound", [enable]);
};

OneSignal.prototype.enableNotificationsWhenActive = function(enable) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "enableNotificationsWhenActive", [enable]);
};

OneSignal.prototype.setSubscription = function(enable) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "setSubscription", [enable]);
};

OneSignal.prototype.postNotification = function(jsonData, onSuccess, onFailure) {
    if (onSuccess == null)
        onSuccess = function() {};

    if (onFailure == null)
        onFailure = function() {};

    cordova.exec(onSuccess, onFailure, "OneSignalPush", "postNotification", [jsonData]);
};

OneSignal.prototype.promptLocation = function() {
  cordova.exec(function(){}, function(){}, "OneSignalPush", "promptLocation", []);
};

OneSignal.prototype.syncHashedEmail = function(email) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "syncHashedEmail", [email]);
};

OneSignal.prototype.setLogLevel = function(logLevel) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "setLogLevel", [logLevel]);
};

OneSignal.prototype.setLocationShared = function(shared) {
   cordova.exec(function() {}, function() {}, "OneSignalPush", "setLocationShared", [shared]);
};

//email

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
}

OneSignal.prototype.logoutEmail = function(onSuccess, onFailure) {
    if (onSuccess == null)
        onSuccess = function() {};


    if (onFailure == null)
        onFailure = function() {};
    
    cordova.exec(onSuccess, onFailure, "OneSignalPush", "logoutEmail", []);
}

OneSignal.prototype.userProvidedPrivacyConsent = function(callback) {
   cordova.exec(callback, function(){}, "OneSignalPush", "userProvidedPrivacyConsent", []);
 }
 
 OneSignal.prototype.setRequiresUserPrivacyConsent = function(required) {
   cordova.exec(function() {}, function() {}, "OneSignalPush", "setRequiresUserPrivacyConsent", [required]);
 }
 
 OneSignal.prototype.provideUserConsent = function(granted) {
   cordova.exec(function() {}, function() {}, "OneSignalPush", "provideUserConsent", [granted]);
 }

 OneSignal.prototype.setExternalUserId = function(externalId) {
    cordova.exec(function() {}, function() {}, "OneSignalPush", "setExternalUserId", [externalId]);
 }

 OneSignal.prototype.removeExternalUserId = function() {
    cordova.exec(function() {}, function() {}, "OneSignalPush", "removeExternalUserId", []);
 }


//-------------------------------------------------------------------

if(!window.plugins)
    window.plugins = {};

if (!window.plugins.OneSignal)
    window.plugins.OneSignal = new OneSignal();

if (typeof module != 'undefined' && module.exports)
    module.exports = OneSignal;
