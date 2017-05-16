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

package com.plugin.gcm;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;
import java.util.ArrayList;
import java.util.Collection;

import com.onesignal.OneSignal;
import com.onesignal.OSNotification;
import com.onesignal.OSNotificationOpenResult;
import com.onesignal.OneSignal.NotificationOpenedHandler;
import com.onesignal.OneSignal.NotificationReceivedHandler;
import com.onesignal.OneSignal.GetTagsHandler;
import com.onesignal.OneSignal.IdsAvailableHandler;
import com.onesignal.OneSignal.PostNotificationResponseHandler;

import com.onesignal.OSPermissionObserver;
import com.onesignal.OSSubscriptionObserver;
import com.onesignal.OSPermissionStateChanges;
import com.onesignal.OSSubscriptionStateChanges;

public class OneSignalPush extends CordovaPlugin {
  private static final String TAG = "OneSignalPush";
  
  private static final String SET_NOTIFICATION_RECEIVED_HANDLER = "setNotificationReceivedHandler";
  private static final String SET_NOTIFICATION_OPENED_HANDLER = "setNotificationOpenedHandler";
  private static final String INIT = "init";
  
  private static final String SET_IN_FOCUS_DISPLAYING = "setInFocusDisplaying";
  
  private static final String GET_PERMISSION_SUBCRIPTION_STATE = "getPermissionSubscriptionState";
  private static final String GET_IDS = "getIds";
  
  private static final String ADD_PERMISSION_OBSERVER = "addPermissionObserver";
  private static final String ADD_SUBSCRIPTION_OBSERVER = "addSubscriptionObserver";
  
  private static final String GET_TAGS = "getTags";
  private static final String DELETE_TAGS = "deleteTags";
  private static final String SEND_TAGS = "sendTags";
  private static final String SYNC_HASHED_EMAIL = "syncHashedEmail";
  
  private static final String REGISTER_FOR_PUSH_NOTIFICATIONS = "registerForPushNotifications";
  private static final String ENABLE_VIBRATE = "enableVibrate";
  private static final String ENABLE_SOUND = "enableSound";

  private static final String SET_SUBSCRIPTION = "setSubscription";
  private static final String POST_NOTIFICATION = "postNotification";
  private static final String PROMPT_LOCATION = "promptLocation";
  private static final String CLEAR_ONESIGNAL_NOTIFICATIONS = "clearOneSignalNotifications";
  
  private static final String SET_LOG_LEVEL = "setLogLevel";

  
  private static CallbackContext notifReceivedCallbackContext;
  private static CallbackContext notifOpenedCallbackContext;
  
  private static CallbackContext jsPermissionObserverCallBack;
  private static CallbackContext jsSubscriptionObserverCallBack;
  
  private static OSPermissionObserver permissionObserver;
  private static OSSubscriptionObserver subscriptionObserver;

