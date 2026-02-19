# OneSignal Ionic + Capacitor Sample App Build Guide

This guide defines how to build and maintain `examples/demo` as an Ionic React + Capacitor app using this repo's local `onesignal-cordova-plugin`.

---

## Phase 0: Reference Screenshots (REQUIRED)

### Prompt 0.1 - Capture Reference UI

Before building anything, an Android emulator MUST be running with the
reference OneSignal demo app installed. These screenshots are the source
of truth for the UI you are building. Do NOT proceed to Phase 1 without them.

```bash
Check for connected emulators:
adb devices

If no device is listed, stop and ask the user to start one.

Identify which emulator has com.onesignal.sdktest installed by checking each listed device, e.g.:
adb -s emulator-5554 shell pm list packages 2>/dev/null | grep -i onesignal
adb -s emulator-5556 shell pm list packages 2>/dev/null | grep -i onesignal

Use that emulator's serial (e.g. emulator-5556) for all subsequent adb commands via the -s flag.

Launch the reference app:
adb -s <emulator-serial> shell pm list packages 2>/dev/null | grep -i onesignal
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
```

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

---

## Phase 1: Initial Setup

### Prompt 1.1 - Project Foundation

```bash
cd examples
npx @ionic/cli start demo blank --type=react --no-interactive
```

Requirements:

- Path: `examples/demo`
- App name: `OneSignal Demo`
- Android id: `com.onesignal.example`
- iOS bundle id: `com.onesignal.example`
- Keep dependencies minimal to reduce bundle size
- Build with clean architecture: repository pattern + React Context + reducer state
- TypeScript strict mode enabled
- OneSignal brand colors with consistent token-based styling
- Top header (app bar) is fixed/sticky, uses standard 56dp toolbar height (+ safe-area top inset), and shows OneSignal logo wordmark plus separate `Sample App` text
- Logs panel is fixed/sticky directly below the app bar
- Support both Android and iOS native targets
- Dialogs should open with EMPTY input fields for Appium entry
- Prefer separate component files per section to keep files focused

Asset requirements:

- Download app bar logo SVG:
  `https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/assets/onesignal_logo.svg`
- Save to demo assets (for example `src/assets/onesignal_logo.svg`) and render it in the header component used by this demo (`src/pages/Home.tsx`) via import:
  `import OneSignalLogo from '../assets/onesignal_logo.svg';`
- Use the logo as the `OneSignal` wordmark and show separate `Sample App` text
- Do not inline long SVG paths in `Home.tsx`/header JSX

- Download padded icon PNG:
  `https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/assets/onesignal_logo_icon_padded.png`
- Save as Capacitor icon source (for example `resources/icon.png`, 1024x1024)
- Generate platform icons using Capacitor tooling (not RN script):
  `bun add -d @capacitor/assets`
  `npx @capacitor/assets generate`
  `npx cap sync`

Local plugin setup requirement:

- Reference local plugin tarball through `examples/setup.sh` workflow
- Ensure package scripts include:

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

### Prompt 1.2 - Dependencies (package.json)

Use local plugin setup and live-reload scripts:

Required runtime dependencies:

- Capacitor core/native packages:
  - `@capacitor/core`
  - `@capacitor/android`
  - `@capacitor/ios`
  - `@capacitor/app`
  - `@capacitor/haptics`
  - `@capacitor/keyboard`
  - `@capacitor/status-bar`
- Ionic/UI packages:
  - `@ionic/react`
  - `@ionic/react-router`
  - `react-icons` (use Material icons from `react-icons/md`, for example in `src/components/LogView.tsx`)
- React/router packages used by the demo:
  - `react`
  - `react-dom`
  - `react-router`
  - `react-router-dom`
  - `@types/react-router`
  - `@types/react-router-dom`

Required dev dependencies:

- Capacitor CLI and assets:
  - `@capacitor/cli`
  - `@capacitor/assets`
- Local plugin tarball:
  - `onesignal-cordova-plugin` as `file:../../onesignal-cordova-plugin.tgz`
- Build toolchain:
  - `typescript`
  - `vite`
  - `@vitejs/plugin-react`
  - `@vitejs/plugin-legacy`
  - `terser`

Keep dependencies minimal and avoid adding test dependencies for this demo app unless explicitly needed.

Do not add `cordova-android`, `cordova-ios`, or `cordova.platforms` to this Capacitor demo.

### Prompt 1.3 - Native Setup and Build Flow

