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

import com.onesignal.OneSignal;
import com.onesignal.debug.internal.logging.Logging;
import com.onesignal.common.OneSignalWrapper;

import com.onesignal.inAppMessages.IInAppMessage;
import com.onesignal.inAppMessages.IInAppMessageClickListener;
import com.onesignal.inAppMessages.IInAppMessageClickEvent;
import com.onesignal.inAppMessages.IInAppMessageClickResult;
import com.onesignal.inAppMessages.IInAppMessageLifecycleListener;
import com.onesignal.inAppMessages.IInAppMessageWillDisplayEvent;
import com.onesignal.inAppMessages.IInAppMessageDidDisplayEvent;
import com.onesignal.inAppMessages.IInAppMessageWillDismissEvent;
import com.onesignal.inAppMessages.IInAppMessageDidDismissEvent;

import com.onesignal.notifications.INotification;
import com.onesignal.notifications.INotificationClickListener;
import com.onesignal.notifications.INotificationClickEvent;
import com.onesignal.notifications.INotificationClickResult;
import com.onesignal.notifications.INotificationLifecycleListener;
import com.onesignal.notifications.INotificationWillDisplayEvent;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import java.util.HashMap;

public class OneSignalPush extends CordovaPlugin implements INotificationLifecycleListener, INotificationClickListener, IInAppMessageLifecycleListener, IInAppMessageClickListener {
  private static final String TAG = "OneSignalPush";

  private static final String ADD_FOREGROUND_LIFECYCLE_LISTENER = "addForegroundLifecycleListener";
  private static final String PROCEED_WITH_WILL_DISPLAY = "proceedWithWillDisplay";
  private static final String DISPLAY_NOTIFICATION = "displayNotification";
  private static final String PREVENT_DEFAULT = "preventDefault";
  private static final String ADD_NOTIFICATION_CLICK_LISTENER = "addNotificationClickListener";
  
  private static final String SET_IN_APP_MESSAGE_CLICK_HANDLER = "setInAppMessageClickHandler";
  private static final String SET_ON_WILL_DISPLAY_IN_APP_MESSAGE_HANDLER = "setOnWillDisplayInAppMessageHandler";
  private static final String SET_ON_DID_DISPLAY_IN_APP_MESSAGE_HANDLER = "setOnDidDisplayInAppMessageHandler";
  private static final String SET_ON_WILL_DISMISS_IN_APP_MESSAGE_HANDLER = "setOnWillDismissInAppMessageHandler";
  private static final String SET_ON_DID_DISMISS_IN_APP_MESSAGE_HANDLER = "setOnDidDismissInAppMessageHandler";

  private static final String INIT = "init";

  private static final String SET_LANGUAGE = "setLanguage";

  private static final String LOGIN = "login";
  private static final String LOGOUT = "logout";

  private static final String ADD_PERMISSION_OBSERVER = "addPermissionObserver";
  private static final String ADD_PUSH_SUBSCRIPTION_OBSERVER = "addPushSubscriptionObserver";
  private static final String ADD_USER_STATE_OBSERVER = "addUserStateObserver";

  private static final String GET_ONESIGNAL_ID = "getOnesignalId";
  private static final String GET_EXTERNAL_ID = "getExternalId";

  private static final String OPT_IN = "optInPushSubscription";
  private static final String OPT_OUT = "optOutPushSubscription";
   private static final String GET_ID = "getPushSubscriptionId";
  private static final String GET_TOKEN = "getPushSubscriptionToken";
  private static final String GET_OPTED_IN = "getPushSubscriptionOptedIn";
  
  private static final String ADD_ALIASES = "addAliases";
  private static final String REMOVE_ALIASES = "removeAliases";

  private static final String REMOVE_TAGS = "removeTags";
  private static final String ADD_TAGS = "addTags";
  private static final String GET_TAGS = "getTags";

  private static final String REGISTER_FOR_PROVISIONAL_AUTHORIZATION = "registerForProvisionalAuthorization";
  private static final String REQUEST_PERMISSION = "requestPermission";
  private static final String GET_PERMISSION_INTERNAL = "getPermissionInternal";
  private static final String PERMISSION_NATIVE = "permissionNative";
  private static final String CAN_REQUEST_PERMISSION = "canRequestPermission";

