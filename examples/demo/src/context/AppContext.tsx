import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import OneSignal from 'onesignal-cordova-plugin';
import OneSignalRepository from '../repositories/OneSignalRepository';
import PreferencesService from '../services/PreferencesService';
import LogManager from '../services/LogManager';

type Pair = [string, string];

export interface AppState {
  appId: string;
  consentRequired: boolean;
  privacyConsentGiven: boolean;
  externalUserId: string | undefined;
  pushSubscriptionId: string | undefined;
  isPushEnabled: boolean;
  hasNotificationPermission: boolean;
  inAppMessagesPaused: boolean;
  locationShared: boolean;
  aliasesList: Pair[];
  emailsList: string[];
  smsNumbersList: string[];
  tagsList: Pair[];
  triggersList: Pair[];
  logs: string[];
}

const initialState: AppState = {
  appId: '77e32082-ea27-42e3-a898-c72e141824ef',
  consentRequired: false,
  privacyConsentGiven: false,
  externalUserId: undefined,
  pushSubscriptionId: undefined,
  isPushEnabled: false,
  hasNotificationPermission: false,
  inAppMessagesPaused: false,
  locationShared: false,
  aliasesList: [],
  emailsList: [],
  smsNumbersList: [],
  tagsList: [
    ['newestOutcome', 'true'],
    ['somanem', 'somevalue'],
  ],
  triggersList: [],
  logs: [
    '[main] ApplicationService.onActivityStopped(3, APP_OPEN)',
    'Parsed user data: aliases=0, tags=2, emails=0, sms=0',
    'User data fetched successfully, parsing response...',
    '[main] NotificationsManager.requestPermission()',
  ],
};

type AppAction =
  | { type: 'SET_INITIAL_STATE'; payload: Partial<AppState> }
  | { type: 'SET_EXTERNAL_USER_ID'; payload: string | undefined }
  | { type: 'SET_PUSH_SUBSCRIPTION'; payload: { id: string | undefined; optedIn: boolean } }
  | { type: 'SET_HAS_NOTIFICATION_PERMISSION'; payload: boolean }
  | { type: 'SET_CONSENT_REQUIRED'; payload: boolean }
  | { type: 'SET_PRIVACY_CONSENT_GIVEN'; payload: boolean }
  | { type: 'SET_PUSH_ENABLED'; payload: boolean }
  | { type: 'SET_IAM_PAUSED'; payload: boolean }
  | { type: 'SET_LOCATION_SHARED'; payload: boolean }
  | { type: 'ADD_ALIAS'; payload: Pair }
  | { type: 'ADD_ALIASES'; payload: Pair[] }
  | { type: 'CLEAR_USER_DATA' }
  | { type: 'ADD_EMAIL'; payload: string }
  | { type: 'ADD_SMS'; payload: string }
  | { type: 'ADD_TAG'; payload: Pair }
  | { type: 'ADD_TAGS'; payload: Pair[] }
  | { type: 'REMOVE_SELECTED_TAGS'; payload: string[] }
  | { type: 'ADD_TRIGGER'; payload: Pair }
  | { type: 'ADD_TRIGGERS'; payload: Pair[] }
  | { type: 'REMOVE_SELECTED_TRIGGERS'; payload: string[] }
  | { type: 'CLEAR_TRIGGERS' }
  | { type: 'ADD_LOG'; payload: string }
  | { type: 'CLEAR_LOGS' };