```bash
cd examples/demo
npx ionic capacitor add android
npx ionic capacitor add ios
bun run setup
bun install
npx cap sync
bun run android
bun run ios
```

If iOS sync reports `Package.swift`/SPM issues, regenerate native projects and rerun setup/sync.

### Prompt 1.4 - OneSignal Repository

Create a `OneSignalRepository` class that centralizes all OneSignal SDK calls.
This is a plain TypeScript class (not a Context) used inside `AppContextProvider`.

User operations:

- `loginUser(externalUserId: string): Promise<void>`
- `logoutUser(): Promise<void>`

Alias operations:

- `addAlias(label: string, id: string): void`
- `addAliases(aliases: Record<string, string>): void`

Email operations:

- `addEmail(email: string): void`
- `removeEmail(email: string): void`

SMS operations:

- `addSms(smsNumber: string): void`
- `removeSms(smsNumber: string): void`

Tag operations:

- `addTag(key: string, value: string): void`
- `addTags(tags: Record<string, string>): void`
- `removeTags(keys: string[]): void`

Trigger operations (via `OneSignal.InAppMessages`):

- `addTrigger(key: string, value: string): void`
- `addTriggers(triggers: Record<string, string>): void`
- `removeTriggers(keys: string[]): void`
- `clearTriggers(): void`

Outcome operations (via `OneSignal.Session`):

- `sendOutcome(name: string): void`
- `sendUniqueOutcome(name: string): void`
- `sendOutcomeWithValue(name: string, value: number): void`

Track Event:

- `trackEvent(name: string, properties?: Record<string, unknown>): void`

Push subscription:

- `getPushSubscriptionId(): string | undefined`
- `isPushOptedIn(): boolean | undefined`
- `optInPush(): void`
- `optOutPush(): void`

Notifications:

- `hasPermission(): boolean`
- `requestPermission(fallbackToSettings: boolean): Promise<boolean>`

In-App Messages:

- `setPaused(paused: boolean): void`

Location:

- `setLocationShared(shared: boolean): void`
- `requestLocationPermission(): void`

Privacy consent:

- `setConsentRequired(required: boolean): void`
- `setConsentGiven(granted: boolean): void`

User IDs:

- `getExternalId(): string | undefined`
- `getOnesignalId(): string | undefined`

Notification sending (via REST API, delegated to `OneSignalApiService`):

- `sendNotification(type: NotificationType): Promise<boolean>`
- `sendCustomNotification(title: string, body: string): Promise<boolean>`
- `fetchUser(onesignalId: string): Promise<UserData | null>`

### Prompt 1.5 - OneSignalApiService (REST API Client)

Create `src/services/OneSignalApiService.ts` class for REST API calls using built-in `fetch`.

Properties:

- `_appId: string` (set during app initialization and updated when user changes app id)

Methods:

- `setAppId(appId: string): void`
- `getAppId(): string`
- `sendNotification(type: NotificationType, subscriptionId: string): Promise<boolean>`
- `sendCustomNotification(title: string, body: string, subscriptionId: string): Promise<boolean>`
- `fetchUser(onesignalId: string): Promise<UserData | null>`

`sendNotification` endpoint requirements:

- `POST https://onesignal.com/api/v1/notifications`
- Set `Accept: application/vnd.onesignal.v1+json`
- Use `include_subscription_ids` (not `include_player_ids`)
- Include `big_picture` for Android image push support
- Include `ios_attachments` for iOS image push support

`fetchUser` endpoint requirements:

- `GET https://api.onesignal.com/apps/{app_id}/users/by/onesignal_id/{onesignal_id}`
- No Authorization header required for this endpoint
- Map response into typed `UserData` (`aliases`, `tags`, `emails`, `smsNumbers`, `externalId`)

Implementation notes:

- Keep this service UI-agnostic (no component state, no toast/log side effects)
- Return `false`/`null` on network failure and let context/UI decide user feedback
- Keep request body construction in this layer so components remain thin

### Prompt 1.6 - SDK Observers

In startup flow (`App.tsx` or `AppContext` initialization effect), initialize OneSignal before rendering interactive UI:

- `OneSignal.Debug.setLogLevel(LogLevel.Verbose)`
- `OneSignal.setConsentRequired(cachedConsentRequired)`
- `OneSignal.setConsentGiven(cachedPrivacyConsent)`
- `OneSignal.initialize(appId)`

Then register IAM and notification listeners:

