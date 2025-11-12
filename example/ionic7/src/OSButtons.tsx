import OneSignal from 'onesignal-cordova-plugin';
import * as React from 'react';

export const renderButtonView = (name: string, callback: Function) => {
  return (
    <div className="button-container">
      <button
        className="onesignal"
        onClick={() => {
          callback();
        }}
      >
        {name}
      </button>
    </div>
  );
};

const OSButtons: React.FC = () => {
  const createInAppMessagesFields = () => {
    const getPausedButton = renderButtonView('Get paused', async () => {
      const paused = await OneSignal.InAppMessages.getPaused();
      console.log(`Is IAM Paused: ${paused}`);
    });

    const pauseIamButton = renderButtonView('Pause IAM', () => {
      OneSignal.InAppMessages.setPaused(true);
      console.log('IAM Paused: true');
    });

    const unPauseIamButton = renderButtonView('Unpause IAM', () => {
      OneSignal.InAppMessages.setPaused(false);
      console.log('IAM Paused: false');
    });

    const removeTriggerButton = renderButtonView(
      'Remove trigger for key',
      () => {
        const key = 'test_key';
        console.log('Removing trigger for key: ', key);
        OneSignal.InAppMessages.removeTrigger(key);
      },
    );

    const addTriggerButton = renderButtonView(
      'Add trigger with key "my_trigger"',
      () => {
        const triggerValue = 'test_value';
        console.log(
          `Adding trigger with key 'my_trigger' and value "${triggerValue}"`,
        );
        OneSignal.InAppMessages.addTrigger('my_trigger', triggerValue);
      },
    );

    const addTriggersButton = renderButtonView(
      'Add list of test triggers',
      () => {
        console.log('Adding a list of test triggers');
        OneSignal.InAppMessages.addTriggers({
          my_trigger_1: 'my_trigger_1_value',
          my_trigger_2: 'my_trigger_2_value',
          my_trigger_3: 'my_trigger_3_value',
        });
      },
    );

    const removeTriggersButton = renderButtonView(
      'Remove list of test triggers',
      () => {
        console.log('Removing list of test triggers');
        OneSignal.InAppMessages.removeTriggers([
          'my_trigger_1',
          'my_trigger_2',
          'my_trigger_3',
        ]);
      },
    );

    const clearAllTriggersButton = renderButtonView(
      'Clear all triggers',
      () => {
        console.log(`Clearing all triggers`);
        OneSignal.InAppMessages.clearTriggers();
      },
    );

    return [
      getPausedButton,
      pauseIamButton,
      unPauseIamButton,
      addTriggerButton,
      removeTriggerButton,
      addTriggersButton,
      removeTriggersButton,
      clearAllTriggersButton,
    ];
  };

  const createLocationFields = () => {
    const locationShared = renderButtonView('Is Location Shared', async () => {
      const isLocationShared = await OneSignal.Location.isShared();
      console.log(
        `Application has location shared active: ${isLocationShared}`,
      );
    });

    const setLocationShared = renderButtonView('Share Location', () => {
      console.log('Sharing location');
      OneSignal.Location.setShared(true);
    });

    const setLocationUnshared = renderButtonView('Unshare Location', () => {
      console.log('Unsharing location');
      OneSignal.Location.setShared(false);
    });

    const requestPermissionButton = renderButtonView(
      'Request Location Permission',
      () => {
        console.log('Request Location permission');
        OneSignal.Location.requestPermission();
      },
    );

    return [
      locationShared,
      setLocationShared,
      setLocationUnshared,
      requestPermissionButton,
    ];
  };

  const createNotificationFields = () => {
    const hasPermissionButton = renderButtonView(
      'Has Notification Permission',
      async () => {
        const granted = await OneSignal.Notifications.getPermissionAsync();
        console.log(`Has Notification Permission: ${granted}`);
      },
    );

    const permissionNativeButton = renderButtonView(
      'Permission Native',
      async () => {
        const granted = await OneSignal.Notifications.permissionNative();
        console.log(`Permission Native: ${granted}`);
      },
    );

    const canRequestPermissionButton = renderButtonView(
      'Can Request Permission',
      async () => {
        const granted = await OneSignal.Notifications.canRequestPermission();
        console.log(`Can Request Permission: ${granted}`);
      },
    );

    const requestPermissionButton = renderButtonView(
      'Request Permission',
      async () => {
        console.log('Requesting notification permission');
        const granted = await OneSignal.Notifications.requestPermission(false);
        console.log(`Notification permission granted: ${granted}`);
      },
    );

    const clearOneSignalNotificationsButton = renderButtonView(
      'Clear OneSignal Notifications',
      () => {
        console.log('Clearing all OneSignal Notifications');
        OneSignal.Notifications.clearAll();
      },
    );

    return [
      hasPermissionButton,
      permissionNativeButton,
      canRequestPermissionButton,
      requestPermissionButton,
      clearOneSignalNotificationsButton,
    ];
  };

  const createSessionFields = () => {
    const sendOutcomeButton = renderButtonView('Send Outcome With Name', () => {
      console.log('Sending outcome: ', 'test_value');
      OneSignal.Session.addOutcome('test_value');
    });

    const sendUniqueOutcomeButton = renderButtonView(
      'Send Unique Outcome With Name',
      () => {
        console.log('Sending unique outcome: ', 'test_value');
        OneSignal.Session.addUniqueOutcome('test_value');
      },
    );

    const sendOutcomeWithValueButton = renderButtonView(
      'Send "my_outcome" with value',
      () => {
        const value = Number('test_value');
        console.log('Sending outcome of name "my_outcome" with value: ', value);

        if (Number.isNaN(value)) {
          console.error('Outcome with value should be a number');
          return;
        }
        OneSignal.Session.addOutcomeWithValue('my_outcome', value);
      },
    );

    return [
      sendOutcomeButton,
      sendUniqueOutcomeButton,
      sendOutcomeWithValueButton,
    ];
  };

  const createUserFields = () => {
    const addEmailButton = renderButtonView('Add Email', () => {
      const email = 'test_value';
      console.log('Attempting to add email: ', email);
      OneSignal.User.addEmail(email);
    });

    const removeEmailButton = renderButtonView('Remove Email', () => {
      console.log('Attempting to remove email: ', 'test_value');
      OneSignal.User.removeEmail('test_value');
    });

    const loginButton = renderButtonView('Login', () => {
      console.log('Attempting to login a user: ', 'test_value');
      OneSignal.login('test_value');
    });

    const logoutButton = renderButtonView('Logout', () => {
      console.log('Attempting to logout a user: ');
      OneSignal.logout();
    });

    const sendTagWithKeyButton = renderButtonView(
      'Send tag with key my_tag',
      async () => {
        console.log('Sending tag with value: ', 'test_value');
        OneSignal.User.addTag('my_tag', 'test_value');
      },
    );

    const deleteTagWithKeyButton = renderButtonView(
      'Delete Tag With Key',
      async () => {
        console.log('Deleting tag with key: ', 'test_value');
        OneSignal.User.removeTag('test_value');
      },
    );

    const addTagsButton = renderButtonView('Add list of tags', () => {
      console.log('Adding list of tags');
      OneSignal.User.addTags({ my_tag1: 'my_value', my_tag2: 'my_value2' });
    });

    const removeTagsButton = renderButtonView('Remove list of tags', () => {
      console.log('Removing list of tags');
      OneSignal.User.removeTags(['my_tag1', 'my_tag2']);
    });

    const getTagsButton = renderButtonView('Get tags', async () => {
      const tags = await OneSignal.User.getTags();
      console.log('Tags:', tags);
    });

    const setLanguageButton = renderButtonView('Set Language', () => {
      console.log('Attempting to set language: ', 'test_value');
      OneSignal.User.setLanguage('test_value');
    });

    const addSmsButton = renderButtonView('Add SMS Number', () => {
      console.log('Attempting to add SMS number: ', 'test_value');
      OneSignal.User.addSms('test_value');
    });

    const removeSmsButton = renderButtonView('Remove SMS Number', () => {
      console.log('Attempting to remove SMS number: ', 'test_value');
      OneSignal.User.removeSms('test_value');
    });

    const addAliasButton = renderButtonView('Add my_alias with value', () => {
      console.log('Adding my_alias alias with value: ', 'test_value');
      OneSignal.User.addAlias('my_alias', 'test_value');
    });

    const removeAliasButton = renderButtonView('Remove my_alias', () => {
      console.log('Removing my_alias');
      OneSignal.User.removeAlias('my_alias');
    });

    const addAliasesButton = renderButtonView(
      'Add list of test aliases',
      () => {
        console.log('Adding a list of test aliases ');
        OneSignal.User.addAliases({
          my_alias_1: 'my_alias_1_id',
          my_alias_2: 'my_alias_2_id',
          my_alias_3: 'my_alias_3_id',
        });
      },
    );

    const removeAliasesButton = renderButtonView(
      'Remove list of test aliases',
      () => {
        console.log('Removing list of test aliases');
        OneSignal.User.removeAliases([
          'my_alias_1',
          'my_alias_2',
          'my_alias_3',
        ]);
      },
    );

    const getOnesignalIdButton = renderButtonView(
      'Get OneSignal Id',
      async () => {
        const onesignalId = await OneSignal.User.getOnesignalId();
        console.log('OneSignal Id: ', onesignalId);
      },
    );

    const getExternalIdButton = renderButtonView(
      'Get External Id',
      async () => {
        const externalId = await OneSignal.User.getExternalId();
        console.log('External Id:', externalId);
      },
    );

    return [
      loginButton,
      logoutButton,
      addEmailButton,
      removeEmailButton,
      sendTagWithKeyButton,
      deleteTagWithKeyButton,
      addTagsButton,
      removeTagsButton,
      getTagsButton,
      setLanguageButton,
      addSmsButton,
      removeSmsButton,
      addAliasButton,
      removeAliasButton,
      addAliasesButton,
      removeAliasesButton,
      getOnesignalIdButton,
      getExternalIdButton,
    ];
  };

  const createPushSubscriptionFields = () => {
    const getPushSubscriptionIdButton = renderButtonView(
      'Get Push Subscription Id',
      async () => {
        const id = await OneSignal.User.pushSubscription.getIdAsync();
        console.log('Push Subscription Id: ', id);
      },
    );

    const getPushSubscriptionTokenButton = renderButtonView(
      'Get Push Subscription Token',
      async () => {
        const token = await OneSignal.User.pushSubscription.getTokenAsync();
        console.log('Push Subscription Token: ', token);
      },
    );

    const getOptedInButton = renderButtonView('Is Opted In', async () => {
      const optedIn = await OneSignal.User.pushSubscription.getOptedInAsync();
      console.log('Subscribed to push notifications: ', optedIn);
    });

    const optInButton = renderButtonView('Opt In', () => {
      console.log('Subscribing to push notifications');
      OneSignal.User.pushSubscription.optIn();
    });

    const optOutButton = renderButtonView('Opt Out', () => {
      console.log('Unsubscribing from push notifications');
      OneSignal.User.pushSubscription.optOut();
    });

    return [
      getPushSubscriptionIdButton,
      getPushSubscriptionTokenButton,
      getOptedInButton,
      optInButton,
      optOutButton,
    ];
  };

  const createLiveActivitiesFields = () => {
    const startDefaultLiveActivityButton = renderButtonView(
      'Start Default',
      async () => {
        const activityId = 'test_value';
        console.log('Start Default Live Activity: ', activityId);
        await OneSignal.LiveActivities.startDefault(
          activityId,
          { title: 'Welcome!' },
          {
            message: { en: 'Hello World!' },
            intValue: 3,
            doubleValue: 3.14,
            boolValue: true,
          },
        );
      },
    );

    const getEnterLiveActivityButton = renderButtonView(
      'Enter Live Activity',
      async () => {
        const activityId = 'test_value';
        console.log('Enter Live Activity: ', activityId);
        await OneSignal.LiveActivities.enter(activityId, 'FAKE_TOKEN');
      },
    );

    const getExitLiveActivityButton = renderButtonView(
      'Exit Live Activity',
      async () => {
        const activityId = 'test_value';
        console.log('Exit Live Activity: ', activityId);
        await OneSignal.LiveActivities.exit(activityId);
      },
    );

    const getSetupPushToStartButton = renderButtonView(
      'Setup Push To Start',
      () => {
        const activityType = 'test_value';
        console.log('Setting up push to start: ', activityType);
        OneSignal.LiveActivities.setPushToStartToken(
          activityType,
          'FAKE_TOKEN',
        );
      },
    );

    const getRemovePushToStartButton = renderButtonView(
      'Remove Push To Start',
      () => {
        const activityType = 'test_value';
        console.log('Remove push to start: ', activityType);
        OneSignal.LiveActivities.removePushToStartToken(activityType);
      },
    );

    return [
      startDefaultLiveActivityButton,
      getEnterLiveActivityButton,
      getExitLiveActivityButton,
      getSetupPushToStartButton,
      getRemovePushToStartButton,
    ];
  };

  const createPrivacyConsentFields = () => {
    const setPrivacyConsentGivenTrueButton = renderButtonView(
      'Set Privacy Consent to true',
      async () => {
        await OneSignal.setConsentGiven(true);
        console.log('Privacy Consent set to true');
      },
    );

    const setPrivacyConsentGivenFalseButton = renderButtonView(
      'Set Privacy Consent to false',
      async () => {
        await OneSignal.setConsentGiven(false);
        console.log('Privacy Consent set to false');
      },
    );

    const setPrivacyConsentRequiredTrueButton = renderButtonView(
      'Set Requires Privacy Consent to true',
      async () => {
        await OneSignal.setConsentRequired(true);
        console.log('Requires Privacy Consent set to true');
      },
    );

    const setPrivacyConsentRequiredFalseButton = renderButtonView(
      'Set Requires Privacy Consent to false',
      async () => {
        await OneSignal.setConsentRequired(false);
        console.log('Requires Privacy Consent set to false');
      },
    );

    return [
      setPrivacyConsentGivenTrueButton,
      setPrivacyConsentGivenFalseButton,
      setPrivacyConsentRequiredTrueButton,
      setPrivacyConsentRequiredFalseButton,
    ];
  };

  return (
    <div>
      <div className="ion-text-center">
        <h5>In-App Messages</h5>
      </div>
      <div>{createInAppMessagesFields()}</div>
      <div className="ion-text-center">
        <h5>Location</h5>
      </div>
      <div>{createLocationFields()}</div>
      <div className="ion-text-center">
        <h5>Notifications</h5>
      </div>
      <div>{createNotificationFields()}</div>
      <div className="ion-text-center">
        <h5>Session</h5>
      </div>
      <div>{createSessionFields()}</div>
      <div className="ion-text-center">
        <h5>User</h5>
      </div>
      <div>{createUserFields()}</div>
      <div className="ion-text-center">
        <h5>Push Subscription</h5>
      </div>
      <div>{createPushSubscriptionFields()}</div>
      <div className="ion-text-center">
        <h5>Live Activities</h5>
      </div>
      <div>{createLiveActivitiesFields()}</div>
      <div className="ion-text-center">
        <h5>Privacy Consent</h5>
      </div>
      <div>{createPrivacyConsentFields()}</div>
    </div>
  );
};

export default OSButtons;
