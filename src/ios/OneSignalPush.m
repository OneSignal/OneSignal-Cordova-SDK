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

#import <UIKit/UIKit.h>
#import <objc/runtime.h>

#import "OneSignalPush.h"
#import <OneSignal/OneSignal.h>

NSString* notificationReceivedCallbackId;
NSString* notificationOpenedCallbackId;
NSString* getTagsCallbackId;
NSString* getIdsCallbackId;
NSString* postNotificationCallbackId;
NSString* permissionObserverCallbackId;
NSString* subscriptionObserverCallbackId;
NSString* promptForPushNotificationsWithUserResponseCallbackId;
NSString* setEmailCallbackId;
NSString* setUnauthenticatedEmailCallbackId;
NSString* logoutEmailCallbackId;
NSString* emailSubscriptionCallbackId;

OSNotificationOpenedResult* actionNotification;
OSNotification *notification;

id <CDVCommandDelegate> pluginCommandDelegate;

bool initialLaunchFired = false;

void successCallback(NSString* callbackId, NSDictionary* data) {
    CDVPluginResult* commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:data];
    commandResult.keepCallback = @1;
    [pluginCommandDelegate sendPluginResult:commandResult callbackId:callbackId];
}

void failureCallback(NSString* callbackId, NSDictionary* data) {
    CDVPluginResult* commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:data];
    commandResult.keepCallback = @1;
    [pluginCommandDelegate sendPluginResult:commandResult callbackId:callbackId];
}

