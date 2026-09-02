import { describe, expect, test } from 'vite-plus/test';

const notificationDemoSources = [
  ['SPM demo', './demo/src/services/OneSignalApiService.ts'],
  ['CocoaPods demo', './demo-pods/src/services/OneSignalApiService.ts'],
  ['no-location SPM demo', './demo-no-location/src/App.tsx'],
  ['no-location CocoaPods demo', './demo-no-location-pods/src/App.tsx'],
] as const;

describe('Android notification grouping', () => {
  test.each(notificationDemoSources)('%s groups every REST notification send', async (_name, path) => {
    const source = await Bun.file(new URL(path, import.meta.url)).text();
    const notificationSends =
      source.match(/url: 'https:\/\/onesignal\.com\/api\/v1\/notifications'/g) ?? [];
    const explicitlyGroupedSends = source.match(/android_group: 'demo-group'/g) ?? [];

    expect(notificationSends.length).toBeGreaterThan(0);
    expect(explicitlyGroupedSends).toHaveLength(notificationSends.length);
  });
});
