# OneSignal Cordova SDK Demo

An Ionic Capacitor React app showcasing OneSignal Cordova SDK features including push notifications, in-app messaging, user management, tags, triggers, outcomes, live activities, and more. It installs the plugin packed from this repository and uses Swift Package Manager for iOS.

The demo uses Android package `com.onesignal.example` and iOS bundle id `com.onesignal.example` with team `99SW8E36CT`, and the shared OneSignal demo app (`1154c350-e715-4b71-a58b-1b84b6745baa`).

## Prerequisites

- Vite+ (`vp`)
- [Ionic CLI](https://ionicframework.com/docs/cli) (`npm install -g @ionic/cli`), used by the `android` and `ios` scripts
- Android Studio with an emulator or device
- For iOS: macOS and Xcode with a valid signing configuration

## Setup

Install the SDK's dependencies from the repository root, since setup builds and packs the plugin:

```sh
vp install
```

Then, in this directory:

```sh
cp .env.example .env
```

Optionally set your own OneSignal credentials in `.env`:

```sh
VITE_ONESIGNAL_APP_ID=your-onesignal-app-id
VITE_ONESIGNAL_API_KEY=your-onesignal-api-key
VITE_ONESIGNAL_ANDROID_CHANNEL_ID=
```

- `VITE_ONESIGNAL_APP_ID`: optional. Defaults to the shared demo app.
- `VITE_ONESIGNAL_API_KEY`: REST API key, used to update and end live activities. Sending notifications from the demo doesn't need it.
- `VITE_ONESIGNAL_ANDROID_CHANNEL_ID`: optional Android notification channel for the sound test notification. Falls back to a built-in default channel.

The `VITE_*` values are built into the web bundle, so rerun setup (`vp run android` / `vp run ios`) after changing `.env`. The demo's own dependencies are installed by setup.

The OneSignal app needs FCM credentials for the `com.onesignal.example` Android package and APNs credentials for the `com.onesignal.example` bundle ID on iOS. On Android, build with `-PDEMO_BUNDLE_ID=<package>` to use a different package.

iOS builds use bundle ID `com.onesignal.example` and team `99SW8E36CT` by default, set in `ios/demo.xcconfig`. To sign with your own team, copy `ios/local.xcconfig.example` to `ios/local.xcconfig` (gitignored) and set `DEMO_BUNDLE_ID` and `DEMO_TEAM_ID`. The NSE, widget and app group IDs derive from `DEMO_BUNDLE_ID`. E2E builds pass `DEMO_BUNDLE_ID=com.onesignal.sdkdemo DEMO_TEAM_ID=DL8TF3X4K3` to xcodebuild and `-PDEMO_BUNDLE_ID=com.onesignal.sdkdemo` to Gradle.

Firebase Installation ID registration is off by default. To turn it on, add a `google-services.json` with a client for your package to `android/app/` (gitignored) and build with `-PFIREBASE_INSTALLATION_ID_ENABLED=true`. The E2E workflow does both, writing the file from the `APPIUM_GOOGLE_SERVICES_JSON` secret.

## Run

```sh
vp run android
vp run ios
```

Each command first runs `setup` (`../setup.sh`), which:

1. Builds and packs the plugin from the repository root and installs it into the demo when it changed
2. Builds the web bundle
3. Adds the Capacitor platform if missing (iOS with Swift Package Manager, which requires Capacitor 8.4.0 or newer)
4. Runs `cap sync` when inputs changed

It then launches the app with live reload.

If an existing generated `ios/` folder uses CocoaPods, setup recreates it with Swift Package Manager.

To start over, run `vp run clean`.

## Other demos

- [`demo-pods`](../demo-pods): same app using CocoaPods for iOS
- [`demo-no-location`](../demo-no-location) and [`demo-no-location-pods`](../demo-no-location-pods): minimal apps without the native location module

## Build Guide

See [../build.md](../build.md) for the full set of prompts and requirements used to build this app, and [../build_ios.md](../build_ios.md) for the iOS push and live activity setup.
