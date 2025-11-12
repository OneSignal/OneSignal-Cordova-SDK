import OneSignal from 'onesignal-cordova-plugin';
import { useEffect } from 'react';
import './index.css';

import logo from './logo.svg';
import OSButtons from './OSButtons';
import reactLogo from './react.svg';
const APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

export function App() {
  useEffect(() => {
    // Enable verbose logging for debugging (remove in production)
    OneSignal.Debug.setLogLevel(6);
    // Initialize with your OneSignal App ID
    OneSignal.initialize(APP_ID);
    // Use this method to prompt for push notifications.
    // We recommend removing this method after testing and instead use In-App Messages to prompt for notification permission.
    OneSignal.Notifications.requestPermission(false).then(
      (accepted: boolean) => {
        console.log('User accepted notifications: ' + accepted);
      },
    );
  }, []);

  return (
    <div className="app">
      <div className="logo-container">
        <img src={logo} alt="Bun Logo" className="logo bun-logo" />
        <img src={reactLogo} alt="React Logo" className="logo react-logo" />
      </div>

      <h1>React + Ionic 7</h1>
      <OSButtons />
    </div>
  );
}

export default App;
