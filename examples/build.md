# OneSignal Ionic + Capacitor Sample App Build Guide

This document defines how to build and maintain the demo at `examples/demo` as an Ionic + Capacitor project using this repository's local `onesignal-cordova-plugin`.

---

## Phase 0: Reference Screenshots (REQUIRED)

### Prompt 0.1 - Capture Reference UI

```bash
Before building anything, an Android emulator MUST be running with the
reference OneSignal demo app installed. These screenshots are the source
of truth for the UI you are building. Do NOT proceed to Phase 1 without them.

Check for connected emulators:
  adb devices

If no device is listed, stop and ask the user to start one.

Identify which emulator has com.onesignal.sdktest installed by checking each listed device, e.g.:
  adb -s emulator-5554 shell pm list packages 2>/dev/null | grep -i onesignal
  adb -s emulator-5556 shell pm list packages 2>/dev/null | grep -i onesignal

Use that emulator's serial (e.g. emulator-5556) for all subsequent adb commands via the -s flag.

Launch the reference app:
  adb -s <emulator-serial> shell am start -n com.onesignal.sdktest/.ui.main.MainActivity

Dismiss any in-app messages that appear on launch. Tap the X or
click-through button on each IAM until the main UI is fully visible
with no overlays.

Create an output directory:
  mkdir -p /tmp/onesignal_reference

Capture screenshots by scrolling through the full UI:
1. Take a screenshot from the top of the screen:
     adb shell screencap -p /sdcard/ref_01.png && adb pull /sdcard/ref_01.png /tmp/onesignal_reference/ref_01.png
2. Scroll down by roughly one viewport height:
     adb shell input swipe 500 1500 500 500
3. Take the next screenshot (ref_02.png, ref_03.png, etc.)
4. Repeat until you've reached the bottom of the scrollable content

You MUST read each captured screenshot image so you can see the actual UI.
These images define the visual target for every section you build later.
Pay close attention to:
  - Section header style and casing
  - Card vs non-card content grouping
  - Button placement (inside vs outside cards)
  - List item layout (stacked vs inline key-value)
  - Icon choices (delete, close, info, etc.)
  - Typography, spacing, and colors
  - Spacing: 12px gap between sections, 8px gap between cards/buttons within a section

You can also interact with the reference app to observe specific flows:

Dump the UI hierarchy to find elements by resource-id, text, or content-desc:
  adb shell uiautomator dump /sdcard/ui.xml && adb pull /sdcard/ui.xml /tmp/onesignal_reference/ui.xml

Parse the XML to find an element's bounds, then tap it:
  adb shell input tap <centerX> <centerY>

Type into a focused text field:
  adb shell input text "test"

Example flow to observe "Add Tag" behavior:
  1. Dump UI -> find the ADD button bounds -> tap it
  2. Dump UI -> find the Key and Value fields -> tap and type into them
  3. Tap the confirm button -> screenshot the result
  4. Compare the tag list state before and after

Also capture screenshots of key dialogs to match their layout:
  - Add Alias (single pair input)
  - Add Multiple Aliases/Tags (dynamic rows with add/remove)
  - Remove Selected Tags (checkbox multi-select)
  - Login User
  - Send Outcome (radio options)
  - Track Event (with JSON properties field)
  - Custom Notification (title + body)
These dialog screenshots are important for matching field layout,
button placement, spacing, and validation behavior.

Refer back to these screenshots throughout all remaining phases whenever
you need to decide on layout, spacing, section order, dialog flows, or
overall look and feel.
```

---

## Phase 1: Project Foundation

### Prompt 1.1 - Create the Ionic app shell

```bash
# from repo root
cd examples
npx @ionic/cli start demo blank --type=react --no-interactive
```

Requirements:

- Project path: `examples/demo`
- App type: Ionic React (blank)
- Keep source focused and lightweight
- Android package id: `com.onesignal.example`
- iOS bundle id: `com.onesignal.example`
- No Expo-specific setup in this project
- Web entry file: `examples/demo/index.html` (built output goes to `examples/demo/dist/index.html`)
- Do not use `examples/demo/www/index.html` in this Capacitor flow

A setup.sh script in examples/ handles building, packing, and installing automatically.
Add/verify the following scripts in package.json:
```
  "setup": "../setup.sh",
  "preandroid": "bun run setup",
  "preios": "bun run setup",
```

### Prompt 1.2 - Add platforms