- `OneSignal.InAppMessages.addEventListener('willDisplay', handler)`
- `OneSignal.InAppMessages.addEventListener('didDisplay', handler)`
- `OneSignal.InAppMessages.addEventListener('willDismiss', handler)`
- `OneSignal.InAppMessages.addEventListener('didDismiss', handler)`
- `OneSignal.InAppMessages.addEventListener('click', handler)`
- `OneSignal.Notifications.addEventListener('click', handler)`
- `OneSignal.Notifications.addEventListener('foregroundWillDisplay', handler)`

After initialization, restore cached SDK runtime states from preferences:

- `OneSignal.InAppMessages.setPaused(cachedPausedStatus)`
- `OneSignal.Location.setShared(cachedLocationShared)`

In `AppContextProvider`, register observers for state synchronization:

- `OneSignal.User.pushSubscription.addEventListener('change', handler)` to react to push subscription changes
- `OneSignal.Notifications.addEventListener('permissionChange', handler)` to react to permission changes
- `OneSignal.User.addEventListener('change', handler)` to trigger `fetchUserDataFromApi()` when user identity changes

Always remove listeners in cleanup (`useEffect` return):

- `OneSignal.User.pushSubscription.removeEventListener('change', handler)`
- `OneSignal.Notifications.removeEventListener('permissionChange', handler)`
- `OneSignal.User.removeEventListener('change', handler)`

Ionic + Capacitor notes:

- Gate all of this behind `Capacitor.isNativePlatform()` so web builds stay safe
- If running through Cordova bridge compatibility, wait for `deviceready` before calling initialize

---

## Phase 2: UI Sections

### Section Order (top to bottom)

1. **App Section** (App ID input, guidance text, consent required toggle, logged-in state, login/logout actions)
2. **Push Section** (Push subscription ID, push enabled toggle, permission state, auto-prompt on startup)
3. **Send Push Notification Section** (Simple, With Image, and Custom notification actions)
4. **In-App Messaging Section** (IAM paused toggle and lifecycle log visibility)
5. **Send In-App Message Section** (Top Banner, Bottom Banner, Center Modal, Full Screen trigger actions)
6. **Aliases Section** (Add, Add Multiple, Remove, read-only key/value list)
7. **Emails Section** (Add/Remove with list display, collapsible behavior for longer lists)
8. **SMS Section** (Add/Remove with list display, collapsible behavior for longer lists)
9. **Tags Section** (Add, Add Multiple, Remove Selected)
10. **Outcome Events Section** (Send Outcome flow with outcome type selection)
11. **Triggers Section** (Add, Add Multiple, Remove Selected, Clear All - IN MEMORY ONLY)
12. **Track Event Section** (Track event with JSON validation for properties)
13. **Location Section** (Location Shared toggle and Prompt Location action)
14. **Next Page/Activity Button**

### Prompt 2.1 - App Section

App Section layout:

1. App ID display/input near top of section.
2. Guidance banner directly below App ID:
   - Text: `Add your own App ID, then rebuild to fully test all functionality.`
   - Link text: `Get your keys at onesignal.com`
   - Use a light background style so it stands out.
3. Consent card with up to two toggles:
   - `Consent Required` toggle is always visible and updates `setConsentRequired`.
   - `Privacy Consent` toggle is only visible when Consent Required is ON and updates `setConsentGiven`.
   - Use a divider between the two rows.
   - This is non-blocking UI; user can still interact with the app.
4. User status card shown above auth buttons:
   - Row 1: `Status` label + value (`Anonymous` or `Logged In`)
   - Row 2: `External ID` label + value (`-` when logged out)
5. `LOGIN USER` button:
   - Label changes to `SWITCH USER` when already logged in
   - Opens modal with empty `External User Id` input
6. `LOGOUT USER` button visible only when logged in.

### Prompt 2.2 - Push Section

Push Section:

- Section title includes info icon (use `MdInfoOutline` from `react-icons/md`).
- Show Push Subscription ID (read-only).
- `Push Enabled` toggle controls opt-in/opt-out.
  - Toggle is disabled when notification permission is not granted.
- Notification permission is auto-requested on home load.
- `PROMPT PUSH` fallback button:
  - Only visible when permission is not granted
  - Hidden once permission is granted

### Prompt 2.3 - Send Push Notification Section

Send Push Notification Section:

- Section title includes info icon (use `MdInfoOutline` from `react-icons/md`).
- Three actions:
  1. `SIMPLE` -> title: `Simple Notification`, body: `This is a simple push notification`
  2. `WITH IMAGE` -> title: `Image Notification`, body: `This notification includes an image`
  3. `CUSTOM` (opens modal for custom title/body)
