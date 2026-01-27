import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import type {
  InAppMessageClickEvent,
  InAppMessageDidDismissEvent,
  InAppMessageDidDisplayEvent,
  InAppMessageWillDismissEvent,
  InAppMessageWillDisplayEvent,
  NotificationClickEvent,
  NotificationWillDisplayEvent,
} from 'onesignal-cordova-plugin';
import OneSignal, { LogLevel } from 'onesignal-cordova-plugin';
import { useCallback, useEffect, useRef, useState } from 'react';
import OSButtons, { renderButtonView } from './OSButtons';
import OSConsole from './OSConsole';

const APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

export interface Props {
  name: string;
}

const OSDemo: React.FC<Props> = ({ name: _name }) => {
  const contentRef = useRef<HTMLIonContentElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [consoleValue, setConsoleValue] = useState('');
  const [inputValue, setInputValue] = useState('');

  const OSLog = useCallback((message: string, optionalArg: unknown = null) => {
    if (optionalArg !== null) {
      message = message + JSON.stringify(optionalArg);
    }

    console.log(message);

    setConsoleValue((prevValue) => {
      const newValue = prevValue ? `${prevValue}\n${message}` : message;
      setTimeout(() => {
        if (consoleRef.current) {
          consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
      }, 0);
      return newValue;
    });
  }, []);

  const inputChange = useCallback((e: CustomEvent) => {
    setInputValue((e.target as HTMLInputElement).value);
  }, []);

  const handleBlur = useCallback(() => {
    const value = String(inputRef.current?.value ?? '');
    setInputValue(value);
  }, []);

  useEffect(() => {
    const initializeOneSignal = async () => {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      OneSignal.initialize(APP_ID);
      OneSignal.LiveActivities.setupDefault();
    };

    initializeOneSignal();

    // Define all event listeners
    const foregroundWillDisplayListener = (
      event: NotificationWillDisplayEvent,
    ) => {
      const notif = event.getNotification();
      OSLog('OneSignal: notification will show in foreground:', notif.title);

      event.preventDefault(false);
      // event.preventDefault(true); // use true to see the notification be discarded/not show bell in top bar

      // Async work with timeout
      setTimeout(() => {
        console.log('OneSignal Log: notification will display:', notif.title);
        // Call to display the notification after 5 second delay
        notif.display();
      }, 5000);
    };

    const notificationClickListener = (event: NotificationClickEvent) => {
      OSLog('OneSignal: notification clicked:', event.notification.title);
    };

    const iamClickListener = (event: InAppMessageClickEvent) => {
      OSLog('OneSignal IAM clicked:', event);
    };

    const iamWillDisplayListener = (event: InAppMessageWillDisplayEvent) => {
      OSLog('OneSignal: will display IAM: ', event);
    };

    const iamDidDisplayListener = (event: InAppMessageDidDisplayEvent) => {
      OSLog('OneSignal: did display IAM: ', event);
    };

    const iamWillDismissListener = (event: InAppMessageWillDismissEvent) => {
      OSLog('OneSignal: will dismiss IAM: ', event);
    };

    const iamDidDismissListener = (event: InAppMessageDidDismissEvent) => {
      OSLog('OneSignal: did dismiss IAM: ', event);
    };

    const subscriptionChangeListener = (subscription: {
      previous: unknown;
      current: unknown;
    }) => {
      OSLog('OneSignal: subscription changed:', subscription);
    };

    const permissionChangeListener = (granted: boolean) => {
      OSLog('OneSignal: permission changed:', granted);
    };

    const userChangeListener = (event: { current: unknown }) => {
      OSLog('OneSignal: user changed: ', event);
    };

    // Add all event listeners
    OneSignal.Notifications.addEventListener(
      'foregroundWillDisplay',
      foregroundWillDisplayListener,
    );
    OneSignal.Notifications.addEventListener(
      'click',
      notificationClickListener,
    );
    OneSignal.InAppMessages.addEventListener('click', iamClickListener);
    OneSignal.InAppMessages.addEventListener(
      'willDisplay',
      iamWillDisplayListener,
    );
    OneSignal.InAppMessages.addEventListener(
      'didDisplay',
      iamDidDisplayListener,
    );
    OneSignal.InAppMessages.addEventListener(
      'willDismiss',
      iamWillDismissListener,
    );
    OneSignal.InAppMessages.addEventListener(
      'didDismiss',
      iamDidDismissListener,
    );
    OneSignal.User.pushSubscription.addEventListener(
      'change',
      subscriptionChangeListener,
    );
    OneSignal.Notifications.addEventListener(
      'permissionChange',
      permissionChangeListener,
    );
    OneSignal.User.addEventListener('change', userChangeListener);

    // Cleanup function to remove all listeners
    return () => {
      OneSignal.Notifications.removeEventListener(
        'foregroundWillDisplay',
        foregroundWillDisplayListener,
      );
      OneSignal.Notifications.removeEventListener(
        'click',
        notificationClickListener,
      );
      OneSignal.InAppMessages.removeEventListener('click', iamClickListener);
      OneSignal.InAppMessages.removeEventListener(
        'willDisplay',
        iamWillDisplayListener,
      );
      OneSignal.InAppMessages.removeEventListener(
        'didDisplay',
        iamDidDisplayListener,
      );
      OneSignal.InAppMessages.removeEventListener(
        'willDismiss',
        iamWillDismissListener,
      );
      OneSignal.InAppMessages.removeEventListener(
        'didDismiss',
        iamDidDismissListener,
      );
      OneSignal.User.pushSubscription.removeEventListener(
        'change',
        subscriptionChangeListener,
      );
      OneSignal.Notifications.removeEventListener(
        'permissionChange',
        permissionChangeListener,
      );
      OneSignal.User.removeEventListener('change', userChangeListener);
    };
  }, [OSLog]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>OneSignal</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef}>
        <div className="content-container">
          <div className="os-console" ref={consoleRef}>
            <OSConsole value={consoleValue} />
          </div>
          <IonButton
            fill="clear"
            className="clear-button"
            onClick={() => setConsoleValue('')}
          >
            {renderButtonView('X', () => {
              setConsoleValue('');
            })}
          </IonButton>
          <IonInput
            className="input-container"
            placeholder="Input"
            onIonChange={(e) => inputChange(e)}
            ref={inputRef}
            onBlur={handleBlur}
          ></IonInput>
          <div className="button-components">
            <OSButtons loggingFunction={OSLog} inputFieldValue={inputValue} />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OSDemo;
