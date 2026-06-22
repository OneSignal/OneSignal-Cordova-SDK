# OneSignal Cordova Sample App - Build Guide

This document extends the shared build guide with Ionic React + Capacitor-specific details.

**Read the shared guide first:**
https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/demo/build.md

Replace `{{PLATFORM}}` with `Cordova` everywhere in that guide. Everything below either overrides or supplements sections from the shared guide.

Despite the SDK repo name (`OneSignal-Cordova-SDK`), this demo is **Ionic React + Capacitor**. There is no `config.xml` and no Cordova CLI workflow. Do not add `cordova-android`, `cordova-ios`, or `cordova.platforms` to this Capacitor demo.

---

## Project Setup

Create a new Ionic React + Capacitor project at `examples/demo/`:

```bash
cd examples
npx @ionic/cli start demo blank --type=react --no-interactive
```

- TypeScript strict mode enabled
- Module-scoped `useOneSignal()` hook owns SDK state (no repository class, no Context+reducer)
- Separate component files per section
- Support both Android and iOS native targets
- Top header: fixed/sticky, standard 56dp toolbar height (+ safe-area top inset), OneSignal logo SVG + separate `Cordova` text

App bar logo: import as URL and render `<img src={oneSignalLogo} />`.

```tsx
import oneSignalLogo from '../assets/onesignal_logo.svg';

<img className="brand-logo" src={oneSignalLogo} alt="OneSignal" />;
```

App icon generation:

```bash
bun add -d @capacitor/assets
bunx @capacitor/assets generate --iconBackgroundColor "#ffffff" --iconBackgroundColorDark "#000000"
bun run ios:sync
```

Local plugin setup: reference local plugin tarball through `examples/setup.sh` workflow.

### No-Location Demo

`examples/demo-no-location/` is a smaller Capacitor-hosted app that verifies the Cordova plugin can be built with `ONESIGNAL_DISABLE_LOCATION=true`.

Use it when testing the native dependency split:

```bash
cd examples/demo-no-location
vp run ios
vp run android
```

The demo setup script packs the local Cordova plugin, installs the app dependencies, creates native platforms if needed, and runs Capacitor sync with `ONESIGNAL_DISABLE_LOCATION=true` in the environment. Its normal app flow initializes OneSignal and requests push permission without calling `OneSignal.Location`; the explicit location test button confirms those calls resolve safely when the native location module is absent.

By default, iOS setup validates the generated `OneSignalCordovaDependencies` git source. On `rel/*` branches, the generated Podfile is repointed from the release tag to the matching remote release branch so pre-release validation tests branch HEAD. Use `vp run ios:local` from a demo directory to patch the generated Podfile to the locally packed plugin path while iterating on the podspec.

### vite-plus / vp toolchain

The demo's `package.json` scripts use `vp` (not plain `bun` or `vite`). `vite.config.ts` imports from `vite-plus` rather than `vite`:

```ts
import { defineConfig } from 'vite-plus';
```

Build script is `"build": "tsc && vp build"`. Plain `vite` / `@vitejs/plugin-legacy` / `terser` are not dependencies.

Package scripts:

```json
{
  "scripts": {
    "setup": "../setup.sh",
    "preandroid": "vp run setup",
    "preios": "vp run setup",
    "build": "tsc && vp build",
    "android": "ionic cap run android -l --external",
    "ios": "ionic cap run ios -l --external",
    "android:sync": "ionic cap sync android",
    "ios:sync": "ionic cap sync ios",
    "update:pods": "(cd ios/App && pod update OneSignalXCFramework --no-repo-update)"
  }
}
```

### Dependencies (package.json)

Runtime:

- `@capacitor/core`, `@capacitor/android`, `@capacitor/ios`, `@capacitor/app`, `@capacitor/haptics`, `@capacitor/keyboard`, `@capacitor/status-bar`
- `@ionic/react`, `@ionic/react-router`
- `react-icons` (use Material icons from `react-icons/md`)
- `react`, `react-dom`, `react-router`, `react-router-dom`

Dev:

- `@capacitor/cli`, `@capacitor/assets`
- `onesignal-cordova-plugin` as `file:../../onesignal-cordova-plugin.tgz`
- `typescript`, `@vitejs/plugin-react`

Build tooling (`vite-plus`) is invoked as `vp` from package scripts -- it is not a listed devDependency.

Do not add `cordova-android`, `cordova-ios`, or `cordova.platforms` to this Capacitor demo.

### Environment variables

Vite env vars are read in `useOneSignal.ts` and `OneSignalApiService.ts`:

