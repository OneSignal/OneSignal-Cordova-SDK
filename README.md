### OneSignal Cordova Push Notification Plugin
[![npm version](https://img.shields.io/npm/v/onesignal-cordova-plugin.svg)](https://www.npmjs.com/package/onesignal-cordova-plugin)
[![npm downloads](https://img.shields.io/npm/dm/onesignal-cordova-plugin.svg)](https://www.npmjs.com/package/onesignal-cordova-plugin)

OneSignal is a free push notification service for mobile apps. This plugin makes it easy to integrate your PhoneGap CLI, PhoneGap Build, Cordova, Ionic, Intel XDK or Sencha Touch app with OneSignal. Supports Android, iOS, Windows Phone 8.1 (WP8.1), and Amazon's Fire OS platforms.

- See http://documentation.onesignal.com/v2.0/docs/phonegap-sdk-overview for setup documentation.


## iOS 10 Support

Steps:
1. Bridging header add:

`# import "Constants.h"`
`# import "OneSignalLocation-Helper.h"`

2. Locate OneSignalPush.m and modify`#import “PROJECT_NAME-Swift.h"` to match your project.

3. Build & Run
