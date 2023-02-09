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
import com.onesignal.OSInAppMessage;
import com.onesignal.OSInAppMessageLifecycleHandler;
import com.onesignal.OneSignal;
import com.onesignal.common.OneSignalWrapper;

import com.onesignal.notifications.INotification;
import com.onesignal.notifications.INotificationClickHandler;
import com.onesignal.notifications.INotificationClickResult;
import com.onesignal.notifications.INotificationReceivedEvent;
import com.onesignal.notifications.IRemoteNotificationReceivedHandler;

import com.onesignal.notifications.INotificationWillShowInForegroundHandler;
import com.onesignal.notifications.INotificationReceivedEvent;
import com.onesignal.notifications.IRemoteNotificationReceivedHandler;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import java.util.HashMap;

public class OneSignalPush extends CordovaPlugin {
  private static final String TAG = "OneSignalPush";

  private static final String SET_NOTIFICATION_WILL_SHOW_IN_FOREGROUND_HANDLER = "setNotificationWillShowInForegroundHandler";
  private static final String SET_NOTIFICATION_OPENED_HANDLER = "setNotificationOpenedHandler";
  private static final String SET_IN_APP_MESSAGE_CLICK_HANDLER = "setInAppMessageClickHandler";

  private static final String SET_IN_APP_MESSAGE_LIFECYCLE_HANDLER = "setInAppMessageLifecycleHandler";
  private static final String SET_ON_WILL_DISPLAY_IN_APP_MESSAGE_HANDLER = "setOnWillDisplayInAppMessageHandler";
  private static final String SET_ON_DID_DISPLAY_IN_APP_MESSAGE_HANDLER = "setOnDidDisplayInAppMessageHandler";
  private static final String SET_ON_WILL_DISMISS_IN_APP_MESSAGE_HANDLER = "setOnWillDismissInAppMessageHandler";
  private static final String SET_ON_DID_DISMISS_IN_APP_MESSAGE_HANDLER = "setOnDidDismissInAppMessageHandler";

  private static final String COMPLETE_NOTIFICATION = "completeNotification";
  private static final String INIT = "init";

  private static final String SET_LANGUAGE = "setLanguage";

  private static final String LOGIN = "login";
  private static final String LOGOUT = "logout";

  private static final String ADD_PERMISSION_OBSERVER = "addPermissionObserver";
  private static final String ADD_PUSH_SUBSCRIPTION_OBSERVER = "addPushSubscriptionObserver";
  private static final String REMOVE_PUSH_SUBSCRIPTION_OBSERVER = "removePushSubscriptionObserver";

  private static final String OPT_IN = "optIn";
  private static final String OPT_OUT = "optOut";
   private static final String GET_ID = "getId";
  private static final String GET_TOKEN = "getToken";
  private static final String GET_OPTED_IN = "getOptedIn";
  
  private static final String ADD_ALIASES = "addAliases";
  private static final String REMOVE_ALIASES = "removeAliases";

  private static final String REMOVE_TAGS = "removeTags";
  private static final String ADD_TAGS = "addTags";

  private static final String REGISTER_FOR_PROVISIONAL_AUTHORIZATION = "registerForProvisionalAuthorization";
  private static final String REQUEST_PERMISSION = "requestPermission";
  private static final String GET_PERMISSION = "getPermission";
  private static final String CAN_REQUEST_PERMISSION = "canRequestPermission";
  private static final String PROMPT_FOR_PUSH_NOTIFICATIONS_WITH_USER_RESPONSE = "promptForPushNotificationsWithUserResponse";
  private static final String UNSUBSCRIBE_WHEN_NOTIFICATIONS_DISABLED = "unsubscribeWhenNotificationsAreDisabled";

  private static final String CLEAR_ALL_NOTIFICATIONS = "clearAllNotifications";
  private static final String REMOVE_NOTIFICATION = "removeNotification";
  private static final String REMOVE_GROUPED_NOTIFICATIONS = "removeGroupedNotifications";

  private static final String SET_LAUNCH_URLS_IN_APP = "setLaunchURLsInApp";

  private static final String ADD_EMAIL = "addEmail";
  private static final String REMOVE_EMAIL = "removeEmail";

  private static final String ADD_SMS = "addSms";
  private static final String REMOVE_SMS = "removeSms";

  private static final String SET_LOG_LEVEL = "setLogLevel";
  private static final String SET_ALERT_LEVEL = "setAlertLevel";

  private static final String SET_LOCATION_SHARED = "setLocationShared";
  private static final String IS_LOCATION_SHARED = "isLocationShared";
  private static final String REQUEST_LOCATION_PERMISSION = "requestLocationPermission";

