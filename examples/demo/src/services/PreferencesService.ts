const CONSENT_REQUIRED_KEY = 'onesignal.demo.consentRequired';
const CONSENT_GIVEN_KEY = 'onesignal.demo.consentGiven';
const EXTERNAL_ID_KEY = 'onesignal.demo.externalUserId';
const LOCATION_SHARED_KEY = 'onesignal.demo.locationShared';
const IAM_PAUSED_KEY = 'onesignal.demo.iamPaused';

function readBoolean(key: string, fallback: boolean): boolean {
  const value = localStorage.getItem(key);
  if (value === null) return fallback;
  return value === 'true';
}

class PreferencesService {
  private static instance: PreferencesService;

  static getInstance(): PreferencesService {
    if (!PreferencesService.instance) {
      PreferencesService.instance = new PreferencesService();
    }
    return PreferencesService.instance;
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

export default PreferencesService;
