# Cordova v5.0.0 Migration Guide

#### ⚠️ Migration Advisory for current OneSignal customers

Our new [user-centric APIs and v5.x.x SDKs](https://onesignal.com/blog/unify-your-users-across-channels-and-devices/) offer an improved user and data management experience. However, they may not be at 1:1 feature parity with our previous versions yet.

If you are migrating an existing app, we suggest using iOS and Android’s Phased Rollout capabilities to ensure that there are no unexpected issues or edge cases. Here is the documentation for each:

- [iOS Phased Rollout](https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases/)
- [Google Play Staged Rollouts](https://support.google.com/googleplay/android-developer/answer/6346149?hl=en)

If you run into any challenges or have concerns, please contact our support team at support@onesignal.com

# Intro

In this release, we are making a significant shift from a device-centered model to a user-centered model. A user-centered model allows for more powerful omni-channel integrations within the OneSignal platform.

To facilitate this change, the `externalId` approach for identifying users is being replaced by the `login` and `logout` methods. In addition, the SDK now makes use of namespaces such as `User`, `Notifications`, and `InAppMessages` to better separate code.

This migration guide will walk you through the Cordova SDK changes as a result of this shift.

# Overview

Under the user-centered model, the concept of a "player" is being replaced with three new concepts: **users**, **subscriptions**, and **aliases**.

## Users

A user is a new concept which is meant to represent your end-user. A user has zero or more subscriptions and can be uniquely identified by one or more aliases. In addition to subscriptions, a user can have **data tags** which allows for user attribution.

## Subscription

A subscription refers to the method in which an end-user can receive various communications sent by OneSignal, including push notifications, SMS, and email.  In previous versions of the OneSignal platform, each of these channels was referred to as a “player”. A subscription is in fact identical to the legacy “player” concept.  Each subscription has a **subscription_id** (previously, player_id) to uniquely identify that communication channel.

## Aliases

Aliases are a concept evolved from [external user ids](https://documentation.onesignal.com/docs/external-user-ids) which allows the unique identification of a user within a OneSignal application.  Aliases are a key-value pair made up of an **alias label** (the key) and an **alias id** (the value). The **alias label** can be thought of as a consistent keyword across all users, while the **alias id** is a value specific to each user for that particular label. The combined **alias label** and **alias id** provide uniqueness to successfully identify a user. 

OneSignal uses a built-in **alias label** called `external_id` which supports existing use of [external user ids](https://documentation.onesignal.com/docs/external-user-ids). `external_id` is also used as the identification method when a user identifies themselves to the OneSignal SDK via `OneSignal.login`.  Multiple aliases can be created for each user to allow for your own application's unique identifier as well as identifiers from other integrated applications.

# Migration Guide (v3 to v5)

The Cordova SDK accesses the OneSignal native iOS and Android SDKs. For this update, all SDK versions are aligning across OneSignal’s suite of client SDKs. As such, the Cordova SDK is making the jump from `v3` to `v5`. See existing install instructions for [Cordova](https://documentation.onesignal.com/docs/cordova-sdk-setup) and [Ionic & Capacitor](https://documentation.onesignal.com/docs/ionic-sdk-setup) for more information.

## iOS
### Notification Service Extension Changes

In your Project Root > ios > Podfile, update the notification service extension:

```
    // 3.x.x
    target 'OneSignalNotificationServiceExtension' do
      pod 'OneSignalXCFramework', '>= 3.0', '< 4.0'
    end

    // 5.x.x
    target 'OneSignalNotificationServiceExtension' do
      pod 'OneSignalXCFramework', '>= 5.0', '< 6.0'
    end
```

Close Xcode. While still in the ios directory, run `pod install --repo-update`.

# API Changes
**Note: If you are using Cordova, please prepend all calls to `OneSignal` with `window.plugins.OneSignal`.**

## Namespaces

The OneSignal SDK has been updated to be more modular in nature. The SDK has been split into namespaces, and functionality previously in the static `OneSignal` class has been moved to the appropriate namespace. The namespaces and how to access them in code are as follows:

| **Namespace** | **Access Pattern**            |
| ------------- | ----------------------------- |
| Debug         | `OneSignal.Debug`         |
| InAppMessages | `OneSignal.InAppMessages` |
| LiveActivities| `OneSignal.LiveActivities`|
| Location      | `OneSignal.Location`      |
| Notifications | `OneSignal.Notifications` |
| Session       | `OneSignal.Session`       |
| User          | `OneSignal.User`          |

## Initialization

Initialization of the OneSignal SDK is now completed through the `initialize` method. A typical initialization now looks similar to below.

Navigate to your index.ts file, or the first Javascript file that loads with your app.

Replace the following:

**Cordova/Ionic**
```typescript
    OneSignal.setAppId("YOUR_ONESIGNAL_APP_ID");
```

To the match the new initialization:

**Cordova/Ionic**
```typescript
    OneSignal.initialize("YOUR_ONESIGNAL_APP_ID");
```

**for iOS:** Remove any usages of `setLaunchURLsInApp` as the method and functionality has been removed.

If your integration is **not** user-centric, there is no additional startup code required. A device-scoped user *(please see definition of “**device-scoped user**” below in Glossary)* is automatically created as part of the push subscription creation, both of which are only accessible from the current device or through the OneSignal dashboard.

If your integration is user-centric, or you want the ability to identify the user beyond the current device, the `login` method should be called to identify the user:

**Cordova/Ionic**
```typescript
    OneSignal.login("USER_EXTERNAL_ID");
```

The `login` method will associate the device’s push subscription to the user that can be identified via the alias `externalId=USER_EXTERNAL_ID`. If that user doesn’t already exist, it will be created. If the user does already exist, the user will be updated to own the device’s push subscription. Note that the push subscription for the device will always be transferred to the newly logged in user, as that user is the current owner of that push subscription.

Once (or if) the user is no longer identifiable in your app (i.e. they logged out), the `logout` method should be called:

**Cordova/Ionic**
```typescript
    OneSignal.logout();
```

Logging out has the affect of reverting to a device-scoped user, which is the new owner of the device’s push subscription.

## Subscriptions

In previous versions of the SDK, a “player” could have up to one email address and up to one phone number for SMS. In the user-centered model, a user can own the current device’s **Push Subscription** along with the ability to have **zero or more** email subscriptions and **zero or more** SMS subscriptions. Note: If a new user logs in via the `login` method, the previous user will no longer longer own that push subscription.

### **Push Subscription**
The current device’s push subscription can be retrieved via:

**Cordova/Ionic**
```typescript
    let id = OneSignal.User.pushSubscription.id;
    let token = OneSignal.User.pushSubscription.token;
    let optedIn = OneSignal.User.pushSubscription.optedIn;
```

### **Opting In and Out of Push Notifications**

To receive push notifications on the device, call the push subscription’s `optIn()` method. If needed, this method will prompt the user for push notifications permission.

Note: For greater control over prompting for push notification permission, you may use the `OneSignal.Notifications.requestPermission` method detailed below in the API Reference.

**Cordova/Ionic**
```typescript
    OneSignal.User.pushSubscription.optIn();
```

If at any point you want the user to stop receiving push notifications on the current device (regardless of system-level permission status), you can use the push subscription to opt out:

**Cordova/Ionic**
```typescript
    OneSignal.User.pushSubscription.optOut();
```

To resume receiving of push notifications (driving the native permission prompt if permissions are not available), you can opt back in with the `optIn` method from above.

### **Email/SMS Subscriptions**

Email and/or SMS subscriptions can be added or removed via the following methods. The remove methods will result in a no-op if the specified email or SMS number does not exist on the user within the SDK, and no request will be made.

**Cordova/Ionic**
```typescript
    // Add email subscription
    OneSignal.User.addEmail("customer@company.com");
    // Remove previously added email subscription
    OneSignal.User.removeEmail("customer@company.com");
    
    // Add SMS subscription
    OneSignal.User.addSms("+15558675309");
    // Remove previously added SMS subscription
    OneSignal.User.removeSms("+15558675309");
```

# API Reference

Below is a comprehensive reference to the `5.0.0` OneSignal Cordova SDK.

## OneSignal

The SDK is still accessible via a `OneSignal` static class. It provides access to higher level functionality and is a gateway to each subspace of the SDK.

| **Cordova/Ionic**                                                                                          | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OneSignal.initialize("YOUR_ONESIGNAL_APP_ID");`                    | *Initializes the OneSignal SDK. This should be called during startup of the application.*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `OneSignal.login("USER_EXTERNAL_ID");`                                                              | *Login to OneSignal under the user identified by the [externalId] provided. The act of logging a user into the OneSignal SDK will switch the [user] context to that specific user.<br><br> - If the [externalId] exists, the user will be retrieved and the context will be set from that user information. If operations have already been performed under a device-scoped user, they ***will not*** be applied to the now logged in user (they will be lost).<br> - If the [externalId] does not exist the user, the user will be created and the context set from the current local state. If operations have already been performed under a device-scoped user, those operations ***will*** be applied to the newly created user.<br><br>***Push Notifications and In App Messaging***<br>Logging in a new user will automatically transfer the push notification and in app messaging subscription from the current user (if there is one) to the newly logged in user. This is because both push notifications and in- app messages are owned by the device.* |
| `OneSignal.logout();`                                                                                     | *Logout the user previously logged in via [login]. The [user] property now references a new device-scoped user. A device-scoped user has no user identity that can later be retrieved, except through this device as long as the app remains installed and the app data is not cleared.*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `OneSignal.setConsentGiven(granted: boolean);`                 | *Indicates whether privacy consent has been granted. This field is only relevant when the application has opted into data privacy protections. See [setConsentRequired].*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `OneSignal.setConsentRequired(required: boolean);` | *Determines whether a user must consent to privacy prior to their user data being sent up to OneSignal.  This should be set to `true` prior to the invocation of `initialize` to ensure compliance.*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

## Live Activities Namespace

Live Activities are a type of interactive push notification. Apple introduced them in October 2022 to enable iOS apps to provide real-time updates to their users that are visible from the lock screen and the dynamic island.

Please refer to OneSignal’s guide on [Live Activities](https://documentation.onesignal.com/docs/live-activities), the [Live Activities Quickstart](https://documentation.onesignal.com/docs/live-activities-quickstart) tutorial, and the [existing SDK reference](https://documentation.onesignal.com/docs/live-activities-sdk-methods) on Live Activities. 

| **Cordova/Ionic**                                                                                          | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------- | ----------------------------------- |
| `OneSignal.LiveActivities.enter("ACTIVITY_ID", "TOKEN");`<br><br>***See below for usage of callbacks***|*Entering a Live Activity associates an `activityId` with a live activity temporary push `token` on OneSignal's server. The activityId is then used with the OneSignal REST API to update one or multiple Live Activities at one time.*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `OneSignal.LiveActivities.exit("ACTIVITY_ID");`<br><br>***See below for usage of callbacks***  |*Exiting a Live activity deletes the association between a customer defined `activityId` with a Live Activity temporary push `token` on OneSignal's server.*                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

**Cordova/Ionic**
```typescript
    // Enter a Live Activity
    OneSignal.LiveActivities.enter("ACTIVITY_ID", "TOKEN", (results) => {
        console.log("Results of entering live activity");
        console.log(results);
    });
    
    // Exit a Live Activity
    OneSignal.LiveActivities.exit("ACTIVITY_ID", (results) => {
        console.log("Results of exiting live activity");
        console.log(results);
    });
```

## User Namespace

The User name space is accessible via `OneSignal.User` and provides access to user-scoped functionality.


| **Cordova/Ionic**                                                                                       | **Description**                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OneSignal.User.setLanguage("en");`                                                                  | *Set the 2-character language  for this user.*                                                                                                                                                                                                   |
| `OneSignal.User.addAlias("ALIAS_LABEL", "ALIAS_ID");`                                    | *Set an alias for the current user.  If this alias label already exists on this user, it will be overwritten with the new alias id.*                                                                                         |
| `OneSignal.User.addAliases({ALIAS_LABEL_01: "ALIAS_ID_01", ALIAS_LABEL_02: "ALIAS_ID_02"});` | *Set aliases for the current user. If any alias already exists, it will be overwritten to the new values.*                                                                                                                       |
| `OneSignal.User.removeAlias("ALIAS_LABEL");`                                                         | *Remove an alias from the current user.*                                                                                                                                                                                                 |
| `OneSignal.User.removeAliases(["ALIAS_LABEL_01", "ALIAS_LABEL_02"]);`                              | *Remove aliases from the current user.*                                                                                                                                                                                              |
| `OneSignal.User.addEmail("customer@company.com");`                                               | *Add a new email subscription to the current user.*                                                                                                                                                                                      |
| `OneSignal.User.removeEmail("customer@company.com");`                             | *Results in a no-op if the specified email does not exist on the user within the SDK, and no request will be made.*                                                               |
| `OneSignal.User.addSms("+15558675309");`                                                   | *Add a new SMS subscription to the current user.*                                                                                                                                                                                        |
| `OneSignal.User.removeSms("+15558675309");`                                 | *Results in a no-op if the specified phone number does not exist on the user within the SDK, and no request will be made..*                                                            |
| `OneSignal.User.addTag("KEY", "VALUE");`                                                | *Add a tag for the current user.  Tags are key:value pairs used as building blocks for targeting specific users and/or personalizing messages. If the tag key already exists, it will be replaced with the value provided here.*         |
| `OneSignal.User.addTags({"KEY_01": "VALUE_01", "KEY_02": "VALUE_02"});`                          | *Add multiple tags for the current user.  Tags are key:value pairs used as building blocks for targeting specific users and/or personalizing messages. If the tag key already exists, it will be replaced with the value provided here.* |
| `OneSignal.User.removeTag("KEY");`                                                                   | *Remove the data tag with the provided key from the current user.*                                                                                                                                                                       |
| `OneSignal.User.removeTags(["KEY_01", "KEY_02"]);`                                                 | *Remove multiple tags with the provided keys from the current user.*                                                                                                                                                             |
| `OneSignal.User.getTags();`                                                   | *Returns the local tags for the current user.*                                                                                                                                                                                        |
| `OneSignal.User.addEventListener("change", (event: UserChangedState) => void);` <br><br>***See below for usage***                                                   | *Add a User State callback which contains the nullable onesignalId and externalId. The listener will be fired when these values change.*                                                                                                                                                                                        |
| `await OneSignal.User.getOnesignalId();`                                                   | *Returns the OneSignal ID for the current user, which can be null if it is not yet available.*                                                                                                                                                                                        |
| `await OneSignal.User.getExternalId();`                                                   | *Returns the External ID for the current user, which can be null if not set.*                                                                                                                                                                                        |

### User State Listener

**Cordova/Ionic**
```typescript
    const listener = (event: UserChangedState) => {
        console.log("User changed: " + (event));
    };
    OneSignal.User.addEventListener("change", listener);
    // Remove the listener
    OneSignal.User.removeEventListener("change", listener);
```

## Push Subscription Namespace

The Push Subscription name space is accessible via `OneSignal.User.pushSubscription` and provides access to push subscription-scoped functionality.


| **Cordova/Ionic**                                                                                                                        | **Description**                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `let id = OneSignal.User.pushSubscription.id`                                    | **DEPRECATED**<br>use `getIdAsync()`                                                                                                                                                                                                                                                                                                                                                               |
| `let token = OneSignal.User.pushSubscription.token`                                 | **DEPRECATED**<br>use `getTokenAsync()`                                                                                                                                                                                                                                                                                                                                                                        |
| `let optedIn = OneSignal.User.pushSubscription.optedIn`                                                                               | **DEPRECATED**<br>use `getOptedInAsync()` |
| `await OneSignal.User.pushSubscription.getIdAsync()`                                    | *The readonly push subscription ID.*                                                                                                                                                                                                                                                                                                                                                               |
| `await OneSignal.User.pushSubscription.getTokenAsync()`                                 | *The readonly push token.*                                                                                                                                                                                                                                                                                                                                                                         |
| `await OneSignal.User.pushSubscription.getOptedInAsync()`                                                                               | *Gets a boolean value indicating whether the current user is opted in to push notifications. This returns `true` when the app has notifications permission and `optOut()` is **not** called. ***Note:*** Does not take into account the existence of the subscription ID and push token. This boolean may return `true` but push notifications may still not be received by the user.* |
| `OneSignal.User.pushSubscription.optIn();`                                                                                              | *Call this method to receive push notifications on the device or to resume receiving of push notifications after calling `optOut`. If needed, this method will prompt the user for push notifications permission.*                                                                                                                                                                     |
| `OneSignal.User.pushSubscription.optOut();`                                                                                             | *If at any point you want the user to stop receiving push notifications on the current device (regardless of system-level permission status), you can call this method to opt out.*                                                                                                                                                                                                              |
| `OneSignal.User.pushSubscription.addEventListener("change", (event: PushSubscriptionChangedState) => void);`<br><br>***See below for usage*** | *Adds the listener to run when the push subscription changes.*                                                                                                                                 |
| `OneSignal.User.pushSubscription.removeEventListener("change", (event: PushSubscriptionChangedState) => void);`<br><br>***See below for usage***                             | *Remove a push subscription listener that has been previously added.*                                                                                                                                                                                                                                                                                                                      |

### Push Subscription Listener

**Cordova/Ionic**
```typescript
    const listener = (event: PushSubscriptionChangedState) => {
        console.log("Push subscription changed: " + (event));
    };
    OneSignal.User.pushSubscription.addEventListener("change", listener);
    // Remove the listener
    OneSignal.User.pushSubscription.removeEventListener("change", listener);
```

## Session Namespace

The Session namespace is accessible via `OneSignal.Session` and provides access to session-scoped functionality.


| **Cordova/Ionic**                                         | **Description**                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `OneSignal.Session.addOutcome("OUTCOME_NAME");`                             | *Add an outcome with the provided name, captured against the current session.*           |
| `OneSignal.Session.addUniqueOutcome("OUTCOME_NAME");`                       | *Add a unique outcome with the provided name, captured against the current session.*     |
| `OneSignal.Session.addOutcomeWithValue("OUTCOME_NAME", 1);` | *Add an outcome with the provided name and value, captured against the current session.* |



## Notifications Namespace

The Notifications namespace is accessible via `OneSignal.Notifications` and provides access to notification-scoped functionality.

| **Cordova/Ionic**                                                         |                                                                                              **Description** |
|---------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| `let permission = OneSignal.Notifications.hasPermission()`               | _**DEPRECATED**<br>use `getPermissionAsync`_                                                                                                                                                                                                                                                                                                                                                                        |
| `await OneSignal.Notifications.getPermissionAsync()`               | *Whether this app has push notification permission.*                                                                                                                                                                                                                                                                                                                                                                        |
| `await OneSignal.Notifications.permissionNative()` | *(ios only) Returns the enum for the native permission of the device. It will be one of: NotDetermined, Denied, Authorized, Provisional (only available in iOS 12), Ephemeral (only available in iOS 14)*|
| `await OneSignal.Notifications.canRequestPermission();`  | *Whether attempting to request notification permission will show a prompt. Returns `true` if the device has not been prompted for push notification permission already.*                                                                                                                                                                                                                                                |
| `OneSignal.Notifications.clearAll();`                                           | *Removes all OneSignal notifications.*|                                                                                                                                                           
| `OneSignal.Notifications.removeNotification(1234567890);`                                                                                               | *(Android only) Cancels a single OneSignal notification based on its Android notification integer ID. Use instead of Android's [android.app.NotificationManager.cancel], otherwise the notification will be restored when your app is restarted.*|                                                                                                                                                                                                    
| `OneSignal.Notifications.removeGroupedNotifications("GROUP_KEY");`                                                                                               | *(Android only) Cancels a group of OneSignal notifications with the provided group key. Grouping notifications is a OneSignal concept, there is no [android.app.NotificationManager] equivalent.*|                                                                                                                                                                                                                                                                                                                        
| `await OneSignal.Notifications.requestPermission(fallbackToSettings?: boolean)`<br><br>***See below for usage*** | *Prompt the user for permission to receive push notifications. This will display the native system prompt to request push notification permission.* |                                     
| `OneSignal.Notifications.registerForProvisionalAuthorization(handler?);`<br><br>**See below for usage**                  | *(iOS only) Instead of having to prompt the user for permission to send them push notifications, your app can request provisional authorization.*|                                                                                     
| `OneSignal.Notifications.addEventListener("permissionChange", (event: boolean) => void);`<br><br>***See below for usage***                   | *Adds a listener that will run when a notification permission setting changes. This happens when the user enables or disables notifications for your app from the system settings outside of your app.*|
| `OneSignal.Notifications.addEventListener("foregroundWillDisplay", (event: NotificationWillDisplayEvent) => void);`<br><br>***See below for usage***       | *Adds the listener to run before displaying a notification while the app is in focus. Use this listener to read notification data and change it or decide if the notification ***should*** show or not.<br><br>**Note:** this runs **after** the [Notification Service Extension](https://documentation.onesignal.com/docs/service-extensions) which can be used to modify the notification before showing it. Call `removeEventListener("foregroundWillDisplay", listener)` to remove a listener.*|
| `OneSignal.Notifications.addEventListener("click", (event: NotificationClickEvent) => void);`<br><br>***See below for usage***                   | *Adds a listener that will run whenever a notification is clicked by the user. Call `removeEventListener("click", listener)` to remove a listener.*|                                                                                                                                                                                                                                                                                                                     
| `OneSignal.Notifications.removeEventListener(NotificationEventName, listener);`<br><br>***See below for usage***        | *Remove a listener that has been previously added.*|                                                                                                                                                                                                                         

### Prompt for Push Notification Permission

**Cordova/Ionic**
```typescript
    OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {
        console.log("User accepted notifications: " + accepted);
    });
```

### Request Provisional Authorization

**Cordova/Ionic**
```typescript
    OneSignal.Notifications.registerForProvisionalAuthorization((response: boolean) => {
        console.log("User accepted notifications: " + response);
    });
```

### Permission Change Listener

Add a listener when permission status changes. You can call `removeEventListener` to remove an existing listener.

**Cordova/Ionic**
```typescript
    const listener = (resp: boolean) => {
        console.log("Permission changed to " + resp);
    };
    OneSignal.Notifications.addEventListener("permissionChange", listener);

    // Remove the listener
    OneSignal.Notifications.removeEventListener("permissionChange", listener);
```

### Notification Lifecycle Listener

**Cordova/Ionic**
```typescript
    const listener = (event: NotificationWillDisplayEvent) => {
        // Use preventDefault() to not display
        event.preventDefault();
        // Use notification.display() to display the notification after some async work
        event.getNotification().display();
    }
    OneSignal.Notifications.addEventListener("foregroundWillDisplay", listener);

    // Remove the listener
    OneSignal.Notifications.removeEventListener("foregroundWillDisplay", listener);
```

### Notification Click Listener
**Cordova/Ionic**
```typescript
    const listener = (event: NotificationClickEvent) => {
        const notificationData = JSON.stringify(event);
    };
    OneSignal.Notifications.addEventListener("click", listener);

    // Remove the listener
    OneSignal.Notifications.removeEventListener("click", listener);
```

## Location Namespace

The Location namespace is accessible via `OneSignal.Location` and provide access to location-scoped functionality.

| **Cordova/Ionic**                                         | **Description**                                                                           |
| ----------------------------------------------------------|-------------------------------------------------------------------------------------------|
| `await OneSignal.Location.isShared();`             | *Whether location is currently shared with OneSignal.*|
| `OneSignal.Location.setShared(true);` | *Enable or disable location sharing.* |
| `OneSignal.Location.requestPermission();` | *Use this method to manually prompt the user for location permissions. This allows for geotagging so you send notifications to users based on location.* |

## InAppMessages Namespace

The In App Messages namespace is accessible via `OneSignal.InAppMessages` and provide access to in app messages-scoped functionality.

| **Cordova/Ionic**                                            |       **Description**                                                                                             |
| -------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| `await OneSignal.InAppMessages.getPaused()`<br><br>`OneSignal.InAppMessages.setPaused(true);`                           | *Whether in-app messaging is currently paused.  When set to `true`, no IAM will be presented to the user regardless of whether they qualify for them. When set to `false`, any IAMs the user qualifies for will be presented to the user at the appropriate time.*                                                                                                                                                                                                  |
| `OneSignal.InAppMessages.addTrigger("triggerKey", "triggerValue");` | *Add a trigger for the current user.  Triggers are currently explicitly used to determine whether a specific IAM should be displayed to the user. See [Triggers](https://documentation.onesignal.com/docs/iam-triggers).<br><br>If the trigger key already exists, it will be replaced with the value provided here. Note that triggers are not persisted to the backend. They only exist on the local device and are applicable to the current user.*                    |
| `OneSignal.InAppMessages.addTriggers({"triggerKey1": "triggerValue", "triggerKey2": "triggerValue"});`                          | *Add multiple triggers for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be displayed to the user. See [Triggers](https://documentation.onesignal.com/docs/iam-triggers).<br><br>If any trigger key already exists, it will be replaced with the value provided here. Note that triggers are not persisted to the backend. They only exist on the local device and are applicable to the current user.* |
| `OneSignal.InAppMessages.removeTrigger("triggerKey");`                                                                           | *Remove the trigger with the provided key from the current user.*                                                                                                                                                                                                                                                                                                                                                                                                               |
| `OneSignal.InAppMessages.removeTriggers(["triggerKey1", "triggerKey2"]);`                                                         | *Remove multiple triggers from the current user.*                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `OneSignal.InAppMessages.clearTriggers();`                                                                                  | *Clear all triggers from the current user.*                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `OneSignal.InAppMessages.addEventListener("click", (event: InAppMessageClickEvent) => void);`<br><br>***See below for usage***                         | *Set an in-app message click listener. Call `removeEventListener("click", listener)` to remove a listener.*                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `OneSignal.InAppMessages.addEventListener(lifecycleListenerEventName, (event) => void);`<br><br>***See below for usage*** | *Set listeners for in-app message lifecycle events. Call `removeEventListener("eventName", listener)` to remove a listener.*                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `OneSignal.InAppMessages.removeEventListener(eventName, listener);`<br><br>***See below for usage***        | *Remove a listener that has been previously added.*|

### In-App Message Click Listener

**Cordova/Ionic**
```typescript
    const listener = (event: InAppMessageClickEvent) => {
        const clickEvent = JSON.stringify(event);
        console.log("In-App Message Clicked: " + clickEvent);
    };
    OneSignal.InAppMessages.addEventListener("click", listener);
```

### In-App Message Lifecycle Listeners

**Cordova/Ionic**
```typescript
    const willDisplayListener = (event: InAppMessageWillDisplayEvent) => {
        console.log("OneSignal: will display IAM: "+ event.message.messageId);
    };
    const didDisplayListener = (event: InAppMessageDidDisplayEvent) => {
        console.log("OneSignal: did display IAM: "+ event.message.messageId);
    };
    const willDismissListener = (event: InAppMessageWillDismissEvent) => {
        console.log("OneSignal: will dismiss IAM: "+ event.message.messageId);
    };
    const didDismissListener = (event: InAppMessageDidDismissEvent) => {
        console.log("OneSignal: did dismiss IAM: "+ event.message.messageId);
    };

    // Listeners for each event added separately
    OneSignal.InAppMessages.addEventListener("willDisplay", willDisplayListener);
    OneSignal.InAppMessages.addEventListener("didDisplay", didDisplayListener);
    OneSignal.InAppMessages.addEventListener("willDismiss", willDismissListener);
    OneSignal.InAppMessages.addEventListener("didDismiss", didDismissListener);

    // Remove listeners
    OneSignal.InAppMessages.removeEventListener("willDisplay", willDisplayListener);
    OneSignal.InAppMessages.removeEventListener("didDisplay", didDisplayListener);
    OneSignal.InAppMessages.removeEventListener("willDismiss", willDismissListener);
    OneSignal.InAppMessages.removeEventListener("didDismiss", didDismissListener);
```

## Debug Namespace

The Debug namespace is accessible via `OneSignal.Debug` and provide access to debug-scoped functionality.

| **Objective-C**                                  | **Description**                                                                    |
| ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `OneSignal.Debug.setLogLevel(LogLevel.Verbose);` | *Sets the log level the OneSignal SDK should be writing to the Xcode log. 0 = None, 1 = Fatal, 2 = Error, 3 = Warn, 4 = Info, 5 = Debug, 6 = Verbose* |
| `OneSignal.Debug.setAlertLevel(LogLevel.None);` | *Sets the logging level to show as alert dialogs. 0 = None, 1 = Fatal, 2 = Error, 3 = Warn, 4 = Info, 5 = Debug, 6 = Verbose*                                 |


# Glossary

**device-scoped user**
> An anonymous user with no aliases that cannot be retrieved except through the current device or OneSignal dashboard. On app install, the OneSignal SDK is initialized with a *device-scoped user*. A *device-scoped user* can be upgraded to an identified user by calling `OneSignal.login("USER_EXTERNAL_ID")`  to identify the user by the specified external user ID. 

# Limitations

- Changing app IDs is not supported.
- Any `User` namespace calls must be invoked **after** initialization. Example: `OneSignal.User.addTag("tag", "2")`
- In the SDK, the user state is only refreshed from the server when a new session is started (cold start or backgrounded for over 30 seconds) or when the user is logged in. This is by design.

# Known issues

- Identity Verification
  - We will be introducing Identity Verification using JWT in a follow up release
