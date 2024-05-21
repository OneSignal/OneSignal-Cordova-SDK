package com.onesignal.cordova;

import com.onesignal.OneSignal;
import com.onesignal.Continue;
import com.onesignal.debug.LogLevel;

import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.HashMap;
import java.util.Map;

public class OneSignalController {

  /**
   * Misc
   */
  public static void setLogLevel(JSONArray data) {
    try {
      int logLevel = data.getInt(0);
      LogLevel convertedLogLevel = LogLevel.fromInt(logLevel);

      OneSignal.getDebug().setLogLevel(convertedLogLevel);
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }

  public static void setAlertLevel(JSONArray data) {
    try {
      int alertLevel = data.getInt(0);
      LogLevel convertedVisualLevel = LogLevel.fromInt(alertLevel);

      OneSignal.getDebug().setAlertLevel(convertedVisualLevel);
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }
  
  public static boolean setLanguage(JSONArray data) {
    try {
      OneSignal.getUser().setLanguage(data.getString(0));
      return true;
    }
    catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  public static boolean login(JSONArray data) {
    try {
      String externalId = data.getString(0);
      OneSignal.login(externalId);
      return true;
    }
    catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }

  public static boolean logout() {
    OneSignal.logout();
    return true;
  }

  public static boolean optInPushSubscription() {
    OneSignal.getUser().getPushSubscription().optIn();
    return true;
  }

  public static boolean optOutPushSubscription() {
    OneSignal.getUser().getPushSubscription().optOut();
    return true;
  }

  public static boolean getPushSubscriptionId(CallbackContext callbackContext) {
    String pushId = OneSignal.getUser().getPushSubscription().getId();
    CallbackHelper.callbackSuccessString(callbackContext, OneSignalUtils.getStringOrNull(pushId));
    return true;
  }

  public static boolean getPushSubscriptionToken(CallbackContext callbackContext) {
    String token = OneSignal.getUser().getPushSubscription().getToken();
    CallbackHelper.callbackSuccessString(callbackContext, OneSignalUtils.getStringOrNull(token));
    return true;
  }
  
  public static boolean getPushSubscriptionOptedIn(CallbackContext callbackContext) {
    boolean optedIn = OneSignal.getUser().getPushSubscription().getOptedIn();
    CallbackHelper.callbackSuccessBoolean(callbackContext, optedIn);
    return true;
  }

  /** 
  * Aliases
  */
  public static boolean addAliases(JSONArray data) {
    try{
      JSONObject aliasObject = data.getJSONObject(0);
      Map<String, String> aliasesToAdd = new HashMap<>();
      Iterator<String> labels = aliasObject.keys();

      while (labels.hasNext()) {
          String label = labels.next();
          aliasesToAdd.put(label, aliasObject.getString(label));
      }
      
      OneSignal.getUser().addAliases(aliasesToAdd);
      return true;
    } catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  public static boolean removeAliases(JSONArray data) {
    try {
      Collection<String> aliasesToRemove = new ArrayList<String>();
      
      for (int i = 0; i < data.length(); i++)
        aliasesToRemove.add(data.get(i).toString());
      
      OneSignal.getUser().removeAliases(aliasesToRemove);
      return true;
    } catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  /**
   * Tags
   */
  public static boolean addTags(JSONArray data) {
    try {
      JSONObject tagsObject = data.getJSONObject(0);
      Map<String, String> tagsToAdd = new HashMap<>();
      Iterator<String> keys = tagsObject.keys();

      while (keys.hasNext()) {
          String key = keys.next();
          tagsToAdd.put(key, tagsObject.get(key).toString());
      }
      
      OneSignal.getUser().addTags(tagsToAdd);
      return true;
    } catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  public static boolean removeTags(JSONArray data) {
    try {
      Collection<String> list = new ArrayList<String>();
      for (int i = 0; i < data.length(); i++)
        list.add(data.get(i).toString());
      OneSignal.getUser().removeTags(list);
      return true;
    } catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  public static boolean getTags(CallbackContext callbackContext) {
    Map<String, String> tagsMap = OneSignal.getUser().getTags();
    JSONObject tagsJson = new JSONObject(tagsMap);
    CallbackHelper.callbackSuccess(callbackContext, tagsJson);
    return true;
  }

  public static boolean getOnesignalId(CallbackContext callbackContext) {
    String onesignalId = OneSignal.getUser().getOnesignalId();
    CallbackHelper.callbackSuccessString(callbackContext, OneSignalUtils.getStringOrNull(onesignalId));
    return true;
  }

  public static boolean getExternalId(CallbackContext callbackContext) {
    String externalId = OneSignal.getUser().getExternalId();
    CallbackHelper.callbackSuccessString(callbackContext, OneSignalUtils.getStringOrNull(externalId));
    return true;
  }

  /**
   * Notifications
   */
  public static boolean clearAllNotifications() {
    try {
      OneSignal.getNotifications().clearAllNotifications();
      return true;
    }
    catch(Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  public static boolean removeNotification(JSONArray data) {
    try {
      OneSignal.getNotifications().removeNotification(data.getInt(0));
      return true;
    } catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  public static boolean removeGroupedNotifications(JSONArray data) {
    try {
      OneSignal.getNotifications().removeGroupedNotifications(data.getString(0));
      return true;
    } catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  public static boolean registerForProvisionalAuthorization() {
    // doesn't apply to Android
    return true;
  }

  public static boolean requestPermission(CallbackContext callbackContext, JSONArray data) {
    // if permission already exists, return early as the method call will not resolve
    if (OneSignal.getNotifications().getPermission()) {
      CallbackHelper.callbackSuccessBoolean(callbackContext, true);
      return true;
    }

    boolean fallbackToSettings = false;
    try {
      fallbackToSettings = data.getBoolean(0);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    OneSignal.getNotifications().requestPermission(fallbackToSettings, Continue.with(r -> {
      if (r.isSuccess()) {
        CallbackHelper.callbackSuccessBoolean(callbackContext, r.getData());
      } else {
        // coroutine was not successful
        CallbackHelper.callbackError(callbackContext, r.getThrowable().getMessage());
      }
    }));
    return true;
  }

  public static boolean getPermissionInternal(CallbackContext callbackContext) {
    boolean granted = OneSignal.getNotifications().getPermission();
    CallbackHelper.callbackSuccessBoolean(callbackContext, granted);
    return true;
  }

  public static boolean canRequestPermission(CallbackContext callbackContext) {
    boolean canRequest = OneSignal.getNotifications().getCanRequestPermission();
    CallbackHelper.callbackSuccessBoolean(callbackContext, canRequest);
    return true;
  }

  public static boolean permissionNative(CallbackContext callbackContext) {
    boolean granted = OneSignal.getNotifications().getPermission();
    CallbackHelper.callbackSuccessInt(callbackContext, granted ? 2 : 1);
    return true;
  }

  /**
   * Privacy consent
   */
  public static boolean setPrivacyConsentRequired(JSONArray data) {
    try {
      OneSignal.setConsentRequired(data.getBoolean(0));
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }

  public static boolean setPrivacyConsentGiven(JSONArray data) {
    try {
      OneSignal.setConsentGiven(data.getBoolean(0));
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }

  /**
   * Location
   */
  public static boolean requestLocationPermission() {
    OneSignal.getLocation().requestPermission(Continue.none());
    return true;
  }

  public static void setLocationShared(JSONArray data) {
    try {
      OneSignal.getLocation().setShared(data.getBoolean(0));
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  public static boolean isLocationShared(CallbackContext callbackContext) {
    boolean isShared = OneSignal.getLocation().isShared();
    CallbackHelper.callbackSuccessBoolean(callbackContext, isShared);
    return true;
  }

  public static boolean enterLiveActivity() {
    // doesn't apply to Android
    return true;
  }

  public static boolean exitLiveActivity() {
    // doesn't apply to Android
    return true;
  }

  public static boolean setPushToStartToken() {
    // doesn't apply to Android
    return true;
  }

  public static boolean removePushToStartToken() {
    // doesn't apply to Android
    return true;
  }

  public static boolean setupDefaultLiveActivity() {
    // doesn't apply to Android
    return true;
  }

  public static boolean startDefaultLiveActivity() {
    // doesn't apply to Android
    return true;
  }
}
