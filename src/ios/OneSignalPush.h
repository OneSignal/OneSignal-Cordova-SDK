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

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>

#import <OneSignal/OneSignal.h>

@interface OneSignalPush : CDVPlugin <OSPermissionObserver, OSSubscriptionObserver, OSEmailSubscriptionObserver>

- (void)setNotificationReceivedHandler:(CDVInvokedUrlCommand*)command;
- (void)setNotificationOpenedHandler:(CDVInvokedUrlCommand*)command;
- (void)init:(CDVInvokedUrlCommand*)command;

- (void)setInFocusDisplaying:(CDVInvokedUrlCommand*)command;
- (void)getPermissionSubscriptionState:(CDVInvokedUrlCommand*)command;


- (void)addPermissionObserver:(CDVInvokedUrlCommand*)command;
- (void)addSubscriptionObserver:(CDVInvokedUrlCommand*)command;
- (void)addEmailSubscriptionObserver:(CDVInvokedUrlCommand *)command;

- (void)getTags:(CDVInvokedUrlCommand*)command;
- (void)getIds:(CDVInvokedUrlCommand*)command;
- (void)sendTags:(CDVInvokedUrlCommand*)command;
- (void)deleteTags:(CDVInvokedUrlCommand*)command;
- (void)promptForPushNotificationsWithUserResponse:(CDVInvokedUrlCommand*)command;
- (void)registerForPushNotifications:(CDVInvokedUrlCommand*)command;
- (void)setSubscription:(CDVInvokedUrlCommand*)command;
- (void)postNotification:(CDVInvokedUrlCommand*)command;
- (void)setLogLevel:(CDVInvokedUrlCommand*)command;
- (void)promptLocation:(CDVInvokedUrlCommand*)command;
- (void)syncHashedEmail:(CDVInvokedUrlCommand*)command;
- (void)setLocationShared:(CDVInvokedUrlCommand *)command;

//email
- (void)setEmail:(CDVInvokedUrlCommand *)command;
- (void)setUnauthenticatedEmail:(CDVInvokedUrlCommand *)command;
- (void)logoutEmail:(CDVInvokedUrlCommand *)command;

// Android Only
- (void)enableVibrate:(CDVInvokedUrlCommand*)command;
- (void)enableSound:(CDVInvokedUrlCommand*)command;
- (void)clearOneSignalNotifications:(CDVInvokedUrlCommand*)command;

- (void)userProvidedPrivacyConsent:(CDVInvokedUrlCommand *)command;
- (void)setRequiresUserPrivacyConsent:(CDVInvokedUrlCommand *)command;
- (void)provideUserConsent:(CDVInvokedUrlCommand *)command;
    

// in app
- (void)setInAppMessageClickHandler:(CDVInvokedUrlCommand*)command;
- (void)addTriggers:(CDVInvokedUrlCommand*)command;
- (void)removeTriggersForKeys:(CDVInvokedUrlCommand*)command;
- (void)getTriggerValueForKey:(CDVInvokedUrlCommand*)command;
- (void)pauseInAppMessages:(CDVInvokedUrlCommand*)command;

@end
