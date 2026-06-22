# OneSignal Demo Pods

This demo mirrors `examples/demo` but keeps the iOS project on CocoaPods. Use it to validate the Cordova plugin's CocoaPods path after changing `plugin.xml`, `OneSignalCordovaDependencies.podspec`, or release Podfile behavior.

## iOS

```sh
vp run setup:ios
vp run update:pods
```

Use `vp run setup:ios:local` or `vp run ios:local` when you need the `OneSignalCordovaDependencies` pod to resolve from the locally packed plugin in `node_modules`.
