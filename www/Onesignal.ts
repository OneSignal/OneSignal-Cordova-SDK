import {
  InAppMessageAction,
  InAppMessageLifecycleHandlerObject,
} from "./models/InAppMessage";
import { OpenedEvent } from "./models/NotificationOpened";
import { OutcomeEvent } from "./models/Outcomes";
import NotificationReceivedEvent from "./NotificationReceivedEvent";
import {
  ChangeEvent,
  DeviceState,
  EmailSubscriptionChange,
  PermissionChange,
  SMSSubscriptionChange,
  SubscriptionChange,
} from "./Subscription";

type LogLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * @author AZOULAY Jordan<jazoulay@joazco.com>
 * @requires module:onesignal-cordova-plugin
 */
export default class Onesignal {
  /**
   * Completes OneSignal initialization by setting the OneSignal Application ID.
   * @param  {string} appId
   * @returns void
   */
  static setAppId(appId: string) {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.setAppId(appId);
  }

  /**
   * Set the callback to run just before displaying a notification while the app is in focus.
   * @param  {(event:NotificationReceivedEvent)=>void} handler
   * @returns void
   */
  static setNotificationWillShowInForegroundHandler(
    handler: (event: NotificationReceivedEvent) => void
  ) {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.setNotificationWillShowInForegroundHandler(
      handler
    );
  }

  /**
   * Set the callback to run on notification open.
   * @param  {(openedEvent:OpenedEvent) => void} handler
   * @returns void
   */
  static setNotificationOpenedHandler(
    handler: (openedEvent: OpenedEvent) => void
  ) {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.setNotificationOpenedHandler(handler);
  }

  /**
   * Sets an In-App Message click event handler.
   * @param  {(action:InAppMessageAction)=>void} handler
   * @returns void
   */
  static setInAppMessageClickHandler(
    handler: (action: InAppMessageAction) => void
  ) {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.setNotificationOpenedHandler(handler);
  }

  /**
   * Sets the In-App Message lifecycle handler object to run on displaying and/or dismissing an In-App Message.
   * @param  {InAppMessageLifecycleHandlerObject} handlerObject
   * @returns void
   */
  static setInAppMessageLifecycleHandler(
    handlerObject: InAppMessageLifecycleHandlerObject
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.setInAppMessageLifecycleHandler(handlerObject);
  }

