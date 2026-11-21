# Capacitor apps on CocoaPods still add this pod from plugin.xml, so without this
# file they fail with an unhelpful "No podspec found" error.
raise Pod::Informative, <<~MSG
  onesignal-cordova-plugin no longer supports CocoaPods. Use Swift Package Manager:
    Cordova: upgrade to cordova-ios 8 or newer
    Capacitor: use Capacitor 8.4 or newer and run `npx cap spm-migration-assistant` (see https://capacitorjs.com/docs/ios/spm)
MSG