function upsertPairs(existing: Pair[], incoming: Pair[]): Pair[] {
  const next = new Map(existing);
  incoming.forEach(([key, value]) => {
    next.set(key, value);
  });
  return Array.from(next.entries());
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_INITIAL_STATE':
      return { ...state, ...action.payload };
    case 'SET_EXTERNAL_USER_ID':
      return { ...state, externalUserId: action.payload };
    case 'SET_PUSH_SUBSCRIPTION':
      return {
        ...state,
        pushSubscriptionId: action.payload.id,
        isPushEnabled: action.payload.optedIn,
      };
    case 'SET_HAS_NOTIFICATION_PERMISSION':
      return { ...state, hasNotificationPermission: action.payload };
    case 'SET_CONSENT_REQUIRED':
      return { ...state, consentRequired: action.payload };
    case 'SET_PRIVACY_CONSENT_GIVEN':
      return { ...state, privacyConsentGiven: action.payload };
    case 'SET_PUSH_ENABLED':
      return { ...state, isPushEnabled: action.payload };
    case 'SET_IAM_PAUSED':
      return { ...state, inAppMessagesPaused: action.payload };
    case 'SET_LOCATION_SHARED':
      return { ...state, locationShared: action.payload };
    case 'ADD_ALIAS':
      return { ...state, aliasesList: [...state.aliasesList, action.payload] };
    case 'ADD_ALIASES':
      return { ...state, aliasesList: [...state.aliasesList, ...action.payload] };
    case 'CLEAR_USER_DATA':
      return {
        ...state,
        aliasesList: [],
        emailsList: [],
        smsNumbersList: [],
        tagsList: [],
        triggersList: [],
      };
    case 'ADD_EMAIL':
      return { ...state, emailsList: [...state.emailsList, action.payload] };
    case 'ADD_SMS':
      return { ...state, smsNumbersList: [...state.smsNumbersList, action.payload] };
    case 'ADD_TAG':
      return { ...state, tagsList: upsertPairs(state.tagsList, [action.payload]) };
    case 'ADD_TAGS':
      return { ...state, tagsList: upsertPairs(state.tagsList, action.payload) };
    case 'REMOVE_SELECTED_TAGS': {
      const keys = new Set(action.payload);
      return { ...state, tagsList: state.tagsList.filter(([key]) => !keys.has(key)) };
    }
    case 'ADD_TRIGGER':
      return { ...state, triggersList: upsertPairs(state.triggersList, [action.payload]) };
    case 'ADD_TRIGGERS':
      return { ...state, triggersList: upsertPairs(state.triggersList, action.payload) };
    case 'REMOVE_SELECTED_TRIGGERS': {
      const keys = new Set(action.payload);
      return { ...state, triggersList: state.triggersList.filter(([key]) => !keys.has(key)) };
    }
    case 'CLEAR_TRIGGERS':
      return { ...state, triggersList: [] };
    case 'ADD_LOG':
      return { ...state, logs: [action.payload, ...state.logs].slice(0, 100) };
    case 'CLEAR_LOGS':
      return { ...state, logs: [] };
    default:
      return state;
  }
}

