import OneSignal from 'onesignal-cordova-plugin';
import * as React from 'react';
import { IonButton, IonContent, IonText } from '@ionic/react';
export interface Props {
    loggingFunction: Function;
    inputFieldValue: string;
}

export const renderButtonView = (name: string, callback: Function) => {
    return (
        <div className='button-container'>
            <IonButton color="onesignal" onClick={() => { callback(); }}>{name}</IonButton>
        </div>
    );
};

class OSButtons extends React.Component<Props> {
    createInAppMessagesFields() {
        const { loggingFunction } = this.props;

        const getPausedButton = renderButtonView('Get paused', async () => {
            const paused = await OneSignal.InAppMessages.getPaused();
            loggingFunction(`Is IAM Paused: ${paused}`);
        });

        const pauseIamButton = renderButtonView('Pause IAM', () => {
            OneSignal.InAppMessages.setPaused(true);
            loggingFunction('IAM Paused: true');
        });

        const unPauseIamButton = renderButtonView('Unpause IAM', () => {
            OneSignal.InAppMessages.setPaused(false);
            loggingFunction('IAM Paused: false');
        });

        const removeTriggerButton = renderButtonView(
            'Remove trigger for key',
            () => {
                const key = this.props.inputFieldValue;
                loggingFunction('Removing trigger for key: ', key);
                OneSignal.InAppMessages.removeTrigger(key);
            },
        );

        const addTriggerButton = renderButtonView(
            'Add trigger with key "my_trigger"',
            () => {
                const triggerValue = this.props.inputFieldValue;
                loggingFunction(
                    `Adding trigger with key 'my_trigger' and value "${triggerValue}"`,
                );
                OneSignal.InAppMessages.addTrigger('my_trigger', triggerValue);
            },
        );

        const addTriggersButton = renderButtonView(
            'Add list of test triggers',
            () => {
                loggingFunction('Adding a list of test triggers');
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
                loggingFunction('Removing list of test triggers');
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
                loggingFunction(`Clearing all triggers`);
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
    }

    createLocationFields() {
        const { loggingFunction } = this.props;
        const locationShared = renderButtonView('Is Location Shared', async () => {
            const isLocationShared = await OneSignal.Location.isShared();
            loggingFunction(
                `Application has location shared active: ${isLocationShared}`,
            );
        });

        const setLocationShared = renderButtonView('Share Location', () => {
            loggingFunction('Sharing location');
            OneSignal.Location.setShared(true);
        });

        const setLocationUnshared = renderButtonView('Unshare Location', () => {
            loggingFunction('Unsharing location');
            OneSignal.Location.setShared(false);
        });

        const requestPermissionButton = renderButtonView(
            'Request Location Permission',
            () => {
                loggingFunction('Request Location permission');
                OneSignal.Location.requestPermission();
            },
        );

        return [
            locationShared,
            setLocationShared,
            setLocationUnshared,
            requestPermissionButton,
        ];
    }

    createNotificationFields() {
        const { loggingFunction } = this.props;

        const hasPermissionButton = renderButtonView(
            'Has Notification Permission',
            async () => {
                const granted = await OneSignal.Notifications.getPermissionAsync();
                loggingFunction(`Has Notification Permission: ${granted}`);
            },
        );

        const permissionNativeButton = renderButtonView(
            'Permission Native',
            async () => {
                const granted = await OneSignal.Notifications.permissionNative();
                loggingFunction(`Permission Native: ${granted}`);
            },
        );

        const canRequestPermissionButton = renderButtonView(
            'Can Request Permission',
            async () => {
                const granted = await OneSignal.Notifications.canRequestPermission();
                loggingFunction(`Can Request Permission: ${granted}`);
            },
        );

        const requestPermissionButton = renderButtonView(
            'Request Permission',
            async () => {
                loggingFunction('Requesting notification permission');
                const granted = await OneSignal.Notifications.requestPermission(false);
                loggingFunction(`Notification permission granted: ${granted}`);
            },
        );

        const clearOneSignalNotificationsButton = renderButtonView(
            'Clear OneSignal Notifications',
            () => {
                loggingFunction('Clearing all OneSignal Notifications');
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
    }

    createSessionFields() {
        const { loggingFunction } = this.props;

        const sendOutcomeButton = renderButtonView('Send Outcome With Name', () => {
            loggingFunction('Sending outcome: ', this.props.inputFieldValue);
            OneSignal.Session.addOutcome(this.props.inputFieldValue);
        });

        const sendUniqueOutcomeButton = renderButtonView(
            'Send Unique Outcome With Name',
            () => {
                loggingFunction('Sending unique outcome: ', this.props.inputFieldValue);
                OneSignal.Session.addUniqueOutcome(this.props.inputFieldValue);
            },
        );

        const sendOutcomeWithValueButton = renderButtonView(
            'Send "my_outcome" with value',
            () => {
                const value = Number(this.props.inputFieldValue);
                loggingFunction(
                    'Sending outcome of name "my_outcome" with value: ',
                    value,
                );

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
    }

    createUserFields() {
        const { loggingFunction } = this.props;

        const addEmailButton = renderButtonView('Add Email', () => {
            const email = this.props.inputFieldValue;
            loggingFunction('Attempting to add email: ', email);
            OneSignal.User.addEmail(email);
        });

        const removeEmailButton = renderButtonView('Remove Email', () => {
            loggingFunction(
                'Attempting to remove email: ',
                this.props.inputFieldValue,
            );
            OneSignal.User.removeEmail(this.props.inputFieldValue);
        });

        const loginButton = renderButtonView('Login', () => {
            loggingFunction(
                'Attempting to login a user: ',
                this.props.inputFieldValue,
            );
            OneSignal.login(this.props.inputFieldValue);
        });

        const logoutButton = renderButtonView('Logout', () => {
            loggingFunction('Attempting to logout a user: ');
            OneSignal.logout();
        });

        const sendTagWithKeyButton = renderButtonView(
            'Send tag with key my_tag',
            async () => {
                loggingFunction('Sending tag with value: ', this.props.inputFieldValue);
                OneSignal.User.addTag('my_tag', this.props.inputFieldValue);
            },
        );

        const deleteTagWithKeyButton = renderButtonView(
            'Delete Tag With Key',
            async () => {
                loggingFunction('Deleting tag with key: ', this.props.inputFieldValue);
                OneSignal.User.removeTag(this.props.inputFieldValue);
            },
        );

        const addTagsButton = renderButtonView('Add list of tags', () => {
            loggingFunction('Adding list of tags');
            OneSignal.User.addTags({ my_tag1: 'my_value', my_tag2: 'my_value2' });
        });

        const removeTagsButton = renderButtonView('Remove list of tags', () => {
            loggingFunction('Removing list of tags');
            OneSignal.User.removeTags(['my_tag1', 'my_tag2']);
        });

        const getTagsButton = renderButtonView('Get tags', async () => {
            const tags = await OneSignal.User.getTags();
            loggingFunction('Tags:', tags);
        });

        const setLanguageButton = renderButtonView('Set Language', () => {
            loggingFunction(
                'Attempting to set language: ',
                this.props.inputFieldValue,
            );
            OneSignal.User.setLanguage(this.props.inputFieldValue);
        });

        const addSmsButton = renderButtonView('Add SMS Number', () => {
            loggingFunction(
                'Attempting to add SMS number: ',
                this.props.inputFieldValue,
            );
            OneSignal.User.addSms(this.props.inputFieldValue);
        });

        const removeSmsButton = renderButtonView('Remove SMS Number', () => {
            loggingFunction(
                'Attempting to remove SMS number: ',
                this.props.inputFieldValue,
            );
            OneSignal.User.removeSms(this.props.inputFieldValue);
        });

        const addAliasButton = renderButtonView('Add my_alias with value', () => {
            loggingFunction(
                'Adding my_alias alias with value: ',
                this.props.inputFieldValue,
            );
            OneSignal.User.addAlias('my_alias', this.props.inputFieldValue);
        });

        const removeAliasButton = renderButtonView('Remove my_alias', () => {
            loggingFunction('Removing my_alias');
            OneSignal.User.removeAlias('my_alias');
        });

        const addAliasesButton = renderButtonView(
            'Add list of test aliases',
            () => {
                loggingFunction('Adding a list of test aliases ');
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
                loggingFunction('Removing list of test aliases');
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
                loggingFunction('OneSignal Id: ', onesignalId);
            },
        );

        const getExternalIdButton = renderButtonView(
            'Get External Id',
            async () => {
                const externalId = await OneSignal.User.getExternalId();
                loggingFunction('External Id:', externalId);
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
    }

    createPushSubscriptionFields() {
        const { loggingFunction } = this.props;

        const getPushSubscriptionIdButton = renderButtonView(
            'Get Push Subscription Id',
            async () => {
                const id = await OneSignal.User.pushSubscription.getIdAsync();
                loggingFunction('Push Subscription Id: ', id);
            },
        );

        const getPushSubscriptionTokenButton = renderButtonView(
            'Get Push Subscription Token',
            async () => {
                const token = await OneSignal.User.pushSubscription.getTokenAsync();
                loggingFunction('Push Subscription Token: ', token);
            },
        );

        const getOptedInButton = renderButtonView('Is Opted In', async () => {
            const optedIn = await OneSignal.User.pushSubscription.getOptedInAsync();
            loggingFunction('Subscribed to push notifications: ', optedIn);
        });

        const optInButton = renderButtonView('Opt In', () => {
            loggingFunction('Subscribing to push notifications');
            OneSignal.User.pushSubscription.optIn();
        });

        const optOutButton = renderButtonView('Opt Out', () => {
            loggingFunction('Unsubscribing from push notifications');
            OneSignal.User.pushSubscription.optOut();
        });

        return [
            getPushSubscriptionIdButton,
            getPushSubscriptionTokenButton,
            getOptedInButton,
            optInButton,
            optOutButton,
        ];
    }

    createLiveActivitiesFields() {
        const { loggingFunction } = this.props;

        const startDefaultLiveActivityButton = renderButtonView(
            'Start Default',
            async () => {
                const activityId = this.props.inputFieldValue;
                loggingFunction('Start Default Live Activity: ', activityId);
                await OneSignal.LiveActivities.startDefault(
                    activityId,
                    { title: 'Welcome!' },
                    {
                        message: {en: 'Hello World!'},
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
                const activityId = this.props.inputFieldValue;
                loggingFunction('Enter Live Activity: ', activityId);
                await OneSignal.LiveActivities.enter(activityId, "FAKE_TOKEN");
            },
        );

        const getExitLiveActivityButton = renderButtonView(
            'Exit Live Activity',
            async () => {
                const activityId = this.props.inputFieldValue;
                loggingFunction('Exit Live Activity: ', activityId);
                await OneSignal.LiveActivities.exit(activityId);
            }
        );

        const getSetupPushToStartButton = renderButtonView(
            'Setup Push To Start',
            () => {
                const activityType = this.props.inputFieldValue;
                loggingFunction('Setting up push to start: ', activityType);
                OneSignal.LiveActivities.setPushToStartToken(activityType, "FAKE_TOKEN");
            }
        );

        const getRemovePushToStartButton = renderButtonView(
            'Remove Push To Start',
            () => {
                const activityType = this.props.inputFieldValue;
                loggingFunction('Remove push to start: ', activityType);
                OneSignal.LiveActivities.removePushToStartToken(activityType);
            }
        );

        return [
            startDefaultLiveActivityButton,
            getEnterLiveActivityButton,
            getExitLiveActivityButton,
            getSetupPushToStartButton,
            getRemovePushToStartButton,
        ];
    }

    createPrivacyConsentFields() {
        const { loggingFunction } = this.props;

        const setPrivacyConsentGivenTrueButton = renderButtonView(
            'Set Privacy Consent to true',
            async () => {
                await OneSignal.setConsentGiven(true);
                loggingFunction('Privacy Consent set to true');
            },
        );

        const setPrivacyConsentGivenFalseButton = renderButtonView(
            'Set Privacy Consent to false',
            async () => {
                await OneSignal.setConsentGiven(false);
                loggingFunction('Privacy Consent set to false');
            },
        );

        const setPrivacyConsentRequiredTrueButton = renderButtonView(
            'Set Requires Privacy Consent to true',
            async () => {
                await OneSignal.setConsentRequired(true);
                loggingFunction('Requires Privacy Consent set to true');
            },
        );

        const setPrivacyConsentRequiredFalseButton = renderButtonView(
            'Set Requires Privacy Consent to false',
            async () => {
                await OneSignal.setConsentRequired(false);
                loggingFunction('Requires Privacy Consent set to false');
            },
        );

        return [
            setPrivacyConsentGivenTrueButton,
            setPrivacyConsentGivenFalseButton,
            setPrivacyConsentRequiredTrueButton,
            setPrivacyConsentRequiredFalseButton,
        ];
    }

    render() {
        return (
            <IonContent>
                <IonText className='ion-text-center'><h5>In-App Messages</h5></IonText>
                <div>{this.createInAppMessagesFields()}</div>
                <IonText className='ion-text-center'><h5>Location</h5></IonText>
                <div>{this.createLocationFields()}</div>
                <IonText className='ion-text-center'><h5>Notifications</h5></IonText>
                <div>{this.createNotificationFields()}</div>
                <IonText className='ion-text-center'><h5>Session</h5></IonText>
                <div>{this.createSessionFields()}</div>
                <IonText className='ion-text-center'><h5>User</h5></IonText>
                <div>{this.createUserFields()}</div>
                <IonText className='ion-text-center'><h5>Push Subscription</h5></IonText>
                <div>{this.createPushSubscriptionFields()}</div>
                <IonText className='ion-text-center'><h5>Live Activities</h5></IonText>
                <div>{this.createLiveActivitiesFields()}</div>
                <IonText className='ion-text-center'><h5>Privacy Consent</h5></IonText>
                <div>{this.createPrivacyConsentFields()}</div>
            </IonContent>
        );
    }
}

export default OSButtons;
