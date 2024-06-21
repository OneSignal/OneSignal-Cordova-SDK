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
#import "OneSignalLiveActivities/OneSignalLiveActivities-Swift.h"

NSString* notificationWillShowInForegoundCallbackId;
NSString* notificationClickedCallbackId;
NSString* permissionObserverCallbackId;
NSString* subscriptionObserverCallbackId;
NSString* requestPermissionCallbackId;
NSString* registerForProvisionalAuthorizationCallbackId;
NSString* enterLiveActivityCallbackId;
NSString* exitLiveActivityCallbackId;

NSString* inAppMessageWillDisplayCallbackId;
NSString* inAppMessageDidDisplayCallbackId;
NSString* inAppMessageWillDismissCallbackId;
NSString* inAppMessageDidDismissCallbackId;
NSString* inAppMessageClickedCallbackId;
NSString* userObserverCallbackId;

OSNotificationClickEvent *actionNotification;
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

void successCallbackNSInteger(NSString* callbackId, int param) {
    CDVPluginResult* commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsNSInteger:param];
    commandResult.keepCallback = @1;
    [pluginCommandDelegate sendPluginResult:commandResult callbackId:callbackId];
}

void successCallbackString(NSString* callbackId, NSString* param) {
    CDVPluginResult* commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:param];
    commandResult.keepCallback = @1;
    [pluginCommandDelegate sendPluginResult:commandResult callbackId:callbackId];
}

void failureCallback(NSString* callbackId, NSDictionary* data) {
    CDVPluginResult* commandResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:data];
    commandResult.keepCallback = @1;
    [pluginCommandDelegate sendPluginResult:commandResult callbackId:callbackId];
}

