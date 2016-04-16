/**
 * Modified MIT License
 * 
 * Copyright 2015 OneSignal
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
#import "OneSignal.h"

OneSignal* oneSignal;

NSString* notficationOpenedCallbackId;
NSString* getTagsCallbackId;
NSString* getIdsCallbackId;
NSString* postNotificationCallbackId;

NSMutableDictionary* launchDict;

id <CDVCommandDelegate> pluginCommandDelegate;

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

void processNotificationOpened(NSDictionary* launchOptions) {
    successCallback(notficationOpenedCallbackId, launchOptions);
    launchDict = nil;
}

void initOneSignalObject(NSDictionary* launchOptions, const char* appId, BOOL autoRegister) {
    if (oneSignal == nil) {
        [OneSignal setValue:@"cordova" forKey:@"mSDKType"];

        NSString* appIdStr = (appId ? [NSString stringWithUTF8String: appId] : nil);
        
        oneSignal = [[OneSignal alloc] initWithLaunchOptions:launchOptions appId:appIdStr handleNotification:^(NSString* message, NSDictionary* additionalData, BOOL isActive) {
            launchDict = [NSMutableDictionary new];
            launchDict[@"message"] = message;
            if (additionalData)
                launchDict[@"additionalData"] = additionalData;
            launchDict[@"isActive"] = [NSNumber numberWithBool:isActive];
            
            if (pluginCommandDelegate)
                processNotificationOpened(launchDict);
        } autoRegister:autoRegister];
    }
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
    if ([launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey] != nil)
        initOneSignalObject(launchOptions, nil, true);
    
    if ([self respondsToSelector:@selector(oneSignalApplication:didFinishLaunchingWithOptions:)])
        return [self oneSignalApplication:application didFinishLaunchingWithOptions:launchOptions];
    return YES;
}

@end

@implementation OneSignalPush

- (void)init:(CDVInvokedUrlCommand*)command {
    pluginCommandDelegate = self.commandDelegate;
    notficationOpenedCallbackId = command.callbackId;

    NSDictionary* options = command.arguments[0];
    
    BOOL autoRegister = true;
    if ([options objectForKey:@"autoRegister"] == @NO)
        autoRegister = false;

    initOneSignalObject(nil, [options[@"appId"] UTF8String], autoRegister);
    
    if (launchDict)
        processNotificationOpened(launchDict);
}

- (void)getTags:(CDVInvokedUrlCommand*)command {
    getTagsCallbackId = command.callbackId;
    [oneSignal getTags:^(NSDictionary* result) {
        successCallback(getTagsCallbackId, result);
    }];
}

- (void)getIds:(CDVInvokedUrlCommand*)command {
    getIdsCallbackId = command.callbackId;
    [oneSignal IdsAvailable:^(NSString* userId, NSString* pushToken) {
        if (pushToken == nil)
            pushToken = @"";
        
        successCallback(getIdsCallbackId, @{@"userId" : userId, @"pushToken" : pushToken});
    }];
}

- (void)getIds_GameThrive:(CDVInvokedUrlCommand*)command {
    getIdsCallbackId = command.callbackId;
    [oneSignal IdsAvailable:^(NSString* playerId, NSString* pushToken) {
        if (pushToken == nil)
            pushToken = @"";
        
        successCallback(getIdsCallbackId, @{@"playerId" : playerId, @"pushToken" : pushToken});
    }];
}

- (void)sendTags:(CDVInvokedUrlCommand*)command {
    [oneSignal sendTags:command.arguments[0]];
}

- (void)deleteTags:(CDVInvokedUrlCommand*)command {
    [oneSignal deleteTags:command.arguments];
}   

- (void)registerForPushNotifications:(CDVInvokedUrlCommand*)command {
    [oneSignal registerForPushNotifications];
}

- (void)enableInAppAlertNotification:(CDVInvokedUrlCommand*)command {
    [oneSignal enableInAppAlertNotification:[command.arguments[0] boolValue]];
}

- (void)setSubscription:(CDVInvokedUrlCommand*)command {
    [oneSignal setSubscription:[command.arguments[0] boolValue]];
}

- (void)postNotification:(CDVInvokedUrlCommand*)command {
    postNotificationCallbackId = command.callbackId;

    [oneSignal postNotification:command.arguments[0]
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
   [oneSignal promptLocation];
}

- (void)setEmail:(CDVInvokedUrlCommand*)command {
   [oneSignal setEmail:command.arguments[0]];
}

- (void)setLogLevel:(CDVInvokedUrlCommand*)command {
    NSDictionary* options = command.arguments[0];
    [OneSignal setLogLevel:options[@"logLevel"] visualLevel:options[@"visualLevel"]];
}

// Android only
- (void)enableVibrate:(CDVInvokedUrlCommand*)command {}
- (void)enableSound:(CDVInvokedUrlCommand*)command {}
- (void)enableNotificationsWhenActive:(CDVInvokedUrlCommand*)command {}

@end
