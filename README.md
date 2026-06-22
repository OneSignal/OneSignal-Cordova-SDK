<p align="center">
  <img src="https://media.onesignal.com/cms/Website%20Layout/logo-red.svg"/>
</p>

## Setup

Install clang-format (21.1.3) e.g. `brew install clang-format`.

### OneSignal Cordova Push Notification Plugin

[![npm version](https://img.shields.io/npm/v/onesignal-cordova-plugin.svg)](https://www.npmjs.com/package/onesignal-cordova-plugin) [![npm downloads](https://img.shields.io/npm/dm/onesignal-cordova-plugin.svg)](https://www.npmjs.com/package/onesignal-cordova-plugin)

---

#### ⚠️ Migration Advisory for current OneSignal customers

Our new [user-centric APIs and v5.x.x SDKs](https://onesignal.com/blog/unify-your-users-across-channels-and-devices/) offer an improved user and data management experience. However, they may not be at 1:1 feature parity with our previous versions yet.

If you are migrating an existing app, we suggest using iOS and Android’s Phased Rollout capabilities to ensure that there are no unexpected issues or edge cases. Here is the documentation for each:

- [iOS Phased Rollout](https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases/)
- [Google Play Staged Rollouts](https://support.google.com/googleplay/android-developer/answer/6346149?hl=en)

If you run into any challenges or have concerns, please contact our support team at support@onesignal.com

---

[OneSignal](https://onesignal.com/) is a free email, sms, push notification, and in-app message service for mobile apps. This plugin makes it easy to integrate your [Cordova](http://cordova.apache.org/) based (e.g. [Ionic](http://ionicframework.com/), [PhoneGap](https://phonegap.com/), and PhoneGap Build app with OneSignal.

<p align="center"><img src="https://app.onesignal.com/images/android_and_ios_notification_image.gif" width="500" alt="Cordova Notification"></p>

#### Installation and Setup

See the [Documentation](https://documentation.onesignal.com/docs) for installation and setup instructions:

- Cordova: https://documentation.onesignal.com/docs/cordova-sdk-setup
- Ionic: https://documentation.onesignal.com/docs/ionic-sdk-setup

#### API

See OneSignal's [Client SDK Reference](https://documentation.onesignal.com/docs/sdk-reference) page for a list of all available methods.

#### iOS Native Dependencies

Cordova iOS apps using `cordova-ios` 8 or newer can resolve this plugin with Swift Package Manager. Older Cordova iOS apps continue to use CocoaPods through `OneSignalCordovaDependencies`.

Capacitor apps using Swift Package Manager must use plugins that support SPM. The demo app in `examples/demo` validates that path.

#### Disabling OneSignal Location

If your app does not use `OneSignal.Location`, you can exclude the native OneSignal location module from Android builds and iOS CocoaPods builds.

Set `ONESIGNAL_DISABLE_LOCATION=true` in the environment before installing the plugin or syncing native platforms, because this flag is read when native dependencies are resolved. The value is case-insensitive, and `1` is also accepted. The iOS Swift Package Manager path currently includes the full OneSignal package set.

```bash
ONESIGNAL_DISABLE_LOCATION=true cordova plugin add onesignal-cordova-plugin
ONESIGNAL_DISABLE_LOCATION=true cordova platform add ios
ONESIGNAL_DISABLE_LOCATION=true cordova platform add android
```

Capacitor apps using CocoaPods do not need to edit `ios/App/Podfile`; run Capacitor sync in an environment where the flag is set:

```bash
ONESIGNAL_DISABLE_LOCATION=true npx cap sync ios
ONESIGNAL_DISABLE_LOCATION=true npx cap sync android
```

In CI, set the flag once at the job or step level so CocoaPods and Gradle inherit it:

```yaml
env:
  ONESIGNAL_DISABLE_LOCATION: true
```

With the location module disabled, calls to `OneSignal.Location` are ignored and `OneSignal.Location.isShared()` resolves `false`.

If you change this setting in an existing project, clear the relevant native dependency state and re-resolve in a shell where the variable is exported.

For Cordova:

```bash
cd platforms/ios
pod deintegrate
rm -rf Pods Podfile.lock
ONESIGNAL_DISABLE_LOCATION=true pod install
```

For Capacitor:

```bash
cd ios/App
pod deintegrate
rm -rf Pods Podfile.lock
ONESIGNAL_DISABLE_LOCATION=true pod install
```

When using Xcode or Android Studio, launch the IDE from a terminal that has `ONESIGNAL_DISABLE_LOCATION` exported. An IDE launched from the Dock/Finder does not inherit variables set only in your shell profile.

#### Change Log

See this repository's [release tags](https://github.com/OneSignal/OneSignal-Cordova-SDK/releases) for a complete change log of every released version.

#### Support

Please visit this repository's [Github issue tracker](https://github.com/OneSignal/OneSignal-Cordova-SDK/issues) for feature requests and bug reports related specificly to the SDK.
For account issues and support please contact OneSignal support from the [OneSignal.com](https://onesignal.com) dashboard.

#### Demo Projects

To make things easier, we have published an Ionic Capacitor React demo app in the `/example` folder of this repository.

Legacy (Player Model) demo projects:

- [Cordova](https://github.com/OneSignal/OneSignal-Cordova-Example)
- [Ionic](https://github.com/OneSignal/OneSignal-Ionic-Example)

#### Supports:

- Cordova, Ionic, Ionic Capacitor, and Phonegap
- Android 4.1 (API Level 16) through 12 (API Level 31), and Amazon FireOS
- iOS 9 - 15
