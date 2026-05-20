import OneSignal, {
  LogLevel,
  type NotificationClickEvent,
  type NotificationWillDisplayEvent,
  type PushSubscriptionChangedState,
  type UserChangedState,
} from 'onesignal-cordova-plugin';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { NotificationType } from '../models/NotificationType';
import OneSignalApiService from '../services/OneSignalApiService';
import PreferencesService from '../services/PreferencesService';

const APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID as string | undefined;
const DEFAULT_APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';
const RESOLVED_APP_ID = APP_ID?.trim() || DEFAULT_APP_ID;

const apiService = OneSignalApiService.getInstance();
const preferences = PreferencesService.getInstance();

// uncomment to debug ios logs in safari web inspector
// const buf: string[] = [];
// (['log', 'warn', 'error'] as const).forEach((level) => {
//   const orig = console[level].bind(console);
//   console[level] = (...args) => {
//     buf.push(`[${level}] ${args.map(String).join(' ')}`);
//     localStorage.setItem('__logs', JSON.stringify(buf.slice(-500)));
//     orig(...args);
//   };
// });
// then later call JSON.parse(localStorage.getItem('__logs')).forEach(l => console.log(l))

async function postNotification(type: NotificationType): Promise<boolean> {
  const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
  if (!subscriptionId) return false;
  return apiService.sendNotification(type, subscriptionId);
}

async function postCustomNotification(title: string, body: string): Promise<boolean> {
  const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
  if (!subscriptionId) return false;
  return apiService.sendCustomNotification(title, body, subscriptionId);
}

function mergePairs<V>(prev: [string, V][], next: Record<string, V>): [string, V][] {
  const merged = new Map(prev);
  for (const [k, v] of Object.entries(next)) merged.set(k, v);
  return Array.from(merged.entries());
}

function mergeUnique<T>(prev: T[], next: T[]): T[] {
  return Array.from(new Set([...prev, ...next]));
}

// Resolves once Cordova's native bridge is ready. `deviceready` is a sticky
// event in cordova.js, so late subscribers (e.g. registering after the event
// already fired) are still invoked. Resolves immediately in non-browser
// environments (SSR, unit tests under Node).
const onDeviceReady: Promise<void> = new Promise((resolve) => {
  if (typeof document === 'undefined') {
    resolve();
    return;
  }
  document.addEventListener('deviceready', () => resolve(), { once: true });
});

// One-shot SDK initialization, gated on `deviceready`. Reuses the same Promise
// across every caller so React StrictMode dual-mounts, route remounts, and HMR
// all share a single underlying init. The downstream `OneSignal.initialize`
// short-circuits on the native side anyway, but this keeps the JS-side log
// noise and listener-registration ordering clean.
const initOneSignal: () => Promise<void> = (() => {
  let inflight: Promise<void> | null = null;
  return () => {
    if (inflight) return inflight;
    inflight = onDeviceReady.then(() => {
      apiService.setAppId(RESOLVED_APP_ID);

      // Verbose log level enables WKWebView.isInspectable on the IAM webview
      // (see OSInAppMessageView.m), which lets Appium's XCUITest driver
      // enumerate the IAM context for E2E tests on iOS 16.4+.
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

      console.log(`OneSignal initialized with app ID: ${RESOLVED_APP_ID}`);
    });
    return inflight;
  };
})();

// Kick init off at module-eval time so it races with React's first render
// instead of waiting for the hook's effect to mount.
void initOneSignal();

