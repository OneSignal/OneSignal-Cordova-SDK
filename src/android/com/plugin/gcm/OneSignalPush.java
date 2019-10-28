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

import android.util.Log;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.onesignal.OneSignal;
import com.onesignal.OSNotification;
import com.onesignal.OSNotificationOpenResult;
import com.onesignal.OSInAppMessageAction;
import com.onesignal.OneSignal.NotificationOpenedHandler;
import com.onesignal.OneSignal.NotificationReceivedHandler;
import com.onesignal.OneSignal.InAppMessageClickHandler;

import com.onesignal.OSPermissionObserver;
import com.onesignal.OSEmailSubscriptionObserver;
import com.onesignal.OSSubscriptionObserver;

public class OneSignalPush extends CordovaPlugin {
  private static final String TAG = "OneSignalPush";

  private static final String SET_NOTIFICATION_RECEIVED_HANDLER = "setNotificationReceivedHandler";
  private static final String SET_NOTIFICATION_OPENED_HANDLER = "setNotificationOpenedHandler";
  private static final String SET_IN_APP_MESSAGE_CLICK_HANDLER = "setInAppMessageClickHandler";
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

  private static final String SET_EMAIL = "setEmail";
  private static final String SET_UNAUTHENTICATED_EMAIL = "setUnauthenticatedEmail";
  private static final String LOGOUT_EMAIL = "logoutEmail";
  private static final String ADD_EMAIL_SUBSCRIPTION_OBSERVER = "addEmailSubscriptionObserver";

  private static final String SET_LOG_LEVEL = "setLogLevel";

  private static final String SET_LOCATION_SHARED = "setLocationShared";

  private static final String USER_PROVIDED_CONSENT = "userProvidedPrivacyConsent";
  private static final String SET_REQUIRES_CONSENT = "setRequiresUserPrivacyConsent";
  private static final String GRANT_CONSENT = "provideUserConsent";

  private static final String SET_EXTERNAL_USER_ID = "setExternalUserId";
  private static final String REMOVE_EXTERNAL_USER_ID = "removeExternalUserId";

  private static final String ADD_TRIGGERS = "addTriggers";
  private static final String REMOVE_TRIGGERS_FOR_KEYS = "removeTriggersForKeys";
  private static final String GET_TRIGGER_VALUE_FOR_KEY = "getTriggerValueForKey";
  private static final String PAUSE_IN_APP_MESSAGES = "pauseInAppMessages";

  private static final String SEND_OUTCOME = "sendOutcome";
  private static final String SEND_UNIQUE_OUTCOME = "sendUniqueOutcome";
  private static final String SEND_OUTCOME_WITH_VALUE = "sendOutcomeWithValue";

  private static CallbackContext notifReceivedCallbackContext;
  private static CallbackContext notifOpenedCallbackContext;
  private static CallbackContext inAppMessageClickedCallbackContext;


  public static boolean setNotificationReceivedHandler(CallbackContext callbackContext) {
    notifReceivedCallbackContext = callbackContext;
    return true;
  }

  public static boolean setNotificationOpenedHandler(CallbackContext callbackContext) {
    notifOpenedCallbackContext = callbackContext;
    return true;
  }

  public static boolean setInAppMessageClickHandler(CallbackContext callbackContext) {
    inAppMessageClickedCallbackContext = callbackContext;
    return true;
  }

  public boolean init(CallbackContext callbackContext, JSONArray data) {
    try {
      String appId = data.getString(0);
      String googleProjectNumber = data.getString(1);

      OneSignal.sdkType = "cordova";
      OneSignal.Builder builder = OneSignal.getCurrentOrNewInitBuilder();
      builder.unsubscribeWhenNotificationsAreDisabled(true);
      builder.filterOtherGCMReceivers(true);
      builder.setInAppMessageClickHandler(new CordovaInAppMessageClickHandler(inAppMessageClickedCallbackContext));

      OneSignal.init(this.cordova.getActivity(),
              googleProjectNumber,
              appId,
              new CordovaNotificationOpenedHandler(notifOpenedCallbackContext),
              new CordovaNotificationReceivedHandler(notifReceivedCallbackContext)
      );

      // data.getJSONObject(2) is for iOS settings.

      int displayOption = data.getInt(3);
      OneSignal.setInFocusDisplaying(displayOption);

      return true;
    } catch (JSONException e) {
      Log.e(TAG, "execute: Got JSON Exception " + e.getMessage());
      return false;
    }
  }

