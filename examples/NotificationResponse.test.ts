import { describe, expect, test } from 'vite-plus/test';

import { getNotificationResponseDisposition } from './demo/src/services/NotificationResponse';

describe('notification response handling', () => {
  test.each([
    ['malformed JSON', '{"id":'],
    ['null', null],
    ['primitive', 42],
    ['array', [{ id: 'notification-id' }]],
  ])('rejects a %s success body without retrying', (_name, data) => {
    expect(getNotificationResponseDisposition(data)).toBe('failure');
  });

  test('accepts a valid success body', () => {
    expect(getNotificationResponseDisposition({ id: 'notification-id', recipients: 1 })).toBe(
      'success',
    );
  });

  test('does not retry an ambiguous object response', () => {
    expect(getNotificationResponseDisposition({})).toBe('failure');
  });

  test('retries a recognized transient subscription-indexing failure', () => {
    expect(
      getNotificationResponseDisposition({
        id: '',
        errors: ['All included players are not subscribed'],
      }),
    ).toBe('retry');
  });
});