- Image payload should use:
  - `big_picture` for Android: `https://media.onesignal.com/automated_push_templates/ratings_template.png`
  - `ios_attachments` for iOS: `{"image":"https://media.onesignal.com/automated_push_templates/ratings_template.png"}`
- Tooltip should describe each action type.

### Prompt 2.4 - In-App Messaging Section

In-App Messaging Section:

- Section title includes info icon (use `MdInfoOutline` from `react-icons/md`).
- `Pause In-App Messages` toggle:
  - Label: `Pause In-App Messages`
  - Description: `Toggle in-app message display`

### Prompt 2.5 - Send In-App Message Section

Send In-App Message Section:

- Section title includes info icon (use `MdInfoOutline` from `react-icons/md`).
- Four full-width buttons (stacked, not grid):
  1. `TOP BANNER` -> `iam_type = top_banner`
  2. `BOTTOM BANNER` -> `iam_type = bottom_banner`
  3. `CENTER MODAL` -> `iam_type = center_modal`
  4. `FULL SCREEN` -> `iam_type = full_screen`
- Button behavior:
  - Full width, uppercase labels
  - Left-aligned icon + text content using icons from `react-icons/md`
  - Uses app primary color styling
- On tap:
  - Add/update trigger in SDK
  - Upsert `iam_type` in the in-memory triggers list immediately
  - Show user feedback toast with selected IAM type
- Tooltip should explain each IAM type.

### Prompt 2.6 - Aliases Section

Aliases Section:

- Section title includes info icon (use `MdInfoOutline` from `react-icons/md`).
- Read-only key/value list.
- Hide special alias keys from display:
  - `external_id`
  - `onesignal_id`
- Empty state text: `No Aliases Added`.
- `ADD` opens single pair modal with empty fields.
- `ADD MULTIPLE` opens dynamic multi-row modal.

### Prompt 2.7 - Emails Section

Emails Section:

- Section title includes info icon (use `MdInfoOutline` from `react-icons/md`).
- List email values with remove action per row.
- Empty state text: `No Emails Added`.
- `ADD EMAIL` opens modal with empty field.
- Collapse behavior for long lists:
  - Show first 5 items by default
  - Show expandable `X more` affordance for remaining items

### Prompt 2.8 - SMS Section

SMS Section:

- Section title includes info icon (use `MdInfoOutline` from `react-icons/md`).
- List phone numbers with remove action per row.
- Empty state text: `No SMS Added`.
- `ADD SMS` opens modal with empty field.
- Same long-list collapse behavior as Emails.

### Prompt 2.9 - Tags Section

Tags Section:

- Section title includes info icon (use `MdInfoOutline` from `react-icons/md`).
- Show key/value entries in stacked layout (key over value).
- Per-row remove action available.
- Empty state text: `No Tags Added`.
- `ADD` opens single pair modal with empty fields.
- `ADD MULTIPLE` opens dynamic multi-row modal.
- `REMOVE SELECTED`:
  - Visible only when tags exist
  - Opens checkbox multi-select remove modal

### Prompt 2.10 - Outcome Events Section

Outcome Events Section:

- Section title includes info icon (use `MdInfoOutline` from `react-icons/md`).
- `SEND OUTCOME` opens modal with 3 choices:
  1. Normal Outcome (name input)
  2. Unique Outcome (name input)
  3. Outcome with Value (name + numeric value input)

### Prompt 2.11 - Triggers Section (IN MEMORY ONLY)

Triggers Section:

- Section title includes info icon (use `MdInfoOutline` from `react-icons/md`).
- Show key/value entries in stacked layout with row remove action.
- Empty state text: `No Triggers Added`.
- `ADD` and `ADD MULTIPLE` use the same modal patterns as Tags.
- Action buttons (only when triggers exist):
  - `REMOVE SELECTED` (checkbox multi-select modal)
  - `CLEAR ALL`

Important behavior:

- Triggers are stored in memory only for current app session.
- `triggersList` is session state and should not be persisted.
- Sending IAM actions should upsert `iam_type` in the same trigger list.
- Triggers reset when app restarts.

### Prompt 2.12 - Track Event Section

Track Event Section:

- Section title includes info icon (use `MdInfoOutline` from `react-icons/md`).
- `TRACK EVENT` opens modal with:
  - Required Event Name input
  - Optional JSON properties input with placeholder example
