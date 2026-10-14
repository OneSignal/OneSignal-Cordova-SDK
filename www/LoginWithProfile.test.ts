import { describe, expect, test, vi } from 'vite-plus/test';

import { failureResult, parseLoginResult, toNativeProfile } from './LoginWithProfile';

const MALFORMED = failureResult('UNKNOWN', 'loginWithProfile received a malformed result');

describe('parseLoginResult', () => {
  test('parses a success envelope', () => {
    expect(
      parseLoginResult({
        success: true,
        data: {
          onesignalId: 'os-id',
          externalId: 'ext-id',
          emailSubscriptionId: 'email-sub',
          smsSubscriptionId: 'sms-sub',
        },
        error: null,
      }),
    ).toEqual({
      success: true,
      data: {
        onesignalId: 'os-id',
        externalId: 'ext-id',
        emailSubscriptionId: 'email-sub',
        smsSubscriptionId: 'sms-sub',
      },
      error: null,
    });
  });

  test('omits absent subscription ids', () => {
    expect(
      parseLoginResult({
        success: true,
        data: { onesignalId: 'os-id', externalId: 'ext-id', emailSubscriptionId: null },
      }),
    ).toEqual({ success: true, data: { onesignalId: 'os-id', externalId: 'ext-id' }, error: null });
  });

  test('parses a failure envelope', () => {
    const detail = {
      code: 'BACKEND_ERROR',
      source: 'BACKEND',
      backendCode: 'user-conflict',
      httpStatus: 409,
      message: 'Conflict',
      meta: { field: 'email' },
    };

    expect(parseLoginResult({ success: false, data: null, error: [detail] })).toEqual({
      success: false,
      data: null,
      error: [detail],
    });
  });

  test('normalizes malformed error details', () => {
    expect(
      parseLoginResult({
        success: false,
        error: [
          { code: 'NOPE', source: 'ELSEWHERE', backendCode: '', httpStatus: 'x', meta: [] },
          { code: 'BACKEND_ERROR' },
          'bad',
        ],
      }),
    ).toEqual({
      success: false,
      data: null,
      error: [
        {
          code: 'UNKNOWN',
          source: 'CLIENT',
          backendCode: null,
          httpStatus: null,
          message: '',
          meta: null,
        },
        {
          code: 'BACKEND_ERROR',
          source: 'BACKEND',
          backendCode: null,
          httpStatus: null,
          message: '',
          meta: null,
        },
        MALFORMED.error![0],
      ],
    });
  });

  test.each([
    ['null', null],
    ['a string', 'ok'],
    ['an array', []],
    ['a non-boolean success', { success: 'true', data: {} }],
    ['success without data', { success: true, data: null }],
    ['success with a missing onesignalId', { success: true, data: { externalId: 'ext' } }],
    [
      'success with a non-string externalId',
      { success: true, data: { onesignalId: 'a', externalId: 1 } },
    ],
    ['failure without errors', { success: false, error: null }],
    ['failure with an empty error list', { success: false, error: [] }],
    [
      'success that carries errors',
      {
        success: true,
        data: { onesignalId: 'a', externalId: 'ext' },
        error: [{ code: 'BACKEND_ERROR', source: 'BACKEND', message: 'x' }],
      },
    ],
  ])('treats %s as an UNKNOWN failure', (_, raw) => {
    expect(parseLoginResult(raw)).toEqual(MALFORMED);
  });
});

describe('toNativeProfile', () => {
  test('copies fields and stringifies tag values', () => {
    const tags = { level: 5, name: 'kim' } as unknown as Record<string, string>;

    expect(
      toNativeProfile({ email: 'a@b.co', sms: '+15555550100', tags, aliases: { crm: '42' } }),
    ).toEqual({
      email: 'a@b.co',
      sms: '+15555550100',
      tags: { level: '5', name: 'kim' },
      aliases: { crm: '42' },
    });
    expect(tags).toEqual({ level: 5, name: 'kim' });
  });

  test('accepts an empty profile and drops null fields', () => {
    expect(toNativeProfile({})).toEqual({});
    expect(toNativeProfile({ email: null, sms: undefined, tags: null })).toEqual({});
  });

  test.each([
    ['a missing profile', undefined],
    ['an array profile', []],
    ['a non-string email', { email: 1 }],
    ['a non-string sms', { sms: {} }],
    ['non-object tags', { tags: 'x' }],
    ['a null tag value', { tags: { a: null } }],
    ['an empty alias id', { aliases: { crm: '' } }],
    ['an empty alias label', { aliases: { '': 'id' } }],
  ])('rejects %s', (_, profile) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(toNativeProfile(profile)).toBeNull();
    expect(error).toHaveBeenCalled();

    error.mockRestore();
  });
});
