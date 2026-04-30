import { StatusBar, Style } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet, IonToast, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';

import HomeScreen from './pages/HomeScreen';
import Secondary from './pages/Secondary';
import TooltipHelper from './services/TooltipHelper';
import { subscribeSnackbar } from './utils/showSnackbar';

StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/display.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */
/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';
/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    void TooltipHelper.getInstance().init();
    // Close-then-open on a fresh tick so consecutive snackbars (e.g. tests
    // sending three outcomes in a row) reliably restart IonToast's timer and
    // re-render the new message. Calling setToastOpen(true) while already true
    // is a no-op for IonToast and the new `message` is often ignored mid-flight.
    return subscribeSnackbar((message) => {
      setToastOpen(false);
      setTimeout(() => {
        setToastMessage(message);
        setToastOpen(true);
      }, 0);
    });
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/home">
            <HomeScreen />
          </Route>
          <Route exact path="/secondary">
            <Secondary />
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
      <IonToast
        isOpen={toastOpen}
        message={toastMessage}
        duration={1600}
        onDidDismiss={() => setToastOpen(false)}
        data-testid="snackbar_toast"
      />
    </IonApp>
  );
};

export default App;