- Validation rules:
  - Name is required
  - If properties is non-empty, it must be valid JSON
  - Submit action disabled until form is valid

### Prompt 2.13 - Location Section

Location Section:

- Section title includes info icon (use `MdInfoOutline` from `react-icons/md`).
- `Location Shared` toggle with descriptive subtitle.
- `PROMPT LOCATION` button requests location permission.

### Prompt 2.14 - Secondary Screen

Secondary Screen behavior (opened from `Next Activity` button):

- Header title: `Secondary Activity`
- Screen body: centered text `Secondary Activity`
- Keep this screen intentionally simple (no extra logic).

---

## Phase 3: View User API Integration

### Prompt 3.1 - Data Loading Flow

Loading indicator behavior:

- Show a full-screen loading overlay while user data is being hydrated.
- Drive overlay visibility via `isLoading` in app context state.
- Use an absolute/fixed overlay with a centered Ionic spinner (`IonSpinner`).
- Add a small delay before hiding loading (100ms) after data is committed:
  - lets list sections render before overlay is dismissed
  - use `await new Promise(resolve => setTimeout(resolve, 100))`

Cold start flow:

- Read `onesignalId` from repository (`getOnesignalId`).
- If `onesignalId` exists:
  - set loading true
  - call `fetchUserDataFromApi()`
  - map response into reducer state (`aliases`, `tags`, `emails`, `sms`, `externalId`)
  - wait 100ms
  - set loading false
- If `onesignalId` is missing:
  - keep lists in empty state
  - skip loading overlay for API fetch

Login flow (`LOGIN USER` / `SWITCH USER`):

- Set loading true immediately.
- Call repository login method with external user id.
- Clear stale user lists (`aliases`, `emails`, `sms`, and trigger UI list) before repopulation.
- Wait for user change observer callback.
- In user change observer, call `fetchUserDataFromApi()`, then apply 100ms delay, then hide loading.

Logout flow:

- Set loading true.
- Call repository logout method.
- Clear local lists/state (`aliases`, `tags`, `emails`, `sms`, triggers, external id display state).
- Set loading false.

On user change callback:

- Trigger `fetchUserDataFromApi()` to sync server-side profile state.
- Update reducer state with latest aliases/tags/emails/sms/external id.
- Keep failures non-blocking and log errors to `LogManager`.

Note:

- REST API key is not required for the `fetchUser` endpoint used here.

### Prompt 3.2 - UserData Model

- `aliases: Record<string, string>`
- `tags: Record<string, string>`
- `emails: string[]`
- `smsNumbers: string[]`
- `externalId: string | null`

---

## Phase 4: Info Tooltips

### Prompt 4.1 - Tooltip Content (Remote)

Tooltip content is fetched at runtime from the `sdk-shared` repo. Do not bundle a local copy.

`https://raw.githubusercontent.com/OneSignal/sdk-shared/main/demo/tooltip_content.json`

This file is maintained in `sdk-shared` and shared across platform demo apps.

### Prompt 4.2 - Tooltip Helper

Create `src/services/TooltipHelper.ts`:

```ts
interface TooltipOption {
  name: string;
  description: string;
}

interface TooltipData {
  title: string;
  description: string;
  options?: TooltipOption[];
}

class TooltipHelper {
  private static instance: TooltipHelper;
  private tooltips: Record<string, TooltipData> = {};
  private initialized = false;

  private static readonly TOOLTIP_URL =
    'https://raw.githubusercontent.com/OneSignal/sdk-shared/main/demo/tooltip_content.json';

  static getInstance(): TooltipHelper {
    if (!TooltipHelper.instance) {
      TooltipHelper.instance = new TooltipHelper();
    }
    return TooltipHelper.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      // Fetch TOOLTIP_URL and parse JSON into tooltips map.
      // On failure, keep map empty (tooltips are non-critical).
    } catch (_) {
      // Non-blocking by design.
    }
    this.initialized = true;
  }

  getTooltip(key: string): TooltipData | undefined {
    return this.tooltips[key];
  }
}
```

### Prompt 4.3 - Tooltip UI Integration

For each section, pass `onInfoTap` to `SectionCard`:

- `SectionCard` shows optional info icon and invokes `onInfoTap`
- In `Home.tsx`, wire `onInfoTap` to open a reusable `TooltipModal`
- `TooltipModal` renders `title`, `description`, and `options` (if present)

Example wiring:

