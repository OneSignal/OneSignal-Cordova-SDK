interface Window {
  plugins?: {
    OneSignal?: {
      setAppId: (appId: string) => void;
      setNotificationWillShowInForegroundHandler(
        handler: (event: any) => void
      ): void;
      setNotificationOpenedHandler: (
        handler: (openedEvent: any) => void
      ) => void;
      setInAppMessageClickHandler(handler: (action: any) => void): void;
      setInAppMessageLifecycleHandler: (handlerObject: any) => void;
      getDeviceState: (handler: (response: any) => void) => void;
      setLanguage: (
        language: string,
        onSuccess?: (success: object) => void,
        onFailure?: (failure: object) => void
      ) => void;
      addSubscriptionObserver: (observer: (event: any) => void) => void;
      addEmailSubscriptionObserver: (observer: (event: any) => void) => void;
      addSMSSubscriptionObserver: (observer: (event: any) => void) => void;
      addPermissionObserver: (observer: (event: any) => void) => void;
      getTags: (handler: (tags: object) => void) => void;
      sendTag: (key: string, value: string) => void;
      deleteTags: (keys: string[]) => void;
      registerForProvisionalAuthorization: (
        handler?: (response: { accepted: boolean }) => void
      ) => void;
      promptForPushNotificationsWithUserResponse: (
        fallbackToSettingsOrHandler?: boolean | ((response: boolean) => void),
        handler?: (response: boolean) => void
      ) => void;
      clearOneSignalNotifications: () => void;
      unsubscribeWhenNotificationsAreDisabled: (unsubscribe: boolean) => void;
      removeNotification: (id: number) => void;
      removeGroupedNotifications: (id: string) => void;
      disablePush: (disable: boolean) => void;
      postNotification: (
        notificationObject: object,
        onSuccess?: (success: object) => void,
        onFailure?: (failure: object) => void
      ) => void;
      setLaunchURLsInApp: (isEnabled: boolean) => void;
      setLogLevel: (nsLogLevel: any, visualLogLevel: any) => void;
      userProvidedPrivacyConsent: (
        handler: (response: boolean) => void
      ) => void;
      requiresUserPrivacyConsent: (
        handler: (response: boolean | { value: boolean }) => void
      ) => void;
      setRequiresUserPrivacyConsent: (required: boolean) => void;
      provideUserConsent: (granted: boolean) => void;
      setEmail: (
        email: string,
        authCode?: string,
        onSuccess?: Function,
        onFailure?: Function
      ) => void;
      logoutEmail: (onSuccess?: Function, onFailure?: Function) => void;
      setSMSNumber: (
        smsNumber: string,
        authCode?: string,
        onSuccess?: Function,
        onFailure?: Function
      ) => void;
      logoutSMSNumber: (onSuccess?: Function, onFailure?: Function) => void;
      setExternalUserId: (
        externalId: string | null,
        handlerOrAuth?: ((results: object) => void) | string,
        handler?: (results: object) => void
      ) => void;
      removeExternalUserId: (handler?: (results: object) => void) => void;
      addTriggers: (triggers: {
        [key: string]: string | number | boolean;
      }) => void;
      addTrigger: (key: string, value: string | number | boolean) => void;
      removeTriggerForKey: (key: string) => void;
      removeTriggersForKeys: (keys: string[]) => void;
      getTriggerValueForKey: (
        key: string,
        handler: (value: string) => void
      ) => void;
      pauseInAppMessages: (pause: boolean) => void;
      sendOutcome: (name: string, handler?: (event: any) => void) => void;
      sendUniqueOutcome: (name: string, handler?: (event: any) => void) => void;
      sendOutcomeWithValue: (
        name: string,
        value: string | number,
        handler?: (event: any) => void
      ) => void;
      promptLocation: () => void;
      setLocationShared: (shared: boolean) => void;
      isLocationShared: (
        handler: (response: boolean | { value: boolean }) => void
      ) => void;
    };
  };
}