type AppContextValue = {
  state: AppState;
  clearLogs: () => void;
  loginUser: (externalUserId: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  setConsentRequired: (required: boolean) => Promise<void>;
  setConsentGiven: (granted: boolean) => Promise<void>;
  promptPush: () => Promise<void>;
  setPushEnabled: (enabled: boolean) => Promise<void>;
  sendSimpleNotification: () => Promise<void>;
  sendImageNotification: () => Promise<void>;
  sendCustomNotification: (title: string, body: string) => Promise<void>;
  setIamPaused: (paused: boolean) => Promise<void>;
  sendIamTrigger: (iamType: string) => Promise<void>;
  addAlias: (label: string, id: string) => Promise<void>;
  addAliases: (pairs: Record<string, string>) => Promise<void>;
  addEmail: (email: string) => Promise<void>;
  addSms: (sms: string) => Promise<void>;
  addTag: (key: string, value: string) => Promise<void>;
  addTags: (pairs: Record<string, string>) => Promise<void>;
  removeSelectedTags: (keys: string[]) => Promise<void>;
  sendOutcome: (name: string) => Promise<void>;
  sendUniqueOutcome: (name: string) => Promise<void>;
  sendOutcomeWithValue: (name: string, value: number) => Promise<void>;
  addTrigger: (key: string, value: string) => Promise<void>;
  addTriggers: (pairs: Record<string, string>) => Promise<void>;
  removeSelectedTriggers: (keys: string[]) => Promise<void>;
  clearTriggers: () => Promise<void>;
  trackEvent: (name: string, properties?: Record<string, unknown>) => Promise<void>;
  setLocationShared: (shared: boolean) => Promise<void>;
  requestLocationPermission: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

const repository = new OneSignalRepository();
const preferences = new PreferencesService();
const logManager = LogManager.getInstance();

function toPairs(pairs: Record<string, string>): Pair[] {
  return Object.entries(pairs).map(([key, value]) => [key, value]);
}

interface Props {
  children: ReactNode;
}

export function AppContextProvider({ children }: Props) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addLog = useCallback((message: string) => {
    dispatch({ type: 'ADD_LOG', payload: message });
    logManager.i('AppContext', message);
  }, []);

  const refreshPushState = useCallback(async () => {
    const [id, optedIn] = await Promise.all([
      repository.getPushSubscriptionId(),
      repository.isPushOptedIn(),
    ]);
    dispatch({
      type: 'SET_PUSH_SUBSCRIPTION',
      payload: {
        id: id ?? undefined,
        optedIn,
      },
    });
  }, []);

  useEffect(() => {
    const init = async () => {
      const appId = preferences.getAppId();
      const consentRequired = preferences.getConsentRequired();
      const consentGiven = preferences.getConsentGiven();
      const externalUserId = preferences.getExternalUserId() ?? undefined;
      const iamPaused = preferences.getIamPaused();
      const locationShared = preferences.getLocationShared();

      dispatch({
        type: 'SET_INITIAL_STATE',
        payload: {
          appId,
          consentRequired,
          privacyConsentGiven: consentGiven,
          externalUserId,
          inAppMessagesPaused: iamPaused,
          locationShared,
        },
      });

      repository.setConsentRequired(consentRequired);
      repository.setConsentGiven(consentGiven);
      repository.initialize(appId);
      repository.setPaused(iamPaused);
      repository.setLocationShared(locationShared);

      if (externalUserId) {
        repository.loginUser(externalUserId);
      }

      await refreshPushState();
      dispatch({
        type: 'SET_HAS_NOTIFICATION_PERMISSION',
        payload: repository.hasPermission(),
      });
    };

    init().catch(() => {
      addLog('Initialization failed');
    });
  }, [addLog, refreshPushState]);

  useEffect(() => {
    const onPermissionChange = (granted: boolean) => {
      dispatch({ type: 'SET_HAS_NOTIFICATION_PERMISSION', payload: granted });
      addLog(`Permission changed: ${granted}`);
    };

    const onPushSubscriptionChange = async () => {
      await refreshPushState();
      addLog('Push subscription changed');
    };

    const onUserChange = async () => {
      const externalId = await repository.getExternalId();
      dispatch({ type: 'SET_EXTERNAL_USER_ID', payload: externalId ?? undefined });
      addLog('User changed');
    };

    OneSignal.Notifications.addEventListener('permissionChange', onPermissionChange);
    OneSignal.User.pushSubscription.addEventListener('change', onPushSubscriptionChange);
    OneSignal.User.addEventListener('change', onUserChange);

    return () => {
      OneSignal.Notifications.removeEventListener('permissionChange', onPermissionChange);
      OneSignal.User.pushSubscription.removeEventListener('change', onPushSubscriptionChange);
      OneSignal.User.removeEventListener('change', onUserChange);
    };
  }, [addLog, refreshPushState]);

  const clearLogs = useCallback(() => {
    dispatch({ type: 'CLEAR_LOGS' });
    logManager.clear();
  }, []);

  const loginUser = useCallback(async (externalUserId: string) => {
    repository.loginUser(externalUserId);
    preferences.setExternalUserId(externalUserId);
    dispatch({ type: 'SET_EXTERNAL_USER_ID', payload: externalUserId });
    dispatch({ type: 'CLEAR_USER_DATA' });
    addLog(`Login user: ${externalUserId}`);
  }, [addLog]);

  const logoutUser = useCallback(async () => {
    repository.logoutUser();
    preferences.setExternalUserId(null);
    dispatch({ type: 'SET_EXTERNAL_USER_ID', payload: undefined });
    dispatch({ type: 'CLEAR_USER_DATA' });
    addLog('User logged out');
  }, [addLog]);

  const setConsentRequired = useCallback(async (required: boolean) => {
    repository.setConsentRequired(required);
    preferences.setConsentRequired(required);
    dispatch({ type: 'SET_CONSENT_REQUIRED', payload: required });
    addLog(`Consent required: ${required}`);
  }, [addLog]);

  const setConsentGiven = useCallback(async (granted: boolean) => {
    repository.setConsentGiven(granted);
    preferences.setConsentGiven(granted);
    dispatch({ type: 'SET_PRIVACY_CONSENT_GIVEN', payload: granted });
    addLog(`Consent given: ${granted}`);
  }, [addLog]);

  const promptPush = useCallback(async () => {
    const granted = await repository.requestPermission(true);
    dispatch({ type: 'SET_HAS_NOTIFICATION_PERMISSION', payload: granted });
    addLog(`Push permission prompt result: ${granted}`);
  }, [addLog]);

  const setPushEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      repository.optInPush();
    } else {
      repository.optOutPush();
    }
    dispatch({ type: 'SET_PUSH_ENABLED', payload: enabled });
    addLog(enabled ? 'Push enabled' : 'Push disabled');
  }, [addLog]);

  const sendSimpleNotification = useCallback(async () => {
    addLog('Simple notification queued');
  }, [addLog]);

  const sendImageNotification = useCallback(async () => {
    addLog('Image notification queued');
  }, [addLog]);

  const sendCustomNotification = useCallback(async (title: string, body: string) => {
    addLog(`Custom notification queued: ${title} (${body.length} chars)`);
  }, [addLog]);

  const setIamPaused = useCallback(async (paused: boolean) => {
    repository.setPaused(paused);
    preferences.setIamPaused(paused);
    dispatch({ type: 'SET_IAM_PAUSED', payload: paused });
    addLog(paused ? 'In-app messages paused' : 'In-app messages resumed');
  }, [addLog]);

  const addTrigger = useCallback(async (key: string, value: string) => {
    repository.addTrigger(key, value);
    dispatch({ type: 'ADD_TRIGGER', payload: [key, value] });
    addLog(`Trigger added: ${key}=${value}`);
  }, [addLog]);

  const addTriggers = useCallback(async (pairs: Record<string, string>) => {
    repository.addTriggers(pairs);
    const entries = toPairs(pairs);
    dispatch({ type: 'ADD_TRIGGERS', payload: entries });
    addLog(`Added ${entries.length} triggers`);
  }, [addLog]);

  const clearTriggers = useCallback(async () => {
    repository.clearTriggers();
    dispatch({ type: 'CLEAR_TRIGGERS' });
    addLog('All triggers cleared');
  }, [addLog]);

  const removeSelectedTriggers = useCallback(async (keys: string[]) => {
    repository.removeTriggers(keys);
    dispatch({ type: 'REMOVE_SELECTED_TRIGGERS', payload: keys });
    addLog(`Removed ${keys.length} trigger(s)`);
  }, [addLog]);

  const sendIamTrigger = useCallback(async (iamType: string) => {
    await addTrigger('iam_type', iamType);
  }, [addTrigger]);

  const addAlias = useCallback(async (label: string, id: string) => {
    repository.addAlias(label, id);
    dispatch({ type: 'ADD_ALIAS', payload: [label, id] });
    addLog(`Alias added: ${label}`);
  }, [addLog]);

  const addAliases = useCallback(async (pairs: Record<string, string>) => {
    repository.addAliases(pairs);
    const entries = toPairs(pairs);
    dispatch({ type: 'ADD_ALIASES', payload: entries });
    addLog(`Added ${entries.length} aliases`);
  }, [addLog]);

  const addEmail = useCallback(async (email: string) => {
    repository.addEmail(email);
    dispatch({ type: 'ADD_EMAIL', payload: email });
    addLog(`Email added: ${email}`);
  }, [addLog]);

  const addSms = useCallback(async (sms: string) => {
    repository.addSms(sms);
    dispatch({ type: 'ADD_SMS', payload: sms });
    addLog(`SMS added: ${sms}`);
  }, [addLog]);

  const addTag = useCallback(async (key: string, value: string) => {
    repository.addTag(key, value);
    dispatch({ type: 'ADD_TAG', payload: [key, value] });
    addLog(`Tag added: ${key}`);
  }, [addLog]);

  const addTags = useCallback(async (pairs: Record<string, string>) => {
    repository.addTags(pairs);
    const entries = toPairs(pairs);
    dispatch({ type: 'ADD_TAGS', payload: entries });
    addLog(`Added ${entries.length} tags`);
  }, [addLog]);

  const removeSelectedTags = useCallback(async (keys: string[]) => {
    repository.removeTags(keys);
    dispatch({ type: 'REMOVE_SELECTED_TAGS', payload: keys });
    addLog(`Removed ${keys.length} tags`);
  }, [addLog]);

  const sendOutcome = useCallback(async (name: string) => {
    repository.sendOutcome(name);
    addLog(`Outcome sent: ${name}`);
  }, [addLog]);

  const sendUniqueOutcome = useCallback(async (name: string) => {
    repository.sendUniqueOutcome(name);
    addLog(`Unique outcome sent: ${name}`);
  }, [addLog]);

  const sendOutcomeWithValue = useCallback(async (name: string, value: number) => {
    repository.sendOutcomeWithValue(name, value);
    addLog(`Outcome sent with value: ${name}=${value}`);
  }, [addLog]);

  const trackEvent = useCallback(async (name: string, properties?: Record<string, unknown>) => {
    repository.trackEvent(name, properties);
    addLog(`Track event: ${name}`);
  }, [addLog]);

  const setLocationShared = useCallback(async (shared: boolean) => {
    repository.setLocationShared(shared);
    preferences.setLocationShared(shared);
    dispatch({ type: 'SET_LOCATION_SHARED', payload: shared });
    addLog(shared ? 'Location sharing enabled' : 'Location sharing disabled');
  }, [addLog]);

  const requestLocationPermission = useCallback(async () => {
    repository.requestLocationPermission();
    addLog('Location permission prompt triggered');
  }, [addLog]);

  const value = useMemo<AppContextValue>(() => ({
    state,
    clearLogs,
    loginUser,
    logoutUser,
    setConsentRequired,
    setConsentGiven,
    promptPush,
    setPushEnabled,
    sendSimpleNotification,
    sendImageNotification,
    sendCustomNotification,
    setIamPaused,
    sendIamTrigger,
    addAlias,
    addAliases,
    addEmail,
    addSms,
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
  }), [
    state,
    clearLogs,
    loginUser,
    logoutUser,
    setConsentRequired,
    setConsentGiven,
    promptPush,
    setPushEnabled,
    sendSimpleNotification,
    sendImageNotification,
    sendCustomNotification,
    setIamPaused,
    sendIamTrigger,
    addAlias,
    addAliases,
    addEmail,
    addSms,
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
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
}