void processNotificationReceived(OSNotification* _notif) {
    NSString * data = [_notif stringify];
    NSError *jsonError;
    NSData *objectData = [data dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json = [NSJSONSerialization JSONObjectWithData:objectData
                                                         options:NSJSONReadingMutableContainers
                                                           error:&jsonError];
    if(!jsonError) {
        successCallback(notificationReceivedCallbackId, json);
        notification = nil;
    }
}

void processNotificationOpened(OSNotificationOpenedResult* result) {
    NSString * data = [result stringify];
    NSError *jsonError;
    NSData *objectData = [data dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json = [NSJSONSerialization JSONObjectWithData:objectData
                                                         options:NSJSONReadingMutableContainers
                                                           error:&jsonError];
    if(!jsonError) {
        successCallback(notificationOpenedCallbackId, json);
        actionNotification = nil;
    }
}

void initOneSignalObject(NSDictionary* launchOptions, const char* appId, int displayOption, BOOL inAppLaunchURL, BOOL autoPrompt, BOOL fromColdStart) {
    [OneSignal setValue:@"cordova" forKey:@"mSDKType"];

    NSString* appIdStr = (appId ? [NSString stringWithUTF8String: appId] : nil);    
    NSDictionary *iOSSettings = initialLaunchFired ? @{kOSSettingsKeyAutoPrompt : @(autoPrompt),
                                                       kOSSettingsKeyInFocusDisplayOption : @(displayOption),
                                                       kOSSettingsKeyInAppLaunchURL : @(inAppLaunchURL),
                                                       @"kOSSettingsKeyInOmitNoAppIdLogging": @(fromColdStart)} : @{@"kOSSettingsKeyInOmitNoAppIdLogging": @(fromColdStart),
                                                                                                                          kOSSettingsKeyAutoPrompt : @false
                                                                                                                        };
    
    [OneSignal initWithLaunchOptions:launchOptions appId:appIdStr handleNotificationReceived:^(OSNotification* _notif) {
        notification = _notif;
        if (pluginCommandDelegate)
            processNotificationReceived(_notif);
    }
            handleNotificationAction:^(OSNotificationOpenedResult* openResult) {
                actionNotification = openResult;
                if (pluginCommandDelegate)
                    processNotificationOpened(openResult);
            } settings: iOSSettings];

    initialLaunchFired = true;
}

@implementation UIApplication(OneSignalCordovaPush)

static void injectSelector(Class newClass, SEL newSel, Class addToClass, SEL makeLikeSel) {
    Method newMeth = class_getInstanceMethod(newClass, newSel);
    IMP imp = method_getImplementation(newMeth);
    const char* methodTypeEncoding = method_getTypeEncoding(newMeth);
    
    BOOL successful = class_addMethod(addToClass, makeLikeSel, imp, methodTypeEncoding);
    if (!successful) {
        class_addMethod(addToClass, newSel, imp, methodTypeEncoding);
        newMeth = class_getInstanceMethod(addToClass, newSel);
        
        Method orgMeth = class_getInstanceMethod(addToClass, makeLikeSel);
        
        method_exchangeImplementations(orgMeth, newMeth);
    }
}

+ (void)load {
    method_exchangeImplementations(class_getInstanceMethod(self, @selector(setDelegate:)), class_getInstanceMethod(self, @selector(setOneSignalCordovaDelegate:)));
}

static Class delegateClass = nil;

- (void) setOneSignalCordovaDelegate:(id<UIApplicationDelegate>)delegate {
    if(delegateClass != nil)
        return;
    delegateClass = [delegate class];
    
    injectSelector(self.class, @selector(oneSignalApplication:didFinishLaunchingWithOptions:),
                   delegateClass, @selector(application:didFinishLaunchingWithOptions:));
    [self setOneSignalCordovaDelegate:delegate];
}

- (BOOL)oneSignalApplication:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions {
    initOneSignalObject(launchOptions, nil, 1, YES, NO, YES);
    
    if ([self respondsToSelector:@selector(oneSignalApplication:didFinishLaunchingWithOptions:)])
        return [self oneSignalApplication:application didFinishLaunchingWithOptions:launchOptions];
    return YES;
}

@end

@implementation OneSignalPush

- (void)onOSPermissionChanged:(OSPermissionStateChanges*)stateChanges {
    successCallback(permissionObserverCallbackId, [stateChanges toDictionary]);
}

- (void)onOSSubscriptionChanged:(OSSubscriptionStateChanges*)stateChanges {
    successCallback(subscriptionObserverCallbackId, [stateChanges toDictionary]);
}

-(void)onOSEmailSubscriptionChanged:(OSEmailSubscriptionStateChanges *)stateChanges {
    successCallback(emailSubscriptionCallbackId, [stateChanges toDictionary]);
}

- (void)setNotificationReceivedHandler:(CDVInvokedUrlCommand*)command {
    notificationReceivedCallbackId = command.callbackId;
}

- (void)setNotificationOpenedHandler:(CDVInvokedUrlCommand*)command {
    notificationOpenedCallbackId = command.callbackId;
}

- (void)init:(CDVInvokedUrlCommand*)command {
    
    pluginCommandDelegate = self.commandDelegate;

    NSString* appId = (NSString*)command.arguments[0];
    NSDictionary* settings = command.arguments[2] == [NSNull null] ? @{} : (NSDictionary*)command.arguments[2];
    
    BOOL inAppLaunchURL = settings[@"kOSSettingsKeyInAppLaunchURL"] ? [(NSNumber*)settings[@"kOSSettingsKeyInAppLaunchURL"] boolValue] : YES;
    BOOL autoPrompt = settings[@"kOSSettingsKeyAutoPrompt"] ? [(NSNumber*)settings[@"kOSSettingsKeyAutoPrompt"] boolValue] : YES;

    int displayOption = [(NSNumber*)command.arguments[3] intValue];

    initOneSignalObject(nil, [appId UTF8String], displayOption, inAppLaunchURL, autoPrompt, NO);
    
    if (notification)
        processNotificationReceived(notification);
    if (actionNotification)
        processNotificationOpened(actionNotification);
}

- (void)getTags:(CDVInvokedUrlCommand*)command {
    getTagsCallbackId = command.callbackId;
    [OneSignal getTags:^(NSDictionary* result) {
        successCallback(getTagsCallbackId, result);
    }];
}

- (void)getIds:(CDVInvokedUrlCommand*)command {
    getIdsCallbackId = command.callbackId;
    [OneSignal IdsAvailable:^(NSString* userId, NSString* pushToken) {
        if (pushToken == nil)
            pushToken = @"";
        
        successCallback(getIdsCallbackId, @{@"userId" : userId, @"pushToken" : pushToken});
    }];
}

- (void)sendTags:(CDVInvokedUrlCommand*)command {
    [OneSignal sendTags:command.arguments[0]];
}

- (void)deleteTags:(CDVInvokedUrlCommand*)command {
    [OneSignal deleteTags:command.arguments];
}   

- (void)registerForPushNotifications:(CDVInvokedUrlCommand*)command {
    [OneSignal registerForPushNotifications];
}
    
- (void)setLocationShared:(CDVInvokedUrlCommand *)command {
   [OneSignal setLocationShared:command.arguments[0]];
}

- (void)promptForPushNotificationsWithUserResponse:(CDVInvokedUrlCommand*)command {
   promptForPushNotificationsWithUserResponseCallbackId = command.callbackId;
    [OneSignal promptForPushNotificationsWithUserResponse:^(BOOL accepted) {
        successCallback(promptForPushNotificationsWithUserResponseCallbackId, @{@"accepted": (accepted ? @"true" : @"false")});
    }];
}


- (void)setSubscription:(CDVInvokedUrlCommand*)command {
    [OneSignal setSubscription:[command.arguments[0] boolValue]];
}

- (void)postNotification:(CDVInvokedUrlCommand*)command {
    postNotificationCallbackId = command.callbackId;

    [OneSignal postNotification:command.arguments[0]
        onSuccess:^(NSDictionary* results) {
            successCallback(postNotificationCallbackId, results);
        }
        onFailure:^(NSError* error) {
            if (error.userInfo && error.userInfo[@"returned"])
                failureCallback(postNotificationCallbackId, error.userInfo[@"returned"]);
            else
                failureCallback(postNotificationCallbackId, @{@"error": @"HTTP no response error"});

    }];
}

- (void)promptLocation:(CDVInvokedUrlCommand*)command {
   [OneSignal promptLocation];
}

- (void)syncHashedEmail:(CDVInvokedUrlCommand*)command {
   [OneSignal syncHashedEmail:command.arguments[0]];
}

- (void)setLogLevel:(CDVInvokedUrlCommand*)command {
    NSDictionary* options = command.arguments[0];
    [OneSignal setLogLevel:[options[@"logLevel"] intValue] visualLevel:[options[@"visualLevel"] intValue]];
}

// Android only
- (void)enableVibrate:(CDVInvokedUrlCommand*)command {}
- (void)enableSound:(CDVInvokedUrlCommand*)command {}
- (void)clearOneSignalNotifications:(CDVInvokedUrlCommand*)command {}


- (void)setInFocusDisplaying:(CDVInvokedUrlCommand*)command {
    OneSignal.inFocusDisplayType = [(NSNumber*)command.arguments[0] intValue];
}

- (void)getPermissionSubscriptionState:(CDVInvokedUrlCommand*)command {
    successCallback(command.callbackId, [[OneSignal getPermissionSubscriptionState] toDictionary]);
}

- (void)addPermissionObserver:(CDVInvokedUrlCommand*)command {
    bool first = permissionObserverCallbackId  == nil;
    permissionObserverCallbackId = command.callbackId;
    if (first)
        [OneSignal addPermissionObserver:self];
}

- (void)addSubscriptionObserver:(CDVInvokedUrlCommand*)command {
    bool first = subscriptionObserverCallbackId  == nil;
    subscriptionObserverCallbackId = command.callbackId;
    if (first)
        [OneSignal addSubscriptionObserver:self];
}

- (void)addEmailSubscriptionObserver:(CDVInvokedUrlCommand *)command {
    bool first = emailSubscriptionCallbackId == nil;
    emailSubscriptionCallbackId = command.callbackId;
    if (first)
        [OneSignal addEmailSubscriptionObserver:self];
}

- (void)setEmail:(CDVInvokedUrlCommand *)command {
    setEmailCallbackId = command.callbackId;
    
    NSString *email = command.arguments[0];
    NSString *emailAuthToken = command.arguments[1];
    
    [OneSignal setEmail:email withEmailAuthHashToken:emailAuthToken withSuccess:^{
        successCallback(setEmailCallbackId, nil);
    } withFailure:^(NSError *error) {
        failureCallback(setEmailCallbackId, error.userInfo);
    }];
}

- (void)setUnauthenticatedEmail:(CDVInvokedUrlCommand *)command {
    setUnauthenticatedEmailCallbackId = command.callbackId;
    
    NSString *email = command.arguments[0];
    
    [OneSignal setEmail:email withSuccess:^{
        successCallback(setUnauthenticatedEmailCallbackId, nil);
    } withFailure:^(NSError *error) {
        failureCallback(setUnauthenticatedEmailCallbackId, error.userInfo);
    }];
}

- (void)logoutEmail:(CDVInvokedUrlCommand *)command {
    logoutEmailCallbackId = command.callbackId;
    
    [OneSignal logoutEmailWithSuccess:^{
        successCallback(logoutEmailCallbackId, nil);
    } withFailure:^(NSError *error) {
        failureCallback(logoutEmailCallbackId, error.userInfo);
    }];
}

- (void)userProvidedPrivacyConsent:(CDVInvokedUrlCommand *)command {
    CDVPluginResult* commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:!OneSignal.requiresUserPrivacyConsent];
    commandResult.keepCallback = @1;
    [pluginCommandDelegate sendPluginResult:commandResult callbackId:command.callbackId];
}
    
- (void)setRequiresUserPrivacyConsent:(CDVInvokedUrlCommand *)command {
    if (command.arguments.count >= 1)
        [OneSignal setRequiresUserPrivacyConsent:[command.arguments[0] boolValue]];
}

- (void)provideUserConsent:(CDVInvokedUrlCommand *)command {
    if (command.arguments.count >= 1)
        [OneSignal consentGranted:[command.arguments[0] boolValue]];
}

- (void)setExternalUserId:(CDVInvokedUrlCommand *)command {
    NSString *externalId = command.arguments[0];
    
    [OneSignal setExternalUserId:externalId];
}

- (void)removeExternalUserId:(CDVInvokedUrlCommand *)command {
    [OneSignal removeExternalUserId];
}

/**
 * In-App Messaging
 */

- (void)setInAppMessageClickHandler:(CDVInvokedUrlCommand*)command {
    [OneSignal setInAppMessageClickHandler:^(OSInAppMessageAction* action) {
            NSDictionary *result = @{
            @"clickName": action.clickName ?: [NSNull null],
            @"clickUrl" : action.clickUrl.absoluteString ?: [NSNull null],
            @"firstClick" : @(action.firstClick),
            @"closesMessage" : @(action.closesMessage)
            };
            successCallback(command.callbackId, result);
        }
    ];
}

- (void)addTriggers:(CDVInvokedUrlCommand*)command {
   [OneSignal addTriggers:command.arguments[0]]; 
}

- (void)removeTriggersForKeys:(CDVInvokedUrlCommand*)command {
   [OneSignal removeTriggersForKeys:command.arguments[0]];
}

- (void)getTriggerValueForKey:(CDVInvokedUrlCommand*)command {
    NSString *key = command.arguments[0];
    NSString *val = [OneSignal getTriggerValueForKey:key];
    NSDictionary *result = @{
            @"value" : val ?: [NSNull null]
    };
    successCallback(command.callbackId, result);
}

- (void)pauseInAppMessages:(CDVInvokedUrlCommand*)command {
   bool pause = [command.arguments[0] boolValue];
   [OneSignal pauseInAppMessages:pause];
}

- (void)sendOutcome:(CDVInvokedUrlCommand*)command {
    // NSString *name = command.arguments[0];

    // [OneSignal sendOutcome:name onSuccess:^(NSDictionary *result){
    //     successCallback(command.callbackId, result);
    // } onFailure:^(NSError *error){
    //     failureCallback(command.callbackId, error.userInfo);
    // }]
    [OneSignal onesignal_Log:ONE_S_LL_WARN message:@"Method sendOutcome() not yet implemented for iOS!"];
    successCallback(command.callbackId, @{});
}

- (void)sendUniqueOutcome:(CDVInvokedUrlCommand*)command {
    // NSString *name = command.arguments[0];

    // [OneSignal sendUniqueOutcome:name onSuccess:^(NSDictionary *result){
    //     successCallback(command.callbackId, result);
    // } onFailure:^(NSError *error){
    //     failureCallback(command.callbackId, error.userInfo);
    // }]
    [OneSignal onesignal_Log:ONE_S_LL_WARN message:@"Method sendUniqueOutcome() not yet implemented for iOS!"];
    successCallback(command.callbackId, @{});
}

- (void)sendOutcomeWithValue:(CDVInvokedUrlCommand*)command {
    // NSString *name = command.arguments[0];
    // NSNumber *value = command.arguments[1];

    // [OneSignal sendOutcomeWithValue:name value:value onSuccess:^(NSDictionary *result){
    //     successCallback(command.callbackId, result);
    // } onFailure:^(NSError *error){
    //     failureCallback(command.callbackId, error.userInfo);
    // }]
    [OneSignal onesignal_Log:ONE_S_LL_WARN message:@"Method sendOutcomeWithValue() not yet implemented for iOS!"];
    successCallback(command.callbackId, @{});
}

@end
