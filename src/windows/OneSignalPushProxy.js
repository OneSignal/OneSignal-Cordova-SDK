
var OneSingal_launchString = "";
var OneSignal_JSBridge = new OneSignalSDK_WP_WNS_WRTC.WinJSBridge();
var OneSignal_app_id = null;


// Process launch args from cold start
launchArgs = require('cordova/platform').activationContext;
if (launchArgs.type === "activated" && launchArgs.args != "")
    OneSingal_launchString = launchArgs.args;

// Process launch args from warn start
function onActivatedHandler(args) {
  if (args.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch)
        OneSignal_JSBridge.init(OneSignal_app_id, args.detail.arguments);
}
WinJS.Application.addEventListener("activated", onActivatedHandler, false);


var cordova = require('cordova'),
    OneSignal = require('./OneSignal');
    
module.exports = {
  init: function(successCallback, errorCallback, params) {
    var options = params[0];
    OneSignal_app_id = options.appId;
    
    OneSignal_JSBridge.addEventListener("notificationopened", function (e) {
        var additionalData = e.additionalData;

        if (additionalData != null)
            additionalData = JSON.parse(e.additionalData);

        var newData = { message: e.message, additionalData: additionalData, isActive: e.isActive };
        successCallback(newData, { keepCallback: true });
    });
    
    OneSignal_JSBridge.init(options.appId, OneSingal_launchString);
  },

  sendTags: function (successCallback, errorCallback, params) {
      OneSignal_JSBridge.sendtags(JSON.stringify(params[0]));
  },

  getTags: function (successCallback, errorCallback, params) {
      OneSignal_JSBridge.addEventListener("gettagsevent", function (e) {
          successCallback(JSON.parse(e.tags));
      });
      OneSignal_JSBridge.gettags();
  },

  getIds: function (successCallback, errorCallback, params) {
      OneSignal_JSBridge.addEventListener("idsavailableevent", function (e) {
          successCallback({ userId: e.userId, pushToken: e.pushToken });
      });

      OneSignal_JSBridge.getids();
  },
  
  deleteTags: function (successCallback, errorCallback, params) {
      OneSignal_JSBridge.deletetags(JSON.stringify(params));
  },

  // Native SDK does not support these functions.
  registerForPushNotifications: function (successCallback, errorCallback, params) { },
  enableVibrate: function (successCallback, errorCallback, params) { },
  enableSound: function (successCallback, errorCallback, params) { },
  enableNotificationsWhenActive: function (successCallback, errorCallback, params) { },
  enableInAppAlertNotification: function (successCallback, errorCallback, params) { },
  setSubscription: function (successCallback, errorCallback, params) { },
  postNotification: function (successCallback, errorCallback, params) { },
  setLogLevel: function (successCallback, errorCallback, params) { }
};

require("cordova/exec/proxy").add("OneSignalPush", module.exports);
