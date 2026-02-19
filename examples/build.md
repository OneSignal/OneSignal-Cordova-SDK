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
- App name: `OneSignal Demo`
- Keep source focused and lightweight
- Android package id: `com.onesignal.example`
- iOS bundle id: `com.onesignal.example`
- No Expo-specific setup in this project
- Web entry file: `examples/demo/index.html` (built output goes to `examples/demo/dist/index.html`)
- Do not use `examples/demo/www/index.html` in this Capacitor flow
- Do not add `cordova-android` or `cordova-ios` as demo app dependencies
- Do not add a `cordova.platforms` block in `examples/demo/package.json` for this Capacitor flow
- Use strict TypeScript and keep clean architecture (`repository + context/reducer`)
- Use OneSignal brand colors and shared theme tokens/styles
- Header should show OneSignal logo wordmark + separate `Sample App` label (centered)
- Dialogs should open with empty input fields by default (Appium enters values)
- Prefer separate component files per section to keep files focused/readable

Asset requirements:

- Download wordmark SVG:
  `https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/assets/onesignal_logo.svg`
- Save to demo assets and import the SVG component directly for header usage
- Do not inline long SVG path strings in component files
- Download padded app icon PNG:
  `https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/assets/onesignal_logo_icon_padded.png`
- Save it as the Capacitor source icon (for example `resources/icon.png`, 1024x1024)
- Generate platform icons using Capacitor assets:
  `bun add -d @capacitor/assets`
  `npx @capacitor/assets generate`
- Sync generated assets to native projects:
  `npx cap sync`

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
    "android": "ionic cap run android -l --external",
    "ios": "ionic cap run ios -l --external"
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

## Phase 2: OneSignal Initialization (Ionic + Capacitor)

### Prompt 2.1 - Initialize on native app startup

Initialize OneSignal only on native platforms and only after the native bridge is ready. In this Ionic React + Capacitor app, run initialization once from startup code.