void processForegroundLifecycleListener(OSNotificationWillDisplayEvent* _notif) {
    NSString * data = [_notif.notification stringify];
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

void processNotificationClicked(OSNotificationClickEvent* event) {
    if (notificationClickedCallbackId != nil) {
        successCallback(notificationClickedCallbackId, [event jsonRepresentation]);
        actionNotification = nil;
    }
}

void initOneSignalObject(NSDictionary* launchOptions) {
    OneSignalWrapper.sdkType = @"cordova";
    OneSignalWrapper.sdkVersion = @"050201";
    [OneSignal initialize:nil withLaunchOptions:launchOptions];
    initialLaunchFired = true;
}

/** Helper method to return NSNull if string is empty or nil **/
NSString* getStringOrNSNull(NSString* string) {
    // length method can be used on nil and strings
    if (string.length > 0) {
        return string;
    } else {
        return [NSNull null];
    }
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

@property (strong, nonatomic) NSMutableDictionary* notificationWillDisplayCache;
@property (strong, nonatomic) NSMutableDictionary* preventDefaultCache;

@end

@implementation OneSignalPush

- (void)onNotificationPermissionDidChange:(BOOL)permission {
   successCallbackBoolean(permissionObserverCallbackId, permission);
}

- (void)onPushSubscriptionDidChangeWithState:(OSPushSubscriptionChangedState *)state {
    NSMutableDictionary *result = [NSMutableDictionary new];
    
    //Previous state
    NSMutableDictionary *previousObject = [NSMutableDictionary new];
    previousObject[@"token"] = getStringOrNSNull(state.previous.token);
    previousObject[@"id"] = getStringOrNSNull(state.previous.id);
    previousObject[@"optedIn"] = @(state.previous.optedIn);
    result[@"previous"] = previousObject;
    
    //Current state
    NSMutableDictionary *currentObject = [NSMutableDictionary new];
    currentObject[@"token"] = getStringOrNSNull(state.current.token);
    currentObject[@"id"] = getStringOrNSNull(state.current.id);
    currentObject[@"optedIn"] = @(state.current.optedIn);
    result[@"current"] = currentObject;
    
    successCallback(subscriptionObserverCallbackId, result);
}

- (void)onUserStateDidChangeWithState:(OSUserChangedState * _Nonnull)state {
    NSString *onesignalId = state.current.onesignalId;
    NSString *externalId = state.current.externalId;

    NSMutableDictionary *result = [NSMutableDictionary new];
    
    NSMutableDictionary *currentObject = [NSMutableDictionary new];
    
    currentObject[@"onesignalId"] = getStringOrNSNull(onesignalId);
    currentObject[@"externalId"] = getStringOrNSNull(externalId);
    result[@"current"] = currentObject;

    successCallback(userObserverCallbackId, result);
}

- (void)getOnesignalId:(CDVInvokedUrlCommand *)command {
    successCallbackString(command.callbackId, OneSignal.User.onesignalId);
}

- (void)getExternalId:(CDVInvokedUrlCommand *)command {
    successCallbackString(command.callbackId, OneSignal.User.externalId);
}

- (void)setProvidesNotificationSettingsView:(CDVInvokedUrlCommand *)command {
    BOOL providesView = command.arguments[0];
    [OneSignal setProvidesNotificationSettingsView:providesView];
}

- (void)onWillDisplayNotification:(OSNotificationWillDisplayEvent *)event {
    self.notificationWillDisplayCache[event.notification.notificationId] = event;
    [event preventDefault];
    processForegroundLifecycleListener(event);
}

- (void)preventDefault:(CDVInvokedUrlCommand *)command {
    NSString *notificationId = command.arguments[0];
    OSNotificationWillDisplayEvent *event = _notificationWillDisplayCache[notificationId];
    if (!event) {
        [OneSignalLog onesignalLog:ONE_S_LL_ERROR message:[NSString stringWithFormat:@"OneSignal (objc): could not find notification will display event for notification with id: %@", notificationId]];
        return;
    }
    [event preventDefault];
    self.preventDefaultCache[event.notification.notificationId] = event;
}

-(void)displayNotification:(CDVInvokedUrlCommand *)command {
    NSString *notificationId = command.arguments[0];
    OSNotificationWillDisplayEvent *event = _notificationWillDisplayCache[notificationId];
    if (!event) {
        [OneSignalLog onesignalLog:ONE_S_LL_ERROR message:[NSString stringWithFormat:@"OneSignal (objc): could not find notification will display event for notification with id: %@", notificationId]];
        return;
    }
    [event.notification display];
}

-(void)proceedWithWillDisplay:(CDVInvokedUrlCommand *)command {
    NSString *notificationId = command.arguments[0];
    OSNotificationWillDisplayEvent *event = self.notificationWillDisplayCache[notificationId];
    if (!event) {
        [OneSignalLog onesignalLog:ONE_S_LL_ERROR message:[NSString stringWithFormat:@"OneSignal (objc): could not find notification will display event for notification with id: %@", notificationId]];
        return;
    }
    if (self.preventDefaultCache[notificationId]) {
        return;
    }
    [event.notification display];
}

- (void)addForegroundLifecycleListener:(CDVInvokedUrlCommand*)command {
    bool first = notificationWillShowInForegoundCallbackId  == nil;
    notificationWillShowInForegoundCallbackId = command.callbackId;
    if (first) {
        [OneSignal.Notifications addForegroundLifecycleListener:self];
    }
}

- (void)onClickNotification:(OSNotificationClickEvent * _Nonnull)event {
    actionNotification = event;
    if (pluginCommandDelegate)
        processNotificationClicked(actionNotification);
}

- (void)addNotificationClickListener:(CDVInvokedUrlCommand*)command {
    bool first = notificationClickedCallbackId  == nil;
    notificationClickedCallbackId = command.callbackId;
    if (first) {
        [OneSignal.Notifications addClickListener:self];
    }
}

- (void)init:(CDVInvokedUrlCommand*)command {
    _notificationWillDisplayCache = [NSMutableDictionary new];
    _preventDefaultCache = [NSMutableDictionary new];

    pluginCommandDelegate = self.commandDelegate;

    NSString* appId = (NSString*)command.arguments[0];
    NSString* appIdStr = (appId ? [NSString stringWithUTF8String: [appId UTF8String]] : nil);

    [OneSignal initialize:appIdStr withLaunchOptions:nil];

    // In-App Message listeners
    [OneSignal.InAppMessages addLifecycleListener:self];
    [OneSignal.InAppMessages addClickListener:self];

    if (actionNotification)
        processNotificationClicked(actionNotification);
    
    successCallbackBoolean(command.callbackId, true);
}

- (void)setLanguage:(CDVInvokedUrlCommand*)command {
    [OneSignal.User setLanguage:command.arguments[0]];
}

- (void)addPermissionObserver:(CDVInvokedUrlCommand*)command {
    bool first = permissionObserverCallbackId == nil;
    permissionObserverCallbackId = command.callbackId;
    if (first) {
        [OneSignal.Notifications addPermissionObserver:self];
    }
}

- (void)addPushSubscriptionObserver:(CDVInvokedUrlCommand*)command {
    bool first = subscriptionObserverCallbackId == nil;
    subscriptionObserverCallbackId = command.callbackId;
    if (first)
        [OneSignal.User.pushSubscription addObserver:self];
}

- (void)addUserStateObserver:(CDVInvokedUrlCommand*)command {
    bool first = userObserverCallbackId == nil;
    userObserverCallbackId = command.callbackId;
    if (first) {
        [OneSignal.User addObserver:self];
    }
}

- (void)getPushSubscriptionId:(CDVInvokedUrlCommand*)command {
    successCallbackString(command.callbackId, OneSignal.User.pushSubscription.id);
}

- (void)getPushSubscriptionToken:(CDVInvokedUrlCommand*)command {
    successCallbackString(command.callbackId, OneSignal.User.pushSubscription.token);
}

- (void)getPushSubscriptionOptedIn:(CDVInvokedUrlCommand*)command {
    bool optedIn = OneSignal.User.pushSubscription.optedIn;
    successCallbackBoolean(command.callbackId, optedIn);
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
    [OneSignal.Debug setAlertLevel:[command.arguments[0] intValue]];
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

- (void)getTags:(CDVInvokedUrlCommand*)command {
    NSDictionary<NSString *, NSString *> *tags = [OneSignal.User getTags];
    successCallback(command.callbackId, tags);
}

- (void)requestPermission:(CDVInvokedUrlCommand*)command {
    requestPermissionCallbackId = command.callbackId;
    [OneSignal.Notifications requestPermission:^(BOOL accepted) {
        successCallbackBoolean(requestPermissionCallbackId, accepted);
    } fallbackToSettings:[command.arguments[0] boolValue]];
}

- (void)permissionNative:(CDVInvokedUrlCommand*)command {
    OSNotificationPermission permissionNative = [OneSignal.Notifications permissionNative];
    successCallbackNSInteger(command.callbackId, permissionNative);
}

- (void)getPermissionInternal:(CDVInvokedUrlCommand*)command {
    bool isPermitted = [OneSignal.Notifications permission];
    successCallbackBoolean(command.callbackId, isPermitted);
}

- (void)canRequestPermission:(CDVInvokedUrlCommand*)command {
    bool canRequest = [OneSignal.Notifications canRequestPermission];
    successCallbackBoolean(command.callbackId, canRequest);
}

- (void)registerForProvisionalAuthorization:(CDVInvokedUrlCommand *)command {
    registerForProvisionalAuthorizationCallbackId = command.callbackId;
    [OneSignal.Notifications registerForProvisionalAuthorization:^(BOOL accepted) {
        successCallbackBoolean(registerForProvisionalAuthorizationCallbackId, accepted);
    }];
}

- (void)clearAllNotifications:(CDVInvokedUrlCommand*)command {
    [OneSignal.Notifications clearAll];
}

// Start Android only
- (void)removeNotification:(CDVInvokedUrlCommand *)command {}

- (void)removeGroupedNotifications:(CDVInvokedUrlCommand *)command {}
// Finish Android only

- (void)setPrivacyConsentRequired:(CDVInvokedUrlCommand *)command {
    if (command.arguments.count >= 1)
        [OneSignal setConsentRequired:[command.arguments[0] boolValue]];
}

- (void)setPrivacyConsentGiven:(CDVInvokedUrlCommand *)command {
    if (command.arguments.count >= 1)
        [OneSignal setConsentGiven:[command.arguments[0] boolValue]];
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
    [OneSignal.User addSms:smsNumber];
}

- (void)removeSms:(CDVInvokedUrlCommand *)command {
    NSString *smsNumber = command.arguments[0];
    [OneSignal.User removeSms:smsNumber];
}

/**
 * In-App Messages
 */

- (void)onClickInAppMessage:(OSInAppMessageClickEvent * _Nonnull)event {
    if (inAppMessageClickedCallbackId != nil) {
        NSInteger urlTargetInt = event.result.urlTarget;
        NSString *urlTarget;
        switch (urlTargetInt) {
            case 0:
                urlTarget = @"browser";
                break;
            case 1:
                urlTarget = @"webview";
                break;
            case 2:
                urlTarget = @"replacement";
                break;
        }

        NSMutableDictionary *clickResultDict = [NSMutableDictionary new];
        clickResultDict[@"actionId"] = event.result.actionId;
        clickResultDict[@"urlTarget"] = urlTarget;
        clickResultDict[@"closingMessage"] = @(event.result.closingMessage);
        clickResultDict[@"url"] = event.result.url;

        NSDictionary *json = @{
            @"message" : [event.message jsonRepresentation],
            @"result": clickResultDict
        };

        successCallback(inAppMessageClickedCallbackId, json);
    }
}

- (void)setInAppMessageClickHandler:(CDVInvokedUrlCommand*)command {
    inAppMessageClickedCallbackId = command.callbackId;
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

- (void)onWillDisplayInAppMessage:(OSInAppMessageWillDisplayEvent * _Nonnull)event {
    if (inAppMessageWillDisplayCallbackId != nil) {
        successCallback(inAppMessageWillDisplayCallbackId, [event jsonRepresentation]);
    }
}

- (void)onDidDisplayInAppMessage:(OSInAppMessageDidDisplayEvent * _Nonnull)event {
    if (inAppMessageDidDisplayCallbackId != nil) {
        successCallback(inAppMessageDidDisplayCallbackId, [event jsonRepresentation]);
    }
}

- (void)onWillDismissInAppMessage:(OSInAppMessageWillDismissEvent * _Nonnull)event {
    if (inAppMessageWillDismissCallbackId != nil) {
        successCallback(inAppMessageWillDismissCallbackId, [event jsonRepresentation]);
    }
}

- (void)onDidDismissInAppMessage:(OSInAppMessageDidDismissEvent * _Nonnull)event {
    if (inAppMessageDidDismissCallbackId != nil) {
        successCallback(inAppMessageDidDismissCallbackId, [event jsonRepresentation]);
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
    successCallbackBoolean(command.callbackId, paused);
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
    
    [OneSignal.LiveActivities enter:activityId withToken:token withSuccess:^(NSDictionary* results){
        successCallback(enterLiveActivityCallbackId, results);
    } withFailure:^(NSError *error) {
        failureCallback(enterLiveActivityCallbackId, error.userInfo);
    }];
}

- (void)exitLiveActivity:(CDVInvokedUrlCommand *)command {
    exitLiveActivityCallbackId = command.callbackId;

    NSString *activityId = command.arguments[0];

    [OneSignal.LiveActivities exit:activityId withSuccess:^(NSDictionary* results){
        successCallback(exitLiveActivityCallbackId, results);
    } withFailure:^(NSError *error) {
        failureCallback(exitLiveActivityCallbackId, error.userInfo);
    }];
}

- (void)setPushToStartToken:(CDVInvokedUrlCommand *)command {
    NSString *activityType = command.arguments[0];
    NSString *token = command.arguments[1];
    NSError* err=nil;

    if (@available(iOS 17.2, *)) {
        [OneSignalLiveActivitiesManagerImpl setPushToStartToken:activityType withToken:token error:&err];
        if (err) {
            [OneSignalLog onesignalLog:ONE_S_LL_ERROR message:[NSString stringWithFormat:@"activityType must be the name of your ActivityAttributes struct"]];
        }
    } else {
        [OneSignalLog onesignalLog:ONE_S_LL_ERROR message:[NSString stringWithFormat:@"cannot setPushToStartToken on iOS < 17.2"]];
    }
}

- (void)removePushToStartToken:(CDVInvokedUrlCommand *)command {
    NSString *activityType = command.arguments[0];
    NSError* err=nil;

    if (@available(iOS 17.2, *)) {
        [OneSignalLiveActivitiesManagerImpl removePushToStartToken:activityType error:&err];
        if (err) {
            [OneSignalLog onesignalLog:ONE_S_LL_ERROR message:[NSString stringWithFormat:@"activityType must be the name of your ActivityAttributes struct"]];
        }
    } else {
        [OneSignalLog onesignalLog:ONE_S_LL_ERROR message:[NSString stringWithFormat:@"cannot removePushToStartToken on iOS < 17.2"]];
    }
}

- (void)setupDefaultLiveActivity:(CDVInvokedUrlCommand *)command {
    NSDictionary *options = command.arguments[0];
    LiveActivitySetupOptions *laOptions = nil;

    if (options != [NSNull null]) {
        laOptions = [LiveActivitySetupOptions alloc];
        [laOptions setEnablePushToStart:[options[@"enablePushToStart"] boolValue]];
        [laOptions setEnablePushToUpdate:[options[@"enablePushToUpdate"] boolValue]];
    }

    if (@available(iOS 16.1, *)) {
        [OneSignalLiveActivitiesManagerImpl setupDefaultWithOptions:laOptions];
    } else {
        [OneSignalLog onesignalLog:ONE_S_LL_ERROR message:[NSString stringWithFormat:@"cannot setupDefault on iOS < 16.1"]];
    }
}

- (void)startDefaultLiveActivity:(CDVInvokedUrlCommand *)command {
    NSString *activityId = command.arguments[0];
    NSDictionary *attributes = command.arguments[1];
    NSDictionary *content = command.arguments[2];

    if (@available(iOS 16.1, *)) {
        [OneSignalLiveActivitiesManagerImpl startDefault:activityId attributes:attributes content:content];
    } else {
        [OneSignalLog onesignalLog:ONE_S_LL_ERROR message:[NSString stringWithFormat:@"cannot startDefault on iOS < 16.1"]];
    }
}
@end
