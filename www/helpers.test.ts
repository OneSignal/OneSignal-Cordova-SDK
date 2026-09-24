import { describe, expect, test, vi } from 'vite-plus/test';

import { rejectNullOrEmpty, rejectNullOrEmptyKeys } from './helpers';

describe('rejectNullOrEmpty', () => {
  test('rejects null, empty, and non-strings', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(rejectNullOrEmpty(null, 'login: externalId')).toBe(true);
    expect(rejectNullOrEmpty(undefined, 'login: externalId')).toBe(true);
    expect(rejectNullOrEmpty('', 'login: externalId')).toBe(true);
    expect(rejectNullOrEmpty(1, 'login: externalId')).toBe(true);
    expect(rejectNullOrEmpty('user', 'login: externalId')).toBe(false);
    expect(rejectNullOrEmpty(' ', 'login: externalId')).toBe(false);

    error.mockRestore();
  });
});

describe('rejectNullOrEmptyKeys', () => {
  test('rejects a missing map, an empty key, and an empty value', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(rejectNullOrEmptyKeys(null, 'addAliases')).toBe(true);
    expect(rejectNullOrEmptyKeys(undefined, 'addAliases')).toBe(true);
    expect(rejectNullOrEmptyKeys({ '': 'id' }, 'addAliases')).toBe(true);
    expect(rejectNullOrEmptyKeys({ label: '' }, 'addAliases')).toBe(true);
    expect(rejectNullOrEmptyKeys({ label: null }, 'addAliases', true)).toBe(true);
    expect(rejectNullOrEmptyKeys({ label: '' }, 'addTags', true)).toBe(false);
    expect(rejectNullOrEmptyKeys({ label: 'id' }, 'addAliases')).toBe(false);

    error.mockRestore();
  });
});
