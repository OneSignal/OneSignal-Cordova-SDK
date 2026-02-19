import type { CapacitorConfig } from '@capacitor/cli';

type EdgeToEdgeAndroidConfig = NonNullable<CapacitorConfig['android']> & {
  adjustMarginsForEdgeToEdge?: 'auto' | 'force' | 'off';
};

type DemoCapacitorConfig = CapacitorConfig & {
  android?: EdgeToEdgeAndroidConfig;
};

const config: DemoCapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'demo',
  webDir: 'dist',
  android: {
    adjustMarginsForEdgeToEdge: 'auto',
  },
};

export default config;
