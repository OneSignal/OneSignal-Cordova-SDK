import { beforeEach, describe, expect, test, vi } from 'vite-plus/test';

import OneSignalApiService from './OneSignalApiService';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('@capacitor/core', () => ({
  CapacitorHttp: { post },
}));

describe('OneSignalApiService notification responses', () => {
  const service = OneSignalApiService.getInstance();

  beforeEach(() => {
    post.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.useRealTimers();
  });

  test.each([
    ['malformed JSON', '{"id":'],
    ['null', null],
    ['primitive', 42],
    ['array', [{ id: 'notification-id' }]],
  ])('rejects a %s success body without retrying', async (_name, data) => {
    post.mockResolvedValue({ status: 200, data });

    await expect(service.sendCustomNotification('title', 'body', 'subscription-id')).resolves.toBe(
      false,
    );
    expect(post).toHaveBeenCalledTimes(1);
  });

  test('accepts a valid success body', async () => {
    post.mockResolvedValue({
      status: 200,
      data: { id: 'notification-id', recipients: 1 },
    });

    await expect(service.sendCustomNotification('title', 'body', 'subscription-id')).resolves.toBe(
      true,
    );
    expect(post).toHaveBeenCalledTimes(1);
  });

  test('does not retry an ambiguous object response', async () => {
    post.mockResolvedValue({ status: 200, data: {} });

    await expect(service.sendCustomNotification('title', 'body', 'subscription-id')).resolves.toBe(
      false,
    );
    expect(post).toHaveBeenCalledTimes(1);
  });

  test('retries a recognized transient subscription-indexing failure', async () => {
    vi.useFakeTimers();
    post
      .mockResolvedValueOnce({
        status: 200,
        data: { id: '', errors: ['All included players are not subscribed'] },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: { id: 'notification-id', recipients: 1 },
      });

    const result = service.sendCustomNotification('title', 'body', 'subscription-id');
    await vi.runAllTimersAsync();

    await expect(result).resolves.toBe(true);
    expect(post).toHaveBeenCalledTimes(2);
  });
});
