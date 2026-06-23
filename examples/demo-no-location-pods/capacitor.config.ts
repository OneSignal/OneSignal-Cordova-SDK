import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onesignal.example',
  appName: 'OneSignal No Location',
  webDir: 'dist',
  ios: {
    handleApplicationNotifications: false,
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
