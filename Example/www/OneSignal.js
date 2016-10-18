/**
 * Modified MIT License
 * 
 * Copyright 2016 OneSignal
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
}

OneSignal._displayOption = OneSignal.prototype.OSInFocusDisplayOption.InAppAlert;

// You must call init before any other OneSignal function.
// options is a JSON object that includes:
//  Android - googleProjectNumber: is required.
OneSignal.prototype.startInit = function(appId, googleProjectNumber) {
    OneSignal._appID = appId;
    OneSignal._googleProjectNumber = googleProjectNumber;
    return this;
};

OneSignal.prototype.handleNotificationReceived = function(handleNotificationReceivedCallback) {
    OneSignal._notificationReceivedDelegate = handleNotificationReceivedCallback;
    return this;
}

OneSignal.prototype.handleNotificationOpened = function(handleNotificationOpenedCallback) {
    OneSignal._notificationOpenedDelegate = handleNotificationOpenedCallback;
    return this;
}

OneSignal.prototype.inFocusDisplaying = function(display) {
    OneSignal._displayOption = display;
    return this;
}

//Possible settings keys:
// kOSSettingsKeyInAppLaunchURL: Bool. Enable in-app webviews for urls. Default: Enabled
// kOSSettingsKeyAutoPrompt: Bool. Enable automatic prompting for notifications. Default: Enabled
OneSignal.prototype.iOSSettings = function(settings) {
    OneSignal._iOSSettings = settings;
    return this;
}

OneSignal.prototype.endInit = function() {

    //Pass notification received handler
    cordova.exec(OneSignal._notificationReceivedDelegate, function(){}, "OneSignalPush", "setNotificationReceivedHandler", []);
    cordova.exec(OneSignal._notificationOpenedDelegate, function(){}, "OneSignalPush", "setNotificationOpenedHandler", []);

    //Call Init
    cordova.exec(function() {}, function(){}, "OneSignalPush", "init", [OneSignal._appID, OneSignal._googleProjectNumber, OneSignal._iOSSettings, OneSignal._displayOption]);
}

OneSignal.prototype.getTags = function(tagsReceivedCallBack) {
    cordova.exec(tagsReceivedCallBack, function(){}, "OneSignalPush", "getTags", []);
};

OneSignal.prototype.getIds = function(IdsReceivedCallBack) {
    cordova.exec(IdsReceivedCallBack, function(){}, "OneSignalPush", "getIds", []);
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


//-------------------------------------------------------------------

if(!window.plugins)
    window.plugins = {};

if (!window.plugins.OneSignal)
    window.plugins.OneSignal = new OneSignal();

if (typeof module != 'undefined' && module.exports)
    module.exports = OneSignal;