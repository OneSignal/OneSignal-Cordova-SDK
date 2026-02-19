import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'OneSignal Demo',
  webDir: 'dist',
  ios: {
    handleApplicationNotifications: false,
  },
};

export default config;
