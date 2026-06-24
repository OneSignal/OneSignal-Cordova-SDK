# OneSignal Cordova No-Location CocoaPods Demo

This lightweight runnable example shows the native build flag for apps that use OneSignal push, but do not use `OneSignal.Location`.

The demo uses package/bundle id `com.onesignal.example`.

Run it with:

```sh
vp run ios
vp run android
```

`vp run ios` validates the same CocoaPods source path that consumers use. The generated Podfile resolves `OneSignalCordovaDependencies` from this repository by git tag; when the Cordova SDK checkout is on a `rel/*` branch, setup repoints that generated pod line to the matching remote git branch so pre-release validation exercises branch HEAD before the release tag exists.

For local podspec iteration, use:

```sh
vp run ios:local
```

`ios:local` patches the generated Podfile to use the locally packed plugin path instead of the remote git source.

## Setup

Copy `.env.example` to `.env` and set your OneSignal app ID:

```sh
cp .env.example .env
```

Then edit `.env`:

```sh
VITE_ONESIGNAL_APP_ID=your-onesignal-app-id
```

The `setup` script exports `ONESIGNAL_DISABLE_LOCATION=true` before packing the local Cordova plugin and running Capacitor sync, so Android Gradle and iOS CocoaPods resolve OneSignal without the location module.

## iOS

The `ios` script runs `setup`, which syncs Capacitor with:

```sh
ONESIGNAL_DISABLE_LOCATION=true
```

Cordova iOS support uses CocoaPods. The setup script adds iOS with:

```sh
vpx cap add ios --packagemanager CocoaPods
```

If an existing generated `ios/` folder is using SPM, the setup script recreates it with CocoaPods.

By default, setup leaves `OneSignalCordovaDependencies` on the generated git source. Use `vp run ios:local` when you need the helper podspec to come from the local checkout.

The generated iOS app is patched with the Push Notifications entitlement (`aps-environment`) after sync.

If you run `vpx cap sync ios`, Xcode, or CocoaPods manually, set `ONESIGNAL_DISABLE_LOCATION=true` in that environment too.

## Android

The `android` script runs `setup`, which syncs Capacitor with:

```sh
ONESIGNAL_DISABLE_LOCATION=true
```

If you build Android another way, such as Android Studio or a raw `./gradlew` invocation, set `ONESIGNAL_DISABLE_LOCATION=true` in that environment too.

## App Code

`src/App.tsx` initializes OneSignal, requests notification permission, and sends a test notification without calling the `OneSignal.Location` namespace during normal app flow. The optional location test button calls `OneSignal.Location.isShared()` to confirm the no-location bridge resolves safely.