  private static final String CLEAR_ALL_NOTIFICATIONS = "clearAllNotifications";
  private static final String REMOVE_NOTIFICATION = "removeNotification";
  private static final String REMOVE_GROUPED_NOTIFICATIONS = "removeGroupedNotifications";

  private static final String ADD_EMAIL = "addEmail";
  private static final String REMOVE_EMAIL = "removeEmail";

  private static final String ADD_SMS = "addSms";
  private static final String REMOVE_SMS = "removeSms";

  private static final String SET_LOG_LEVEL = "setLogLevel";
  private static final String SET_ALERT_LEVEL = "setAlertLevel";

  private static final String SET_LOCATION_SHARED = "setLocationShared";
  private static final String IS_LOCATION_SHARED = "isLocationShared";
  private static final String REQUEST_LOCATION_PERMISSION = "requestLocationPermission";

  private static final String SET_PRIVACY_CONSENT_REQUIRED = "setPrivacyConsentRequired";
  private static final String SET_PRIVACY_CONSENT_GIVEN = "setPrivacyConsentGiven";

  private static final String ADD_TRIGGERS = "addTriggers";
  private static final String REMOVE_TRIGGERS = "removeTriggers";
  private static final String CLEAR_TRIGGERS = "clearTriggers";
  private static final String SET_PAUSED = "setPaused";
  private static final String IS_PAUSED = "isPaused";

  private static final String ADD_OUTCOME = "addOutcome";
  private static final String ADD_UNIQUE_OUTCOME = "addUniqueOutcome";
  private static final String ADD_OUTCOME_WITH_VALUE = "addOutcomeWithValue";

  private static final String ENTER_LIVE_ACTIVITY = "enterLiveActivity";
  private static final String EXIT_LIVE_ACTIVITY = "exitLiveActivity";
  private static final String SET_PUSH_TO_START_TOKEN = "setPushToStartToken";
  private static final String REMOVE_PUSH_TO_START_TOKEN = "removePushToStartToken";
  private static final String SETUP_DEFAULT_ACTIVITY = "setupDefaultLiveActivity";
  private static final String START_DEFAULT_LIVE_ACTIVITY = "startDefaultLiveActivity";

  private static final HashMap<String, INotificationWillDisplayEvent> notificationWillDisplayCache = new HashMap<>();
  private static final HashMap<String, INotificationWillDisplayEvent> preventDefaultCache = new HashMap<>();

  private static CallbackContext jsInAppMessageWillDisplayCallback;
  private static CallbackContext jsInAppMessageDidDisplayCallBack;
  private static CallbackContext jsInAppMessageWillDismissCallback;
  private static CallbackContext jsInAppMessageDidDismissCallBack;
  private static CallbackContext jsInAppMessageClickedCallback;
  private static CallbackContext jsNotificationInForegroundCallBack;
  private static CallbackContext jsNotificationClickedCallback;

  /**
   * N O T I F I C A T I O N    L I F E C Y C L E
   */

  public boolean addForegroundLifecycleListener(CallbackContext callbackContext) {
    jsNotificationInForegroundCallBack = callbackContext;
    return true;
  }

