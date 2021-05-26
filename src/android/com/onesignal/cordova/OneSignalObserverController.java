package com.onesignal.cordova;

import org.apache.cordova.CallbackContext;

import org.apache.cordova.PluginResult;

import org.json.JSONObject;

import com.onesignal.OneSignal;

import com.onesignal.OSPermissionObserver;
import com.onesignal.OSEmailSubscriptionObserver;
import com.onesignal.OSSMSSubscriptionObserver;
import com.onesignal.OSSubscriptionObserver;
import com.onesignal.OSPermissionStateChanges;
import com.onesignal.OSSubscriptionStateChanges;
import com.onesignal.OSEmailSubscriptionStateChanges;
import com.onesignal.OSSMSSubscriptionStateChanges;

public class OneSignalObserverController {
  private static CallbackContext jsPermissionObserverCallBack;
  private static CallbackContext jsSubscriptionObserverCallBack;
  private static CallbackContext jsEmailSubscriptionObserverCallBack;
  private static CallbackContext jsSMSSubscriptionObserverCallBack;

  private static OSPermissionObserver permissionObserver;
  private static OSSubscriptionObserver subscriptionObserver;
  private static OSEmailSubscriptionObserver emailSubscriptionObserver;
  private static OSSMSSubscriptionObserver smsSubscriptionObserver;

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
      permissionObserver = new OSPermissionObserver() {
        @Override
        public void onOSPermissionChanged(OSPermissionStateChanges stateChanges) {
          callbackSuccess(jsPermissionObserverCallBack, stateChanges.toJSONObject());
        }
      };
      OneSignal.addPermissionObserver(permissionObserver);
    }
    return true;
  }

  public static boolean addSubscriptionObserver(CallbackContext callbackContext) {
    jsSubscriptionObserverCallBack = callbackContext;
      if (subscriptionObserver == null) {
        subscriptionObserver = new OSSubscriptionObserver() {
          @Override
          public void onOSSubscriptionChanged(OSSubscriptionStateChanges stateChanges) {
            callbackSuccess(jsSubscriptionObserverCallBack, stateChanges.toJSONObject());
          }
        };
        OneSignal.addSubscriptionObserver(subscriptionObserver);
      }
      return true;
  }

  public static boolean addEmailSubscriptionObserver(CallbackContext callbackContext) {
    jsEmailSubscriptionObserverCallBack = callbackContext;
      if (emailSubscriptionObserver == null) {
        emailSubscriptionObserver = new OSEmailSubscriptionObserver() {
          @Override
          public void onOSEmailSubscriptionChanged(OSEmailSubscriptionStateChanges stateChanges) {
            callbackSuccess(jsEmailSubscriptionObserverCallBack, stateChanges.toJSONObject());
          }
        };
        OneSignal.addEmailSubscriptionObserver(emailSubscriptionObserver);
      }
      return true;
  }

  public static boolean addSMSSubscriptionObserver(CallbackContext callbackContext) {
    jsSMSSubscriptionObserverCallBack = callbackContext;
      if (smsSubscriptionObserver == null) {
        smsSubscriptionObserver = new OSSMSSubscriptionObserver() {
          @Override
          public void onSMSSubscriptionChanged(OSSMSSubscriptionStateChanges stateChanges) {
            callbackSuccess(jsSMSSubscriptionObserverCallBack, stateChanges.toJSONObject());
          }
        };
        OneSignal.addSMSSubscriptionObserver(smsSubscriptionObserver);
      }
      return true;
  }
}