```bash
cd examples/demo
npx ionic capacitor add android
npx ionic capacitor add ios
```

### Prompt 1.3 - Keep local plugin workflow

This repo already includes `examples/setup.sh` for local tarball packing and reinstall. Use it for every native test cycle.

Update `examples/demo/package.json` scripts to include:

```json
{
  "scripts": {
    "setup": "../setup.sh",
    "preandroid": "bun run setup",
    "preios": "bun run setup",
    "android": "npx ionic capacitor run android",
    "ios": "npx ionic capacitor run ios"
  }
}
```

Install or refresh the plugin from the packed tarball:

```bash
cd examples/demo
bun run setup
bun install
npx cap sync
```

---

## Phase 2: OneSignal Initialization

### Prompt 2.1 - Initialize on `deviceready`

Initialize OneSignal only after Cordova is ready. In Ionic React, this is usually done once from app startup code.

```ts
import OneSignal, { LogLevel } from 'onesignal-cordova-plugin';

const ONE_SIGNAL_APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

function initOneSignal() {
  document.addEventListener('deviceready', () => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(ONE_SIGNAL_APP_ID);
  });
}
```

### Prompt 2.2 - Register observers/listeners

Add observers after `initialize`:

```ts
OneSignal.InAppMessages.addEventListener('willDisplay', event => {
  console.log('IAM will display', event);
});
OneSignal.InAppMessages.addEventListener('didDisplay', event => {
  console.log('IAM did display', event);
});
OneSignal.InAppMessages.addEventListener('willDismiss', event => {
  console.log('IAM will dismiss', event);
});
OneSignal.InAppMessages.addEventListener('didDismiss', event => {
  console.log('IAM did dismiss', event);
});
OneSignal.InAppMessages.addEventListener('click', event => {
  console.log('IAM click', event);
});

OneSignal.Notifications.addEventListener('click', event => {
  console.log('Notification click', event);
});
OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
  console.log('Notification foreground', event);
});

OneSignal.Notifications.addEventListener('permissionChange', granted => {
  console.log('Permission changed', granted);
});
OneSignal.User.pushSubscription.addEventListener('change', state => {
  console.log('Push subscription changed', state);
});
OneSignal.User.addEventListener('change', state => {
  console.log('User changed', state);
});
```

Remove listeners in component cleanup where you attach them.

---

## Phase 3: App Architecture

Use the same high-level architecture as the React Native demo but adapted to Ionic React + Cordova runtime:

- `src/models/*` for API/domain types
- `src/services/*` for REST clients, storage, and utility services
- `src/repositories/OneSignalRepository.ts` for all SDK calls
- `src/context/*` for reducer-based state + actions
- `src/components/*` and `src/components/sections/*` for UI
- `src/screens/*` for page composition

Target behavior:

- Clean repository pattern
- React Context + reducer state management
- Strict TypeScript
- No `any` and no broad type assertions
- Keep dependencies minimal

---

## Phase 4: Repository API Surface

Create a `OneSignalRepository` class that wraps Cordova OneSignal APIs:

- User: `loginUser`, `logoutUser`
- Aliases: `addAlias`, `addAliases`
- Email: `addEmail`, `removeEmail`
- SMS: `addSms`, `removeSms`
- Tags: `addTag`, `addTags`, `removeTags`
- In-App triggers: `addTrigger`, `addTriggers`, `removeTriggers`, `clearTriggers`
- Outcomes: `sendOutcome`, `sendUniqueOutcome`, `sendOutcomeWithValue`
- Events: `trackEvent`
- Push subscription: `getPushSubscriptionId`, `isPushOptedIn`, `optInPush`, `optOutPush`
- Permission: `hasPermission`, `requestPermission`
- IAM: `setPaused`
- Location: `setLocationShared`, `requestLocationPermission`
- Privacy: `setConsentRequired`, `setConsentGiven`
- IDs: `getExternalId`, `getOnesignalId`

Map these methods directly to:

- `OneSignal.User.*`
- `OneSignal.Notifications.*`
- `OneSignal.InAppMessages.*`
- `OneSignal.Location.*`
- `OneSignal.Session.*`

---

## Phase 5: REST API Service

Create `OneSignalApiService` for server-side operations with `fetch`:

