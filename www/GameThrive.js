/**
 * Modified MIT License
 * 
 * Copyright 2015 OneSignal
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


 // GameThive is now called OneSignal. Please rename places where you use GameThrive to OneSignal

var GameThrive = function() {
};


// You must call init before any other GameThrive function.
// options is a JSON object that includes:
//  Android - googleProjectNumber: is required.
//  iOS - autoRegister: Set as false to delay the iOS push notification permisions system prompt.
//                      Make sure to call registerForPushNotifications sometime later.
GameThrive.prototype.init = function(appId, options, didReceiveRemoteNotificationCallBack) {
    if (didReceiveRemoteNotificationCallBack == null)
        didReceiveRemoteNotificationCallBack = function() {};
    
    options.appId = appId;
    cordova.exec(didReceiveRemoteNotificationCallBack, function(){}, "OneSignalPush", "init", [options]);
};

GameThrive.prototype.getTags = function(tagsReceivedCallBack) {
    cordova.exec(tagsReceivedCallBack, function(){}, "OneSignalPush", "getTags", []);
};

GameThrive.prototype.getIds = function(IdsReceivedCallBack) {
    cordova.exec(IdsReceivedCallBack, function(){}, "OneSignalPush", "getIds_GameThrive", []);
};

GameThrive.prototype.sendTag = function(key, value) {
    jsonKeyValue = {};
    jsonKeyValue[key] = value;
    cordova.exec(function(){}, function(){}, "OneSignalPush", "sendTags", [jsonKeyValue]);
};

GameThrive.prototype.sendTags = function(tags) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "sendTags", [tags]);
};

GameThrive.prototype.deleteTag = function(key) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "deleteTags", [key]);
};

GameThrive.prototype.deleteTags = function(keys) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "deleteTags", keys);
};

// Only applies to iOS(does nothing on Android as it always silently registers)
// Call only if you passed false to autoRegister
GameThrive.prototype.registerForPushNotifications = function() {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "registerForPushNotifications", []);
};

// Only applies to Android, vibrate is on by default but can be disabled by passing in false.
GameThrive.prototype.enableVibrate = function(enable) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "enableVibrate", [enable]);
};

// Only applies to Android, sound is on by default but can be disabled by passing in false.
GameThrive.prototype.enableSound = function(enable) {
    cordova.exec(function(){}, function(){}, "OneSignalPush", "enableSound", [enable]);
};

//-------------------------------------------------------------------

if(!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.GameThrive) {
    window.plugins.GameThrive = new GameThrive();
}

if (typeof module != 'undefined' && module.exports) {
  module.exports = GameThrive;
}