  @Override
  public void onWillDisplay(INotificationWillDisplayEvent event) {
    if (jsNotificationInForegroundCallBack != null) {
      try {
        INotification notification = event.getNotification();
        notificationWillDisplayCache.put(notification.getNotificationId(), (INotificationWillDisplayEvent) event);

        event.preventDefault();

        JSONObject foregroundData = serializeNotification(notification);
        CallbackHelper.callbackSuccess(jsNotificationInForegroundCallBack, foregroundData);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
  }

  private boolean proceedWithWillDisplay(JSONArray data) {
    try{
      String notificationId = data.getString(0);
      INotificationWillDisplayEvent event = notificationWillDisplayCache.get(notificationId);
      if (event == null) {
          Logging.error("Could not find onWillDisplayNotification event for notification with id: " + notificationId, null);
          return true;
      }
      if (this.preventDefaultCache.containsKey(notificationId)) {
          return true;
      }
      event.getNotification().display();
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return true;
  }

  private boolean displayNotification(JSONArray data) {
    try {
      String notificationId = data.getString(0);
        INotificationWillDisplayEvent event = notificationWillDisplayCache.get(notificationId);
        if (event == null) {
            Logging.error("Could not find onWillDisplayNotification event for notification with id: " + notificationId, null);
            return true;
        }
        event.getNotification().display();
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return true;
  }

  private boolean preventDefault(JSONArray data) {
    try {
      String notificationId = data.getString(0);
      INotificationWillDisplayEvent event = notificationWillDisplayCache.get(notificationId);
      if (event == null) {
          Logging.error("Could not find onWillDisplayNotification event for notification with id: " + notificationId, null);
          return true;
      }
      event.preventDefault();
      this.preventDefaultCache.put(notificationId, event);
      return true;
    } catch (JSONException e) {
      e.printStackTrace();
    }
    return true;
  }

  /**
   * N O T I F I C A T I O N    C L I C K    L I S T E N E R
   */

  public boolean addNotificationClickListener(CallbackContext callbackContext) {
    jsNotificationClickedCallback = callbackContext;
    return true;
  }

  @Override
  public void onClick(INotificationClickEvent event) {
    try {
      if (jsNotificationClickedCallback != null) {
        CallbackHelper.callbackSuccess(jsNotificationClickedCallback, serializeNotificationClickEvent(event));
      }
    } catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * I N    A P P    M E S S A G E    C L I C K    L I S T E N E R
   */

  public boolean setInAppMessageClickHandler(CallbackContext callbackContext) {
    jsInAppMessageClickedCallback = callbackContext;
    return true;
  }

  @Override
  public void onClick(IInAppMessageClickEvent event) {
    try {
      if (jsInAppMessageClickedCallback != null) {
        CallbackHelper.callbackSuccess(jsInAppMessageClickedCallback, serializeInAppMessageClickEvent(event));
      }
    }
    catch (JSONException e) {
      e.printStackTrace();
    }
  }

  /**
   * I N    A P P    M E S S A G E    L I F E C Y C L E
   */

  @Override
  public void onWillDisplay(IInAppMessageWillDisplayEvent event) {
    if (jsInAppMessageWillDisplayCallback != null) {
      try {
        JSONObject onWillDisplayResult = new JSONObject();
        onWillDisplayResult.put("message", serializeInAppMessage(event.getMessage()));
        CallbackHelper.callbackSuccess(jsInAppMessageWillDisplayCallback, onWillDisplayResult);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
  }
  @Override
  public void onDidDisplay(IInAppMessageDidDisplayEvent event) {
    if (jsInAppMessageDidDisplayCallBack != null) {
      try {
        JSONObject onDidDisplayResult = new JSONObject();
        onDidDisplayResult.put("message", serializeInAppMessage(event.getMessage()));
        CallbackHelper.callbackSuccess(jsInAppMessageDidDisplayCallBack, onDidDisplayResult);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
  }
  @Override
  public void onWillDismiss(IInAppMessageWillDismissEvent event) {
    if (jsInAppMessageWillDismissCallback != null) {
      try {
        JSONObject onWillDismissResult = new JSONObject();
        onWillDismissResult.put("message", serializeInAppMessage(event.getMessage()));
        CallbackHelper.callbackSuccess(jsInAppMessageWillDismissCallback, onWillDismissResult);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
  }
  @Override
  public void onDidDismiss(IInAppMessageDidDismissEvent event) {
    if (jsInAppMessageDidDismissCallBack != null) {
      try {
        JSONObject onDidDismissResult = new JSONObject();
        onDidDismissResult.put("message", serializeInAppMessage(event.getMessage()));
        CallbackHelper.callbackSuccess(jsInAppMessageDidDismissCallBack, onDidDismissResult);
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
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

  /**
   * I N I T I A L I Z A T I O N
   */

  public boolean init(CallbackContext callbackContext, JSONArray data) {
    OneSignalWrapper.setSdkType("cordova");  
    OneSignalWrapper.setSdkVersion("050201");
    try {
      String appId = data.getString(0);
      OneSignal.initWithContext(this.cordova.getActivity(), appId);

      // add listeners
      OneSignal.getInAppMessages().addLifecycleListener(this);
      OneSignal.getInAppMessages().addClickListener(this);
      OneSignal.getNotifications().addForegroundLifecycleListener(this);
      OneSignal.getNotifications().addClickListener(this);

      CallbackHelper.callbackSuccessBoolean(callbackContext, true);
      return true;
    } catch (JSONException e) {
      Logging.error(TAG + "execute: Got JSON Exception " + e.getMessage(), null);
      return false;
    }
  }

  @Override
  public boolean execute(String action, JSONArray data, CallbackContext callbackContext) {
    boolean result = false;

    switch(action) {
      case ADD_NOTIFICATION_CLICK_LISTENER:
        result = addNotificationClickListener(callbackContext);
        break;

      case ADD_FOREGROUND_LIFECYCLE_LISTENER:
        result = addForegroundLifecycleListener(callbackContext);
        break;

      case PROCEED_WITH_WILL_DISPLAY:
        result = proceedWithWillDisplay(data);
        break;

      case DISPLAY_NOTIFICATION:
        result = displayNotification(data);
        break;

      case PREVENT_DEFAULT:
        result = preventDefault(data);
        break;

      case SET_IN_APP_MESSAGE_CLICK_HANDLER:
        result = setInAppMessageClickHandler(callbackContext);
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
        break;

      case ADD_PERMISSION_OBSERVER:
        result = OneSignalObserverController.addPermissionObserver(callbackContext);
        break;

      case ADD_PUSH_SUBSCRIPTION_OBSERVER:
        result = OneSignalObserverController.addPushSubscriptionObserver(callbackContext);
        break;

      case ADD_USER_STATE_OBSERVER:
        result = OneSignalObserverController.addUserStateObserver(callbackContext);
        break;

      case GET_ONESIGNAL_ID:
        result = OneSignalController.getOnesignalId(callbackContext);
        break;

      case GET_EXTERNAL_ID:
        result = OneSignalController.getExternalId(callbackContext);
        break;

      case OPT_IN:
        result = OneSignalController.optInPushSubscription();
        break;

      case OPT_OUT:
        result = OneSignalController.optOutPushSubscription();
        break;
      
      case GET_ID:
        result = OneSignalController.getPushSubscriptionId(callbackContext);
        break;

      case GET_TOKEN:
        result = OneSignalController.getPushSubscriptionToken(callbackContext);
        break;

      case GET_OPTED_IN:
        result = OneSignalController.getPushSubscriptionOptedIn(callbackContext);
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

      case GET_TAGS:
        result = OneSignalController.getTags(callbackContext);
        break;

      case REGISTER_FOR_PROVISIONAL_AUTHORIZATION:
        result = OneSignalController.registerForProvisionalAuthorization();
        break;

      case REQUEST_PERMISSION:
        result = OneSignalController.requestPermission(callbackContext, data);
        break;

      case GET_PERMISSION_INTERNAL:
        result = OneSignalController.getPermissionInternal(callbackContext);
        break;

      case PERMISSION_NATIVE:
        result = OneSignalController.permissionNative(callbackContext);
        break;

      case CAN_REQUEST_PERMISSION:
        result = OneSignalController.canRequestPermission(callbackContext);
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

      case SET_LOG_LEVEL:
        OneSignalController.setLogLevel(data);
        break;

      case SET_ALERT_LEVEL:
        OneSignalController.setAlertLevel(data);
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
        OneSignalController.requestLocationPermission();
        break;

      case SET_LOCATION_SHARED:
        OneSignalController.setLocationShared(data);
        break;

      case IS_LOCATION_SHARED:
        result = OneSignalController.isLocationShared(callbackContext);
        break;

      case SET_PRIVACY_CONSENT_REQUIRED:
        result = OneSignalController.setPrivacyConsentRequired(data);
        break;

      case SET_PRIVACY_CONSENT_GIVEN:
        result = OneSignalController.setPrivacyConsentGiven(data);
        break;

      case ADD_TRIGGERS:
        result = OneSignalInAppMessagingController.addTriggers(data);
        break;

      case REMOVE_TRIGGERS:
        result = OneSignalInAppMessagingController.removeTriggers(data);
        break;

      case CLEAR_TRIGGERS:
        result = OneSignalInAppMessagingController.clearTriggers();
        break;

      case SET_PAUSED:
        result = OneSignalInAppMessagingController.setPaused(data);
        break;

      case IS_PAUSED:
        result = OneSignalInAppMessagingController.isPaused(callbackContext);
        break;

      case ADD_OUTCOME:
        result = OneSignalOutcomeController.addOutcome(data);
        break;

      case ADD_UNIQUE_OUTCOME:
        result = OneSignalOutcomeController.addUniqueOutcome(data);
        break;

      case ADD_OUTCOME_WITH_VALUE:
        result = OneSignalOutcomeController.addOutcomeWithValue(data);
        break;

      case ENTER_LIVE_ACTIVITY:
        result = OneSignalController.enterLiveActivity();
        break;

      case EXIT_LIVE_ACTIVITY:
        result = OneSignalController.exitLiveActivity();
        break;

      case SET_PUSH_TO_START_TOKEN:
        result = OneSignalController.setPushToStartToken();
        break;

      case REMOVE_PUSH_TO_START_TOKEN:
        result = OneSignalController.removePushToStartToken();
        break;

      case SETUP_DEFAULT_ACTIVITY:
        result = OneSignalController.setupDefaultLiveActivity();
        break;

      case START_DEFAULT_LIVE_ACTIVITY:
        result = OneSignalController.startDefaultLiveActivity();
        break;

      default:
        Logging.error(TAG + "Invalid action : " + action, null);
        CallbackHelper.callbackError(callbackContext, "Invalid action : " + action);
    }

    return result;
  }

  /**
   * S E R I A L I Z E R S
   */

  private JSONObject serializeNotification(INotification notification) throws JSONException {
      JSONObject foregroundData = new JSONObject();

      foregroundData.put("body", notification.getBody());
      foregroundData.put("sound", notification.getSound());
      foregroundData.put("title", notification.getTitle());
      foregroundData.put("launchURL", notification.getLaunchURL());
      foregroundData.put("rawPayload", notification.getRawPayload());
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

      return foregroundData;
  }

  private JSONObject serializeInAppMessage(IInAppMessage message) throws JSONException {
    JSONObject json = new JSONObject();
    json.put("messageId", message.getMessageId());
    return json;
  }

  private JSONObject serializeInAppMessageClickEvent(IInAppMessageClickEvent event) throws JSONException {
    JSONObject json = new JSONObject();
    JSONObject clickResultJson = new JSONObject();

    IInAppMessageClickResult result = event.getResult();
    clickResultJson.put("actionId", result.getActionId());
    clickResultJson.put("urlTarget", result.getUrlTarget());
    clickResultJson.put("url", result.getUrl());
    clickResultJson.put("closingMessage", result.getClosingMessage());

    json.put("result", clickResultJson);
    json.put("message", serializeInAppMessage(event.getMessage()));
    return json;
  }

  private JSONObject serializeNotificationClickEvent(INotificationClickEvent event) throws JSONException {
    JSONObject json = new JSONObject();
    JSONObject clickResultJson = new JSONObject();

    INotificationClickResult clickResult =  event.getResult();
    clickResultJson.put("actionId", clickResult.getActionId());
    clickResultJson.put("url", clickResult.getUrl());

    json.put("notification", serializeNotification(event.getNotification()));
    json.put("result", clickResultJson);
    return json;
  }

  @Override
  public void onDestroy() {
    OneSignal.getNotifications().removeClickListener(this);
    OneSignal.getNotifications().removeForegroundLifecycleListener(this);
    OneSignal.getInAppMessages().removeClickListener(this);
    OneSignal.getInAppMessages().removeLifecycleListener(this);
  }
}