  /**
   * This method returns a "snapshot" of the device state for when it was called.
   * @param  {(response: DeviceState) => void} handler
   * @returns void
   */
  static getDeviceState(handler: (response: DeviceState) => void): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.getDeviceState(handler);
  }

  /**
   * Allows you to set the app defined language with the OneSignal SDK.
   * @param  {string} language
   * @param  {(success:object)=>void} onSuccess
   * @param  {(failure:object)=>void} onFailure
   * @returns void
   */
  static setLanguage(
    language: string,
    onSuccess?: (success: object) => void,
    onFailure?: (failure: object) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.setLanguage(language, onSuccess, onFailure);
  }

  /**
   * Add a callback that fires when the OneSignal subscription state changes.
   * @param  {(event:ChangeEvent<SubscriptionChange>)=>void} observer
   * @returns void
   */
  static addSubscriptionObserver(
    observer: (event: ChangeEvent<SubscriptionChange>) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.addSubscriptionObserver(observer);
  }

  /**
   * Add a callback that fires when the OneSignal email subscription changes.
   * @param  {(event:ChangeEvent<EmailSubscriptionChange>)=>void} observer
   * @returns void
   */
  static addEmailSubscriptionObserver(
    observer: (event: ChangeEvent<EmailSubscriptionChange>) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.addEmailSubscriptionObserver(observer);
  }

  /**
   * Add a callback that fires when the OneSignal sms subscription changes.
   * @param  {(event:ChangeEvent<SMSSubscriptionChange>)=>void} observer
   * @returns void
   */
  static addSMSSubscriptionObserver(
    observer: (event: ChangeEvent<SMSSubscriptionChange>) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.addSMSSubscriptionObserver(observer);
  }

  /**
   * Add a callback that fires when the native push permission changes.
   * @param  {(event:ChangeEvent<PermissionChange>)=>void} observer
   * @returns void
   */
  static addPermissionObserver(
    observer: (event: ChangeEvent<PermissionChange>) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.addPermissionObserver(observer);
  }

  /**
   * Retrieve a list of tags that have been set on the user from the OneSignal server.
   * @param  {(tags:object)=>void} handler
   * @returns void
   */
  static getTags(handler: (tags: object) => void): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.getTags(handler);
  }

  /**
   * Tag a user based on an app event of your choosing so they can be targeted later via segments.
   * @param  {string} key
   * @param  {string} value
   * @returns void
   */
  static sendTag(key: string, value: string): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.sendTag(key, value);
  }

  /**
   * Deletes multiple tags that were previously set on a user.
   * @param  {string[]} keys
   * @returns void
   */
  static deleteTags(keys: string[]): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.deleteTags(keys);
  }

  /**
   * Only applies to iOS (does nothing on Android as it always silently registers)
   * Call only if you passed false to autoRegister
   * Request for Direct-To-History push notification authorization
   *
   * For more information: https://documentation.onesignal.com/docs/ios-customizations#provisional-push-notifications
   *
   * @param  {(response:{accepted:boolean})=>void} handler
   * @returns void
   */
  static registerForProvisionalAuthorization(
    handler?: (response: { accepted: boolean }) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.registerForProvisionalAuthorization(handler);
  }

  /**
   * Prompts the user for push notifications permission in iOS and Android 13+.
   * Use the fallbackToSettings parameter to prompt to open the settings app if a user has already declined push permissions.
   *
   * Call with promptForPushNotificationsWithUserResponse(fallbackToSettings?, handler?)
   *
   * @param  {boolean} fallbackToSettings
   * @param  {(response:boolean)=>void} handler
   * @returns void
   */
  static promptForPushNotificationsWithUserResponse(
    fallbackToSettingsOrHandler?: boolean | ((response: boolean) => void),
    handler?: (response: boolean) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.promptForPushNotificationsWithUserResponse(
      fallbackToSettingsOrHandler,
      handler
    );
  }

  /**
   * Android Only. iOS provides a standard way to clear notifications by clearing badge count.
   * @returns void
   */
  static clearOneSignalNotifications(): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.clearOneSignalNotifications();
  }

  /**
   * Android Only. If notifications are disabled for your application, unsubscribe the user from OneSignal.
   * @param  {boolean} unsubscribe
   * @returns void
   */
  static unsubscribeWhenNotificationsAreDisabled(unsubscribe: boolean): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.unsubscribeWhenNotificationsAreDisabled(
      unsubscribe
    );
  }

  /**
   * Removes a single OneSignal notification based on its Android notification integer id.
   * @param  {number} id - notification id to cancel
   * @returns void
   */
  static removeNotification(id: number): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.removeNotification(id);
  }

  /**
   * Removes all OneSignal notifications based on its Android notification group Id.
   * @param  {string} id - notification group id to cancel
   * @returns void
   */
  static removeGroupedNotifications(id: string): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.removeGroupedNotifications(id);
  }

  /**
   * Disable the push notification subscription to OneSignal.
   * @param  {boolean} disable
   * @returns void
   */
  static disablePush(disable: boolean): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.disablePush(disable);
  }

  /**
   * Send a notification
   * @param  {object} notificationObject - JSON payload (see REST API reference)
   * @param  {(success:object)=>void} onSuccess
   * @param  {(failure:object)=>void} onFailure
   * @returns void
   */
  static postNotification(
    notificationObject: object,
    onSuccess?: (success: object) => void,
    onFailure?: (failure: object) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.postNotification(
      notificationObject,
      onSuccess,
      onFailure
    );
  }

  /**
   * iOS only.
   * This method can be used to set if launch URLs should be opened within the application or in Safari.
   * @param  {boolean} isEnabled - false will open the link in Safari or user's default browser
   * @returns void
   */
  static setLaunchURLsInApp(isEnabled: boolean): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.setLaunchURLsInApp(isEnabled);
  }

  /**
   * Enable logging to help debug if you run into an issue setting up OneSignal.
   * @param  {LogLevel} nsLogLevel - Sets the logging level to print to the Android LogCat log or Xcode log.
   * @param  {LogLevel} visualLogLevel - Sets the logging level to show as alert dialogs.
   * @returns void
   */
  static setLogLevel(nsLogLevel: LogLevel, visualLogLevel: LogLevel): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.setLogLevel(nsLogLevel, visualLogLevel);
  }

  /**
   * Did the user provide privacy consent for GDPR purposes.
   * @param  {(response: boolean) => void} handler
   * @returns void
   */
  static userProvidedPrivacyConsent(
    handler: (response: boolean) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.userProvidedPrivacyConsent(handler);
  }

  /**
   * True if the application requires user privacy consent, false otherwise
   * Passes a boolean on Android and passes an object on iOS to the handler.
   *
   * @param  {(response: boolean | {value: boolean}) => void} handler
   * @returns void
   */
  static requiresUserPrivacyConsent(
    handler: (response: boolean | { value: boolean }) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.requiresUserPrivacyConsent(handler);
  }

  /**
   * For GDPR users, your application should call this method before setting the App ID.
   * @param  {boolean} required
   * @returns void
   */
  static setRequiresUserPrivacyConsent(required: boolean): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.setRequiresUserPrivacyConsent(required);
  }

  /**
   * If your application is set to require the user's privacy consent, you can provide this consent using this method.
   * @param  {boolean} granted
   * @returns void
   */
  static provideUserConsent(granted: boolean): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.provideUserConsent(granted);
  }

  /**
   * Allows you to set the user's email address with the OneSignal SDK.
   * @param  {string} email
   * @param  {string} authCode
   * @param  {Function} onSuccess
   * @param  {Function} onFailure
   * @returns void
   */
  static setEmail(
    email: string,
    authCode?: string,
    onSuccess?: Function,
    onFailure?: Function
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.setEmail(email, authCode, onSuccess, onFailure);
  }

  /**
   * If your app implements logout functionality, you can call logoutEmail to dissociate the email from the device.
   * @param  {Function} onSuccess
   * @param  {Function} onFailure
   * @returns void
   */
  static logoutEmail(onSuccess?: Function, onFailure?: Function): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.logoutEmail(onSuccess, onFailure);
  }

  /**
   * Allows you to set the user's SMS number with the OneSignal SDK.
   * @param  {string} smsNumber
   * @param  {string} authCode
   * @param  {Function} onSuccess
   * @param  {Function} onFailure
   * @returns void
   */
  static setSMSNumber(
    smsNumber: string,
    authCode?: string,
    onSuccess?: Function,
    onFailure?: Function
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.setSMSNumber(
      smsNumber,
      authCode,
      onSuccess,
      onFailure
    );
  }

  /**
   * If your app implements logout functionality, you can call logoutSMSNumber to dissociate the SMS number from the device.
   * @param  {Function} onSuccess
   * @param  {Function} onFailure
   * @returns void
   */
  static logoutSMSNumber(onSuccess?: Function, onFailure?: Function): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.logoutSMSNumber(onSuccess, onFailure);
  }

  /**
   * Allows you to use your own system's user ID's to send push notifications to your users.
   *
   * Possible function usages:
   * setExternalUserId(externalId: string?): void
   * setExternalUserId(externalId: string?, handler: function?): void
   * setExternalUserId(externalId: string?, externalIdAuthCode: string?, handler: function?): void
   *
   * @param  {string} externalId
   * @param  {string} externalIdAuthCode
   * @param  {(results:object) => void} handler
   * @returns void
   */
  static setExternalUserId(
    externalId: string | null,
    handlerOrAuth?: ((results: object) => void) | string,
    handler?: (results: object) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.setExternalUserId(
      externalId,
      handlerOrAuth,
      handler
    );
  }

  /**
   * Removes whatever was set as the current user's external user ID.
   * @param  {(results:object)=>void} handler
   * @returns void
   */
  static removeExternalUserId(handler?: (results: object) => void): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.removeExternalUserId(handler);
  }

  /**
   * Adds Multiple In-App Message Triggers.
   * @param  {[key: string]: string | number | boolean} triggers
   * @returns void
   */
  static addTriggers(triggers: {
    [key: string]: string | number | boolean;
  }): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.addTriggers(triggers);
  }

  /**
   * Add an In-App Message Trigger.
   * @param  {string} key
   * @param  {string | number | boolean} value
   * @returns void
   */
  static addTrigger(key: string, value: string | number | boolean): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.addTrigger(key, value);
  }

  /**
   * Removes a list of triggers based on a key.
   * @param  {string} key
   * @returns void
   */
  static removeTriggerForKey(key: string): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.removeTriggerForKey(key);
  }

  /**
   * Removes a list of triggers based on a collection of keys.
   * @param  {string[]} keys
   * @returns void
   */
  static removeTriggersForKeys(keys: string[]): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.removeTriggersForKeys(keys);
  }

  /**
   * Gets a trigger value for a provided trigger key.
   * @param  {string} key
   * @param  {(value: string) => void} handler
   * @returns void
   */
  static getTriggerValueForKey(
    key: string,
    handler: (value: string) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.getTriggerValueForKey(key, handler);
  }

  /**
   * Pause & unpause In-App Messages
   * @param  {boolean} pause
   * @returns void
   */
  static pauseInAppMessages(pause: boolean): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.pauseInAppMessages(pause);
  }

  /**
   * Increases the "Count" of this Outcome by 1 and will be counted each time sent.
   * @param  {string} name
   * @param  {(event:OutcomeEvent)=>void} handler
   * @returns void
   */
  static sendOutcome(
    name: string,
    handler?: (event: OutcomeEvent) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.sendOutcome(name, handler);
  }

  /**
   * Increases "Count" by 1 only once. This can only be attributed to a single notification.
   * @param  {string} name
   * @param  {(event:OutcomeEvent)=>void} handler
   * @returns void
   */
  static sendUniqueOutcome(
    name: string,
    handler?: (event: OutcomeEvent) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.sendUniqueOutcome(name, handler);
  }

  /**
   * Increases the "Count" of this Outcome by 1 and the "Sum" by the value. Will be counted each time sent.
   * If the method is called outside of an attribution window, it will be unattributed until a new session occurs.
   * @param  {string} name
   * @param  {string|number} value
   * @param  {(event:OutcomeEvent)=>void} handler
   * @returns void
   */
  static sendOutcomeWithValue(
    name: string,
    value: string | number,
    handler?: (event: OutcomeEvent) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.sendOutcomeWithValue(name, value, handler);
  }

  /**
   * Prompts the user for location permissions to allow geotagging from the OneSignal dashboard.
   * @returns void
   */
  static promptLocation(): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.promptLocation();
  }

  /**
   * Disable or enable location collection (defaults to enabled if your app has location permission).
   * @param  {boolean} shared
   * @returns void
   */
  static setLocationShared(shared: boolean): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.setLocationShared(shared);
  }

  /**
   * True if the application has location share activated, false otherwise
   * Passes a boolean on Android and passes an object on iOS to the handler.
   *
   * @param  {(response: boolean | {value: boolean}) => void} handler
   * @returns void
   */
  static isLocationShared(
    handler: (response: boolean | { value: boolean }) => void
  ): void {
    if (
      typeof window.plugins === "undefined" ||
      typeof window.plugins.OneSignal === "undefined"
    ) {
      Onesignal.warnPluginIsUnInstallOrIncompatible();
      return;
    }
    window.plugins.OneSignal.isLocationShared(handler);
  }

  static warnPluginIsUnInstallOrIncompatible() {
    console.warn(
      "Onesignal is uninstalled or incompatible with current platform"
    );
  }
}

export {
  LogLevel,
  InAppMessageAction,
  InAppMessageLifecycleHandlerObject,
  OpenedEvent,
  OutcomeEvent,
  NotificationReceivedEvent,
  ChangeEvent,
  DeviceState,
  EmailSubscriptionChange,
  PermissionChange,
  SMSSubscriptionChange,
  SubscriptionChange,
};
