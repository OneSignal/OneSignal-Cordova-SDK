# OneSignal Cordova Sample App - Build Guide

This document extends the shared build guide with Ionic React + Capacitor-specific details.

**Read the shared guide first:**
https://raw.githubusercontent.com/OneSignal/sdk-shared/refs/heads/main/demo/build.md

Replace `{{PLATFORM}}` with `Cordova` everywhere in that guide. Everything below either overrides or supplements sections from the shared guide.

---

## Project Setup

Create a new Ionic React + Capacitor project at `examples/demo/`:

```bash
cd examples
npx @ionic/cli start demo blank --type=react --no-interactive
```

- TypeScript strict mode enabled
- Clean architecture: repository pattern + React Context + reducer state
- Separate component files per section
- Support both Android and iOS native targets
- Top header: fixed/sticky, standard 56dp toolbar height (+ safe-area top inset), OneSignal logo SVG + separate `Cordova` text

App bar logo: import SVG into `src/assets/onesignal_logo.svg` and render via:
```tsx
import OneSignalLogo from '../assets/onesignal_logo.svg';
```

App icon generation:
```bash
bun add -d @capacitor/assets
bunx @capacitor/assets generate --iconBackgroundColor "#ffffff" --iconBackgroundColorDark "#000000"
bun run ios:sync
```

Local plugin setup: reference local plugin tarball through `examples/setup.sh` workflow.

Package scripts:
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

### Dependencies (package.json)

Runtime:
- `@capacitor/core`, `@capacitor/android`, `@capacitor/ios`, `@capacitor/app`, `@capacitor/haptics`, `@capacitor/keyboard`, `@capacitor/status-bar`
- `@ionic/react`, `@ionic/react-router`
- `react-icons` (use Material icons from `react-icons/md`)
- `react`, `react-dom`, `react-router`, `react-router-dom`

Dev:
- `@capacitor/cli`, `@capacitor/assets`
- `onesignal-cordova-plugin` as `file:../../onesignal-cordova-plugin.tgz`
- `typescript`, `vite`, `@vitejs/plugin-react`, `@vitejs/plugin-legacy`, `terser`

Do not add `cordova-android`, `cordova-ios`, or `cordova.platforms` to this Capacitor demo.

### Native Setup

```bash
npx ionic capacitor add android
npx ionic capacitor add ios
bun run setup && bun install && npx cap sync
```

Android `strings.xml`: set `app_name` and `title_activity_main` to `OneSignal Demo`.

If iOS sync reports SPM issues, regenerate native projects and rerun setup/sync.

---

## OneSignal Repository (SDK API Mapping)

Use the `OneSignal` object from `onesignal-cordova-plugin`:

| Operation | SDK Call |
|---|---|
| LoginUser(externalUserId) | `OneSignal.login(externalUserId)` |
| LogoutUser() | `OneSignal.logout()` |
| AddAlias(label, id) | `OneSignal.User.addAlias(label, id)` |
| AddAliases(aliases) | `OneSignal.User.addAliases(aliases)` |
| AddEmail(email) | `OneSignal.User.addEmail(email)` |
| RemoveEmail(email) | `OneSignal.User.removeEmail(email)` |
| AddSms(number) | `OneSignal.User.addSms(number)` |
| RemoveSms(number) | `OneSignal.User.removeSms(number)` |
| AddTag(key, value) | `OneSignal.User.addTag(key, value)` |
| AddTags(tags) | `OneSignal.User.addTags(tags)` |
| RemoveTags(keys) | `OneSignal.User.removeTags(keys)` |
| AddTrigger(key, value) | `OneSignal.InAppMessages.addTrigger(key, value)` |
| AddTriggers(triggers) | `OneSignal.InAppMessages.addTriggers(triggers)` |
| RemoveTriggers(keys) | `OneSignal.InAppMessages.removeTriggers(keys)` |
| ClearTriggers() | `OneSignal.InAppMessages.clearTriggers()` |
| SendOutcome(name) | `OneSignal.Session.addOutcome(name)` |
| SendUniqueOutcome(name) | `OneSignal.Session.addUniqueOutcome(name)` |
| SendOutcomeWithValue(name, value) | `OneSignal.Session.addOutcomeWithValue(name, value)` |
| TrackEvent(name, properties) | `OneSignal.User.trackEvent(name, properties)` |
| GetPushSubscriptionId() | `OneSignal.User.pushSubscription.id` |
| IsPushOptedIn() | `OneSignal.User.pushSubscription.optedIn` |
| OptInPush() | `OneSignal.User.pushSubscription.optIn()` |
| OptOutPush() | `OneSignal.User.pushSubscription.optOut()` |
| ClearAllNotifications() | `OneSignal.Notifications.clearAll()` |
| HasPermission() | `OneSignal.Notifications.hasPermission()` |
| RequestPermission(fallback) | `OneSignal.Notifications.requestPermission(fallback)` |
| SetPaused(paused) | `OneSignal.InAppMessages.setPaused(paused)` |
| SetLocationShared(shared) | `OneSignal.Location.setShared(shared)` |
| RequestLocationPermission() | `OneSignal.Location.requestPermission()` |
| SetConsentRequired(required) | `OneSignal.setConsentRequired(required)` |
| SetConsentGiven(granted) | `OneSignal.setConsentGiven(granted)` |
| GetExternalId() | `OneSignal.User.getExternalId()` |
| GetOnesignalId() | `OneSignal.User.getOnesignalId()` |

REST API client uses built-in `fetch`.

---

## SDK Initialization & Observers

