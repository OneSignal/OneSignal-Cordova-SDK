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

#import <UIKit/UIKit.h>
#import <objc/runtime.h>

#import "OneSignalPush.h"
#import <OneSignalFramework/OneSignalFramework.h>

NSString* notificationWillShowInForegoundCallbackId;
NSString* notificationOpenedCallbackId;
NSString* getIdsCallbackId;
NSString* postNotificationCallbackId;
NSString* permissionObserverCallbackId;
NSString* subscriptionObserverCallbackId;
NSString* promptForPushNotificationsWithUserResponseCallbackId;
NSString* registerForProvisionalAuthorizationCallbackId;
NSString* enterLiveActivityCallbackId;
NSString* exitLiveActivityCallbackId;

NSString* inAppMessageWillDisplayCallbackId;
NSString* inAppMessageDidDisplayCallbackId;
NSString* inAppMessageWillDismissCallbackId;
NSString* inAppMessageDidDismissCallbackId;

OSNotificationOpenedResult* actionNotification;
OSNotification *notification;

id <CDVCommandDelegate> pluginCommandDelegate;

bool initialLaunchFired = false;

void successCallback(NSString* callbackId, NSDictionary* data) {
    CDVPluginResult* commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:data];
    commandResult.keepCallback = @1;
    [pluginCommandDelegate sendPluginResult:commandResult callbackId:callbackId];
}

void successCallbackBoolean(NSString* callbackId, bool param) {
    CDVPluginResult* commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:param];
    commandResult.keepCallback = @1;
    [pluginCommandDelegate sendPluginResult:commandResult callbackId:callbackId];
}

void failureCallback(NSString* callbackId, NSDictionary* data) {
    CDVPluginResult* commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:data];
    commandResult.keepCallback = @1;
    [pluginCommandDelegate sendPluginResult:commandResult callbackId:callbackId];
}