- `VITE_ONESIGNAL_APP_ID` -- OneSignal App ID. Falls back to a hardcoded `DEFAULT_APP_ID` if missing/empty.
- `VITE_ONESIGNAL_API_KEY` -- REST API key used by `OneSignalApiService` for push sends and Live Activity update/end.
- `VITE_ONESIGNAL_ANDROID_CHANNEL_ID` -- Android channel id for the `WithSound` notification template. Falls back to `DEFAULT_ANDROID_CHANNEL_ID`.

### Native Setup

```bash
npx ionic capacitor add android
npx ionic capacitor add ios
bun run setup && bun install && npx cap sync
```

Android `strings.xml`: set `app_name` and `title_activity_main` to `OneSignal Demo`.

If iOS sync reports SPM issues, regenerate native projects and rerun setup/sync.

---

## OneSignal SDK API Mapping

Use the `OneSignal` object from `onesignal-cordova-plugin`:

| Operation                         | SDK Call                                                  |
| --------------------------------- | --------------------------------------------------------- |
| LoginUser(externalUserId)         | `OneSignal.login(externalUserId)`                         |
| LogoutUser()                      | `OneSignal.logout()`                                      |
| AddAlias(label, id)               | `OneSignal.User.addAlias(label, id)`                      |
| AddAliases(aliases)               | `OneSignal.User.addAliases(aliases)`                      |
| AddEmail(email)                   | `OneSignal.User.addEmail(email)`                          |
| RemoveEmail(email)                | `OneSignal.User.removeEmail(email)`                       |
| AddSms(number)                    | `OneSignal.User.addSms(number)`                           |
| RemoveSms(number)                 | `OneSignal.User.removeSms(number)`                        |
| AddTag(key, value)                | `OneSignal.User.addTag(key, value)`                       |
| AddTags(tags)                     | `OneSignal.User.addTags(tags)`                            |
| RemoveTags(keys)                  | `OneSignal.User.removeTags(keys)`                         |
| AddTrigger(key, value)            | `OneSignal.InAppMessages.addTrigger(key, value)`          |
| AddTriggers(triggers)             | `OneSignal.InAppMessages.addTriggers(triggers)`           |
| RemoveTriggers(keys)              | `OneSignal.InAppMessages.removeTriggers(keys)`            |
| ClearTriggers()                   | `OneSignal.InAppMessages.clearTriggers()`                 |
| SendOutcome(name)                 | `OneSignal.Session.addOutcome(name)`                      |
| SendUniqueOutcome(name)           | `OneSignal.Session.addUniqueOutcome(name)`                |
| SendOutcomeWithValue(name, value) | `OneSignal.Session.addOutcomeWithValue(name, value)`      |
| TrackEvent(name, properties)      | `OneSignal.User.trackEvent(name, properties)`             |
| GetPushSubscriptionId()           | `await OneSignal.User.pushSubscription.getIdAsync()`      |
| IsPushOptedIn()                   | `await OneSignal.User.pushSubscription.getOptedInAsync()` |
| OptInPush()                       | `OneSignal.User.pushSubscription.optIn()`                 |
| OptOutPush()                      | `OneSignal.User.pushSubscription.optOut()`                |
| ClearAllNotifications()           | `OneSignal.Notifications.clearAll()`                      |
| HasPermission()                   | `await OneSignal.Notifications.getPermissionAsync()`      |
| RequestPermission(fallback)       | `OneSignal.Notifications.requestPermission(fallback)`     |
| SetPaused(paused)                 | `OneSignal.InAppMessages.setPaused(paused)`               |
| SetLocationShared(shared)         | `OneSignal.Location.setShared(shared)`                    |
| RequestLocationPermission()       | `OneSignal.Location.requestPermission()`                  |
| SetConsentRequired(required)      | `OneSignal.setConsentRequired(required)`                  |
| SetConsentGiven(granted)          | `OneSignal.setConsentGiven(granted)`                      |
| GetExternalId()                   | `await OneSignal.User.getExternalId()`                    |
| GetOnesignalId()                  | `await OneSignal.User.getOnesignalId()`                   |

The demo uses the async getter variants (`getIdAsync`, `getOptedInAsync`, `getPermissionAsync`) instead of the synchronous property/getter forms.

---

## SDK Initialization & Observers

SDK init is module-scoped in `src/hooks/useOneSignal.ts` and waits on the Cordova `deviceready` event via an `onDeviceReady` promise. The demo does NOT gate calls on `Capacitor.isNativePlatform()`.

Initialization order (inside the one-shot `initOneSignal()`):

```typescript
OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.setConsentRequired(preferences.getConsentRequired());
OneSignal.setConsentGiven(preferences.getConsentGiven());
OneSignal.initialize(RESOLVED_APP_ID);

OneSignal.LiveActivities.setupDefault({
  enablePushToStart: true,
  enablePushToUpdate: true,
});

OneSignal.InAppMessages.setPaused(preferences.getIamPaused());
OneSignal.Location.setShared(preferences.getLocationShared());

const storedExternalUserId = preferences.getExternalUserId();
if (storedExternalUserId) {
  OneSignal.login(storedExternalUserId);
}
```

