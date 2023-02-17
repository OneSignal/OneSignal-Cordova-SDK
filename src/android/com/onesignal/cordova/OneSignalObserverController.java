package com.onesignal.cordova;

import org.apache.cordova.CallbackContext;

import org.apache.cordova.PluginResult;

import org.json.JSONException;
import org.json.JSONObject;

import com.onesignal.OneSignal;
import com.onesignal.user.subscriptions.IPushSubscription;
import com.onesignal.user.subscriptions.ISubscription;
import com.onesignal.user.subscriptions.ISubscriptionChangedHandler;
import com.onesignal.notifications.IPermissionChangedHandler;

public class OneSignalObserverController {
  private static CallbackContext jsPermissionObserverCallBack;
  private static CallbackContext jsSubscriptionObserverCallBack;

  private static IPermissionChangedHandler permissionObserver;

  private static ISubscriptionChangedHandler pushSubscriptionChangedHandler;

  // This is to prevent an issue where if two Javascript calls are made to OneSignal expecting a callback then only one would fire.
  private static void callbackSuccess(CallbackContext callbackContext, JSONObject jsonObject) {
    if (jsonObject == null) // in case there are no data
      jsonObject = new JSONObject();

    PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, jsonObject);
    pluginResult.setKeepCallback(true);
    callbackContext.sendPluginResult(pluginResult);
  }

  public static boolean addPermissionObserver(CallbackContext callbackContext) {
    jsPermissionObserverCallBack = callbackContext;
    if (permissionObserver == null) {
      permissionObserver = new IPermissionChangedHandler() {
        @Override
        public void onPermissionChanged(boolean permission) {
          CallbackHelper.callbackSuccessBoolean(jsPermissionObserverCallBack, permission);
        }
      };
      OneSignal.getNotifications().addPermissionChangedHandler(permissionObserver);
    };  
    return true;
  }

  public static boolean addPushSubscriptionObserver(CallbackContext callbackContext) {
    jsSubscriptionObserverCallBack = callbackContext;
    if (pushSubscriptionChangedHandler == null) {
      pushSubscriptionChangedHandler = new ISubscriptionChangedHandler() {
        @Override
        public void onSubscriptionChanged(ISubscription subscription) {
          if (!(subscription instanceof IPushSubscription)){
            return;
          }
          IPushSubscription pushSubscription = (IPushSubscription) subscription;

          try {
            JSONObject pushSubscriptionProperties = new JSONObject();

            pushSubscriptionProperties.put("id", pushSubscription.getId());
            pushSubscriptionProperties.put("token", pushSubscription.getToken());
            pushSubscriptionProperties.put("optedIn", pushSubscription.getOptedIn());
          } catch (JSONException e) {
            e.printStackTrace();
          }
          callbackSuccess(jsSubscriptionObserverCallBack, pushSubscriptionProperties);
        }
      };
      OneSignal.getUser().getPushSubscription().addChangeHandler(handler);
    }
    return true;      
  }
}
