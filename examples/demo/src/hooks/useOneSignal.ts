import OneSignal, { LogLevel } from 'onesignal-cordova-plugin';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { NotificationType } from '../models/NotificationType';
import OneSignalApiService from '../services/OneSignalApiService';
import PreferencesService from '../services/PreferencesService';

const DEFAULT_APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

function resolveAppId(): string {
  const envId = (import.meta.env.VITE_ONESIGNAL_APP_ID ?? '').trim();
  return envId || DEFAULT_APP_ID;
}

const apiService = OneSignalApiService.getInstance();
const preferences = PreferencesService.getInstance();

async function postNotification(type: NotificationType): Promise<boolean> {
  const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
  if (!subscriptionId) return false;
  return apiService.sendNotification(type, subscriptionId);
}

async function postCustomNotification(
  title: string,
  body: string,
): Promise<boolean> {
  const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
  if (!subscriptionId) return false;
  return apiService.sendCustomNotification(title, body, subscriptionId);
}

function toPairs(pairs: Record<string, string>): [string, string][] {
  return Object.entries(pairs).map(([key, value]) => [key, value]);
}

function mergePairs<V>(
  prev: [string, V][],
  next: Record<string, V>,
): [string, V][] {
  const merged = new Map(prev);
  for (const [k, v] of Object.entries(next)) merged.set(k, v);
  return Array.from(merged.entries());
}

function mergeUnique<T>(prev: T[], next: T[]): T[] {
  return Array.from(new Set([...prev, ...next]));
}

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
  promptPush: () => Promise<void>;
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
  requestLocationPermission: () => void;
  startDefaultLiveActivity: (
    activityId: string,
    attributes: object,
    content: object,
  ) => void;
  updateLiveActivity: (
    activityId: string,
    eventUpdates: Record<string, unknown>,
  ) => Promise<boolean>;
  endLiveActivity: (activityId: string) => Promise<boolean>;
};

