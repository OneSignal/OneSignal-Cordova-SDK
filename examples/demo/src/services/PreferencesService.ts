const APP_ID_KEY = 'onesignal.demo.appId';
const CONSENT_REQUIRED_KEY = 'onesignal.demo.consentRequired';
const CONSENT_GIVEN_KEY = 'onesignal.demo.consentGiven';
const EXTERNAL_ID_KEY = 'onesignal.demo.externalUserId';
const LOCATION_SHARED_KEY = 'onesignal.demo.locationShared';
const IAM_PAUSED_KEY = 'onesignal.demo.iamPaused';

const DEFAULT_APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

function readBoolean(key: string, fallback: boolean): boolean {
  const value = localStorage.getItem(key);
  if (value === null) return fallback;
  return value === 'true';
}

export default class PreferencesService {
  getAppId(): string {
    return localStorage.getItem(APP_ID_KEY) ?? DEFAULT_APP_ID;
  }

  setAppId(value: string): void {
    localStorage.setItem(APP_ID_KEY, value);
  }

  getConsentRequired(): boolean {
    return readBoolean(CONSENT_REQUIRED_KEY, false);
  }

  setConsentRequired(value: boolean): void {
    localStorage.setItem(CONSENT_REQUIRED_KEY, String(value));
  }

  getConsentGiven(): boolean {
    return readBoolean(CONSENT_GIVEN_KEY, false);
  }

  setConsentGiven(value: boolean): void {
    localStorage.setItem(CONSENT_GIVEN_KEY, String(value));
  }

  getExternalUserId(): string | null {
    return localStorage.getItem(EXTERNAL_ID_KEY);
  }

  setExternalUserId(value: string | null): void {
    if (value === null) {
      localStorage.removeItem(EXTERNAL_ID_KEY);
      return;
    }
    localStorage.setItem(EXTERNAL_ID_KEY, value);
  }

  getLocationShared(): boolean {
    return readBoolean(LOCATION_SHARED_KEY, false);
  }

  setLocationShared(value: boolean): void {
    localStorage.setItem(LOCATION_SHARED_KEY, String(value));
  }

  getIamPaused(): boolean {
    return readBoolean(IAM_PAUSED_KEY, false);
  }

  setIamPaused(value: boolean): void {
    localStorage.setItem(IAM_PAUSED_KEY, String(value));
  }
}