  private static final String GET_PRIVACY_CONSENT = "getPrivacyConsent";
  private static final String GET_REQUIRES_PRIVACY_CONSENT = "getRequiresPrivacyConsent";
  private static final String SET_REQUIRES_PRIVACY_CONSENT = "setRequiresPrivacyConsent";
  private static final String SET_PRIVACY_CONSENT = "setPrivacyConsent";

  private static final String ADD_TRIGGERS = "addTriggers";
  private static final String REMOVE_TRIGGERS_FOR_KEYS = "removeTriggersForKeys";
  private static final String GET_TRIGGER_VALUE_FOR_KEY = "getTriggerValueForKey";

  private static final String PAUSE_IN_APP_MESSAGES = "pauseInAppMessages";
  private static final String IN_APP_MESSAGING_PAUSED = "isInAppMessagingPaused";

  private static final String SEND_OUTCOME = "sendOutcome";
  private static final String SEND_UNIQUE_OUTCOME = "sendUniqueOutcome";
  private static final String SEND_OUTCOME_WITH_VALUE = "sendOutcomeWithValue";

  private static final String ENTER_LIVE_ACTIVITY = "enterLiveActivity";
  private static final String EXIT_LIVE_ACTIVITY = "exitLiveActivity";

  private static final HashMap<String, INotificationReceivedEvent> notificationReceivedEventCache = new HashMap<>();

  private static CallbackContext jsInAppMessageWillDisplayCallback;
  private static CallbackContext jsInAppMessageDidDisplayCallBack;
  private static CallbackContext jsInAppMessageWillDismissCallback;
  private static CallbackContext jsInAppMessageDidDismissCallBack;

  public boolean setNotificationWillShowInForegroundHandler(CallbackContext callbackContext) {
    OneSignal.getNotifications().setNotificationWillShowInForegroundHandler(new CordovaNotificationInForegroundHandler(callbackContext));
    return true;
  }

  public boolean setNotificationOpenedHandler(CallbackContext callbackContext) {
    OneSignal.getNotifications().setNotificationClickHandler(new CordovaNotificationOpenedHandler(callbackContext));
    return true;
  }


  public boolean setInAppMessageClickHandler(CallbackContext callbackContext) {
    OneSignal.setInAppMessageClickHandler(new CordovaInAppMessageClickHandler(callbackContext));
    return true;
  }

  public boolean setInAppMessageLifecycleHandler() {
    OneSignal.setInAppMessageLifecycleHandler(new OSInAppMessageLifecycleHandler() {
      @Override
      public void onWillDisplayInAppMessage(OSInAppMessage message) {
        if (jsInAppMessageWillDisplayCallback != null) {
          CallbackHelper.callbackSuccess(jsInAppMessageWillDisplayCallback, message.toJSONObject());
        }
      }
      @Override
      public void onDidDisplayInAppMessage(OSInAppMessage message) {
        if (jsInAppMessageDidDisplayCallBack != null) {
          CallbackHelper.callbackSuccess(jsInAppMessageDidDisplayCallBack, message.toJSONObject());
        }
      }
      @Override
      public void onWillDismissInAppMessage(OSInAppMessage message) {
        if (jsInAppMessageWillDismissCallback != null) {
          CallbackHelper.callbackSuccess(jsInAppMessageWillDismissCallback, message.toJSONObject());
        }
      }
      @Override
      public void onDidDismissInAppMessage(OSInAppMessage message) {
        if (jsInAppMessageDidDismissCallBack != null) {
          CallbackHelper.callbackSuccess(jsInAppMessageDidDismissCallBack, message.toJSONObject());
        }
      }
    });
    return true;
  }

  public boolean setOnWillDisplayInAppMessageHandler(CallbackContext callbackContext) {
    jsInAppMessageWillDisplayCallback = callbackContext;
    return true;
  }

  public boolean setOnDidDisplayInAppMessageHandler(CallbackContext callbackContext) {
    jsInAppMessageDidDisplayCallBack = callbackContext;
    return true;
  }

  public boolean setOnWillDismissInAppMessageHandler(CallbackContext callbackContext) {
    jsInAppMessageWillDismissCallback = callbackContext;
    return true;
  }

  public boolean setOnDidDismissInAppMessageHandler(CallbackContext callbackContext) {
    jsInAppMessageDidDismissCallBack = callbackContext;
    return true;
  }

