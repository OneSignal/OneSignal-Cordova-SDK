# iOS Setup: Push Notifications + Live Activities (Ionic + Capacitor)

Configure the Ionic Capacitor demo app for OneSignal push notifications and live activities.

All paths below are relative to `examples/demo/ios/App/`.

---

## 0. Prerequisites

In `examples/demo/capacitor.config.ts`, make sure iOS notification handling is configured like this:

```ts
ios: {
  handleApplicationNotifications: false,
},
```

---

## 1. iOS dependency setup

Choose one path:

### 1A. CocoaPods (`Podfile`)

Open `Podfile` in `ios/App/Podfile`.

The Capacitor app target is `App` (not `Runner`). Keep the existing target and add two new extension targets after it:

```ruby
target 'App' do
  capacitor_pods
  # Add your Pods here
end

target 'OneSignalNotificationServiceExtension' do
  use_frameworks!
  pod 'OneSignalXCFramework', '>= 5.0.0', '< 6.0'
end

target 'OneSignalWidgetExtension' do
  use_frameworks!
  pod 'OneSignalXCFramework', '>= 5.0.0', '< 6.0'
end
```

### 1B. Swift Package Manager (SPM)

TODO

---

## 2. App target entitlements + Info.plist

### App.entitlements

Create `App/App.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>aps-environment</key>
	<string>development</string>
	<key>com.apple.security.application-groups</key>
	<array>
		<string>group.com.onesignal.example.onesignal</string>
	</array>
</dict>
</plist>
```

### App/Info.plist

In `App/Info.plist`, add this inside the top-level `<dict>`:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Used for location-targeted push notifications.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Used for location-targeted push notifications.</string>
```

---

## 3. Notification Service Extension

Create `OneSignalNotificationServiceExtension/` with the 3 files below.

### NotificationService.swift

```swift
import UserNotifications
import OneSignalExtension

class NotificationService: UNNotificationServiceExtension {
    var contentHandler: ((UNNotificationContent) -> Void)?
    var receivedRequest: UNNotificationRequest!
    var bestAttemptContent: UNMutableNotificationContent?

    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        self.receivedRequest = request
        self.contentHandler = contentHandler
        self.bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)

        if let bestAttemptContent = bestAttemptContent {
            OneSignalExtension.didReceiveNotificationExtensionRequest(self.receivedRequest, with: bestAttemptContent, withContentHandler: self.contentHandler)
        }
    }

    override func serviceExtensionTimeWillExpire() {
        if let contentHandler = contentHandler, let bestAttemptContent = bestAttemptContent {
            OneSignalExtension.serviceExtensionTimeWillExpireRequest(self.receivedRequest, with: self.bestAttemptContent)
            contentHandler(bestAttemptContent)
        }
    }
}
```

### Info.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundleShortVersionString</key>
	<string>$(MARKETING_VERSION)</string>
	<key>CFBundleVersion</key>
	<string>$(CURRENT_PROJECT_VERSION)</string>
	<key>NSExtension</key>
	<dict>
		<key>NSExtensionPointIdentifier</key>
		<string>com.apple.usernotifications.service</string>
		<key>NSExtensionPrincipalClass</key>
		<string>$(PRODUCT_MODULE_NAME).NotificationService</string>
	</dict>
</dict>
</plist>
```

### OneSignalNotificationServiceExtension.entitlements

The app group must match `App/App.entitlements`.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.security.application-groups</key>
	<array>
		<string>group.com.onesignal.example.onesignal</string>
	</array>
</dict>
</plist>
```

---

## 4. Widget Extension (Live Activities)

Create `OneSignalWidget/` with the following files.

Note: on-disk folder is `OneSignalWidget`, target name is `OneSignalWidgetExtension` (matching Podfile).

### Info.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundleShortVersionString</key>
	<string>$(MARKETING_VERSION)</string>
	<key>CFBundleVersion</key>
	<string>$(CURRENT_PROJECT_VERSION)</string>
	<key>NSExtension</key>
	<dict>
		<key>NSExtensionPointIdentifier</key>
		<string>com.apple.widgetkit-extension</string>
	</dict>
</dict>
</plist>
```

### OneSignalWidgetLiveActivity.swift

`OneSignalWidgetAttributes` must conform to `OneSignalLiveActivityAttributes` and include `onesignal: OneSignalLiveActivityAttributeData`.
`ContentState` must conform to `OneSignalLiveActivityContentState` and include `onesignal: OneSignalLiveActivityContentStateData?`.

```swift
import ActivityKit
import WidgetKit
import SwiftUI
import OneSignalLiveActivities

struct OneSignalWidgetAttributes: OneSignalLiveActivityAttributes  {
    public struct ContentState: OneSignalLiveActivityContentState {
        var emoji: String
        var onesignal: OneSignalLiveActivityContentStateData?
    }
    var name: String
    var onesignal: OneSignalLiveActivityAttributeData
}

struct OneSignalWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: OneSignalWidgetAttributes.self) { context in
            VStack {
                Text("Hello \(context.attributes.name) \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}
```

### OneSignalWidgetBundle.swift

```swift
import WidgetKit
import SwiftUI

@main
struct OneSignalWidgetBundle: WidgetBundle {
    var body: some Widget {
        OneSignalWidgetLiveActivity()
    }
}
```

---

## 5. Xcode project (`project.pbxproj`)

The `project.pbxproj` already includes both extension targets with all required build settings, dependencies, and the Embed App Extensions phase. No manual Xcode changes needed for the project file.

After syncing, open `ios/App/App.xcworkspace` in Xcode and verify:

- **App** target: bundle ID `com.onesignal.example`, team `99SW8E36CT`, entitlements `App/App.entitlements`, depends on both extensions
- **OneSignalNotificationServiceExtension**: bundle ID `com.onesignal.example.OneSignalNotificationServiceExtensionCordova`, team `99SW8E36CT`, deployment target iOS 14.0
- **OneSignalWidgetExtension**: bundle ID `com.onesignal.example.OneSignalWidgetExtension`, team `99SW8E36CT`, deployment target iOS 16.2, `SUPPORTS_LIVE_ACTIVITIES = YES`

To add App Groups capability (shows up in Signing & Capabilities), select each target in Xcode and use **+ Capability > App Groups**, then add `group.com.onesignal.example.onesignal`. Do this for:
- `App`
- `OneSignalNotificationServiceExtension`

---

## 6. Install pods and sync

From `examples/demo`, run:

```sh
bun run ios:sync
cd ios/App && pod install
```

Then open `ios/App/App.xcworkspace` (not `.xcodeproj`) in Xcode.

If native config changes are not reflected, rerun `bun run ios:sync` and reinstall pods.
