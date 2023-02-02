package com.onesignal.cordova;

import com.onesignal.OSDeviceState;
import com.onesignal.OneSignal;
import com.onesignal.debug.LogLevel;
import com.onesignal.OneSignal.PostNotificationResponseHandler;

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
   * Subscriptions
   */
  public static boolean getDeviceState(CallbackContext callbackContext) {
    OSDeviceState deviceState = OneSignal.getDeviceState();
    if (deviceState != null)
      CallbackHelper.callbackSuccess(callbackContext, deviceState.toJSONObject());
    return true;
  }

  public static boolean disablePush(JSONArray data) {
    try {
      OneSignal.disablePush(data.getBoolean(0));
      return true;
    }
    catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  /**
   * Misc
   */
  public static void setLogLevel(JSONArray data) {
    try {
      int logLevel = data.getInt(0);
      LogLevel level = LogLevel.fromInt(logLevel);
      OneSignal.getDebug().setLogLevel(level);
    } catch (Throwable t) {
      t.printStackTrace();
    }
  }

  public static void setAlertLevel(JSONArray data) {
    try {
      int alertLevel = data.getInt(0);
      LogLevel visuallevel = LogLevel.fromInt(alertLevel);
      OneSignal.getDebug().setLogLevel(visuallevel);
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
          aliasesToAdd.put(label, aliasObject.get(label).toString());
      }
      
      OneSignal.getUser().addAliases(aliasesToAdd);
      return true;
    } catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  Will be added in next update
   public static boolean removeAliases(JSONArray data) {
    try{
      JSONObject aliasObject = data.getJSONObject(0);
      Map<String, String> aliasesToRemove = new HashMap<>();
      Iterator<String> labels = aliasObject.keys();

      while (labels.hasNext()) {
          String label = labels.next();
          aliasesToRemove.put(label, aliasObject.get(label).toString());
      }
      
      OneSignal.getUser().removeAliases(aliasesToRemove);
      return true;
    } catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  public static boolean removeAlias(JSONArray data) {
    try {
      String aliasToRemove = data.getString(0);
      OneSignal.getUser().removeAlias(aliasToRemove);
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

  /**
   * Notifications
   */
  public static boolean postNotification(CallbackContext callbackContext, JSONArray data) {
    try {
      JSONObject jo = data.getJSONObject(0);
      final CallbackContext jsPostNotificationCallBack = callbackContext;
      OneSignal.postNotification(jo,
              new PostNotificationResponseHandler() {
                @Override
                public void onSuccess(JSONObject response) {
                  CallbackHelper.callbackSuccess(jsPostNotificationCallBack, response);
                }

                @Override
                public void onFailure(JSONObject response) {
                  CallbackHelper.callbackError(jsPostNotificationCallBack, response);
                }
              });

      return true;
    }
    catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  public static boolean clearOneSignalNotifications() {
    try {
      OneSignal.clearOneSignalNotifications();
      return true;
    }
    catch(Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  public static boolean removeNotification(JSONArray data) {
    try {
      OneSignal.removeNotification(data.getInt(0));
      return true;
    } catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

  public static boolean removeGroupedNotifications(JSONArray data) {
    try {
      OneSignal.removeGroupedNotifications(data.getString(0));
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

  public static boolean promptForPushNotificationsWithUserResponse(CallbackContext callbackContext, JSONArray data) {
    final CallbackContext jsPromptForPushNotificationsCallback = callbackContext;
    boolean fallbackToSettings = false;
    try {
      fallbackToSettings = data.getBoolean(0);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    OneSignal.promptForPushNotifications(fallbackToSettings, new OneSignal.PromptForPushNotificationPermissionResponseHandler() {
      @Override
      public void response(boolean accepted) {
        CallbackHelper.callbackSuccessBoolean(callbackContext, accepted);
      }
    });
    return true;
  }

  public static boolean setLaunchURLsInApp() {
    // doesn't apply to Android
    return true;
  }

  public static boolean unsubscribeWhenNotificationsAreDisabled(JSONArray data) {
    try {
      OneSignal.unsubscribeWhenNotificationsAreDisabled(data.getBoolean(0));
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return false;
  }

  /**
   * Privacy consent
   */
  public static boolean userProvidedConsent(CallbackContext callbackContext) {
    boolean providedConsent = OneSignal.userProvidedPrivacyConsent();
    CallbackHelper.callbackSuccessBoolean(callbackContext, providedConsent);
    return true;
  }

  public static boolean requiresUserPrivacyConsent(CallbackContext callbackContext) {
    boolean requiresUserPrivacyConsent = OneSignal.requiresUserPrivacyConsent();
    CallbackHelper.callbackSuccessBoolean(callbackContext, requiresUserPrivacyConsent);
    return true;
  }

  public static boolean setRequiresConsent(CallbackContext callbackContext, JSONArray data) {
    try {
      OneSignal.setRequiresUserPrivacyConsent(data.getBoolean(0));
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }

  public static boolean provideUserConsent(JSONArray data) {
    try {
      OneSignal.provideUserConsent(data.getBoolean(0));
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }

  /**
   * Location
   */
  public static void promptLocation() {
    OneSignal.promptLocation();
  }

  public static void setLocationShared(JSONArray data) {
    try {
      OneSignal.setLocationShared(data.getBoolean(0));
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  public static boolean isLocationShared(CallbackContext callbackContext) {
    // Need to be implemented in Android
    CallbackHelper.callbackSuccessBoolean(callbackContext, false);
    return true;
  }
}