- `setAppId(appId: string): void`
- `getAppId(): string`
- `sendNotification(type, subscriptionId): Promise<boolean>`
- `sendCustomNotification(title, body, subscriptionId): Promise<boolean>`
- `fetchUser(onesignalId): Promise<UserData | null>`

Endpoints:

- POST `https://onesignal.com/api/v1/notifications`
- GET `https://api.onesignal.com/apps/{app_id}/users/by/onesignal_id/{onesignal_id}`

Notification request details:

- Use `include_subscription_ids`
- Add Android `big_picture` for image push
- Add iOS `ios_attachments` for image push

---

## Phase 6: UI Sections and Order

Render sections in this exact order:

1. App
2. Push
3. Send Push Notification
4. In-App Messaging
5. Send In-App Message
6. Aliases
7. Emails
8. SMS
9. Tags
10. Outcome Events
11. Triggers
12. Track Event
13. Location
14. Next Activity button

Functional expectations:

- Login/logout behavior mirrors the existing RN sample
- Push prompt auto-requests on first load and has fallback button
- IAM trigger buttons set `iam_type` and update in-memory trigger list
- Tags and triggers support add multiple and remove selected
- Track Event validates JSON before submit
- Lists show empty state text when no values exist

---

## Phase 7: Persistence and Runtime State

Persist with local storage service:

- OneSignal App ID
- Consent required
- Privacy consent
- External user id
- Location shared
- IAM paused state

In-memory only:

- Trigger list used for IAM testing
- Session UI state that should reset on app restart

Startup sequence:

1. Restore stored preferences
2. Apply consent settings
3. Initialize OneSignal
4. Re-apply IAM paused and location shared flags
5. Register observers
6. Fetch user data if `onesignalId` exists

---

## Phase 8: Tooltips and Logging

### Prompt 8.1 - Remote tooltip content

Do not bundle local tooltip JSON.

Use:

`https://raw.githubusercontent.com/OneSignal/sdk-shared/main/demo/tooltip_content.json`

### Prompt 8.2 - Log view

Add a compact log panel for local debugging and Appium:

- Fixed height
- Clear action
- Auto-scroll to newest
- Stable test ids on rows and controls

---

## Phase 9: Native Configuration Checklist

Update native app metadata and IDs:

- `capacitor.config.ts` app id: `com.onesignal.example`
- No legacy Cordova metadata file setup required

Ensure plugin and platforms are present:

```bash
cd examples/demo
npx cap ls
npm ls onesignal-cordova-plugin --depth=0
```

Expected plugin list includes:

- `onesignal-cordova-plugin`

---

## Phase 10: Build and Run

Use script-based commands so local plugin packaging always runs first:

```bash
cd examples/demo
bun run android
bun run ios
```

If native state becomes stale:

```bash
cd examples/demo
npx cordova platform rm android ios
npx cordova platform add android ios
```

---

## Reference API Snippets (Cordova)

```ts
// Push permission
const granted = await OneSignal.Notifications.requestPermission(true);

// Push opt state
const pushId = await OneSignal.User.pushSubscription.getIdAsync();
const optedIn = await OneSignal.User.pushSubscription.getOptedInAsync();

// Login and aliases
OneSignal.login('test-user-id');
OneSignal.User.addAlias('crm_user_id', '12345');
OneSignal.User.addAliases({ account_type: 'premium', region: 'us' });

// Tags
OneSignal.User.addTag('plan', 'pro');
OneSignal.User.addTags({ locale: 'en', cohort: 'beta' });
OneSignal.User.removeTags(['cohort']);

// IAM triggers
OneSignal.InAppMessages.addTrigger('iam_type', 'top_banner');
OneSignal.InAppMessages.removeTriggers(['iam_type']);
OneSignal.InAppMessages.clearTriggers();

// Outcomes
OneSignal.Session.addOutcome('opened_screen');
OneSignal.Session.addUniqueOutcome('purchased');
OneSignal.Session.addOutcomeWithValue('cart_value', 10.5);

// Location
OneSignal.Location.setShared(true);
OneSignal.Location.requestPermission();
```

---

## Completion Gate

All checks should pass before considering the demo complete:

- App starts with no runtime import or plugin errors
- `OneSignal.initialize` runs only after `deviceready`
- Login/logout, aliases, tags, emails, sms flows work
- Push permission and opt-in state react correctly
- IAM lifecycle and click listeners fire
- Outcome and track event actions work
- Tooltip fetch failure is non-blocking
- Android and iOS both build from the same codebase