  @Override
  public boolean execute(String action, JSONArray data, CallbackContext callbackContext) {
    boolean result = false;


    switch(action) {
      case SET_NOTIFICATION_OPENED_HANDLER:
        result = setNotificationOpenedHandler(callbackContext);
        break;

      case SET_NOTIFICATION_RECEIVED_HANDLER:
        result = setNotificationReceivedHandler(callbackContext);
        break;

      case SET_IN_APP_MESSAGE_CLICK_HANDLER:
        result = setInAppMessageClickHandler(callbackContext);
        break;

      case INIT:
        result = init(callbackContext, data);
        break;

      case SET_IN_FOCUS_DISPLAYING:
        result = OneSignalController.setInFocusDisplaying(callbackContext, data);
        break;

      case ADD_PERMISSION_OBSERVER:
        result = OneSignalObserverController.addPermissionObserver(callbackContext);
        break;

      case ADD_SUBSCRIPTION_OBSERVER:
        result = OneSignalObserverController.addSubscriptionObserver(callbackContext);
        break;

      case ADD_EMAIL_SUBSCRIPTION_OBSERVER:
        result = OneSignalObserverController.addEmailSubscriptionObserver(callbackContext);
        break;

      case GET_TAGS:
        result = OneSignalController.getTags(callbackContext);
        break;

      case GET_PERMISSION_SUBCRIPTION_STATE:
        result = OneSignalController.getPermissionSubscriptionState(callbackContext);
        break;

      case GET_IDS:
        result = OneSignalController.getIds(callbackContext);
        break;

      case SEND_TAGS:
        result = OneSignalController.sendTags(data);
        break;

      case DELETE_TAGS:
        result = OneSignalController.deleteTags(data);
        break;

      case REGISTER_FOR_PUSH_NOTIFICATIONS:
        result = OneSignalController.registerForPushNotifications();
        break;

      case ENABLE_VIBRATE:
        result = OneSignalController.enableVibrate(data);
        break;

      case ENABLE_SOUND:
        result = OneSignalController.enableSound(data);
        break;

      case SET_SUBSCRIPTION:
        result = OneSignalController.setSubscription(data);
        break;

      case POST_NOTIFICATION:
        result = OneSignalController.postNotification(callbackContext, data);
        break;

      case PROMPT_LOCATION:
        OneSignalController.promptLocation();
        break;

      case SYNC_HASHED_EMAIL:
        OneSignalEmailController.syncHashedEmail(data);
        break;

      case SET_LOG_LEVEL:
        OneSignalController.setLogLevel(data);
        break;

      case CLEAR_ONESIGNAL_NOTIFICATIONS:
        result = OneSignalController.clearOneSignalNotifications();
        break;

      case SET_EMAIL:
        result = OneSignalEmailController.setEmail(callbackContext, data);
        break;

      case SET_UNAUTHENTICATED_EMAIL:
        result = OneSignalEmailController.setUnauthenticatedEmail(callbackContext, data);
        break;

      case LOGOUT_EMAIL:
        result = OneSignalEmailController.logoutEmail(callbackContext);
        break;

      case SET_LOCATION_SHARED:
        OneSignalController.setLocationShared(data);
        break;

      case USER_PROVIDED_CONSENT:
        result = OneSignalController.userProvidedConsent(callbackContext);
        break;

      case SET_REQUIRES_CONSENT:
        result = OneSignalController.setRequiresConsent(callbackContext, data);
        break;

      case GRANT_CONSENT:
        result = OneSignalController.grantConsent(data);
        break;

      case SET_EXTERNAL_USER_ID:
        result = OneSignalController.setExternalUserId(data);
        break;

      case REMOVE_EXTERNAL_USER_ID:
        result = OneSignalController.removeExternalUserId();
        break;

      case ADD_TRIGGERS:
        result = OneSignalInAppMessagingController.addTriggers(data);
        break;

      case REMOVE_TRIGGERS_FOR_KEYS:
        result = OneSignalInAppMessagingController.removeTriggersForKeys(data);
        break;

      case GET_TRIGGER_VALUE_FOR_KEY:
        result = OneSignalInAppMessagingController.getTriggerValueForKey(callbackContext, data);
        break;

      case PAUSE_IN_APP_MESSAGES:
        result = OneSignalInAppMessagingController.pauseInAppMessages(data);
        break;

      case SEND_OUTCOME:
        result = OneSignalOutcomeController.sendOutcome(callbackContext, data);
        break;

      case SEND_UNIQUE_OUTCOME:
        result = OneSignalOutcomeController.sendUniqueOutcome(callbackContext, data);
        break;

      case SEND_OUTCOME_WITH_VALUE:
        result = OneSignalOutcomeController.sendOutcomeWithValue(callbackContext, data);
        break;

        default:
          Log.e(TAG, "Invalid action : " + action);
          CallbackHelper.callbackError(callbackContext, "Invalid action : " + action);
    }

    return result;
  }


  /**
   * Handlers
   */

  private class CordovaNotificationReceivedHandler implements NotificationReceivedHandler {

    private CallbackContext jsNotificationReceivedCallBack;

    public CordovaNotificationReceivedHandler(CallbackContext inCallbackContext) {
      jsNotificationReceivedCallBack = inCallbackContext;
    }

    @Override
    public void notificationReceived(OSNotification notification) {
      try {
        CallbackHelper.callbackSuccess(jsNotificationReceivedCallBack, new JSONObject(notification.stringify()));
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
        CallbackHelper.callbackSuccess(jsNotificationOpenedCallBack, new JSONObject(result.stringify()));
      }
      catch (Throwable t) {
        t.printStackTrace();
      }
    }
  }

  private class CordovaInAppMessageClickHandler implements InAppMessageClickHandler {

    private CallbackContext jsInAppMessageClickedCallback;

    public CordovaInAppMessageClickHandler(CallbackContext inCallbackContext) {
      jsInAppMessageClickedCallback = inCallbackContext;
    }

    @Override
    public void inAppMessageClicked(OSInAppMessageAction result) {
      try {
        CallbackHelper.callbackSuccess(jsInAppMessageClickedCallback, result.toJSONObject());
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