function useOneSignalState(): UseOneSignalReturn {
  const [appId] = useState(resolveAppId);
  const [consentRequired, setConsentRequiredState] = useState(false);
  const [privacyConsentGiven, setPrivacyConsentGivenState] = useState(false);
  const [externalUserId, setExternalUserId] = useState<string | undefined>(
    undefined,
  );
  const [pushSubscriptionId, setPushSubscriptionId] = useState<
    string | undefined
  >(undefined);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);
  const [inAppMessagesPaused, setInAppMessagesPaused] = useState(false);
  const [locationShared, setLocationSharedState] = useState(false);
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

    const refreshPushState = async () => {
      const [id, optedIn] = await Promise.all([
        OneSignal.User.pushSubscription.getIdAsync(),
        OneSignal.User.pushSubscription.getOptedInAsync(),
      ]);
      if (cancelled) return;
      setPushSubscriptionId(id ?? undefined);
      setIsPushEnabled(optedIn);
    };

    const handlePermissionChange = (granted: boolean) => {
      if (cancelled) return;
      setHasNotificationPermission(granted);
      console.log(`Permission changed: ${granted}`);
    };

    const handlePushSubscriptionChange = () => {
      if (cancelled) return;
      void refreshPushState();
    };

    const handleUserChange = () => {
      if (cancelled) return;
      fetchUserDataFromApi();
    };

    const init = async () => {
      const nextAppId = resolveAppId();
      const nextConsentRequired = preferences.getConsentRequired();
      const nextPrivacyConsentGiven = preferences.getConsentGiven();
      const nextIamPaused = preferences.getIamPaused();
      const nextLocationShared = preferences.getLocationShared();
      const storedExternalUserId = preferences.getExternalUserId() ?? undefined;

      apiService.setAppId(nextAppId);

      setConsentRequiredState(nextConsentRequired);
      setPrivacyConsentGivenState(nextPrivacyConsentGiven);
      setInAppMessagesPaused(nextIamPaused);
      setLocationSharedState(nextLocationShared);
      setExternalUserId(storedExternalUserId);

      // Verbose log level enables WKWebView.isInspectable on the IAM webview
      // (see OSInAppMessageView.m), which lets Appium's XCUITest driver
      // enumerate the IAM context for E2E tests on iOS 16.4+.
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      OneSignal.setConsentRequired(nextConsentRequired);
      OneSignal.setConsentGiven(nextPrivacyConsentGiven);
      OneSignal.initialize(nextAppId);

      OneSignal.LiveActivities.setupDefault({
        enablePushToStart: true,
        enablePushToUpdate: true,
      });

      OneSignal.InAppMessages.setPaused(nextIamPaused);
      OneSignal.Location.setShared(nextLocationShared);

      if (storedExternalUserId) {
        OneSignal.login(storedExternalUserId);
      }

      OneSignal.Notifications.addEventListener(
        'permissionChange',
        handlePermissionChange,
      );
      OneSignal.User.pushSubscription.addEventListener(
        'change',
        handlePushSubscriptionChange,
      );
      OneSignal.User.addEventListener('change', handleUserChange);

      setHasNotificationPermission(OneSignal.Notifications.hasPermission());
      await refreshPushState();

      if (!cancelled) {
        setIsReady(true);
      }

      const onesignalId = await OneSignal.User.getOnesignalId();
      if (!cancelled && onesignalId) {
        await fetchUserDataFromApi();
      }
    };

    void init();

    return () => {
      cancelled = true;
      OneSignal.Notifications.removeEventListener(
        'permissionChange',
        handlePermissionChange,
      );
      OneSignal.User.pushSubscription.removeEventListener(
        'change',
        handlePushSubscriptionChange,
      );
      OneSignal.User.removeEventListener('change', handleUserChange);
    };
  }, [fetchUserDataFromApi]);

  const loginUser = async (nextExternalUserId: string) => {
    setAliasesList([]);
    setEmailsList([]);
    setSmsNumbersList([]);
    setTagsList([]);
    setTriggersList([]);
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
    setAliasesList([]);
    setEmailsList([]);
    setSmsNumbersList([]);
    setTagsList([]);
    setTriggersList([]);
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

  const promptPush =  () =>  OneSignal.Notifications.requestPermission(true);

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
    console.log(
      success ? `Notification sent: ${type}` : 'Failed to send notification',
    );
  };

  const sendCustomNotification = async (title: string, body: string) => {
    const success = await postCustomNotification(title, body);
    console.log(
      success ? `Notification sent: ${title}` : 'Failed to send notification',
    );
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
    setTriggersList((prev) => {
      const filtered = prev.filter(([key]) => key !== 'iam_type');
      return [...filtered, ['iam_type', iamType] as [string, string]];
    });
    console.log(`Sent In-App Message: ${iamType}`);
  };

  const addAlias = (label: string, id: string) => {
    OneSignal.User.addAlias(label, id);
    setAliasesList((prev) => [...prev, [label, id]]);
    console.log(`Alias added: ${label}`);
  };

  const addAliases = (pairs: Record<string, string>) => {
    OneSignal.User.addAliases(pairs);
    const newEntries = toPairs(pairs);
    setAliasesList((prev) => [...prev, ...newEntries]);
    console.log(`${newEntries.length} alias(es) added`);
  };

  const addEmail = (email: string) => {
    OneSignal.User.addEmail(email);
    setEmailsList((prev) => [
      ...prev.filter((value) => value !== email),
      email,
    ]);
    console.log(`Email added: ${email}`);
  };

  const removeEmail = (email: string) => {
    OneSignal.User.removeEmail(email);
    setEmailsList((prev) => prev.filter((value) => value !== email));
    console.log(`Email removed: ${email}`);
  };

  const addSms = (sms: string) => {
    OneSignal.User.addSms(sms);
    setSmsNumbersList((prev) => [
      ...prev.filter((value) => value !== sms),
      sms,
    ]);
    console.log(`SMS added: ${sms}`);
  };

  const removeSms = (sms: string) => {
    OneSignal.User.removeSms(sms);
    setSmsNumbersList((prev) => prev.filter((value) => value !== sms));
    console.log(`SMS removed: ${sms}`);
  };

  const addTag = (key: string, value: string) => {
    OneSignal.User.addTag(key, value);
    setTagsList((prev) => {
      const filtered = prev.filter(([k]) => k !== key);
      return [...filtered, [key, value]];
    });
    console.log(`Tag added: ${key}`);
  };

  const addTags = (pairs: Record<string, string>) => {
    OneSignal.User.addTags(pairs);
    const newEntries = toPairs(pairs);
    setTagsList((prev) => {
      const keys = new Set(newEntries.map(([k]) => k));
      return [...prev.filter(([k]) => !keys.has(k)), ...newEntries];
    });
    console.log(`${newEntries.length} tag(s) added`);
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
    setTriggersList((prev) => {
      const filtered = prev.filter(([k]) => k !== key);
      return [...filtered, [key, value]];
    });
    console.log(`Trigger added: ${key}`);
  };

  const addTriggers = (pairs: Record<string, string>) => {
    OneSignal.InAppMessages.addTriggers(pairs);
    const newEntries = toPairs(pairs);
    setTriggersList((prev) => {
      const keys = new Set(newEntries.map(([k]) => k));
      return [...prev.filter(([k]) => !keys.has(k)), ...newEntries];
    });
    console.log(`${newEntries.length} trigger(s) added`);
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
    console.log(
      shared ? 'Location sharing enabled' : 'Location sharing disabled',
    );
  };

  const requestLocationPermission = () => {
    OneSignal.Location.requestPermission();
  };

  const startDefaultLiveActivity = (
    activityId: string,
    attributes: object,
    content: object,
  ) => {
    OneSignal.LiveActivities.startDefault(activityId, attributes, content);
    console.log(`Started Live Activity: ${activityId}`);
  };

  const updateLiveActivity = async (
    activityId: string,
    eventUpdates: Record<string, unknown>,
  ): Promise<boolean> => {
    const success = await apiService.updateLiveActivity(
      activityId,
      'update',
      eventUpdates,
    );
    console.log(
      success
        ? `Updated Live Activity: ${activityId}`
        : 'Failed to update Live Activity',
    );
    return success;
  };

  const endLiveActivity = async (activityId: string): Promise<boolean> => {
    const success = await apiService.updateLiveActivity(activityId, 'end', {
      data: {},
    });
    console.log(
      success
        ? `Ended Live Activity: ${activityId}`
        : 'Failed to end Live Activity',
    );
    return success;
  };

  return {
    appId,
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
    requestLocationPermission,
    startDefaultLiveActivity,
    updateLiveActivity,
    endLiveActivity,
  };
}

const OneSignalContext = createContext<UseOneSignalReturn | null>(null);

interface ProviderProps {
  children: ReactNode;
}

export function OneSignalProvider({ children }: ProviderProps) {
  const value = useOneSignalState();
  return createElement(OneSignalContext.Provider, { value }, children);
}

export function useOneSignal(): UseOneSignalReturn {
  const ctx = useContext(OneSignalContext);
  if (!ctx) {
    throw new Error('useOneSignal must be used within <OneSignalProvider>');
  }
  return ctx;
}
