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
import com.onesignal.OSNotification;
import com.onesignal.OSNotificationOpenResult;
import com.onesignal.OneSignal.NotificationOpenedHandler;
import com.onesignal.OneSignal.NotificationReceivedHandler;
import com.onesignal.OneSignal.GetTagsHandler;
import com.onesignal.OneSignal.IdsAvailableHandler;
import com.onesignal.OneSignal.PostNotificationResponseHandler;

public class OneSignalPush extends CordovaPlugin {
  public static final String TAG = "OneSignalPush";
  
  public static final String SET_NOTIFICATION_RECEIVED_HANDLER = "setNotificationReceivedHandler";
  public static final String SET_NOTIFICATION_OPENED_HANDLER = "setNotificationOpenedHandler";
  public static final String INIT = "init";
  public static final String GET_TAGS = "getTags";
  public static final String GET_IDS = "getIds";
  public static final String DELETE_TAGS = "deleteTags";
  public static final String SEND_TAGS = "sendTags";
  public static final String REGISTER_FOR_PUSH_NOTIFICATIONS = "registerForPushNotifications";
  public static final String ENABLE_VIBRATE = "enableVibrate";
  public static final String ENABLE_SOUND = "enableSound";
  public static final String SET_SUBSCRIPTION = "setSubscription";
  public static final String POST_NOTIFICATION = "postNotification";
  public static final String PROMPT_LOCATION = "promptLocation";
  public static final String SYNC_HASHED_EMAIL = "syncHashedEmail";
  public static final String SET_LOG_LEVEL = "setLogLevel";
  public static final String CLEAR_ONESIGNAL_NOTIFICATIONS = "clearOneSignalNotifications";

  
  private static CallbackContext notifReceivedCallbackContext;
  private static CallbackContext notifOpenedCallbackContext;

  // This is to prevent an issue where if two Javascript calls are made to OneSignal expecting a callback then only one would fire.
  private static void callbackSuccess(CallbackContext callbackContext, JSONObject jsonObject) {
    if(jsonObject == null){ // in case there are no data
      jsonObject = new JSONObject();
    }

    if(jsonObject.has("payload")) {
      try {
        JSONObject payload = jsonObject.getJSONObject("payload");
        if(payload.has("additionalData")) {
          payload.put("additionalData", new JSONObject(payload.getString("additionalData")));
          jsonObject.put("payload", payload);
        }
      } catch (Throwable t) {t.printStackTrace();}
    }

    PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, jsonObject.toString());
    pluginResult.setKeepCallback(true);
    callbackContext.sendPluginResult(pluginResult);
  }
  
  private static void callbackError(CallbackContext callbackContext, JSONObject jsonObject) {
    if(jsonObject == null) { // in case there are no data
      jsonObject = new JSONObject();
    }
    
    PluginResult pluginResult = new PluginResult(PluginResult.Status.ERROR, jsonObject.toString());
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
        OneSignal.setLogLevel(jo.getInt("logLevel"), jo.getInt("visualLevel"));
        } catch(Throwable t) {
        t.printStackTrace();
      }
    }
    else if (CLEAR_ONESIGNAL_NOTIFICATIONS.equals(action)) {
      try {
        OneSignal.clearOneSignalNotifications();
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

  private class CordovaNotificationReceivedHandler implements NotificationReceivedHandler {
    
    private CallbackContext jsNotificationReceivedCallBack;
    
    public CordovaNotificationReceivedHandler(CallbackContext inCallbackContext) {
      jsNotificationReceivedCallBack = inCallbackContext;
    }
    
    @Override
    public void notificationReceived(OSNotification notification) {      
      try {
        callbackSuccess(jsNotificationReceivedCallBack, new JSONObject(notification.stringify()));
        } catch (Throwable t) {
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
        } catch (Throwable t) {
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