```ts
function showTooltipModal(key: string): void {
  const tooltip = TooltipHelper.getInstance().getTooltip(key);
  if (tooltip) {
    setActiveTooltip(tooltip);
    setTooltipVisible(true);
  }
}
```

If no tooltip exists for a key, do nothing (no crash, no blocking).

---

## Phase 5: Data Persistence & Initialization

### What IS Persisted (localStorage)

app id, consent required, consent given, external user id, location shared, IAM paused.

### Initialization Flow

1. Hydrate persisted settings
2. Apply consent settings
3. Initialize OneSignal (native only)
4. Re-apply IAM/location state
5. Register observers
6. Hydrate View User data when id exists

### What is NOT Persisted (In-Memory Only)

Trigger list, temporary modal values, ephemeral UI state.

---

## Phase 6: Testing Values (Appium Compatibility)

All modal input fields must be empty by default.
The Appium automation flow enters the following values:

- Login modal: External User Id = `test`
- Add Alias modal: Key = `Test`, Value = `Value`
- Add Multiple Aliases modal: Key = `Test`, Value = `Value` (first row; supports multiple rows)
- Add Email modal: Email = `test@onesignal.com`
- Add SMS modal: SMS = `123-456-5678`
- Add Tag modal: Key = `Test`, Value = `Value`
- Add Multiple Tags modal: Key = `Test`, Value = `Value` (first row; supports multiple rows)
- Add Trigger modal: Key = `trigger_key`, Value = `trigger_value`
- Add Multiple Triggers modal: Key = `trigger_key`, Value = `trigger_value` (first row; supports multiple rows)
- Outcome modal: Name = `test_outcome`, Value = `1.5`
- Track Event modal: Name = `test_event`, Properties = `{"key": "value"}`
- Custom Notification modal: Title = `Test Title`, Body = `Test Body`

Additional Appium compatibility requirements:

- Explicit empty-state labels (for example `No Aliases Added`, `No Tags Added`)
- Stable `data-testid` usage for key controls and log rows
- No random values in primary form fields
- Stable labels and section ordering

---

## Phase 7: Important Implementation Details

### Alias Management

Aliases use a hybrid sync model:

1. On app start/login, hydrate from REST API via `fetchUserDataFromApi()`.
2. When alias is added locally:
   - Call `OneSignal.User.addAlias(label, id)` via repository.
   - Immediately upsert in local aliases state without waiting for network round-trip.
   - This keeps UI responsive while SDK sync happens in background.
3. On next launch/session refresh, API hydration includes the server-synced values.

### Notification Permission

Notification permission should be requested on first home load:

- Trigger `promptPush()` once in a startup `useEffect`.
- Keep `PROMPT PUSH` button as fallback when permission is denied.
- Hide fallback button once permission is granted.
- Keep Push `Enabled` toggle disabled until permission is granted.
- Model permission and opt-in independently in state.

### Startup Safety

Guard SDK calls by native platform and keep web runtime from crashing.

---

## Phase 8: Ionic + Capacitor Architecture

### Prompt 8.1 - State Management with Context + Reducer

Use React Context for dependency injection and `useReducer` for state management.

`App.tsx` responsibilities:

- Wrap app routes with `AppContextProvider`.
- Start SDK initialization flow before user interaction paths are available.
- Start tooltip fetch in background (non-blocking).

`AppContextProvider` responsibilities:

- Own all shared runtime state in reducer.
- Expose state and actions through `useAppContext`.
- Use `OneSignalRepository` and `PreferencesService` internally.
- Own observer lifecycle and startup hydration.
- Keep UI components free from direct SDK calls.

### Prompt 8.2 - Reusable Components

Create reusable components in `src/components/`:

`SectionCard.tsx`:

- Section wrapper with title and optional info action.
- Children slot for section content.
- Consistent spacing/padding driven by theme tokens.

`ToggleRow.tsx`:

- Label + optional description + Ionic toggle control.
- Consistent row alignment and spacing.

`ActionButton.tsx`:

- Primary and outline/destructive variants.
- Full-width actions for section consistency.

`ListWidgets.tsx`:

- Pair rows (key/value) with optional remove action.
- Single-value rows with optional remove action.
- Empty state and collapsible list helpers.

`LoadingOverlay.tsx`:

- Full-screen semi-transparent overlay.
- Centered `IonSpinner`.
- Controlled by `isLoading` from app context.

`LogView.tsx`:

- Sticky top debug panel with fixed height.
- Clear button uses icon button style with icons from `react-icons/md`.
- Auto-scroll to newest entries.

`components/modals/*`:

- Shared shells and focused modal components:
  - `SingleInputModal`
  - `PairInputModal`
  - `MultiPairInputModal`
  - `MultiSelectRemoveModal`
  - `OutcomeModal`
  - `TrackEventModal`
  - `CustomNotificationModal`
  - `TooltipModal`

### Prompt 8.3 - Reusable Multi-Pair Modal

Tags, Aliases, and Triggers should share one `MultiPairInputModal`.

Behavior:

- Opens full width with page padding.
- Starts with one empty key/value row.
- Supports add/remove row actions.
- Hide row remove action when only one row remains.
- Validate all rows on every change.
- Disable `Add All` until every key/value is filled.
- Submit batched `Record<string, string>` for:
  - `addAliases`
  - `addTags`
  - `addTriggers`

### Prompt 8.4 - Reusable Remove Multi Modal

Tags and Triggers share one `MultiSelectRemoveModal`.

Behavior:

- Accept current items as `[string, string][]`.
- Show a checkbox row per key.
- Allow 0..N selections.
- Confirm button label includes count: `Remove (N)`.
- Confirm button is disabled when `N = 0`.
- Return selected keys as `string[]`.

### Prompt 8.5 - Theme

Define shared tokens in `src/theme/tokens.ts` and apply consistently.

Colors:

- primary red: `#E54B4D`
- success green and subtle success background
- neutral backgrounds/cards/dividers
- warning background

Spacing:

- `cardGap = 8` (inside section)
- `sectionGap = 12` (between sections)

Also define:

- shared radii for cards/buttons
- typography scale for titles/labels/values
- reusable style primitives used by section/components

### Prompt 8.6 - Log View (Appium-Ready)

Add a collapsible log view at the top for debugging and Appium.

Files:

- `src/services/LogManager.ts` (singleton logger + subscribers)
- `src/components/LogView.tsx` (UI viewer)

Behavior:

- Sticky top panel, fixed ~100px height.
- Expand/collapse support (default expanded).
- Clear logs icon button (not text-only).
- Auto-scroll to newest entries.
- Console forwarding for `debug/info/warn/error`.

Appium ids:

- `log_view_container`
- `log_view_header`
- `log_view_count`
- `log_view_clear_button`
- `log_view_list`
- `log_view_empty`
- `log_entry_{N}`
- `log_entry_{N}_timestamp`
- `log_entry_{N}_level`
- `log_entry_{N}_message`

### Prompt 8.7 - Toast Messages

All user actions should show toast feedback via `IonToast` (plus inline validation where needed).

Recommended message patterns:

- Login: `Logged in as: {userId}`
- Logout: `Logged out`
- Add alias: `Alias added: {label}`
- Add multiple aliases: `{count} alias(es) added`
- Similar patterns for tags, triggers, emails, and SMS
- Notifications: `Notification sent: {type}` or `Failed to send notification`
- In-App Messages: `Sent In-App Message: {type}`
- Outcomes: `Outcome sent: {name}`
- Events: `Event tracked: {name}`
- Location: `Location sharing enabled` / `Location sharing disabled`
- Push: `Push enabled` / `Push disabled`

Implementation guidance:

- Keep a single toast state in page/context (`message`, `isOpen`, optional `color`).
- Render one `IonToast` at page/root composition level (not inside each button component).
- Use consistent placement and duration (for example bottom, 2000ms).
- Update toast state from action handlers after success/failure resolution.
- Log each toast message through `LogManager.getInstance().i(...)` for traceability.
- Replace currently visible toast text when a new action fires rapidly.

### Prompt 8.8 - Safe Area Insets (Fullscreen Content)

When using `IonContent fullscreen`, apply safe-area padding for custom headers/footers so content does not render under system UI.

Use Ionic CSS vars (preferred):

```css
.my-header {
  padding-top: var(--ion-safe-area-top);
}

.my-footer {
  padding-bottom: var(--ion-safe-area-bottom);
}
```

Raw CSS env vars are also valid:

