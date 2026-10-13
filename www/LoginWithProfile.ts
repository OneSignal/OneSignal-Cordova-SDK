import { hasMissingEntries, isObject } from './helpers';

export type OneSignalErrorCode =
  | 'BACKEND_ERROR'
  | 'INVALID_ARGUMENT'
  | 'NOT_INITIALIZED'
  | 'STORAGE_LOCKED'
  | 'UNKNOWN';

export type OneSignalErrorSource = 'CLIENT' | 'BACKEND';

export interface OneSignalUserProfile {
  email?: string;
  sms?: string;
  tags?: { [key: string]: string };
  aliases?: { [label: string]: string };
}

export interface LoginData {
  onesignalId: string;
  externalId: string;
  emailSubscriptionId?: string;
  smsSubscriptionId?: string;
}

export interface OneSignalErrorDetail {
  code: OneSignalErrorCode;
  source: OneSignalErrorSource;
  backendCode: string | null;
  httpStatus: number | null;
  message: string;
  meta: { [key: string]: unknown } | null;
}

export interface OneSignalResult<T> {
  success: boolean;
  data: T | null;
  error: OneSignalErrorDetail[] | null;
}

const ERROR_CODES: readonly string[] = [
  'BACKEND_ERROR',
  'INVALID_ARGUMENT',
  'NOT_INITIALIZED',
  'STORAGE_LOCKED',
  'UNKNOWN',
];

const MALFORMED_RESULT = 'loginWithProfile received a malformed result';

export const IOS_UNSUPPORTED_MESSAGE = 'loginWithProfile is only supported on Android';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function clientError(code: OneSignalErrorCode, message: string): OneSignalErrorDetail {
  return { code, source: 'CLIENT', backendCode: null, httpStatus: null, message, meta: null };
}

export function failureResult<T>(code: OneSignalErrorCode, message: string): OneSignalResult<T> {
  return { success: false, data: null, error: [clientError(code, message)] };
}

function parseLoginData(raw: unknown): LoginData | null {
  if (!isRecord(raw)) return null;
  const onesignalId = optionalString(raw.onesignalId);
  const externalId = optionalString(raw.externalId);
  if (!onesignalId || !externalId) return null;

  const data: LoginData = { onesignalId, externalId };
  const emailSubscriptionId = optionalString(raw.emailSubscriptionId);
  const smsSubscriptionId = optionalString(raw.smsSubscriptionId);
  if (emailSubscriptionId) data.emailSubscriptionId = emailSubscriptionId;
  if (smsSubscriptionId) data.smsSubscriptionId = smsSubscriptionId;
  return data;
}

function parseErrorDetail(raw: unknown): OneSignalErrorDetail {
  if (!isRecord(raw)) return clientError('UNKNOWN', MALFORMED_RESULT);

  const code = (
    typeof raw.code === 'string' && ERROR_CODES.includes(raw.code) ? raw.code : 'UNKNOWN'
  ) as OneSignalErrorCode;
  let source: OneSignalErrorSource = code === 'BACKEND_ERROR' ? 'BACKEND' : 'CLIENT';
  if (raw.source === 'CLIENT' || raw.source === 'BACKEND') source = raw.source;

  return {
    code,
    source,
    backendCode: optionalString(raw.backendCode) ?? null,
    httpStatus:
      typeof raw.httpStatus === 'number' && Number.isFinite(raw.httpStatus) ? raw.httpStatus : null,
    message: typeof raw.message === 'string' ? raw.message : '',
    meta: isRecord(raw.meta) ? raw.meta : null,
  };
}

function isOptionalString(value: unknown, api: string): boolean {
  if (value === undefined || value === null || typeof value === 'string') return true;
  console.error(`[OneSignal] ${api} must be a string`);
  return false;
}

/**
 * Returns the profile to send to native with tag values coerced to strings like `addTags`,
 * or null after logging when any field is invalid.
 */
export function toNativeProfile(profile: unknown): OneSignalUserProfile | null {
  if (!isObject(profile, 'loginWithProfile: profile')) return null;
  const { email, sms, tags, aliases } = profile;
  if (!isOptionalString(email, 'loginWithProfile: email')) return null;
  if (!isOptionalString(sms, 'loginWithProfile: sms')) return null;
  if (
    tags != null &&
    hasMissingEntries(tags as Record<string, unknown>, 'loginWithProfile: tags', true)
  ) {
    return null;
  }
  if (
    aliases != null &&
    hasMissingEntries(aliases as Record<string, unknown>, 'loginWithProfile: aliases')
  ) {
    return null;
  }

  const nativeProfile: OneSignalUserProfile = {};
  if (typeof email === 'string') nativeProfile.email = email;
  if (typeof sms === 'string') nativeProfile.sms = sms;
  if (tags != null) {
    nativeProfile.tags = {};
    for (const [key, value] of Object.entries(tags as Record<string, unknown>)) {
      nativeProfile.tags[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
  }
  if (aliases != null) nativeProfile.aliases = { ...(aliases as Record<string, string>) };
  return nativeProfile;
}

/**
 * Parses the native result envelope. Anything that does not match the wire shape becomes an
 * UNKNOWN failure rather than throwing, so callers can always branch on `success`.
 */
export function parseLoginResult(raw: unknown): OneSignalResult<LoginData> {
  if (!isRecord(raw) || typeof raw.success !== 'boolean') {
    return failureResult('UNKNOWN', MALFORMED_RESULT);
  }

  if (raw.success) {
    const data = parseLoginData(raw.data);
    return data ? { success: true, data, error: null } : failureResult('UNKNOWN', MALFORMED_RESULT);
  }

  const details = Array.isArray(raw.error) ? raw.error.map(parseErrorDetail) : [];
  return details.length > 0
    ? { success: false, data: null, error: details }
    : failureResult('UNKNOWN', MALFORMED_RESULT);
}