```ts
import { Capacitor } from '@capacitor/core';
import OneSignal, { LogLevel } from 'onesignal-cordova-plugin';

const ONE_SIGNAL_APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

function initOneSignal() {
  const start = () => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(ONE_SIGNAL_APP_ID);
  };

  if (!Capacitor.isNativePlatform()) return;

  // Cordova-bridge plugins in Capacitor are safe after deviceready when available.
  if ('cordova' in window) {
    document.addEventListener('deviceready', start, { once: true });
    return;
  }

  start();
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

Use the same high-level architecture as the React Native demo but adapted to Ionic React + Capacitor runtime:

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

### Prompt 3.1 - Implementation order (required)

Do not implement the full demo directly in `src/pages/Home.tsx`.

Build in this order:

1. `src/repositories/OneSignalRepository.ts`
2. `src/services/PreferencesService.ts`
3. `src/context/AppContext.tsx` (state, reducer, actions, startup effects)
4. `src/pages/Home.tsx` as presentational + dialog UI that calls context actions

Rules:

- `Home.tsx` should not call `OneSignal.*` directly
- `Home.tsx` should not own core app state for push, consent, aliases, tags, triggers, or identity
- Keep modal open/close and temporary form fields local to UI when practical
- Put SDK logic in repository methods and context actions

---

## Phase 4: Repository API Surface

Create a `OneSignalRepository` class that wraps OneSignal APIs used by the Ionic + Capacitor app:

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

Repository behavior requirements:

- No UI logic and no component state
- Return typed values for async reads (`getPushSubscriptionId`, `isPushOptedIn`, IDs)
- Guard native-only calls to avoid web runtime crashes

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

Implementation notes:

- Add a small `PreferencesService` in `src/services/PreferencesService.ts`
- `AppContext` owns hydration from storage, initialization, observers, and dispatching updates
- `Home.tsx` reads context state and invokes context actions only

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

### Prompt 8.1 - State Management with Context + Reducer

Use React Context for dependency injection and `useReducer` for app state management.

App root (`src/App.tsx`):

- Wrap the routed app with `AppContextProvider`
- Initialize OneSignal from context startup effects before user actions are available
- Start tooltip fetch in the background (non-blocking) so UI is still usable if the request fails

`AppContextProvider` (`src/context/AppContext.tsx`):

- Holds shared runtime state in a reducer
- Exposes state + action functions through `useAppContext`
- Uses `OneSignalRepository` and `PreferencesService` internally
- Owns observer lifecycle and startup hydration effects

### Prompt 8.2 - Reusable Components

Create reusable components in `src/components/` for Ionic + React:

- `SectionCard.tsx`: section title, optional info button, children slot
- `ToggleRow.tsx`: label, optional description, and toggle control
- `ActionButton.tsx`: primary and outline variants, full width
- `ListWidgets.tsx`: pair item, single item, empty state, and list wrappers
- `LogView.tsx`: sticky/collapsible log panel with Appium-friendly `data-testid` labels
- `modals/*`: modal components shared by multiple sections

Guidelines:

- Keep section spacing and card spacing consistent with the screenshot rules (12px section gap, 8px inner gap)
- Use shared props and styles to avoid repeated per-section JSX/CSS
- Keep optional one-off UI state local to components (for example, modal open state and temporary input values)

### Prompt 8.3 - Reusable Multi-Pair Modal

Aliases, Tags, and Triggers should share a reusable multi-pair modal.

Behavior:

- Opens full-width (content constrained with page padding)
- Starts with one empty key/value row
- "Add Row" adds another row
- Row remove control hidden when only one row remains
- "Add All" disabled until all fields are filled
- Submits a `Record<string, string>` payload for bulk actions

Used by:

- Aliases -> `addAliases`
- Tags -> `addTags`
- Triggers -> `addTriggers`

### Prompt 8.4 - Reusable Remove Multi Modal

Tags and Triggers should share a reusable remove-selected modal.

Behavior:

- Accepts current items as `[string, string][]`
- Displays checkbox rows using key label
- Allows zero or more selections
- Confirm button label includes count (`Remove (N)`) and is disabled when `N = 0`
- Returns selected keys as `string[]`

Used by:

- Tags -> `removeSelectedTags`
- Triggers -> `removeSelectedTriggers` (or equivalent clear/remove action)

### Prompt 8.5 - Theme and Tokens

Create shared theme tokens (for example in `src/theme/tokens.ts` or `src/theme.ts`):

- Primary red (`#E54B4D` or app-approved equivalent)
- Background, card, divider, warning colors
- Typography sizes/weights for headers, labels, and row values
- Spacing constants (`sectionGap = 12`, `cardGap = 8`)
- Card radius and button radius tokens

Apply these tokens consistently across all sections and dialogs.

### Prompt 8.6 - Remote tooltip content

Do not bundle local tooltip JSON.

Use:

`https://raw.githubusercontent.com/OneSignal/sdk-shared/main/demo/tooltip_content.json`

### Prompt 8.7 - Log View (Appium-Ready)

Add a collapsible log view at the top of the screen for debugging and Appium.

Suggested files:

- `src/services/LogManager.ts` - singleton logger with subscribers
- `src/components/LogView.tsx` - sticky log component

Log view requirements:

- Sticky near top while content scrolls below
- Fixed height (`~100px`)
- Clear control (icon button)
- Auto-scroll to newest entry
- Uses shared logger stream + console forwarding (`debug/info/warn/error`)

Appium labels (use `data-testid` in web/Ionic):

| data-testid              | Description                    |
|--------------------------|--------------------------------|
| `log_view_container`     | Main log container             |
| `log_view_header`        | Expand/collapse row            |
| `log_view_count`         | Log count text                 |
| `log_view_clear_button`  | Clear logs button              |
| `log_view_list`          | Scrollable log list            |
| `log_view_empty`         | Empty-state row                |
| `log_entry_{N}`          | Log row container              |
| `log_entry_{N}_timestamp`| Timestamp text                 |
| `log_entry_{N}_level`    | Level badge/text               |
| `log_entry_{N}_message`  | Log message text               |

### Prompt 8.8 - User Feedback

Show user feedback for important actions using Ionic-friendly UI (for example `IonToast` + inline validation text).

Expected feedback coverage:

- Login/logout
- Alias/tag/trigger/email/SMS add/remove
- Notification action success/failure
- IAM trigger actions
- Outcome and track event actions
- Push and location toggle/permission actions

---

## Phase 9: Native Configuration Checklist

Update native app metadata and IDs:

- `capacitor.config.ts` app id: `com.onesignal.example`
- Keep native projects generated through Capacitor (`android/` and `ios/`)

Ensure plugin and platforms are present:

```bash
cd examples/demo
npx cap ls
npm ls onesignal-cordova-plugin --depth=0
npx cap doctor
```

Expected plugin list includes:

- `onesignal-cordova-plugin`

iOS plugin and notification checklist:

- Add to iOS `Info.plist`:
  `<key>UIBackgroundModes</key>` with `<string>remote-notification</string>`
- If `npx cap sync ios` warns about `Package.swift` under
  `ios/capacitor-cordova-ios-plugins/sources/OnesignalCordovaPlugin`,
  re-run:
  `bun run setup`
  `bun install`
  `npx cap sync`

---

## Phase 10: Build and Run

Use script-based commands so local plugin packaging always runs first:

```bash
cd examples/demo
bun run android
bun run ios
```

These scripts run with live reload (`-l`) and external host binding (`--external`).

If native state becomes stale:

```bash
cd examples/demo
bun run setup
bun install
npx cap sync
```

If native projects need to be regenerated from scratch:

```bash
cd examples/demo
rm -rf android ios
npx cap add android
npx cap add ios
bun run setup
bun install
npx cap sync
```

---

## Reference API Snippets (Ionic + Capacitor Native)

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
- `OneSignal.initialize` runs only on native and only after bridge-ready startup
- Login/logout, aliases, tags, emails, sms flows work
- Push permission and opt-in state react correctly
- IAM lifecycle and click listeners fire
- Outcome and track event actions work
- Tooltip fetch failure is non-blocking
- Android and iOS both build from the same codebase
