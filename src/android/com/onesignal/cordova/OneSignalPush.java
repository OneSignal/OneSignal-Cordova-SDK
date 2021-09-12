/**
 * Modified MIT License
 *
 * Copyright 2021 OneSignal
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

package com.onesignal.cordova;

import android.util.Log;

import com.onesignal.OSInAppMessageAction;
import com.onesignal.OSNotification;
import com.onesignal.OSNotificationOpenedResult;
import com.onesignal.OSNotificationReceivedEvent;
import com.onesignal.OneSignal;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import java.util.HashMap;

public class OneSignalPush extends CordovaPlugin {
  private static final String TAG = "OneSignalPush";

  private static final String SET_NOTIFICATION_WILL_SHOW_IN_FOREGROUND_HANDLER = "setNotificationWillShowInForegroundHandler";
  private static final String SET_NOTIFICATION_OPENED_HANDLER = "setNotificationOpenedHandler";
  private static final String SET_IN_APP_MESSAGE_CLICK_HANDLER = "setInAppMessageClickHandler";
  private static final String COMPLETE_NOTIFICATION = "completeNotification";
  private static final String INIT = "init";

  private static final String GET_DEVICE_STATE = "getDeviceState";

  private static final String SET_LANGUAGE = "setLanguage";

  private static final String ADD_PERMISSION_OBSERVER = "addPermissionObserver";
  private static final String ADD_SUBSCRIPTION_OBSERVER = "addSubscriptionObserver";
  private static final String ADD_EMAIL_SUBSCRIPTION_OBSERVER = "addEmailSubscriptionObserver";
  private static final String ADD_SMS_SUBSCRIPTION_OBSERVER = "addSMSSubscriptionObserver";

  private static final String GET_TAGS = "getTags";
  private static final String DELETE_TAGS = "deleteTags";
  private static final String SEND_TAGS = "sendTags";

  private static final String REGISTER_FOR_PROVISIONAL_AUTHORIZATION = "registerForProvisionalAuthorization";
  private static final String PROMPT_FOR_PUSH_NOTIFICATIONS_WITH_USER_RESPONSE = "promptForPushNotificationsWithUserResponse";
  private static final String UNSUBSCRIBE_WHEN_NOTIFICATIONS_DISABLED = "unsubscribeWhenNotificationsAreDisabled";

  private static final String CLEAR_ONESIGNAL_NOTIFICATIONS = "clearOneSignalNotifications";
  private static final String REMOVE_NOTIFICATION = "removeNotification";
  private static final String REMOVE_GROUPED_NOTIFICATIONS = "removeGroupedNotifications";

  private static final String DISABLE_PUSH = "disablePush";
  private static final String POST_NOTIFICATION = "postNotification";

  private static final String SET_EMAIL = "setEmail";
  private static final String SET_UNAUTHENTICATED_EMAIL = "setUnauthenticatedEmail";
  private static final String LOGOUT_EMAIL = "logoutEmail";

  private static final String SET_SMS_NUMBER = "setSMSNumber";
  private static final String SET_UNAUTHENTICATED_SMS_NUMBER = "setUnauthenticatedSMSNumber";
  private static final String LOGOUT_SMS_NUMBER = "logoutSMSNumber";

  private static final String SET_LOG_LEVEL = "setLogLevel";

  private static final String SET_LOCATION_SHARED = "setLocationShared";
  private static final String IS_LOCATION_SHARED = "isLocationShared";
  private static final String PROMPT_LOCATION = "promptLocation";

  private static final String USER_PROVIDED_CONSENT = "userProvidedPrivacyConsent";
  private static final String REQUIRES_CONSENT = "requiresUserPrivacyConsent";
  private static final String SET_REQUIRES_CONSENT = "setRequiresUserPrivacyConsent";
  private static final String PROVIDE_USER_CONSENT = "provideUserConsent";

  private static final String SET_EXTERNAL_USER_ID = "setExternalUserId";
  private static final String REMOVE_EXTERNAL_USER_ID = "removeExternalUserId";

  private static final String ADD_TRIGGERS = "addTriggers";
  private static final String REMOVE_TRIGGERS_FOR_KEYS = "removeTriggersForKeys";
  private static final String GET_TRIGGER_VALUE_FOR_KEY = "getTriggerValueForKey";

  private static final String PAUSE_IN_APP_MESSAGES = "pauseInAppMessages";
  private static final String IN_APP_MESSAGING_PAUSED = "isInAppMessagingPaused";

  private static final String SEND_OUTCOME = "sendOutcome";
  private static final String SEND_UNIQUE_OUTCOME = "sendUniqueOutcome";
  private static final String SEND_OUTCOME_WITH_VALUE = "sendOutcomeWithValue";

  private static final HashMap<String, OSNotificationReceivedEvent> notificationReceivedEventCache = new HashMap<>();

  public boolean setNotificationWillShowInForegroundHandler(CallbackContext callbackContext) {
    OneSignal.setNotificationWillShowInForegroundHandler(new CordovaNotificationInForegroundHandler(callbackContext));
    return true;
  }

  public boolean setNotificationOpenedHandler(CallbackContext callbackContext) {
    OneSignal.setNotificationOpenedHandler(new CordovaNotificationOpenHandler(callbackContext));
    return true;
  }

  public boolean setInAppMessageClickHandler(CallbackContext callbackContext) {
    OneSignal.setInAppMessageClickHandler(new CordovaInAppMessageClickHandler(callbackContext));
    return true;
  }

  public boolean init(JSONArray data) {
    try {
      String appId = data.getString(0);

      OneSignal.sdkType = "cordova";

      OneSignal.setAppId(appId);
      OneSignal.initWithContext(this.cordova.getActivity());

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

      case SET_NOTIFICATION_WILL_SHOW_IN_FOREGROUND_HANDLER:
        result = setNotificationWillShowInForegroundHandler(callbackContext);
        break;

      case SET_IN_APP_MESSAGE_CLICK_HANDLER:
        result = setInAppMessageClickHandler(callbackContext);
        break;

      case COMPLETE_NOTIFICATION:
        result = completeNotification(data);
        break;

      case INIT:
        result = init(data);
        break;

      case GET_DEVICE_STATE:
        result = OneSignalController.getDeviceState(callbackContext);
        break;

      case SET_LANGUAGE:
        result = OneSignalController.setLanguage(data);
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

      case ADD_SMS_SUBSCRIPTION_OBSERVER:
        result = OneSignalObserverController.addSMSSubscriptionObserver(callbackContext);
        break;

      case GET_TAGS:
        result = OneSignalController.getTags(callbackContext);
        break;

      case SEND_TAGS:
        result = OneSignalController.sendTags(data);
        break;

      case DELETE_TAGS:
        result = OneSignalController.deleteTags(data);
        break;

      case REGISTER_FOR_PROVISIONAL_AUTHORIZATION:
        result = OneSignalController.registerForProvisionalAuthorization();
        break;

      case PROMPT_FOR_PUSH_NOTIFICATIONS_WITH_USER_RESPONSE:
        result = OneSignalController.promptForPushNotificationsWithUserResponse();
        break;

      case UNSUBSCRIBE_WHEN_NOTIFICATIONS_DISABLED:
        result = OneSignalController.unsubscribeWhenNotificationsAreDisabled(data);
        break;

      case CLEAR_ONESIGNAL_NOTIFICATIONS:
        result = OneSignalController.clearOneSignalNotifications();
        break;

      case REMOVE_NOTIFICATION:
        result = OneSignalController.removeNotification(data);
        break;

      case REMOVE_GROUPED_NOTIFICATIONS:
        result = OneSignalController.removeGroupedNotifications(data);
        break;

      case DISABLE_PUSH:
        result = OneSignalController.disablePush(data);
        break;

      case POST_NOTIFICATION:
        result = OneSignalController.postNotification(callbackContext, data);
        break;

      case SET_LOG_LEVEL:
        OneSignalController.setLogLevel(data);
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

      case SET_SMS_NUMBER:
        result = OneSignalSMSController.setSMSNumber(callbackContext, data);
        break;

      case SET_UNAUTHENTICATED_SMS_NUMBER:
        result = OneSignalSMSController.setUnauthenticatedEmail(callbackContext, data);
        break;

      case LOGOUT_SMS_NUMBER:
        result = OneSignalSMSController.logoutSMSNumber(callbackContext);
        break;

      case PROMPT_LOCATION:
        OneSignalController.promptLocation();
        break;

      case SET_LOCATION_SHARED:
        OneSignalController.setLocationShared(data);
        break;

      case IS_LOCATION_SHARED:
        result = OneSignalController.isLocationShared(callbackContext);
        break;

      case USER_PROVIDED_CONSENT:
        result = OneSignalController.userProvidedConsent(callbackContext);
        break;

      case REQUIRES_CONSENT:
        result = OneSignalController.requiresUserPrivacyConsent(callbackContext);
        break;

      case SET_REQUIRES_CONSENT:
        result = OneSignalController.setRequiresConsent(callbackContext, data);
        break;

      case PROVIDE_USER_CONSENT:
        result = OneSignalController.provideUserConsent(data);
        break;

      case SET_EXTERNAL_USER_ID:
        result = OneSignalController.setExternalUserId(callbackContext, data);
        break;

      case REMOVE_EXTERNAL_USER_ID:
        result = OneSignalController.removeExternalUserId(callbackContext);
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

      case IN_APP_MESSAGING_PAUSED:
        result = OneSignalInAppMessagingController.isInAppMessagingPaused(callbackContext);
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

  private boolean completeNotification(JSONArray data) {
    try {
      String notificationId = data.getString(0);
      boolean shouldDisplay = data.getBoolean(1);

      OSNotificationReceivedEvent notificationReceivedEvent = notificationReceivedEventCache.get(notificationId);

      if (notificationReceivedEvent == null) {
        OneSignal.onesignalLog(OneSignal.LOG_LEVEL.ERROR, "Could not find notification completion block with id: " + notificationId);
        return false;
      }

      if (shouldDisplay)
        notificationReceivedEvent.complete(notificationReceivedEvent.getNotification());
      else
        notificationReceivedEvent.complete(null);

      return true;
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return false;
  }

  /**
   * Handlers
   */

  private static class CordovaNotificationInForegroundHandler implements OneSignal.OSNotificationWillShowInForegroundHandler {

    private CallbackContext jsNotificationInForegroundCallBack;

    public CordovaNotificationInForegroundHandler(CallbackContext inCallbackContext) {
      jsNotificationInForegroundCallBack = inCallbackContext;
    }

    @Override
    public void notificationWillShowInForeground(OSNotificationReceivedEvent notificationReceivedEvent) {
      try {
        OSNotification notification = notificationReceivedEvent.getNotification();
        notificationReceivedEventCache.put(notification.getNotificationId(), notificationReceivedEvent);

        CallbackHelper.callbackSuccess(jsNotificationInForegroundCallBack, notificationReceivedEvent.toJSONObject());
      } catch (Throwable t) {
        t.printStackTrace();
      }
    }
  }

  private static class CordovaNotificationOpenHandler implements OneSignal.OSNotificationOpenedHandler {

    private CallbackContext jsNotificationOpenedCallBack;

    public CordovaNotificationOpenHandler(CallbackContext inCallbackContext) {
      jsNotificationOpenedCallBack = inCallbackContext;
    }

    @Override
    public void notificationOpened(OSNotificationOpenedResult result) {
      try {
        if (jsNotificationOpenedCallBack != null)
          CallbackHelper.callbackSuccess(jsNotificationOpenedCallBack, result.toJSONObject());
      } catch (Throwable t) {
        t.printStackTrace();
      }
    }
  }

  private static class CordovaInAppMessageClickHandler implements OneSignal.OSInAppMessageClickHandler {

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
    OneSignal.setNotificationOpenedHandler(null);
    OneSignal.setNotificationWillShowInForegroundHandler(null);
  }
}