void processNotificationWillShowInForeground(OSNotification* _notif) {
    NSString * data = [_notif stringify];
    NSError *jsonError;
    NSData *objectData = [data dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json = [NSJSONSerialization JSONObjectWithData:objectData
                                                         options:NSJSONReadingMutableContainers
                                                           error:&jsonError];
    if(!jsonError) {
        successCallback(notificationWillShowInForegoundCallbackId, json);
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

void initOneSignalObject(NSDictionary* launchOptions) {
    [OneSignal setMSDKType:@"cordova"];
    [OneSignal setLaunchOptions:launchOptions];
    initialLaunchFired = true;
}

void setAppId(const char* appId) {
    NSString* appIdStr = (appId ? [NSString stringWithUTF8String: appId] : nil);
    [OneSignal initialize:appIdStr withLaunchOptions:nil];
}

@implementation UIApplication(OneSignalCordovaPush)

static void injectSelectorCordova(Class newClass, SEL newSel, Class addToClass, SEL makeLikeSel) {
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

- (void)setOneSignalCordovaDelegate:(id<UIApplicationDelegate>)delegate {
    if(delegateClass != nil)
        return;
    delegateClass = [delegate class];

    injectSelectorCordova(self.class, @selector(oneSignalApplication:didFinishLaunchingWithOptions:),
                   delegateClass, @selector(application:didFinishLaunchingWithOptions:));
    [self setOneSignalCordovaDelegate:delegate];
}

- (BOOL)oneSignalApplication:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions {
    initOneSignalObject(launchOptions);

    if ([self respondsToSelector:@selector(oneSignalApplication:didFinishLaunchingWithOptions:)])
        return [self oneSignalApplication:application didFinishLaunchingWithOptions:launchOptions];
    return YES;
}

@end

@interface OneSignalPush ()

@property (strong, nonatomic) NSMutableDictionary* notificationCompletionCache;
@property (strong, nonatomic) NSMutableDictionary* receivedNotificationCache;

@end

@implementation OneSignalPush

- (void)onOSPermissionChanged:(OSPermissionStateChanges*)stateChanges {
    successCallback(permissionObserverCallbackId, [stateChanges toDictionary]);
}

- (void)onOSSubscriptionChanged:(OSSubscriptionStateChanges*)stateChanges {
    successCallback(subscriptionObserverCallbackId, [stateChanges toDictionary]);
}

- (void)setProvidesNotificationSettingsView:(CDVInvokedUrlCommand *)command {
    BOOL providesView = command.arguments[0];
    [OneSignal setProvidesNotificationSettingsView:providesView];
}

- (void)setNotificationWillShowInForegroundHandler:(CDVInvokedUrlCommand*)command {
    notificationWillShowInForegoundCallbackId = command.callbackId;

    [OneSignal setNotificationWillShowInForegroundHandler:^(OSNotification *notification, OSNotificationDisplayResponse completion) {
        self.receivedNotificationCache[notification.notificationId] = notification;
        self.notificationCompletionCache[notification.notificationId] = completion;
        processNotificationWillShowInForeground(notification);
    }];
}

- (void)setNotificationOpenedHandler:(CDVInvokedUrlCommand*)command {
    notificationOpenedCallbackId = command.callbackId;

    [OneSignal setNotificationOpenedHandler:^(OSNotificationOpenedResult * _Nonnull result) {
        actionNotification = result;
        if (pluginCommandDelegate)
            processNotificationOpened(actionNotification);
    }];
}

- (void)completeNotification:(CDVInvokedUrlCommand*)command {
    NSString *notificationId = command.arguments[0];
    BOOL shouldDisplay = [command.arguments[1] boolValue];
    OSNotificationDisplayResponse completion = self.notificationCompletionCache[notificationId];

    if (!completion) {
        [OneSignal onesignalLog:ONE_S_LL_ERROR message:[NSString stringWithFormat:@"OneSignal (objc): could not find notification completion block with id: %@", notificationId]];
        return;
    }

    if (shouldDisplay) {
        OSNotification *notification = self.receivedNotificationCache[notificationId];
        completion(notification);
    } else {
        completion(nil);
    }

    [self.notificationCompletionCache removeObjectForKey:notificationId];
    [self.receivedNotificationCache removeObjectForKey:notificationId];
}

- (void)init:(CDVInvokedUrlCommand*)command {
    _receivedNotificationCache = [NSMutableDictionary new];
    _notificationCompletionCache = [NSMutableDictionary new];;

    pluginCommandDelegate = self.commandDelegate;

    NSString* appId = (NSString*)command.arguments[0];
    setAppId([appId UTF8String]);

    if (actionNotification)
        processNotificationOpened(actionNotification);
}

- (void)getDeviceState:(CDVInvokedUrlCommand*)command {
    successCallback(command.callbackId, [[OneSignal getDeviceState] jsonRepresentation]);
}

- (void)setLanguage:(CDVInvokedUrlCommand*)command {
    [OneSignal.User setLanguage:command.arguments[0]];
}

- (void)addPermissionObserver:(CDVInvokedUrlCommand*)command {
    bool first = permissionObserverCallbackId  == nil;
    permissionObserverCallbackId = command.callbackId;
    if (first)
        [OneSignal addPermissionObserver:self];
}

- (void)addPushSubscriptionObserver:(CDVInvokedUrlCommand*)command {
    bool first = subscriptionObserverCallbackId == nil;
    subscriptionObserverCallbackId = command.callbackId;
    if (first)
        [OneSignal.User.pushSubscription addObserver:self];
}

- (void)getPushSubscriptionId:(CDVInvokedUrlCommand*)command {
    NSString *pushId = OneSignal.User.pushSubscription.id;
    if (pushId) {
        NSDictionary *result = @{
            @"value" : pushId
        };
        successCallback(command.callbackId, result);
    }
}

- (void)getPushSubscriptionToken:(CDVInvokedUrlCommand*)command {
    NSString *token = OneSignal.User.pushSubscription.token;
    if (token) {
        NSDictionary *result = @{
            @"value" : token
        };
        successCallback(command.callbackId, result);
    }
}

- (void)getPushSubscriptionOptedIn:(CDVInvokedUrlCommand*)command {
    bool optedIn = OneSignal.User.pushSubscription.optedIn;
    NSDictionary *result = @{
        @"value" : @(optedIn)
    };
    successCallback(command.callbackId, result);
}

- (void)optInPushSubscription:(CDVInvokedUrlCommand*)command {
    [OneSignal.User.pushSubscription optIn];
}

- (void)optOutPushSubscription:(CDVInvokedUrlCommand*)command {
    [OneSignal.User.pushSubscription optOut];
}

- (void)setLogLevel:(CDVInvokedUrlCommand*)command {
    [OneSignal.Debug setLogLevel:[command.arguments[0] intValue]];
}

- (void)setAlertLevel:(CDVInvokedUrlCommand*)command {
    [OneSignal.Debug setVisualLevel:[command.arguments[0] intValue]];
}

- (void)login:(CDVInvokedUrlCommand*)command {
    [OneSignal login:command.arguments[0]];
}

- (void)logout:(CDVInvokedUrlCommand*)command {
    [OneSignal logout];
}

- (void)addTags:(CDVInvokedUrlCommand*)command {
    [OneSignal.User addTags:command.arguments[0]];
}

- (void)removeTags:(CDVInvokedUrlCommand*)command {
    [OneSignal.User removeTags:command.arguments];
}

- (void)promptForPushNotificationsWithUserResponse:(CDVInvokedUrlCommand*)command {
   promptForPushNotificationsWithUserResponseCallbackId = command.callbackId;
    [OneSignal promptForPushNotificationsWithUserResponse:^(BOOL accepted) {
        successCallbackBoolean(promptForPushNotificationsWithUserResponseCallbackId, accepted);
    } fallbackToSettings:[command.arguments[0] boolValue]];
}

- (void)registerForProvisionalAuthorization:(CDVInvokedUrlCommand *)command {
    registerForProvisionalAuthorizationCallbackId = command.callbackId;
    [OneSignal registerForProvisionalAuthorization:^(BOOL accepted) {
        // TODO: Update the response in next major release to just boolean
        successCallback(registerForProvisionalAuthorizationCallbackId, @{@"accepted": (accepted ? @"true" : @"false")});
    }];
}

- (void)disablePush:(CDVInvokedUrlCommand*)command {
    [OneSignal disablePush:[command.arguments[0] boolValue]];
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

// Start Android only
- (void)clearOneSignalNotifications:(CDVInvokedUrlCommand*)command {}

- (void)unsubscribeWhenNotificationsAreDisabled:(CDVInvokedUrlCommand *)command {}

- (void)removeNotification:(CDVInvokedUrlCommand *)command {}

- (void)removeGroupedNotifications:(CDVInvokedUrlCommand *)command {}
// Finish Android only

// Note: This implementation may not be accurate, as this method doesn't seem to exist in iOS
- (void)getPrivacyConsent:(CDVInvokedUrlCommand *)command {
    bool userProvidedPrivacyConsent = OneSignal.getPrivacyConsent;
    successCallbackBoolean(command.callbackId, userProvidedPrivacyConsent);
}

- (void)getRequiresPrivacyConsent:(CDVInvokedUrlCommand *)command {
    BOOL requiresUserPrivacyConsent = [OneSignal requiresPrivacyConsent];
    successCallbackBoolean(command.callbackId, requiresUserPrivacyConsent);
}

- (void)setRequiresPrivacyConsent:(CDVInvokedUrlCommand *)command {
    if (command.arguments.count >= 1)
        [OneSignal setRequiresPrivacyConsent:[command.arguments[0] boolValue]];
}

- (void)setPrivacyConsentConsent:(CDVInvokedUrlCommand *)command {
    if (command.arguments.count >= 1)
        [OneSignal setPrivacyConsent:[command.arguments[0] boolValue]];
}

- (void)addAliases:(CDVInvokedUrlCommand *)command {
    [OneSignal.User addAliases:command.arguments[0]];
}

- (void)removeAliases:(CDVInvokedUrlCommand *)command {
    [OneSignal.User removeAliases:command.arguments];
}

- (void)addEmail:(CDVInvokedUrlCommand *)command {
    NSString *email = command.arguments[0];
    [OneSignal.User addEmail:email];
}

- (void)removeEmail:(CDVInvokedUrlCommand *)command {
    NSString *email = command.arguments[0];
    [OneSignal.User removeEmail:email];
}

- (void)addSms:(CDVInvokedUrlCommand *)command {
    NSString *smsNumber = command.arguments[0];
    [OneSignal.User addSmsNumber:smsNumber];
}

- (void)removeSms:(CDVInvokedUrlCommand *)command {
    NSString *smsNumber = command.arguments[0];
    [OneSignal.User removeSmsNumber:smsNumber];
}

- (void)setLaunchURLsInApp:(CDVInvokedUrlCommand *)command {
    BOOL launchInApp = [command.arguments[0] boolValue];
    [OneSignal setLaunchURLsInApp:launchInApp];
}

/**
 * In-App Messages
 */

- (void)setClickHandler:(CDVInvokedUrlCommand*)command {
    [OneSignal.InAppMessages setClickHandler:^(OSInAppMessageAction* action) {
            NSDictionary *actionDict = [action jsonRepresentation];
            NSDictionary *result = @{
                @"clickName": action.clickName ?: [NSNull null],
                @"clickUrl" : action.clickUrl.absoluteString ?: [NSNull null],
                @"firstClick" : @(action.firstClick),
                @"closesMessage" : @(action.closesMessage),
                @"outcomes" : actionDict[@"outcomes"] ?: [NSNull null],
                @"tags" : actionDict[@"tags"] ?: [NSNull null]
            };
            successCallback(command.callbackId, result);
        }
    ];
}

- (void)setLifecycleHandler:(CDVInvokedUrlCommand *)command {
    [OneSignal.InAppMessages setLifecycleHandler:self];
}

- (void)setOnWillDisplayInAppMessageHandler:(CDVInvokedUrlCommand*)command {
    inAppMessageWillDisplayCallbackId = command.callbackId;
}

- (void)setOnDidDisplayInAppMessageHandler:(CDVInvokedUrlCommand*)command {
    inAppMessageDidDisplayCallbackId = command.callbackId;
}

- (void)setOnWillDismissInAppMessageHandler:(CDVInvokedUrlCommand*)command {
    inAppMessageWillDismissCallbackId = command.callbackId;
}

- (void)setOnDidDismissInAppMessageHandler:(CDVInvokedUrlCommand*)command {
    inAppMessageDidDismissCallbackId = command.callbackId;
}

- (void)onWillDisplayInAppMessage:(OSInAppMessage * _Nonnull)message {
    if (inAppMessageWillDisplayCallbackId != nil) {
        successCallback(inAppMessageWillDisplayCallbackId, [message jsonRepresentation]);
    }
}

- (void)onDidDisplayInAppMessage:(OSInAppMessage * _Nonnull)message {
    if (inAppMessageDidDisplayCallbackId != nil) {
        successCallback(inAppMessageDidDisplayCallbackId, [message jsonRepresentation]);
    }
}

- (void)onWillDismissInAppMessage:(OSInAppMessage * _Nonnull)message {
    if (inAppMessageWillDismissCallbackId != nil) {
        successCallback(inAppMessageWillDismissCallbackId, [message jsonRepresentation]);
    }
}

- (void)onDidDismissInAppMessage:(OSInAppMessage * _Nonnull)message {
    if (inAppMessageDidDismissCallbackId != nil) {
        successCallback(inAppMessageDidDismissCallbackId, [message jsonRepresentation]);
    }
}

- (void)addTriggers:(CDVInvokedUrlCommand*)command {
   [OneSignal.InAppMessages addTriggers:command.arguments[0]]; 
}

- (void)removeTriggers:(CDVInvokedUrlCommand*)command {
   [OneSignal.InAppMessages removeTriggers:command.arguments[0]];
}

- (void)clearTriggers:(CDVInvokedUrlCommand*)command {
    [OneSignal.InAppMessages clearTriggers];
}

- (void)setPaused:(CDVInvokedUrlCommand*)command {
    bool pause = [command.arguments[0] boolValue];
    
    [OneSignal.InAppMessages paused:pause];
}

- (void)isPaused:(CDVInvokedUrlCommand*)command {
    bool paused = [OneSignal.InAppMessages paused];
    NSDictionary *result = @{
            @"value" : @(paused)
    };
    successCallback(command.callbackId, result);
}

/**
 * Outcomes
 */

- (void)addOutcome:(CDVInvokedUrlCommand*)command {
    NSString *name = command.arguments[0];

    [OneSignal.Session addOutcome:name];
}

- (void)addUniqueOutcome:(CDVInvokedUrlCommand*)command {
    NSString *name = command.arguments[0];

    [OneSignal.Session addUniqueOutcome:name];
}

- (void)addOutcomeWithValue:(CDVInvokedUrlCommand*)command {
    NSString *name = command.arguments[0];
    NSNumber *value = command.arguments[1];
    
    [OneSignal.Session addOutcomeWithValue:name value:value];
}

/**
 * Location
 */

- (void)requestLocationPermission:(CDVInvokedUrlCommand*)command {
    [OneSignal.Location requestPermission];
}

- (void)setLocationShared:(CDVInvokedUrlCommand *)command {
    [OneSignal.Location setShared:[command.arguments[0] boolValue]];
}

- (void)isLocationShared:(CDVInvokedUrlCommand *)command {
    bool isShared = [OneSignal.Location isShared];
    successCallbackBoolean(command.callbackId, isShared);
}

/**
 * Live Activities
 */

- (void)enterLiveActivity:(CDVInvokedUrlCommand *)command {
    enterLiveActivityCallbackId = command.callbackId;

    NSString *activityId = command.arguments[0];
    NSString *token = command.arguments[1];
    
    [OneSignal enterLiveActivity:activityId withToken:token withSuccess:^(NSDictionary* results){
        successCallback(enterLiveActivityCallbackId, results);
    } withFailure:^(NSError *error) {
        failureCallback(enterLiveActivityCallbackId, error.userInfo);
    }];
}

- (void)exitLiveActivity:(CDVInvokedUrlCommand *)command {
    exitLiveActivityCallbackId = command.callbackId;

    NSString *activityId = command.arguments[0];

    [OneSignal exitLiveActivity:activityId withSuccess:^(NSDictionary* results){
        successCallback(exitLiveActivityCallbackId, results);
    } withFailure:^(NSError *error) {
        failureCallback(exitLiveActivityCallbackId, error.userInfo);
    }];
}

@end
