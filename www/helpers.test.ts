import { describe, expect, test, vi } from 'vite-plus/test';

import { isMissing, hasMissingEntries } from './helpers';

describe('isMissing', () => {
  test('rejects null, empty, and non-strings', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(isMissing(null, 'login: externalId')).toBe(true);
    expect(isMissing(undefined, 'login: externalId')).toBe(true);
    expect(isMissing('', 'login: externalId')).toBe(true);
    expect(isMissing(1, 'login: externalId')).toBe(true);
    expect(isMissing('user', 'login: externalId')).toBe(false);
    expect(isMissing(' ', 'login: externalId')).toBe(false);

    error.mockRestore();
  });
});

describe('hasMissingEntries', () => {
  test('rejects a missing map, an empty key, and an empty value', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(hasMissingEntries(null, 'addAliases')).toBe(true);
    expect(hasMissingEntries(undefined, 'addAliases')).toBe(true);
    expect(hasMissingEntries({ '': 'id' }, 'addAliases')).toBe(true);
    expect(hasMissingEntries({ label: '' }, 'addAliases')).toBe(true);
    expect(hasMissingEntries({ label: null }, 'addAliases', true)).toBe(true);
    expect(hasMissingEntries({ label: '' }, 'addTags', true)).toBe(false);
    expect(hasMissingEntries({ label: 'id' }, 'addAliases')).toBe(false);

    error.mockRestore();
  });
});
