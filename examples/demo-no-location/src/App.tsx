import { CapacitorHttp } from '@capacitor/core';
import { LogLevel, type OneSignalPlugin } from 'onesignal-cordova-plugin';
import { useCallback, useEffect, useState } from 'react';

const DEFAULT_APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';
const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID?.trim() || DEFAULT_APP_ID;

const isPlaceholder = (value: string): boolean => value.toLowerCase().startsWith('your-');

const onDeviceReady: Promise<void> = new Promise((resolve) => {
  if (typeof document === 'undefined') {
    resolve();
    return;
  }
  document.addEventListener('deviceready', () => resolve(), { once: true });
});

const getOneSignal = (): OneSignalPlugin | undefined => window.plugins?.OneSignal;

async function sendTestNotification(appId: string, subscriptionId: string): Promise<boolean> {
  const response = await CapacitorHttp.post({
    url: 'https://onesignal.com/api/v1/notifications',
    headers: {
      Accept: 'application/vnd.onesignal.v1+json',
      'Content-Type': 'application/json',
    },
    data: {
      app_id: appId,
      include_subscription_ids: [subscriptionId],
      headings: { en: 'Test Notification' },
      contents: { en: 'This is a test notification from the no-location demo.' },
    },
  });

  if (response.status < 200 || response.status >= 300) return false;
  if (!response.data || typeof response.data !== 'object') return false;

  const data = response.data as { id?: unknown; recipients?: unknown };
  return typeof data.id === 'string' && data.id.length > 0 && data.recipients !== 0;
}

export default function App() {
  const [bridgeReady, setBridgeReady] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [pushSubscriptionId, setPushSubscriptionId] = useState<string | null>(null);
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [locationTestResult, setLocationTestResult] = useState<string>('Not run');

  const refreshPushState = useCallback(() => {
    const oneSignal = getOneSignal();
    if (!oneSignal) return;

    void oneSignal.Notifications.getPermissionAsync()
      .then(setPermission)
      .catch(() => setPermission(null));

    void oneSignal.User.pushSubscription
      .getIdAsync()
      .then(setPushSubscriptionId)
      .catch(() => setPushSubscriptionId(null));
  }, []);

  useEffect(() => {
    void onDeviceReady.then(() => {
      const oneSignal = getOneSignal();
      setBridgeReady(true);
      if (!oneSignal) return;

      setSdkReady(true);
      oneSignal.Debug.setLogLevel(LogLevel.Verbose);
      oneSignal.initialize(ONESIGNAL_APP_ID);
      setInitialized(true);
      refreshPushState();
    });
  }, [refreshPushState]);

  const requestPermission = useCallback(async () => {
    const oneSignal = getOneSignal();
    if (!oneSignal) {
      window.alert('OneSignal SDK unavailable');
      return;
    }

    setRequestingPermission(true);
    try {
      const granted = await oneSignal.Notifications.requestPermission(false);
      setPermission(granted);
      refreshPushState();
    } catch (error) {
      window.alert(`Permission Request Failed\n\n${String(error)}`);
    } finally {
      setRequestingPermission(false);
    }
  }, [refreshPushState]);

  const testNotification = useCallback(async () => {
    const oneSignal = getOneSignal();
    if (!oneSignal) {
      window.alert('OneSignal SDK unavailable');
      return;
    }

    setSendingNotification(true);
    try {
      const subscriptionId = await oneSignal.User.pushSubscription.getIdAsync();
      if (!subscriptionId) {
        window.alert('No push subscription ID yet');
        return;
      }

      setPushSubscriptionId(subscriptionId);
      const success = await sendTestNotification(ONESIGNAL_APP_ID, subscriptionId);
      if (!success) window.alert('Failed to send test notification');
    } catch (error) {
      window.alert(`Failed to send test notification\n\n${String(error)}`);
    } finally {
      setSendingNotification(false);
    }
  }, []);

  const testLocationBridge = useCallback(async () => {
    const oneSignal = getOneSignal();
    if (!oneSignal) {
      setLocationTestResult('OneSignal SDK unavailable');
      return;
    }

    setLocationTestResult('Running...');
    try {
      const shared = await oneSignal.Location.isShared();
      setLocationTestResult(`Location.isShared() resolved ${String(shared)}`);
    } catch (error) {
      setLocationTestResult(`Unexpected JavaScript error: ${String(error)}`);
    }
  }, []);

  return (
    <main className="app">
      <header className="appbar">
        <div className="appbar-content">
          <h1>OneSignal</h1>
          <p>Cordova No-Location Demo</p>
        </div>
      </header>

      <div className="content">
        <section className="section">
          <h2>App</h2>
          <div className="card">
            <dl>
              <div>
                <dt>App ID</dt>
                <dd className={isPlaceholder(ONESIGNAL_APP_ID) ? 'warning' : undefined}>
                  {ONESIGNAL_APP_ID}
                </dd>
              </div>
              <div>
                <dt>Bridge</dt>
                <dd>{bridgeReady ? 'Ready' : 'Waiting for deviceready'}</dd>
              </div>
              <div>
                <dt>OneSignal</dt>
                <dd>
                  {sdkReady ? (initialized ? 'Initialized' : 'Not initialized') : 'Unavailable'}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="section">
          <h2>Push</h2>
          <div className="card">
            <dl>
              <div>
                <dt>Permission</dt>
                <dd>{permission == null ? 'Unknown' : permission ? 'Granted' : 'Not granted'}</dd>
              </div>
              <div>
                <dt>Push ID</dt>
                <dd>{pushSubscriptionId || '-'}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={requestPermission}
              disabled={!bridgeReady || requestingPermission}
            >
              REQUEST PERMISSION
            </button>
            <button
              type="button"
              onClick={testNotification}
              disabled={!bridgeReady || sendingNotification}
            >
              {sendingNotification ? 'SENDING...' : 'TEST NOTIFICATION'}
            </button>
          </div>
        </section>

        <section className="section">
          <h2>Location Module</h2>
          <div className="card">
            <p>
              This demo initializes OneSignal and requests notification permission without calling
              `OneSignal.Location` during normal app flow. Native setup exports
              `ONESIGNAL_DISABLE_LOCATION=true`, so iOS and Android resolve the SDK without the
              location module.
            </p>
            <dl>
              <div>
                <dt>Test Result</dt>
                <dd>{locationTestResult}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="secondary"
              onClick={testLocationBridge}
              disabled={!bridgeReady}
            >
              TEST LOCATION BRIDGE
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
