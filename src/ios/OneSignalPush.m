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
#import <OneSignal/OneSignal.h>

NSString* notificationWillShowInForegoundCallbackId;
NSString* notificationOpenedCallbackId;
NSString* setLanguageCallbackId;
NSString* getTagsCallbackId;
NSString* getIdsCallbackId;
NSString* postNotificationCallbackId;
NSString* permissionObserverCallbackId;
NSString* subscriptionObserverCallbackId;
NSString* promptForPushNotificationsWithUserResponseCallbackId;
NSString* registerForProvisionalAuthorizationCallbackId;
NSString* setEmailCallbackId;
NSString* setUnauthenticatedEmailCallbackId;
NSString* setSMSNumberCallbackId;
NSString* setUnauthenticatedSMSNumberCallbackId;
NSString* setExternalIdCallbackId;
NSString* logoutEmailCallbackId;
NSString* logoutSMSNumberCallbackId;
NSString* emailSubscriptionCallbackId;
NSString* smsSubscriptionCallbackId;
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

// Helper method to rename a property of subscription state changes.
// Currently used by email and SMS state changes to rename the `isSubscribed` key.
NSDictionary* renameStateChangesKey(NSDictionary* oldFrom, NSDictionary* oldTo, NSString* oldKey, NSString* newKey) {
    NSMutableDictionary *from = [oldFrom mutableCopy];
    [from setObject: [from objectForKey: oldKey] forKey: newKey];
    [from removeObjectForKey: oldKey];

    NSMutableDictionary *to = [oldTo mutableCopy];
    [to setObject: [to objectForKey: oldKey] forKey: newKey];
    [to removeObjectForKey: oldKey];

    return @{@"from": from, @"to": to};
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

void initOneSignalObject(NSDictionary* launchOptions, const char* appId) {
    NSString* appIdStr = (appId ? [NSString stringWithUTF8String: appId] : nil);
    [OneSignal setMSDKType:@"cordova"];
    [OneSignal setAppId:appIdStr];
    [OneSignal initWithLaunchOptions:launchOptions];
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

- (void)setOneSignalCordovaDelegate:(id<UIApplicationDelegate>)delegate {
    if(delegateClass != nil)
        return;
    delegateClass = [delegate class];

    injectSelector(self.class, @selector(oneSignalApplication:didFinishLaunchingWithOptions:),
                   delegateClass, @selector(application:didFinishLaunchingWithOptions:));
    [self setOneSignalCordovaDelegate:delegate];
}

- (BOOL)oneSignalApplication:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions {
    initOneSignalObject(launchOptions, nil);

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

- (void)onOSEmailSubscriptionChanged:(OSEmailSubscriptionStateChanges *)stateChanges {
    NSDictionary *result = renameStateChangesKey(
        [stateChanges.from toDictionary],
        [stateChanges.to toDictionary],
        @"isSubscribed",
        @"isEmailSubscribed"
    );
    successCallback(emailSubscriptionCallbackId, result);
}

- (void)onOSSMSSubscriptionChanged:(OSSMSSubscriptionStateChanges *)stateChanges {
    NSDictionary *result = renameStateChangesKey(
        [stateChanges.from toDictionary],
        [stateChanges.to toDictionary],
        @"isSubscribed",
        @"isSMSSubscribed"
    );
    successCallback(smsSubscriptionCallbackId, result);
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
    initOneSignalObject(nil, [appId UTF8String]);

    if (actionNotification)
        processNotificationOpened(actionNotification);
}

- (void)getDeviceState:(CDVInvokedUrlCommand*)command {
    successCallback(command.callbackId, [[OneSignal getDeviceState] jsonRepresentation]);
}

- (void)setLanguage:(CDVInvokedUrlCommand*)command {
    setLanguageCallbackId = command.callbackId;

    [OneSignal setLanguage:command.arguments[0] withSuccess:^{
        successCallback(setLanguageCallbackId, nil);
    } withFailure:^(NSError *error) {
        failureCallback(setLanguageCallbackId, error.userInfo);
    }];
}

- (void)addPermissionObserver:(CDVInvokedUrlCommand*)command {
    bool first = permissionObserverCallbackId  == nil;
    permissionObserverCallbackId = command.callbackId;
    if (first)
        [OneSignal addPermissionObserver:self];
}

- (void)addSubscriptionObserver:(CDVInvokedUrlCommand*)command {
    bool first = subscriptionObserverCallbackId == nil;
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

- (void)addSMSSubscriptionObserver:(CDVInvokedUrlCommand *)command {
    bool first = smsSubscriptionCallbackId == nil;
    smsSubscriptionCallbackId = command.callbackId;
    if (first)
        [OneSignal addSMSSubscriptionObserver:self];
}

- (void)setLogLevel:(CDVInvokedUrlCommand*)command {
    [OneSignal setLogLevel:[command.arguments[0] intValue] visualLevel:[command.arguments[1] intValue]];
}

- (void)getTags:(CDVInvokedUrlCommand*)command {
    getTagsCallbackId = command.callbackId;
    [OneSignal getTags:^(NSDictionary* result) {
        successCallback(getTagsCallbackId, result);
    }];
}

- (void)sendTags:(CDVInvokedUrlCommand*)command {
    [OneSignal sendTags:command.arguments[0]];
}

- (void)deleteTags:(CDVInvokedUrlCommand*)command {
    [OneSignal deleteTags:command.arguments];
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
- (void)userProvidedPrivacyConsent:(CDVInvokedUrlCommand *)command {
    bool userProvidedPrivacyConsent = !OneSignal.requiresUserPrivacyConsent;
    successCallbackBoolean(command.callbackId, userProvidedPrivacyConsent);
}

- (void)requiresUserPrivacyConsent:(CDVInvokedUrlCommand *)command {
    BOOL requiresUserPrivacyConsent = [OneSignal requiresUserPrivacyConsent];
    // TODO: Update the response in next major release to just boolean
    successCallback(command.callbackId, @{@"value" : @(requiresUserPrivacyConsent)});
}

- (void)setRequiresUserPrivacyConsent:(CDVInvokedUrlCommand *)command {
    if (command.arguments.count >= 1)
        [OneSignal setRequiresUserPrivacyConsent:[command.arguments[0] boolValue]];
}

- (void)provideUserConsent:(CDVInvokedUrlCommand *)command {
    if (command.arguments.count >= 1)
        [OneSignal consentGranted:[command.arguments[0] boolValue]];
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

- (void)setSMSNumber:(CDVInvokedUrlCommand *)command {
    setSMSNumberCallbackId = command.callbackId;

    NSString *smsNumber = command.arguments[0];
    NSString *smsAuthHashToken = command.arguments[1];

    [OneSignal setSMSNumber:smsNumber withSMSAuthHashToken:smsAuthHashToken withSuccess:^(NSDictionary *results){
        successCallback(setSMSNumberCallbackId, results);
    } withFailure:^(NSError *error) {
        failureCallback(setSMSNumberCallbackId, error.userInfo);
    }];
}

- (void)setUnauthenticatedSMSNumber:(CDVInvokedUrlCommand *)command {
    setUnauthenticatedSMSNumberCallbackId = command.callbackId;

    NSString *smsNumber = command.arguments[0];

    [OneSignal setSMSNumber:smsNumber withSuccess:^(NSDictionary *results){
        successCallback(setUnauthenticatedSMSNumberCallbackId, results);
    } withFailure:^(NSError *error) {
        failureCallback(setUnauthenticatedSMSNumberCallbackId, error.userInfo);
    }];
}

- (void)logoutSMSNumber:(CDVInvokedUrlCommand *)command {
    logoutSMSNumberCallbackId = command.callbackId;

    [OneSignal logoutSMSNumberWithSuccess:^(NSDictionary *results){
        successCallback(logoutSMSNumberCallbackId, results);
    } withFailure:^(NSError *error) {
        failureCallback(logoutSMSNumberCallbackId, error.userInfo);
    }];
}

- (void)setExternalUserId:(CDVInvokedUrlCommand *)command {
    setExternalIdCallbackId = command.callbackId;

    NSString *externalId = command.arguments[0];
    NSString *authHashToken = nil;

    if (command.arguments.count > 1)
        authHashToken = command.arguments[1];

    [OneSignal setExternalUserId:externalId withExternalIdAuthHashToken:authHashToken withSuccess:^(NSDictionary *results) {
        successCallback(setExternalIdCallbackId, results);
    } withFailure: ^(NSError* error) {
        [OneSignal onesignalLog:ONE_S_LL_VERBOSE message:[NSString stringWithFormat:@"Set external user id Failure with error: %@", error]];
        failureCallback(setExternalIdCallbackId, error.userInfo);
    }];
}

- (void)removeExternalUserId:(CDVInvokedUrlCommand *)command {
    [OneSignal removeExternalUserId:^(NSDictionary *results) {
        successCallback(command.callbackId, results);
    } withFailure:^(NSError* error) {
        [OneSignal onesignalLog:ONE_S_LL_VERBOSE message:[NSString stringWithFormat:@"Remove external user id Failure with error: %@", error]];
        failureCallback(command.callbackId, error.userInfo);
    }];
}

/**
 * In-App Messaging
 */

- (void)setLaunchURLsInApp:(CDVInvokedUrlCommand *)command {
    BOOL launchInApp = [command.arguments[0] boolValue];
    [OneSignal setLaunchURLsInApp:launchInApp];
}

- (void)setInAppMessageClickHandler:(CDVInvokedUrlCommand*)command {
    [OneSignal setInAppMessageClickHandler:^(OSInAppMessageAction* action) {
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

- (void)setInAppMessageLifecycleHandler:(CDVInvokedUrlCommand *)command {
    [OneSignal setInAppMessageLifecycleHandler:self];
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

/**
 * Outcomes
 */

- (void)sendOutcome:(CDVInvokedUrlCommand*)command {
    NSString *name = command.arguments[0];

    [OneSignal sendOutcome:name onSuccess:^(OSOutcomeEvent *outcome){
        successCallback(command.callbackId, [outcome jsonRepresentation]);
    }];
}

- (void)sendUniqueOutcome:(CDVInvokedUrlCommand*)command {
    NSString *name = command.arguments[0];

    [OneSignal sendUniqueOutcome:name onSuccess:^(OSOutcomeEvent *outcome){
        successCallback(command.callbackId, [outcome jsonRepresentation]);
    }];
}

- (void)sendOutcomeWithValue:(CDVInvokedUrlCommand*)command {
    NSString *name = command.arguments[0];
    NSNumber *value = command.arguments[1];

    [OneSignal sendOutcomeWithValue:name value:value onSuccess:^(OSOutcomeEvent *outcome){
        successCallback(command.callbackId, [outcome jsonRepresentation]);
    }];
}

/**
 * Location
 */

- (void)promptLocation:(CDVInvokedUrlCommand*)command {
    [OneSignal promptLocation];
}

- (void)setLocationShared:(CDVInvokedUrlCommand *)command {
    [OneSignal setLocationShared:[command.arguments[0] boolValue]];
}

- (void)isLocationShared:(CDVInvokedUrlCommand *)command {
    BOOL locationShared = [OneSignal isLocationShared];
    // TODO: Update the response in next major release to just boolean
    successCallback(command.callbackId, @{@"value" : @(locationShared)});
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
