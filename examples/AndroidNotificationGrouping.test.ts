import { describe, expect, test } from 'vite-plus/test';

import demoNoLocationPodsSource from './demo-no-location-pods/src/App.tsx?raw';
import demoNoLocationSource from './demo-no-location/src/App.tsx?raw';
import demoPodsSource from './demo-pods/src/services/OneSignalApiService.ts?raw';
import demoSource from './demo/src/services/OneSignalApiService.ts?raw';

const notificationDemoSources = [
  ['SPM demo', demoSource],
  ['CocoaPods demo', demoPodsSource],
  ['no-location SPM demo', demoNoLocationSource],
  ['no-location CocoaPods demo', demoNoLocationPodsSource],
] as const;

describe('Android notification grouping', () => {
  test.each(notificationDemoSources)('%s groups every REST notification send', (_name, source) => {
    const notificationSends =
      source.match(/url: 'https:\/\/onesignal\.com\/api\/v1\/notifications'/g) ?? [];
    const explicitlyGroupedSends = source.match(/android_group: 'demo-group'/g) ?? [];

    expect(notificationSends.length).toBeGreaterThan(0);
    expect(explicitlyGroupedSends).toHaveLength(notificationSends.length);
  });
});