  public boolean init(CallbackContext callbackContext, JSONArray data) {
    OneSignalWrapper.setSdkType("cordova");  
    // For 5.0.0-beta, hard code to reflect Cordova SDK version found in plugin.xml
    OneSignalWrapper.setSdkVersion("3.3.0");
    try {
      String appId = data.getString(0);

      OneSignal.initWithContext(this.cordova.getActivity(), appId);

      CallbackHelper.callbackSuccessBoolean(callbackContext, true);
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

      case SET_IN_APP_MESSAGE_LIFECYCLE_HANDLER:
        result = setInAppMessageLifecycleHandler();
        break;

      case SET_ON_WILL_DISPLAY_IN_APP_MESSAGE_HANDLER:
        result = setOnWillDisplayInAppMessageHandler(callbackContext);
        break;

      case SET_ON_DID_DISPLAY_IN_APP_MESSAGE_HANDLER:
        result = setOnDidDisplayInAppMessageHandler(callbackContext);
        break;

      case SET_ON_WILL_DISMISS_IN_APP_MESSAGE_HANDLER:
        result = setOnWillDismissInAppMessageHandler(callbackContext);
        break;

      case SET_ON_DID_DISMISS_IN_APP_MESSAGE_HANDLER:
        result = setOnDidDismissInAppMessageHandler(callbackContext);
        break;

      case COMPLETE_NOTIFICATION:
        result = completeNotification(data);
        break;

      case INIT:
        result = init(callbackContext, data);
        break;

      case SET_LANGUAGE:
        result = OneSignalController.setLanguage(data);
        break;

      case LOGIN:
        result = OneSignalController.login(data);
        break;
      
      case LOGOUT:
        result = OneSignalController.logout();

      case ADD_PERMISSION_OBSERVER:
        result = OneSignalObserverController.addPermissionObserver(callbackContext);
        break;

      case ADD_PUSH_SUBSCRIPTION_OBSERVER:
        result = OneSignalObserverController.addPushSubscriptionObserver(callbackContext);
        break;
      
      case REMOVE_PUSH_SUBSCRIPTION_OBSERVER:
        result = OneSignalObserverController.removePushSubscriptionObserver();
        break;

      case OPT_IN:
        result = OneSignalController.optIn();
        break;

      case OPT_OUT:
        result = OneSignalController.optOut();
        break;
      
      case GET_ID:
        result = OneSignalController.getId(callbackContext);
        break;

      case GET_TOKEN:
        result = OneSignalController.getToken(callbackContext);
        break;

      case GET_OPTED_IN:
        result = OneSignalController.getOptedIn(callbackContext);
        break;

      case ADD_ALIASES:
        result = OneSignalController.addAliases(data);
        break;

      case REMOVE_ALIASES:
        result = OneSignalController.removeAliases(data);
        break;

      case ADD_TAGS:
        result = OneSignalController.addTags(data);
        break;

      case REMOVE_TAGS:
        result = OneSignalController.removeTags(data);
        break;

      case REGISTER_FOR_PROVISIONAL_AUTHORIZATION:
        result = OneSignalController.registerForProvisionalAuthorization();
        break;

      case REQUEST_PERMISSION:
        result = OneSignalController.requestPermission(callbackContext, data);
        break;

      case GET_PERMISSION:
        result = OneSignalController.getPermission(callbackContext);

      case CAN_REQUEST_PERMISSION:
        result = OneSignalController.canRequestPermission();
        break;
      
      case CLEAR_ALL_NOTIFICATIONS:
        result = OneSignalController.clearAllNotifications();
        break;

      case REMOVE_NOTIFICATION:
        result = OneSignalController.removeNotification(data);
        break;

      case REMOVE_GROUPED_NOTIFICATIONS:
        result = OneSignalController.removeGroupedNotifications(data);
        break;

      case SET_LAUNCH_URLS_IN_APP:
        result = OneSignalController.setLaunchURLsInApp();
        break;

      case SET_LOG_LEVEL:
        OneSignalController.setLogLevel(callbackContext,data);
        break;

      case ADD_EMAIL:
        result = OneSignalEmailController.addEmail(data);
        break;

      case REMOVE_EMAIL:
        result = OneSignalEmailController.removeEmail(data);
        break;

      case ADD_SMS:
        result = OneSignalSMSController.addSms(data);
        break;

      case REMOVE_SMS:
        result = OneSignalSMSController.removeSms(data);
        break;

      case REQUEST_LOCATION_PERMISSION:
        OneSignalController.requestLocationPermission(callbackContext);
        break;

      case SET_LOCATION_SHARED:
        OneSignalController.setLocationShared(data);
        break;

      case IS_LOCATION_SHARED:
        result = OneSignalController.isLocationShared(callbackContext);
        break;

      case GET_PRIVACY_CONSENT:
        result = OneSignalController.getPrivacyConsent(callbackContext);
        break;

      case GET_REQUIRES_PRIVACY_CONSENT:
        result = OneSignalController.getRequiresPrivacyConsent(callbackContext);
        break;

      case SET_REQUIRES_PRIVACY_CONSENT:
        result = OneSignalController.setRequiresPrivacyConsent(data);
        break;

      case SET_PRIVACY_CONSENT:
        result = OneSignalController.setPrivacyConsent(data);
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

      case ENTER_LIVE_ACTIVITY:
        result = OneSignalController.enterLiveActivity();
        break;

      case EXIT_LIVE_ACTIVITY:
        result = OneSignalController.exitLiveActivity();
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

      INotificationReceivedEvent notificationReceivedEvent = notificationReceivedEventCache.get(notificationId);

      if (notificationReceivedEvent == null) {
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

  private static class CordovaNotificationInForegroundHandler implements INotificationWillShowInForegroundHandler {
    
    private CallbackContext jsNotificationInForegroundCallBack;

    public CordovaNotificationInForegroundHandler(CallbackContext inCallbackContext) {
      jsNotificationInForegroundCallBack = inCallbackContext;
    }

    @Override
    public void notificationWillShowInForeground(INotificationReceivedEvent notificationReceivedEvent) {
      try {
        System.out.println(notificationReceivedEvent.getNotification());

        INotification notification = notificationReceivedEvent.getNotification();
        notificationReceivedEventCache.put(notification.getNotificationId(), notificationReceivedEvent);

        JSONObject foregroundData = new JSONObject();
        
        foregroundData.put("body", notification.getBody());
        foregroundData.put("sound", notification.getSound());
        foregroundData.put("title", notification.getTitle());
        foregroundData.put("launchURL", notification.getLaunchURL());
        // Can't seem to access this?
        // foregroundData.put("rawPayload", notification.getrawPayload());
        foregroundData.put("actionButtons", notification.getActionButtons());
        foregroundData.put("additionalData", notification.getAdditionalData());
        foregroundData.put("notificationId", notification.getNotificationId());
        foregroundData.put("groupKey", notification.getGroupKey());
        foregroundData.put("groupMessage", notification.getGroupMessage());
        foregroundData.put("groupedNotifications", notification.getGroupedNotifications());
        foregroundData.put("ledColor", notification.getLedColor());
        foregroundData.put("priority", notification.getPriority());
        foregroundData.put("smallIcon", notification.getSmallIcon());
        foregroundData.put("largeIcon", notification.getLargeIcon());
        foregroundData.put("bigPicture", notification.getBigPicture());
        foregroundData.put("collapseId", notification.getCollapseId());
        foregroundData.put("fromProjectNumber", notification.getFromProjectNumber());
        foregroundData.put("smallIconAccentColor", notification.getSmallIconAccentColor());
        foregroundData.put("lockScreenVisibility", notification.getLockScreenVisibility());
        foregroundData.put("androidNotificationId", notification.getAndroidNotificationId());

        CallbackHelper.callbackSuccess(jsNotificationInForegroundCallBack, foregroundData);
      } catch (Throwable t) {
        t.printStackTrace();
      }
    }
  }

  private static class CordovaNotificationOpenedHandler implements INotificationClickHandler {

    private CallbackContext jsNotificationOpenedCallBack;

    public CordovaNotificationOpenedHandler(CallbackContext inCallbackContext) {
      jsNotificationOpenedCallBack = inCallbackContext;
    }

    @Override
    public void notificationClicked(INotificationClickResult result) {
      try {
        JSONObject openedData = new JSONObject();

        if (jsNotificationOpenedCallBack != null) {
          openedData.put("actionId", result.getAction().getActionId());
          openedData.put("type", result.getAction().getType());
          openedData.put("title", result.getNotification().getTitle());
          openedData.put("message", result.getNotification().getBody());
          openedData.put("additionalData", result.getNotification().getAdditionalData());

          CallbackHelper.callbackSuccess(jsNotificationOpenedCallBack, openedData);
        }
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
        JSONObject resultJSON = result.toJSONObject();
        JSONObject actionJSON = new JSONObject();

        // Convert key names to camelCase, which is the expected type
        if (resultJSON.has("first_click")) {
          actionJSON.put("firstClick", resultJSON.getBoolean("first_click"));
        }
        if (resultJSON.has("closes_message")) {
          actionJSON.put("closesMessage", resultJSON.getBoolean("closes_message"));
        }
        actionJSON.put("clickName", resultJSON.optString("click_name", null));
        actionJSON.put("clickUrl", resultJSON.optString("click_url", null));
        actionJSON.put("outcomes", resultJSON.optJSONArray("outcomes"));
        actionJSON.put("tags", resultJSON.optJSONObject("tags"));

        CallbackHelper.callbackSuccess(jsInAppMessageClickedCallback, actionJSON);
      }
      catch (JSONException e) {
        e.printStackTrace();
      }
    }
  }

  @Override
  public void onDestroy() {
    OneSignal.getNotifications().setNotificationClickHandler(null);
    OneSignal.getNotifications().setNotificationWillShowInForegroundHandler(null);
  }
}
