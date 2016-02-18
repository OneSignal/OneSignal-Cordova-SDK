### OneSignal PhoneGap Build (PBG) Plugin

#### Branch Deprecation warning
This PGB-Compat branch is being phased out now that PhoneGap (PBG) now supports gradle builds. Please switch to `onesignal-cordova-plugin` using the config.xml settings below as soon as possible:
```xml
<gap:plugin name="onesignal-cordova-plugin" source="npm" />

<!-- Recommend the newest cli but requires cli-5.1.1+, and gradle for Android. -->
<preference name="phonegap-version" value="cli-5.4.1" />
<preference name="android-build-tool" value="gradle" />
```

If you have other plugins in your project that are incompatibile with Corodva 4.0.0+ or gradle builds make sure your using the latest version of the their plugin. Also check for updated plugin names on npmjs.com.

This pgb-compat branch will continue to be updated but updates will stop to this branch near future once it has been fully deprecated.

#### Setup

OneSignal is a free push notification service for mobile apps. This plugin makes it easy to integrate OneSignal into your PhoneGap Build projects.

- See http://documentation.onesignal.com/v2.0/docs/phonegap-sdk-overview for setup documentation.