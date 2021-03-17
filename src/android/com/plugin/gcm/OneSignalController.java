package com.plugin.gcm;

import com.onesignal.OSDeviceState;
import com.onesignal.OneSignal;
import com.onesignal.OneSignal.PostNotificationResponseHandler;

import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collection;

public class OneSignalController {
  private static CallbackContext notifReceivedCallbackContext;
  private static CallbackContext notifOpenedCallbackContext;
  private static CallbackContext inAppMessageClickedCallbackContext;

  private static final String TAG = "OneSignalPush";

  /**
   * Tags
   */
  public static boolean getTags(CallbackContext callbackContext) {
    final CallbackContext jsTagsAvailableCallBack = callbackContext;
    OneSignal.getTags(new OneSignal.OSGetTagsHandler() {
      @Override
      public void tagsAvailable(JSONObject tags) {
        CallbackHelper.callbackSuccess(jsTagsAvailableCallBack, tags);
      }
    });
    return true;
  }

  public static boolean sendTags(JSONArray data) {
    try {
      OneSignal.sendTags(data.getJSONObject(0));
    }
    catch (Throwable t) {
      t.printStackTrace();
    }
    return true;
  }

  public static boolean deleteTags(JSONArray data) {
    try {
      Collection<String> list = new ArrayList<String>();
      for (int i = 0; i < data.length(); i++)
        list.add(data.get(i).toString());
      OneSignal.deleteTags(list);
      return true;
    } catch (Throwable t) {
      t.printStackTrace();
      return false;
    }
  }

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

  /**
   * Misc
   */
  public static boolean registerForPushNotifications() {
    // doesn't apply to Android
    return true;
  }

  public static boolean getIds(CallbackContext callbackContext) {
    OSDeviceState deviceState = OneSignal.getDeviceState();

    if (deviceState == null)
      return false;

    JSONObject jsonIds = new JSONObject();
    try {
      jsonIds.put("userId", deviceState.getUserId());
      jsonIds.put("pushToken", deviceState.getPushToken() == null ? "" : deviceState.getPushToken());

      CallbackHelper.callbackSuccess(callbackContext, jsonIds);
    } catch (Throwable t) {
      t.printStackTrace();
    }

    return true;
  }

  public static void setLogLevel(JSONArray data) {
    try {
      JSONObject jo = data.getJSONObject(0);
      OneSignal.setLogLevel(jo.optInt("logLevel", 0), jo.optInt("visualLevel", 0));
    }
    catch(Throwable t) {
      t.printStackTrace();
    }
  }

  public static boolean userProvidedConsent(CallbackContext callbackContext) {
    boolean providedConsent = OneSignal.userProvidedPrivacyConsent();
    CallbackHelper.callbackSuccessBoolean(callbackContext, providedConsent);
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

  public static boolean grantConsent(JSONArray data) {
    try {
      OneSignal.provideUserConsent(data.getBoolean(0));
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
      return false;
    }
  }

  public static boolean setExternalUserId(final CallbackContext callback, JSONArray data) {
    try {
      String authHashToken = null;
      if (data.length() > 1)
        authHashToken = data.getString(1);

      OneSignal.setExternalUserId(data.getString(0), authHashToken, new OneSignal.OSExternalUserIdUpdateCompletionHandler() {
        @Override
        public void onSuccess(JSONObject results) {
          CallbackHelper.callbackSuccess(callback, results);
        }

        @Override
        public void onFailure(OneSignal.ExternalIdError error) {
          CallbackHelper.callbackError(callback, error.getMessage());
        }
      });
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return false;
  }

  public static boolean removeExternalUserId(final CallbackContext callback) {
    OneSignal.removeExternalUserId(new OneSignal.OSExternalUserIdUpdateCompletionHandler() {
      @Override
      public void onSuccess(JSONObject results) {
        CallbackHelper.callbackSuccess(callback, results);
      }

      @Override
      public void onFailure(OneSignal.ExternalIdError error) {
        CallbackHelper.callbackError(callback, error.getMessage());
      }
    });
    return true;
  }

}