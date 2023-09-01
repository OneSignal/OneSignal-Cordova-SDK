package com.onesignal.cordova;

import org.apache.cordova.CallbackContext;

import org.apache.cordova.PluginResult;

import org.json.JSONException;
import org.json.JSONObject;

import com.onesignal.OneSignal;
import com.onesignal.user.subscriptions.IPushSubscription;
import com.onesignal.user.subscriptions.ISubscription;
import com.onesignal.user.subscriptions.IPushSubscriptionObserver;
import com.onesignal.user.subscriptions.PushSubscriptionChangedState;
import com.onesignal.user.subscriptions.PushSubscriptionState;
import com.onesignal.notifications.IPermissionObserver;

public class OneSignalObserverController {
  private static CallbackContext jsPermissionObserverCallBack;
  private static CallbackContext jsSubscriptionObserverCallBack;

  private static IPermissionObserver permissionObserver;
  private static IPushSubscriptionObserver pushSubscriptionObserver;

  public static boolean addPermissionObserver(CallbackContext callbackContext) {
    jsPermissionObserverCallBack = callbackContext;
    if (permissionObserver == null) {
      permissionObserver = new IPermissionObserver() {
        @Override
        public void onNotificationPermissionChange(boolean permission) {
          CallbackHelper.callbackSuccessBoolean(jsPermissionObserverCallBack, permission);
        }
      };
      OneSignal.getNotifications().addPermissionObserver(permissionObserver);
    };  
    return true;
  }

  public static boolean addPushSubscriptionObserver(CallbackContext callbackContext) {
    jsSubscriptionObserverCallBack = callbackContext;
    if (pushSubscriptionObserver == null) {
      pushSubscriptionObserver = new IPushSubscriptionObserver() {
        @Override
        public void onPushSubscriptionChange(PushSubscriptionChangedState state) {
          PushSubscriptionState pushSubscription = state.getCurrent();
          
          if (!(pushSubscription instanceof PushSubscriptionState)){
            return;
          }
          
          try {
            JSONObject hash = new JSONObject();
            hash.put("current", createPushSubscriptionProperties(state.getCurrent()));
            hash.put("previous", createPushSubscriptionProperties(state.getPrevious()));

            CallbackHelper.callbackSuccess(jsSubscriptionObserverCallBack, hash);
            
          } catch (Exception e) {
            e.printStackTrace();
          }
        }
      };
      OneSignal.getUser().getPushSubscription().addObserver(pushSubscriptionObserver);
    }
    return true;      
  }

  private static JSONObject createPushSubscriptionProperties(PushSubscriptionState pushSubscription) {
    JSONObject pushSubscriptionProperties = new JSONObject();
    try {
      pushSubscriptionProperties.put("id", pushSubscription.getId());
      pushSubscriptionProperties.put("token", pushSubscription.getToken());
      pushSubscriptionProperties.put("optedIn", pushSubscription.getOptedIn());
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return pushSubscriptionProperties;
  }
}