Restoration order:

- Consent flags BEFORE `OneSignal.initialize(...)`
- IAM paused + location shared AFTER initialize
- `OneSignal.login(storedExternalUserId)` after initialize if a cached external id exists

Event listeners (addEventListener pattern, registered inside the hook's `useEffect`):

```typescript
OneSignal.InAppMessages.addEventListener('willDisplay', handler);
OneSignal.InAppMessages.addEventListener('didDisplay', handler);
OneSignal.InAppMessages.addEventListener('willDismiss', handler);
OneSignal.InAppMessages.addEventListener('didDismiss', handler);
OneSignal.InAppMessages.addEventListener('click', handler);
OneSignal.Notifications.addEventListener('click', handler);
OneSignal.Notifications.addEventListener('foregroundWillDisplay', handler);
OneSignal.Notifications.addEventListener('permissionChange', handler);
OneSignal.User.pushSubscription.addEventListener('change', handler);
OneSignal.User.addEventListener('change', handler);
```

All listeners are removed in the `useEffect` cleanup.

---

## State Management (hook + provider)

- State lives in a single `useOneSignal()` hook (`src/hooks/useOneSignal.ts`) called once from `HomeScreen`. No Context+reducer, no repository class, no provider wrapper -- only a separate `ToastProvider` for snackbars.
- SDK init: module-scoped initialization in `useOneSignal.ts` waits on the Cordova `deviceready` event (via an `onDeviceReady` promise). The demo does NOT gate calls on `Capacitor.isNativePlatform()`.
- Restoration order: consent flags BEFORE `OneSignal.initialize(...)`; IAM paused + location shared AFTER initialize; `OneSignal.login(storedExternalUserId)` after initialize if a cached external id exists.
- Stale-result protection: `requestSequenceRef` in the hook drops out-of-date REST results.
- REST client: `OneSignalApiService` uses `CapacitorHttp` from `@capacitor/core` for push sends, user fetch, and Live Activity update/end. `TooltipHelper` uses `fetch` for the remote tooltip JSON.

### Persistence

- `PreferencesService` wraps `localStorage`
- Triggers list (`triggersList`) is NOT persisted

---

## UI Notes

### Notification Permission

- Call `promptPush()` once in a startup `useEffect` (gated on `isReady`)

### Loading state

- No full-screen overlay. List sections (Aliases, Emails, SMS, Tags) render an inline `IonSpinner` in the empty-state slot when `isLoading` is true (`ListWidgets.tsx` → `LoadingState`).

### Toast Messages

- Single `ToastProvider` (`src/components/ToastProvider.tsx`) wraps `<App/>` in `App.tsx` and owns the Ionic `<IonToast>` state.
- The provider exports a `useSnackbar()` hook returning `(message: string) => void`. Section components call `const showSnackbar = useSnackbar()` at the top of the component body and invoke it from action handlers for the allowed actions (Outcomes, Custom Events, Location check).
- Replace-on-show: the provider clears its `toast` React state, then re-sets it via `queueMicrotask(() => setToast({ id, message }))` so `<IonToast>` remounts with a fresh key, restarting its timer.
- Duration is the module-level constant `TOAST_DURATION_MS = 3000` in `ToastProvider.tsx`, passed as `<IonToast duration={TOAST_DURATION_MS} />`.
- SDK state is exposed via the `useOneSignal` hook, not a context provider. Toast lives in a separate `ToastProvider`.

### Secondary Screen

- Uses `IonBackButton` or chevron icon for back navigation

### Modals/Dialogs

- `HomeScreen` owns layout + `TooltipModal` only. Tooltip visibility is a single local `tooltipOpen` boolean; action dialog state never lives here or in the SDK hook.
- Sections render modals as children inside `SectionCard` (siblings of the section's buttons), with one local `useState` boolean per dialog (`open`, `addOpen`, `removeOpen`, ...). Section button click sets the flag; modal `onSubmit` calls the SDK callback from props, then closes the modal and (where applicable) calls `showSnackbar`.
- Custom `ModalShell` (`src/components/modals/ModalShell.tsx`) using a CSS backdrop + card pattern; the demo does NOT use `<IonModal>`. Shared modals in `src/components/modals/` (`SingleInputModal`, `PairInputModal`, `MultiPairInputModal`, `MultiSelectRemoveModal`, `OutcomeModal`, `TrackEventModal`, `CustomNotificationModal`, `TooltipModal`).
- Login uses `SingleInputModal` inline in `UserSection.tsx` -- there is no dedicated `LoginModal`.
- JSON parsing via `JSON.parse` returns `Record<string, unknown>` for Custom Events.
- Do not centralize action dialogs in a `DialogState` union on `HomeScreen` and do not lift dialog visibility into the SDK hook.

### Accessibility (Appium)

- Use `data-testid` attribute for stable test selectors

### Logging

- Logging uses `console.log` / `console.error` in `useOneSignal.ts`; the demo does not ship an in-app log viewer.

### Android back-button handler

- `App.tsx` exits the app on Android back button when at the root route via `@capacitor/app`.

---

## Theme

Define shared design tokens as CSS custom properties on `:root` in `pages/HomeScreen.css`. Do not use a `tokens.ts` file. Avoid inline `style` attributes in TSX, use CSS classes instead.

---

## Safe Area Insets

When using `IonContent fullscreen`, apply safe-area padding for custom headers/footers:

```css
.brand-header {
  padding-top: var(--ion-safe-area-top);
}
.content {
  padding-bottom: calc(24px + var(--ion-safe-area-bottom));
}
```

Coordinate fixed/sticky bars with a shared header height variable:

```css
.demo-app {
  --demo-header-height: calc(56px + var(--ion-safe-area-top));
}
.brand-header {
  position: sticky;
  top: 0;
  z-index: 30;
  min-height: var(--demo-header-height);
}
```

Include `viewport-fit=cover` in `index.html` viewport meta tag.

---

## Platform Config

### iOS

- `Info.plist`: `UIBackgroundModes` with `remote-notification`

### Android

- Manifest includes `INTERNET` permission

### iOS app extensions

- Notification Service Extension under `ios/App/OneSignalNotificationServiceExtension/`
- Widget Extension (Live Activities + home-screen widget) under `ios/App/OneSignalWidget/`

### Live Activities (iOS only)

- `LiveActivitySection` is rendered only when `Capacitor.getPlatform() === 'ios'`.
- Init wires `OneSignal.LiveActivities.setupDefault({ enablePushToStart, enablePushToUpdate })`; section calls `OneSignal.LiveActivities.startDefault(activityId, attributes, content)`.
- Update/end go through `OneSignalApiService.updateLiveActivity(activityId, 'update' | 'end', eventUpdates)` against `https://api.onesignal.com/apps/{appId}/live_activities/{activityId}/notifications`, authorized with the `VITE_ONESIGNAL_API_KEY` REST key.

---

## Key Files Structure

```
examples/demo/
├── index.html
├── package.json
├── capacitor.config.ts
├── vite.config.ts
├── android/
├── ios/
│   └── App/
│       ├── App/
│       ├── OneSignalNotificationServiceExtension/
│       └── OneSignalWidget/
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── hooks/
    │   └── useOneSignal.ts
    ├── services/
    │   ├── OneSignalApiService.ts
    │   ├── PreferencesService.ts
    │   └── TooltipHelper.ts
    ├── models/
    │   ├── NotificationType.ts
    │   └── UserData.ts
    ├── components/
    │   ├── SectionCard.tsx
    │   ├── ToggleRow.tsx
    │   ├── ActionButton.tsx
    │   ├── ListWidgets.tsx
    │   ├── ToastProvider.tsx
    │   ├── modals/
    │   │   ├── ModalShell.tsx
    │   │   ├── SingleInputModal.tsx
    │   │   ├── PairInputModal.tsx
    │   │   ├── MultiPairInputModal.tsx
    │   │   ├── MultiSelectRemoveModal.tsx
    │   │   ├── OutcomeModal.tsx
    │   │   ├── TrackEventModal.tsx
    │   │   ├── CustomNotificationModal.tsx
    │   │   └── TooltipModal.tsx
    │   └── sections/
    │       ├── AppSection.tsx
    │       ├── UserSection.tsx
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
    │       ├── CustomEventsSection.tsx
    │       ├── LocationSection.tsx
    │       └── LiveActivitySection.tsx
    ├── pages/
    │   ├── HomeScreen.tsx
    │   ├── HomeScreen.css
    │   └── Secondary.tsx
    ├── theme/
    │   └── variables.css
    └── assets/
        └── onesignal_logo.svg
```

---

## Ionic + Capacitor Best Practices

- Module-scoped `useOneSignal()` hook owns shared SDK state (no repository, no Context+reducer)
- Reusable components/modals
- Strict TypeScript typing
- Non-blocking startup and tooltip loading
- Appium-ready selectors via `data-testid`
- Safe-area aware layout with `IonContent fullscreen`
- SDK init gated on Cordova `deviceready`, not `Capacitor.isNativePlatform()`