```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

Implementation notes:

- `index.html` should include `viewport-fit=cover` in the viewport meta tag.
- Default `ion-header` + `ion-content` flow usually handles insets automatically.
- If `IonContent` uses `fullscreen`, add explicit safe-area padding in page CSS.
- For this demo, keep fixed/sticky bars coordinated with a shared header height variable:
  - `.demo-app { --demo-header-height: calc(56px + var(--ion-safe-area-top)); }`
  - `.brand-header { position: sticky; top: 0; z-index: 30; min-height: var(--demo-header-height); }`
  - `.logview-panel { position: sticky; top: var(--demo-header-height); z-index: 20; }`
- Example used in this demo:
  - `src/pages/Home.css`:
    - `.brand-header { padding-top: var(--ion-safe-area-top); }`
    - `.content { padding-bottom: calc(12px + var(--ion-safe-area-bottom)); }`
- Android insets may be `0` unless the app draws edge-to-edge and/or a display cutout is present.

---

## Key Files Structure

```text
examples/demo/
├── index.html                                # Viewport + app mount root
├── package.json                              # Ionic/Capacitor + demo scripts
├── capacitor.config.ts                       # Capacitor app config (android/ios)
├── android/                                  # Native Android shell project
├── ios/                                      # Native iOS shell project
└── src/
    ├── App.tsx                               # App root, router, provider wiring
    ├── main.tsx                              # React entrypoint
    ├── context/
    │   └── AppContext.tsx                    # Context + reducer state/actions
    ├── repositories/
    │   └── OneSignalRepository.ts            # SDK-facing repository wrapper
    ├── services/
    │   ├── OneSignalApiService.ts            # REST API client for sample flows
    │   ├── PreferencesService.ts             # localStorage persistence helper
    │   ├── TooltipHelper.ts                  # Remote tooltip loading
    │   └── LogManager.ts                     # Singleton logger + subscribers
    ├── components/
    │   ├── SectionCard.tsx                   # Section title + optional info action
    │   ├── ToggleRow.tsx                     # Label/description + Ionic toggle
    │   ├── ActionButton.tsx                  # Primary and outline action button
    │   ├── ListWidgets.tsx                   # PairList, SingleList, EmptyState
    │   ├── LogView.tsx                       # Sticky logs panel below fixed app bar
    │   ├── modals/
    │   │   ├── SingleInputModal.tsx
    │   │   ├── PairInputModal.tsx
    │   │   ├── MultiPairInputModal.tsx
    │   │   ├── MultiSelectRemoveModal.tsx
    │   │   ├── OutcomeModal.tsx
    │   │   ├── TrackEventModal.tsx
    │   │   ├── CustomNotificationModal.tsx
    │   │   └── TooltipModal.tsx
    │   └── sections/                         # Optional section extraction from Home
    │       ├── AppSection.tsx
    │       ├── PushSection.tsx
    │       ├── SendPushSection.tsx
    │       ├── InAppSection.tsx
    │       ├── SendIamSection.tsx
    │       ├── AliasesSection.tsx
    │       ├── EmailsSection.tsx
    │       ├── SmsSection.tsx
    │       ├── TagsSection.tsx
    │       ├── OutcomesSection.tsx
    │       ├── TriggersSection.tsx
    │       ├── TrackEventSection.tsx
    │       └── LocationSection.tsx
    ├── pages/
    │   ├── Home.tsx                          # Main demo screen composition
    │   └── Home.css                          # Home page visual styles
    ├── theme/
    │   ├── tokens.ts                         # Theme tokens shared by components
    │   └── variables.css                     # Ionic CSS variable overrides
    └── assets/
        └── onesignal_logo.svg               # Brand asset used in header
```

---

## Configuration

### App ID Placeholder

- default app id: `77e32082-ea27-42e3-a898-c72e141824ef`
- persist app id and allow replacement

### Package / Bundle Identifier

- Android: `com.onesignal.example`
- iOS: `com.onesignal.example`

### Native Permission Config

- iOS `Info.plist`: `UIBackgroundModes` with `remote-notification`
- Android manifest keeps `INTERNET` permission

---

## Ionic + Capacitor Best Practices Applied

- repository layer for SDK/API boundaries
- context + reducer for state
- reusable components/modals
- strict TypeScript typing
- non-blocking startup and tooltip loading
- Appium-ready selectors for automation
- safe-area aware layout when using `IonContent fullscreen`

---

## Completion Gate

- app boots without plugin/runtime errors
- OneSignal init is native-only
- identity and CRUD flows work
- permission and push state updates correctly
- IAM listeners fire
- outcomes and events work
- tooltip fetch failures are non-blocking
- Android and iOS build from same codebase

This guide defines how to build and maintain `examples/demo` as an Ionic React + Capacitor app using this repo's local `onesignal-cordova-plugin`.

---