export type UseOneSignalReturn = {
  appId: string;
  consentRequired: boolean;
  privacyConsentGiven: boolean;
  externalUserId: string | undefined;
  pushSubscriptionId: string | undefined;
  isPushEnabled: boolean;
  hasNotificationPermission: boolean;
  inAppMessagesPaused: boolean;
  locationShared: boolean;
  aliasesList: [string, string][];
  emailsList: string[];
  smsNumbersList: string[];
  tagsList: [string, string][];
  triggersList: [string, string][];
  isLoading: boolean;
  isReady: boolean;
  loginUser: (externalUserId: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  setConsentRequired: (required: boolean) => Promise<void>;
  setConsentGiven: (granted: boolean) => Promise<void>;
  promptPush: () => Promise<boolean>;
  setPushEnabled: (enabled: boolean) => void;
  sendNotification: (type: NotificationType) => Promise<void>;
  sendCustomNotification: (title: string, body: string) => Promise<void>;
  clearAllNotifications: () => void;
  setIamPaused: (paused: boolean) => Promise<void>;
  sendIamTrigger: (iamType: string) => void;
  addAlias: (label: string, id: string) => void;
  addAliases: (pairs: Record<string, string>) => void;
  addEmail: (email: string) => void;
  removeEmail: (email: string) => void;
  addSms: (sms: string) => void;
  removeSms: (sms: string) => void;
  addTag: (key: string, value: string) => void;
  addTags: (pairs: Record<string, string>) => void;
  removeSelectedTags: (keys: string[]) => void;
  sendOutcome: (name: string) => void;
  sendUniqueOutcome: (name: string) => void;
  sendOutcomeWithValue: (name: string, value: number) => void;
  addTrigger: (key: string, value: string) => void;
  addTriggers: (pairs: Record<string, string>) => void;
  removeSelectedTriggers: (keys: string[]) => void;
  clearTriggers: () => void;
  trackEvent: (name: string, properties?: Record<string, unknown>) => void;
  setLocationShared: (shared: boolean) => Promise<void>;
  checkLocationShared: () => Promise<boolean>;
  requestLocationPermission: () => void;
  startDefaultLiveActivity: (
    activityId: string,
    attributes: Record<string, unknown>,
    content: Record<string, unknown>,
  ) => void;
  updateLiveActivity: (
    activityId: string,
    eventUpdates: Record<string, unknown>,
  ) => Promise<boolean>;
  endLiveActivity: (activityId: string) => Promise<boolean>;
};

export function useOneSignal(): UseOneSignalReturn {
  const [consentRequired, setConsentRequiredState] = useState(() =>
    preferences.getConsentRequired(),
  );
  const [privacyConsentGiven, setPrivacyConsentGivenState] = useState(() =>
    preferences.getConsentGiven(),
  );
  const [externalUserId, setExternalUserId] = useState<string | undefined>(undefined);
  const [pushSubscriptionId, setPushSubscriptionId] = useState<string | undefined>(undefined);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [inAppMessagesPaused, setInAppMessagesPaused] = useState(() => preferences.getIamPaused());
  const [locationShared, setLocationSharedState] = useState(() => preferences.getLocationShared());
  const [aliasesList, setAliasesList] = useState<[string, string][]>([]);
  const [emailsList, setEmailsList] = useState<string[]>([]);
  const [smsNumbersList, setSmsNumbersList] = useState<string[]>([]);
  const [tagsList, setTagsList] = useState<[string, string][]>([]);
  const [triggersList, setTriggersList] = useState<[string, string][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const requestSequenceRef = useRef(0);

  const fetchUserDataFromApi = useCallback(async () => {
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    setIsLoading(true);

    try {
      const onesignalId = await OneSignal.User.getOnesignalId();
      if (!onesignalId) return;

      const userData = await apiService.fetchUser(onesignalId);
      if (!userData) return;

      const externalId = await OneSignal.User.getExternalId();

      if (requestSequenceRef.current !== requestId) return;

      setAliasesList((prev) => mergePairs(prev, userData.aliases));
      setTagsList((prev) => mergePairs(prev, userData.tags));
      setEmailsList((prev) => mergeUnique(prev, userData.emails));
      setSmsNumbersList((prev) => mergeUnique(prev, userData.smsNumbers));
      setExternalUserId(externalId ?? userData.externalId);
    } finally {
      if (requestSequenceRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const logIam = (kind: string) => (e: { message: { messageId: string } }) =>
      console.log(`IAM ${kind}: ${e.message.messageId}`);

    const handleIamWillDisplay = logIam('willDisplay');
    const handleIamDidDisplay = logIam('didDisplay');
    const handleIamWillDismiss = logIam('willDismiss');
    const handleIamDidDismiss = logIam('didDismiss');
    const handleIamClick = logIam('click');

    const handleNotificationClick = (e: NotificationClickEvent) => {
      console.log(`Notification click: ${e.notification.title ?? ''}`);
    };

    const handleForegroundWillDisplay = (e: NotificationWillDisplayEvent) => {
      console.log(`Notification foregroundWillDisplay: ${e.getNotification().title ?? ''}`);
      e.getNotification().display();
    };

    const pushSubHandler = (event: PushSubscriptionChangedState) => {
      const { previous, current } = event;
      const fmtToken = (t: string | undefined) => (t ? `${t.slice(0, 8)}…` : 'null');
      console.log(
        `Push subscription changed: id=${previous.id ?? 'null'} → ${current.id ?? 'null'}, optedIn=${previous.optedIn} → ${current.optedIn}, token=${fmtToken(previous.token)} → ${fmtToken(current.token)}`,
      );
      setPushSubscriptionId(current.id ?? undefined);
      setIsPushEnabled(current.optedIn);
    };

    const permissionHandler = (granted: boolean) => {
      console.log(`Permission changed: ${granted}`);
      setHasNotificationPermission(granted);
    };

    const userChangeHandler = (event: UserChangedState) => {
      const nextOnesignalId = event.current.onesignalId ?? null;
      console.log(
        `User changed: onesignalId=${nextOnesignalId ?? 'null'}, externalId=${event.current.externalId ?? 'null'}`,
      );

      if (nextOnesignalId === null) return;
      void fetchUserDataFromApi();
    };

    const load = async () => {
      // Wait for the one-shot module-scope SDK init (gated on `deviceready`).
      // After this resolves, OneSignal.initialize has been called and downstream
      // SDK calls will queue safely against the native bridge.
      await initOneSignal();
      if (cancelled) return;

      OneSignal.InAppMessages.addEventListener('willDisplay', handleIamWillDisplay);
      OneSignal.InAppMessages.addEventListener('didDisplay', handleIamDidDisplay);
      OneSignal.InAppMessages.addEventListener('willDismiss', handleIamWillDismiss);
      OneSignal.InAppMessages.addEventListener('didDismiss', handleIamDidDismiss);
      OneSignal.InAppMessages.addEventListener('click', handleIamClick);
      OneSignal.Notifications.addEventListener('click', handleNotificationClick);
      OneSignal.Notifications.addEventListener('permissionChange', permissionHandler);
      // Required so foreground pushes actually display: registering this
      // listener wires up the native `addForegroundLifecycleListener` bridge.
      // Without it the SDK never resolves `proceedWithWillDisplay` and the
      // banner stays queued.
      OneSignal.Notifications.addEventListener(
        'foregroundWillDisplay',
        handleForegroundWillDisplay,
      );

      OneSignal.User.pushSubscription.addEventListener('change', pushSubHandler);
      OneSignal.User.addEventListener('change', userChangeHandler);

      const [externalId, pushId, pushOptedIn, hasPerm, initialOnesignalId] = await Promise.all([
        OneSignal.User.getExternalId(),
        OneSignal.User.pushSubscription.getIdAsync(),
        OneSignal.User.pushSubscription.getOptedInAsync(),
        OneSignal.Notifications.getPermissionAsync(),
        OneSignal.User.getOnesignalId(),
      ]);

      setExternalUserId(externalId ?? preferences.getExternalUserId() ?? undefined);
      setPushSubscriptionId(pushId ?? undefined);
      setIsPushEnabled(pushOptedIn);
      setHasNotificationPermission(hasPerm);
      setIsReady(true);

      if (initialOnesignalId) {
        fetchUserDataFromApi();
      }
    };

    void load().catch((err) => {
      console.error(`Initial load error: ${String(err)}`);
      setIsLoading(false);
    });

    console.log('Loaded OneSignal');
    return () => {
      cancelled = true;
      console.log('Cleaning up OneSignal listeners');
      OneSignal.InAppMessages.removeEventListener('willDisplay', handleIamWillDisplay);
      OneSignal.InAppMessages.removeEventListener('didDisplay', handleIamDidDisplay);
      OneSignal.InAppMessages.removeEventListener('willDismiss', handleIamWillDismiss);
      OneSignal.InAppMessages.removeEventListener('didDismiss', handleIamDidDismiss);
      OneSignal.InAppMessages.removeEventListener('click', handleIamClick);
      OneSignal.Notifications.removeEventListener('click', handleNotificationClick);
      OneSignal.Notifications.removeEventListener('permissionChange', permissionHandler);
      OneSignal.Notifications.removeEventListener(
        'foregroundWillDisplay',
        handleForegroundWillDisplay,
      );
      OneSignal.User.pushSubscription.removeEventListener('change', pushSubHandler);
      OneSignal.User.removeEventListener('change', userChangeHandler);
    };
  }, [fetchUserDataFromApi]);

  const clearUserData = () => {
    setAliasesList([]);
    setEmailsList([]);
    setSmsNumbersList([]);
    setTagsList([]);
    setTriggersList([]);
  };

  const loginUser = async (nextExternalUserId: string) => {
    clearUserData();
    setIsLoading(true);

    try {
      OneSignal.login(nextExternalUserId);
      preferences.setExternalUserId(nextExternalUserId);
      setExternalUserId(nextExternalUserId);
      console.log(`Logged in as: ${nextExternalUserId}`);
      // The user 'change' listener runs fetchUserDataFromApi once the new
      // onesignalId is assigned; that call clears isLoading in its finally.
    } catch (err) {
      console.error(`Login error: ${String(err)}`);
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    OneSignal.logout();
    preferences.setExternalUserId(null);
    setExternalUserId(undefined);
    clearUserData();
    console.log('Logged out');
  };

  const setConsentRequired = async (required: boolean) => {
    setConsentRequiredState(required);
    OneSignal.setConsentRequired(required);
    preferences.setConsentRequired(required);
  };

  const setConsentGiven = async (granted: boolean) => {
    setPrivacyConsentGivenState(granted);
    OneSignal.setConsentGiven(granted);
    preferences.setConsentGiven(granted);
  };

  // Memoized so HomeScreen's push-prompt useEffect dependency doesn't
  // re-fire on unrelated state changes in this provider.
  const promptPush = useCallback(() => OneSignal.Notifications.requestPermission(true), []);

  const setPushEnabled = (enabled: boolean) => {
    if (enabled) {
      OneSignal.User.pushSubscription.optIn();
    } else {
      OneSignal.User.pushSubscription.optOut();
    }
    setIsPushEnabled(enabled);
    console.log(enabled ? 'Push enabled' : 'Push disabled');
  };

  const sendNotification = async (type: NotificationType) => {
    const success = await postNotification(type);
    console.log(success ? `Notification sent: ${type}` : 'Failed to send notification');
  };

  const sendCustomNotification = async (title: string, body: string) => {
    const success = await postCustomNotification(title, body);
    console.log(success ? `Notification sent: ${title}` : 'Failed to send notification');
  };

  const clearAllNotifications = () => {
    OneSignal.Notifications.clearAll();
    console.log('All notifications cleared');
  };

  const setIamPaused = async (paused: boolean) => {
    setInAppMessagesPaused(paused);
    OneSignal.InAppMessages.setPaused(paused);
    preferences.setIamPaused(paused);
    console.log(paused ? 'In-app messages paused' : 'In-app messages resumed');
  };

  const sendIamTrigger = (iamType: string) => {
    OneSignal.InAppMessages.addTrigger('iam_type', iamType);
    setTriggersList((prev) => mergePairs(prev, { iam_type: iamType }));
    console.log(`Sent In-App Message: ${iamType}`);
  };

  const addAlias = (label: string, id: string) => {
    OneSignal.User.addAlias(label, id);
    setAliasesList((prev) => mergePairs(prev, { [label]: id }));
    console.log(`Alias added: ${label}`);
  };

  const addAliases = (pairs: Record<string, string>) => {
    OneSignal.User.addAliases(pairs);
    setAliasesList((prev) => mergePairs(prev, pairs));
    console.log(`${Object.keys(pairs).length} alias(es) added`);
  };

  const addEmail = (email: string) => {
    OneSignal.User.addEmail(email);
    setEmailsList((prev) => mergeUnique(prev, [email]));
    console.log(`Email added: ${email}`);
  };

  const removeEmail = (email: string) => {
    OneSignal.User.removeEmail(email);
    setEmailsList((prev) => prev.filter((value) => value !== email));
    console.log(`Email removed: ${email}`);
  };

  const addSms = (sms: string) => {
    OneSignal.User.addSms(sms);
    setSmsNumbersList((prev) => mergeUnique(prev, [sms]));
    console.log(`SMS added: ${sms}`);
  };

  const removeSms = (sms: string) => {
    OneSignal.User.removeSms(sms);
    setSmsNumbersList((prev) => prev.filter((value) => value !== sms));
    console.log(`SMS removed: ${sms}`);
  };

  const addTag = (key: string, value: string) => {
    OneSignal.User.addTag(key, value);
    setTagsList((prev) => mergePairs(prev, { [key]: value }));
    console.log(`Tag added: ${key}`);
  };

  const addTags = (pairs: Record<string, string>) => {
    OneSignal.User.addTags(pairs);
    setTagsList((prev) => mergePairs(prev, pairs));
    console.log(`${Object.keys(pairs).length} tag(s) added`);
  };

  const removeSelectedTags = (keys: string[]) => {
    OneSignal.User.removeTags(keys);
    const keySet = new Set(keys);
    setTagsList((prev) => prev.filter(([k]) => !keySet.has(k)));
    console.log(`${keys.length} tag(s) removed`);
  };

  const sendOutcome = (name: string) => {
    OneSignal.Session.addOutcome(name);
    console.log(`Outcome sent: ${name}`);
  };

  const sendUniqueOutcome = (name: string) => {
    OneSignal.Session.addUniqueOutcome(name);
    console.log(`Unique outcome sent: ${name}`);
  };

  const sendOutcomeWithValue = (name: string, value: number) => {
    OneSignal.Session.addOutcomeWithValue(name, value);
    console.log(`Outcome sent: ${name} = ${value}`);
  };

  const addTrigger = (key: string, value: string) => {
    OneSignal.InAppMessages.addTrigger(key, value);
    setTriggersList((prev) => mergePairs(prev, { [key]: value }));
    console.log(`Trigger added: ${key}`);
  };

  const addTriggers = (pairs: Record<string, string>) => {
    OneSignal.InAppMessages.addTriggers(pairs);
    setTriggersList((prev) => mergePairs(prev, pairs));
    console.log(`${Object.keys(pairs).length} trigger(s) added`);
  };

  const removeSelectedTriggers = (keys: string[]) => {
    OneSignal.InAppMessages.removeTriggers(keys);
    const keySet = new Set(keys);
    setTriggersList((prev) => prev.filter(([k]) => !keySet.has(k)));
    console.log(`${keys.length} trigger(s) removed`);
  };

  const clearTriggers = () => {
    OneSignal.InAppMessages.clearTriggers();
    setTriggersList([]);
    console.log('All triggers cleared');
  };

  const trackEvent = (name: string, properties?: Record<string, unknown>) => {
    OneSignal.User.trackEvent(name, properties);
    console.log(`Event tracked: ${name}`);
  };

  const setLocationShared = async (shared: boolean) => {
    setLocationSharedState(shared);
    OneSignal.Location.setShared(shared);
    preferences.setLocationShared(shared);
    console.log(shared ? 'Location sharing enabled' : 'Location sharing disabled');
  };

  const checkLocationShared = async () => {
    const shared = await OneSignal.Location.isShared();
    console.log(`Location shared: ${shared}`);
    return shared;
  };

  const requestLocationPermission = () => {
    OneSignal.Location.requestPermission();
  };

  const startDefaultLiveActivity = (
    activityId: string,
    attributes: Record<string, unknown>,
    content: Record<string, unknown>,
  ) => {
    OneSignal.LiveActivities.startDefault(activityId, attributes, content);
    console.log(`Started Live Activity: ${activityId}`);
  };

  const updateLiveActivity = async (
    activityId: string,
    eventUpdates: Record<string, unknown>,
  ): Promise<boolean> => {
    const success = await apiService.updateLiveActivity(activityId, 'update', eventUpdates);
    console.log(
      success ? `Updated Live Activity: ${activityId}` : 'Failed to update Live Activity',
    );
    return success;
  };

  const endLiveActivity = async (activityId: string): Promise<boolean> => {
    const success = await apiService.updateLiveActivity(activityId, 'end', {
      message: 'Ended Live Activity',
    });
    console.log(success ? `Ended Live Activity: ${activityId}` : 'Failed to end Live Activity');
    return success;
  };

  return {
    appId: RESOLVED_APP_ID,
    consentRequired,
    privacyConsentGiven,
    externalUserId,
    pushSubscriptionId,
    isPushEnabled,
    hasNotificationPermission,
    inAppMessagesPaused,
    locationShared,
    aliasesList,
    emailsList,
    smsNumbersList,
    tagsList,
    triggersList,
    isLoading,
    isReady,
    loginUser,
    logoutUser,
    setConsentRequired,
    setConsentGiven,
    promptPush,
    setPushEnabled,
    sendNotification,
    sendCustomNotification,
    clearAllNotifications,
    setIamPaused,
    sendIamTrigger,
    addAlias,
    addAliases,
    addEmail,
    removeEmail,
    addSms,
    removeSms,
    addTag,
    addTags,
    removeSelectedTags,
    sendOutcome,
    sendUniqueOutcome,
    sendOutcomeWithValue,
    addTrigger,
    addTriggers,
    removeSelectedTriggers,
    clearTriggers,
    trackEvent,
    setLocationShared,
    checkLocationShared,
    requestLocationPermission,
    startDefaultLiveActivity,
    updateLiveActivity,
    endLiveActivity,
  };
}