  // This is to prevent an issue where if two Javascript calls are made to OneSignal expecting a callback then only one would fire.
  private static void callbackSuccess(CallbackContext callbackContext, JSONObject jsonObject) {
    if (jsonObject == null) // in case there are no data
      jsonObject = new JSONObject();

    PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, jsonObject);
    pluginResult.setKeepCallback(true);
    callbackContext.sendPluginResult(pluginResult);
  }
  
  private static void callbackError(CallbackContext callbackContext, JSONObject jsonObject) {
    if (jsonObject == null) // in case there are no data
      jsonObject = new JSONObject();
    
    PluginResult pluginResult = new PluginResult(PluginResult.Status.ERROR, jsonObject);
    pluginResult.setKeepCallback(true);
    callbackContext.sendPluginResult(pluginResult);
  }
  
  private static void callbackError(CallbackContext callbackContext, String str) {
    PluginResult pluginResult = new PluginResult(PluginResult.Status.ERROR, str);
    pluginResult.setKeepCallback(true);
    callbackContext.sendPluginResult(pluginResult);
  }
  
  @Override
  public boolean execute(String action, JSONArray data, CallbackContext callbackContext) {
    boolean result = false;
    
    if(SET_NOTIFICATION_RECEIVED_HANDLER.equals(action)) {
      notifReceivedCallbackContext = callbackContext;
      result = true;
    }
    else if(SET_NOTIFICATION_OPENED_HANDLER.equals(action)) {
      notifOpenedCallbackContext = callbackContext;
      result = true;
    }
    else if (INIT.equals(action)) {
      try {
        String appId = data.getString(0);
        String googleProjectNumber = data.getString(1);

        OneSignal.sdkType = "cordova";
        OneSignal.Builder builder = OneSignal.getCurrentOrNewInitBuilder();
        builder.unsubscribeWhenNotificationsAreDisabled(true);
        builder.filterOtherGCMReceivers(true);
        
        OneSignal.init(this.cordova.getActivity(),
                  googleProjectNumber,
                  appId,
                  new CordovaNotificationOpenedHandler(notifOpenedCallbackContext),
                  new CordovaNotificationReceivedHandler(notifReceivedCallbackContext)
                  );

         // data.getJSONObject(2) is for iOS settings.

         int displayOption = data.getInt(3);
         OneSignal.setInFocusDisplaying(displayOption);
         
         result = true;
      }
      catch (JSONException e) {
         Log.e(TAG, "execute: Got JSON Exception " + e.getMessage());
         result = false;
      }
    }
    else if (SET_IN_FOCUS_DISPLAYING.equals(action)) {
      try {
        OneSignal.setInFocusDisplaying(data.getInt(0));
        result = true;
      }
      catch (JSONException e) {
         Log.e(TAG, "execute: Got JSON Exception " + e.getMessage());
         result = false;
      }
    }
    else if (ADD_PERMISSION_OBSERVER.equals(action)) {
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
      result = true;
    }
    else if (ADD_SUBSCRIPTION_OBSERVER.equals(action)) {
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
      result = true;
    }
    else if (GET_TAGS.equals(action)) {
      final CallbackContext jsTagsAvailableCallBack = callbackContext;
      OneSignal.getTags(new GetTagsHandler() {
        @Override
        public void tagsAvailable(JSONObject tags) {
          callbackSuccess(jsTagsAvailableCallBack, tags);
        }
      });
      result = true;
    }
    else if (GET_PERMISSION_SUBCRIPTION_STATE.equals(action)) {
      callbackSuccess(callbackContext, OneSignal.getPermissionSubscriptionState().toJSONObject());
      result = true;
    }
    else if (GET_IDS.equals(action)) {
      final CallbackContext jsIdsAvailableCallBack = callbackContext;
      OneSignal.idsAvailable(new IdsAvailableHandler() {
        @Override
        public void idsAvailable(String userId, String registrationId) {
          JSONObject jsonIds = new JSONObject();
          try {
            jsonIds.put("userId", userId);
            if (registrationId != null)
              jsonIds.put("pushToken", registrationId);
            else
              jsonIds.put("pushToken", "");
            
            callbackSuccess(jsIdsAvailableCallBack, jsonIds);
          }
          catch (Throwable t) {
            t.printStackTrace();
          }
        }
      });
      result = true;
    }
    else if (SEND_TAGS.equals(action)) {
      try {
        OneSignal.sendTags(data.getJSONObject(0));
      }
      catch (Throwable t) {
        t.printStackTrace();
      }
      result = true;
    }
    else if (DELETE_TAGS.equals(action)) {
      try {
        Collection<String> list = new ArrayList<String>();
        for (int i = 0; i < data.length(); i++)
          list.add(data.get(i).toString());
        OneSignal.deleteTags(list);
        result = true;
      } catch (Throwable t) {
        t.printStackTrace();
      }
    }
    else if (REGISTER_FOR_PUSH_NOTIFICATIONS.equals(action)) {
      // Does not apply to Android.
      result = true;
    }
    else if (ENABLE_VIBRATE.equals(action)) {
      try {
        OneSignal.enableVibrate(data.getBoolean(0));
        result = true;
      }
      catch (Throwable t) {
        t.printStackTrace();
      }
    }
    else if (ENABLE_SOUND.equals(action)) {
      try {
        OneSignal.enableSound(data.getBoolean(0));
        result = true;
      }
      catch (Throwable t) {
        t.printStackTrace();
      }
    }
    else if (SET_SUBSCRIPTION.equals(action)) {
      try {
        OneSignal.setSubscription(data.getBoolean(0));
        result = true;
      }
      catch (Throwable t) {
        t.printStackTrace();
      }
    }
    else if (POST_NOTIFICATION.equals(action)) {
      try {
        JSONObject jo = data.getJSONObject(0);
        final CallbackContext jsPostNotificationCallBack = callbackContext;
        OneSignal.postNotification(jo,
          new PostNotificationResponseHandler() {
            @Override
            public void onSuccess(JSONObject response) {
              callbackSuccess(jsPostNotificationCallBack, response);
            }
            
            @Override
            public void onFailure(JSONObject response) {
              callbackError(jsPostNotificationCallBack, response);
            }
          });
        
        result = true;
      }
      catch (Throwable t) {
        t.printStackTrace();
      }
    }
    else if (PROMPT_LOCATION.equals(action))
      OneSignal.promptLocation();
    else if (SYNC_HASHED_EMAIL.equals(action)) {
      try {
        OneSignal.syncHashedEmail(data.getString(0));
      } catch(Throwable t) {
        t.printStackTrace();
      }
    }
    else if (SET_LOG_LEVEL.equals(action)) {
      try {
        JSONObject jo = data.getJSONObject(0);
        OneSignal.setLogLevel(jo.optInt("logLevel", 0), jo.optInt("visualLevel", 0));
      }
      catch(Throwable t) {
        t.printStackTrace();
      }
    }
    else if (CLEAR_ONESIGNAL_NOTIFICATIONS.equals(action)) {
      try {
        OneSignal.clearOneSignalNotifications();
        result = true;
      }
      catch(Throwable t) {
        t.printStackTrace();
      }
    }
    else {
      result = false;
      Log.e(TAG, "Invalid action : " + action);
      callbackError(callbackContext, "Invalid action : " + action);
    }
    
    return result;
  }

  private class CordovaNotificationReceivedHandler implements NotificationReceivedHandler {
    
    private CallbackContext jsNotificationReceivedCallBack;
    
    public CordovaNotificationReceivedHandler(CallbackContext inCallbackContext) {
      jsNotificationReceivedCallBack = inCallbackContext;
    }
    
    @Override
    public void notificationReceived(OSNotification notification) {      
      try {
        callbackSuccess(jsNotificationReceivedCallBack, new JSONObject(notification.stringify()));
      }
      catch (Throwable t) {
        t.printStackTrace();
      }
    }
  }
  
  private class CordovaNotificationOpenedHandler implements NotificationOpenedHandler {
    
    private CallbackContext jsNotificationOpenedCallBack;
    
    public CordovaNotificationOpenedHandler(CallbackContext inCallbackContext) {
      jsNotificationOpenedCallBack = inCallbackContext;
    }
    
    @Override
    public void notificationOpened(OSNotificationOpenResult result) {      
      try {
        callbackSuccess(jsNotificationOpenedCallBack, new JSONObject(result.stringify()));
      }
      catch (Throwable t) {
        t.printStackTrace();
      }
    }
  }
  
  @Override
  public void onDestroy() {
    OneSignal.removeNotificationOpenedHandler();
    OneSignal.removeNotificationReceivedHandler();
  }
}
