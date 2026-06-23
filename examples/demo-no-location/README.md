# OneSignal Cordova No-Location SPM Demo

This temporary runnable example shows the native build flag for apps that use OneSignal push with Swift Package Manager, but do not use `OneSignal.Location`.

The demo uses package/bundle id `com.onesignal.example`.

Current finding: the Cordova plugin's evaluated SwiftPM target dependencies exclude `OneSignalLocation` when `ONESIGNAL_DISABLE_LOCATION=true`, and Xcode does not link or embed `OneSignalLocation.framework` as long as the same environment variable is present for the `xcodebuild` process.

Run it with:

```sh
vp run ios
vp run android
```

`vp run ios` validates the Capacitor SPM source path. The generated `CapApp-SPM/Package.swift` resolves the local packed `onesignal-cordova-plugin` package from `node_modules`.

## Setup

Copy `.env.example` to `.env` and set your OneSignal app ID:

```sh
cp .env.example .env
```

Then edit `.env`:

```sh
VITE_ONESIGNAL_APP_ID=your-onesignal-app-id
```

The `setup` script exports `ONESIGNAL_DISABLE_LOCATION=true` before packing the local Cordova plugin and running Capacitor sync, so Android Gradle and iOS Swift Package Manager resolve OneSignal without the location module.

## iOS

The `ios` script runs `setup`, which syncs Capacitor with:

```sh
ONESIGNAL_DISABLE_LOCATION=true
```

This demo requires Capacitor 8.4.0 or newer for Cordova plugin SPM package support. The setup script adds iOS with:

```sh
vpx cap add ios --packagemanager SPM
```

If an existing generated `ios/` folder is using CocoaPods, delete it before running setup so Capacitor recreates it with SPM.

If you run `vpx cap sync ios`, Xcode, or `xcodebuild` manually, set `ONESIGNAL_DISABLE_LOCATION=true` in that environment too.

## Android

The `android` script runs `setup`, which syncs Capacitor with:

```sh
ONESIGNAL_DISABLE_LOCATION=true
```

If you build Android another way, such as Android Studio or a raw `./gradlew` invocation, set `ONESIGNAL_DISABLE_LOCATION=true` in that environment too.

## App Code

`src/App.tsx` initializes OneSignal, requests notification permission, and sends a test notification without calling the `OneSignal.Location` namespace during normal app flow. The optional location test button calls `OneSignal.Location.isShared()` to confirm the no-location bridge resolves safely.
