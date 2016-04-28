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
import com.onesignal.OneSignal.NotificationOpenedHandler;
import com.onesignal.OneSignal.GetTagsHandler;
import com.onesignal.OneSignal.IdsAvailableHandler;
import com.onesignal.OneSignal.PostNotificationResponseHandler;

public class OneSignalPush extends CordovaPlugin {
  public static final String TAG = "OneSignalPush";
  
  public static final String INIT = "init";
  public static final String GET_TAGS = "getTags";
  public static final String GET_IDS = "getIds";
  public static final String GET_IDS_GAMETHRIVE = "getIds_GameThrive";
  public static final String DELETE_TAGS = "deleteTags";
  public static final String SEND_TAGS = "sendTags";
  public static final String REGISTER_FOR_PUSH_NOTIFICATIONS = "registerForPushNotifications";
  public static final String ENABLE_VIBRATE = "enableVibrate";
  public static final String ENABLE_SOUND = "enableSound";
  public static final String ENABLE_NOTIFICATIONS_WHEN_ACTIVE = "enableNotificationsWhenActive";
  public static final String ENABLE_INAPP_ALERT_NOTIFICATION = "enableInAppAlertNotification";
  public static final String SET_SUBSCRIPTION = "setSubscription";
  public static final String POST_NOTIFICATION = "postNotification";
  public static final String PROMPT_LOCATION = "promptLocation";
  public static final String SET_EMAIL = "setEmail";
  public static final String SET_LOG_LEVEL = "setLogLevel";
  
  // This is to prevent an issue where if two Javascript calls are made to OneSignal expecting a callback then only one would fire.
  private static void callbackSuccess(CallbackContext callbackContext, JSONObject jsonObject) {
    if(jsonObject == null){ // in case there are no data
      jsonObject = new JSONObject();
    }
    PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, jsonObject);
    pluginResult.setKeepCallback(true);
    callbackContext.sendPluginResult(pluginResult);
  }
  
  private static void callbackError(CallbackContext callbackContext, JSONObject jsonObject) {
    if(jsonObject == null){ // in case there are no data
      jsonObject = new JSONObject();
    }
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
    
    if (INIT.equals(action)) {
      try {
        JSONObject jo = data.getJSONObject(0);
        OneSignal.sdkType = "cordova";
        OneSignal.init(
        (Activity)this.cordova.getActivity(),
        jo.getString("googleProjectNumber"),
        jo.getString("appId"),
        new CordovaNotificationOpenedHandler(callbackContext));
        
        result = true;
        } catch (JSONException e) {
        Log.e(TAG, "execute: Got JSON Exception " + e.getMessage());
        result = false;
      }
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
            } catch (Throwable t) {
            t.printStackTrace();
          }
        }
      });
      result = true;
    }
    else if (GET_IDS_GAMETHRIVE.equals(action)) {
      final CallbackContext jsIdsAvailableCallBack = callbackContext;
      OneSignal.idsAvailable(new IdsAvailableHandler() {
        @Override
        public void idsAvailable(String playerId, String registrationId) {
          JSONObject jsonIds = new JSONObject();
          try {
            jsonIds.put("playerId", playerId);
            if (registrationId != null)
            jsonIds.put("pushToken", registrationId);
            else
            jsonIds.put("pushToken", "");
            
            callbackSuccess(jsIdsAvailableCallBack, jsonIds);
            } catch (Throwable t) {
            t.printStackTrace();
          }
        }
      });
      result = true;
    }
    else if (SEND_TAGS.equals(action)) {
      try {
        OneSignal.sendTags(data.getJSONObject(0));
        } catch (Throwable t) {
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
        } catch (Throwable t) {
        t.printStackTrace();
      }
    }
    else if (ENABLE_SOUND.equals(action)) {
      try {
        OneSignal.enableSound(data.getBoolean(0));
        result = true;
        } catch (Throwable t) {
        t.printStackTrace();
      }
    }
    else if (ENABLE_NOTIFICATIONS_WHEN_ACTIVE.equals(action)) {
      try {
        OneSignal.enableNotificationsWhenActive(data.getBoolean(0));
        result = true;
        } catch (Throwable t) {
        t.printStackTrace();
      }
    }
    else if (ENABLE_INAPP_ALERT_NOTIFICATION.equals(action)) {
      try {
        OneSignal.enableInAppAlertNotification(data.getBoolean(0));
        result = true;
        } catch (Throwable t) {
        t.printStackTrace();
      }
    }
    else if (SET_SUBSCRIPTION.equals(action)) {
      try {
        OneSignal.setSubscription(data.getBoolean(0));
        result = true;
        } catch (Throwable t) {
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
        } catch (Throwable t) {
        t.printStackTrace();
      }
    }
    else if (PROMPT_LOCATION.equals(action))
      OneSignal.promptLocation();
    else if (SET_EMAIL.equals(action)) {
      try {
        OneSignal.setEmail(data.getString(0));
      } catch(Throwable t) {
        t.printStackTrace();
      }
    }
    else if (SET_LOG_LEVEL.equals(action)) {
      try {
        JSONObject jo = data.getJSONObject(0);
        OneSignal.setLogLevel(jo.getInt("logLevel"), jo.getInt("visualLevel"));
        } catch(Throwable t) {
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
  
  private class CordovaNotificationOpenedHandler implements NotificationOpenedHandler {
    
    private CallbackContext jsNotificationOpenedCallBack;
    
    public CordovaNotificationOpenedHandler(CallbackContext inCallbackContext) {
      jsNotificationOpenedCallBack = inCallbackContext;
    }
    
    @Override
    public void notificationOpened(String message, JSONObject additionalData, boolean isActive) {      
      JSONObject outerObject = new JSONObject();
      try {
        outerObject.put("message", message);
        outerObject.put("additionalData", additionalData);
        outerObject.put("isActive", isActive);
        callbackSuccess(jsNotificationOpenedCallBack, outerObject);
        } catch (Throwable t) {
        t.printStackTrace();
      }
    }
  }
  
  @Override
  public void onDestroy() {
    OneSignal.removeNotificationOpenedHandler();
  }
}