Gate all SDK calls behind `Capacitor.isNativePlatform()` so web builds stay safe.

Initialization in `AppContextProvider`:
```typescript
OneSignal.Debug.setLogLevel(LogLevel.Verbose);
OneSignal.setConsentRequired(cachedConsentRequired);
OneSignal.setConsentGiven(cachedPrivacyConsent);
OneSignal.initialize(appId);
```

Event listeners (addEventListener pattern):
```typescript
OneSignal.InAppMessages.addEventListener('willDisplay', handler);
OneSignal.InAppMessages.addEventListener('didDisplay', handler);
OneSignal.InAppMessages.addEventListener('willDismiss', handler);
OneSignal.InAppMessages.addEventListener('didDismiss', handler);
OneSignal.InAppMessages.addEventListener('click', handler);
OneSignal.Notifications.addEventListener('click', handler);
OneSignal.Notifications.addEventListener('foregroundWillDisplay', handler);
```

After initialization, restore cached state:
```typescript
OneSignal.InAppMessages.setPaused(cachedPausedStatus);
OneSignal.Location.setShared(cachedLocationShared);
```

Observers (cleanup in `useEffect` return):
```typescript
OneSignal.User.pushSubscription.addEventListener('change', handler);
OneSignal.Notifications.addEventListener('permissionChange', handler);
OneSignal.User.addEventListener('change', handler);
```

---

## State Management (Context + Reducer)

- `AppContextProvider` wraps the app, owns all shared runtime state via `useReducer`
- Expose state and actions through `useAppContext()`
- `OneSignalRepository` is a plain TypeScript class (not a Context)
- Receives `OneSignalRepository` and `PreferencesService` internally
- Initialize SDK before rendering, fetch tooltips in background (non-blocking)

### Persistence

- `PreferencesService` wraps `localStorage`
- Triggers list (`triggersList`) is NOT persisted

---

## UI Notes

### Notification Permission
- Call `promptPush()` once in a startup `useEffect`

### Loading Overlay
- `IonSpinner` centered in a full-screen semi-transparent overlay
- Controlled by `isLoading` from app context
- Use `await new Promise(resolve => setTimeout(resolve, 100))` after setting state for render delay

### Toast Messages
- Single `IonToast` rendered at page/root level (not inside each component)
- Consistent placement: bottom, 2000ms duration
- Replace currently visible toast when a new action fires rapidly

### Send In-App Message Icons
- TOP BANNER: `MdVerticalAlignTop` from `react-icons/md`
- BOTTOM BANNER: `MdVerticalAlignBottom`
- CENTER MODAL: `MdCropSquare`
- FULL SCREEN: `MdFullscreen`

### Secondary Screen
- Uses `IonBackButton` or chevron icon for back navigation

### Dialogs
- Ionic modals, all full-width with consistent padding
- JSON parsing via `JSON.parse` returns `Record<string, unknown>` for Track Event

### Accessibility (Appium)
- Use `data-testid` attribute for stable test selectors

### Log View
- `LogManager` singleton with subscriber callbacks for reactive updates
- `.d(tag, message)`, `.i()`, `.w()`, `.e()` with console forwarding
- Logs panel: fixed/sticky directly below the app bar

---

## Theme

Define shared design tokens as CSS custom properties on `:root` in `Home.css`. Do not use a `tokens.ts` file. Avoid inline `style` attributes in TSX, use CSS classes instead.

---

## Safe Area Insets

When using `IonContent fullscreen`, apply safe-area padding for custom headers/footers:

```css
.brand-header { padding-top: var(--ion-safe-area-top); }
.content { padding-bottom: calc(12px + var(--ion-safe-area-bottom)); }
```

Coordinate fixed/sticky bars with a shared header height variable:
```css
.demo-app { --demo-header-height: calc(56px + var(--ion-safe-area-top)); }
.brand-header { position: sticky; top: 0; z-index: 30; min-height: var(--demo-header-height); }
.logview-panel { position: sticky; top: var(--demo-header-height); z-index: 20; }
```

Include `viewport-fit=cover` in `index.html` viewport meta tag.

---

## Platform Config

### iOS
- `Info.plist`: `UIBackgroundModes` with `remote-notification`

### Android
- Manifest includes `INTERNET` permission

---

## Key Files Structure

```
examples/demo/
├── index.html
├── package.json
├── capacitor.config.ts
├── android/
├── ios/
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── context/
    │   └── AppContext.tsx
    ├── repositories/
    │   └── OneSignalRepository.ts
    ├── services/
    │   ├── OneSignalApiService.ts
    │   ├── PreferencesService.ts
    │   ├── TooltipHelper.ts
    │   └── LogManager.ts
    ├── components/
    │   ├── SectionCard.tsx
    │   ├── ToggleRow.tsx
    │   ├── ActionButton.tsx
    │   ├── ListWidgets.tsx
    │   ├── LogView.tsx
    │   ├── LoadingOverlay.tsx
    │   ├── modals/
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
    │   ├── Home.tsx
    │   └── Home.css
    ├── theme/
    │   └── variables.css
    └── assets/
        └── onesignal_logo.svg
```

---

## Ionic + Capacitor Best Practices

- Repository layer for SDK/API boundaries
- Context + reducer for state (no global mutable state)
- Reusable components/modals
- Strict TypeScript typing
- Non-blocking startup and tooltip loading
- Appium-ready selectors via `data-testid`
- Safe-area aware layout with `IonContent fullscreen`
- Guard SDK calls with `Capacitor.isNativePlatform()`
