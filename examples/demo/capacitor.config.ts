import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onesignal.example',
  appName: 'OneSignal Demo',
  webDir: 'dist',
  ios: {
    handleApplicationNotifications: false,
    // Force WKWebView.isInspectable = true so Appium's XCUITest driver can
    // enumerate the WebView context in Release builds on iOS 16.4+. Without
    // this, Capacitor's bridge leaves isInspectable=false in Release and
    // getContexts() returns only NATIVE_APP, so Appium times out waiting for
    // the WebView. Test-only convenience for the demo app.
    webContentsDebuggingEnabled: true,
  },
};

export default config;
