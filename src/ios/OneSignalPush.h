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

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>

#import <OneSignalFramework/OneSignalFramework.h>

@interface OneSignalPush : CDVPlugin <OSNotificationPermissionObserver, OSNotificationLifecycleListener, OSNotificationClickListener, OSPushSubscriptionObserver, OSInAppMessageLifecycleListener, OSInAppMessageClickListener, OSUserStateObserver>

- (void)setProvidesNotificationSettingsView:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)addForegroundLifecycleListener:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)onWillDisplayNotification:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)onClickNotification:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)preventDefault:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)proceedWithWillDisplay:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)displayNotification:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)addNotificationClickListener:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)init:(CDVInvokedUrlCommand* _Nonnull)command;

- (void)setLogLevel:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)setAlertLevel:(CDVInvokedUrlCommand* _Nonnull)command;

- (void)login:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)logout:(CDVInvokedUrlCommand* _Nonnull)command;

- (void)addTags:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)removeTags:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)getTags:(CDVInvokedUrlCommand* _Nonnull)command;

- (void)addUserStateObserver:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)getOnesignalId:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)getExternalId:(CDVInvokedUrlCommand* _Nonnull)command;

// Push Subscription
- (void)addPushSubscriptionObserver:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)getPushSubscriptionId:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)getPushSubscriptionToken:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)getPushSubscriptionOptedIn:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)optInPushSubscription:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)optOutPushSubscription:(CDVInvokedUrlCommand* _Nonnull)command;

// Notifications
- (void)addPermissionObserver:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)requestPermission:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)getPermissionInternal:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)permissionNative:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)canRequestPermission:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)registerForProvisionalAuthorization:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)clearAllNotifications:(CDVInvokedUrlCommand* _Nonnull)command;

// Android Only - Notifications
- (void)removeNotification:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)removeGroupedNotifications:(CDVInvokedUrlCommand* _Nonnull)command;

- (void)setPrivacyConsentRequired:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)setPrivacyConsentGiven:(CDVInvokedUrlCommand* _Nonnull)command;

// Aliases
- (void)addAliases:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)removeAliases:(CDVInvokedUrlCommand* _Nonnull)command;

// Email
- (void)addEmail:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)removeEmail:(CDVInvokedUrlCommand* _Nonnull)command;

// SMS
- (void)addSms:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)removeSms:(CDVInvokedUrlCommand* _Nonnull)command;

// In-App Messages
- (void)setInAppMessageClickHandler:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)onClickInAppMessage:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)setOnWillDisplayInAppMessageHandler:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)setOnDidDisplayInAppMessageHandler:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)setOnWillDismissInAppMessageHandler:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)setOnDidDismissInAppMessageHandler:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)addTriggers:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)removeTriggers:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)clearTriggers:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)setPaused:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)isPaused:(CDVInvokedUrlCommand* _Nonnull)command;

// Outcomes
- (void)addOutcome:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)addUniqueOutcome:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)addOutcomeWithValue:(CDVInvokedUrlCommand* _Nonnull)command;

// Location
- (void)requestLocationPermission:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)setLocationShared:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)isLocationShared:(CDVInvokedUrlCommand* _Nonnull)command;

- (void)setLanguage:(CDVInvokedUrlCommand* _Nonnull)command;

// Live Activity
- (void)enterLiveActivity:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)exitLiveActivity:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)setPushToStartToken:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)removePushToStartToken:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)setupDefaultLiveActivity:(CDVInvokedUrlCommand* _Nonnull)command;
- (void)startDefaultLiveActivity:(CDVInvokedUrlCommand* _Nonnull)command;

@end
