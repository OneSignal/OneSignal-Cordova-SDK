import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import OneSignal, { LogLevel } from "onesignal-cordova-plugin";
import * as React from "react";
import OSButtons, { renderButtonView } from "./OSButtons";
import OSConsole from "./OSConsole";

const APP_ID = "77e32082-ea27-42e3-a898-c72e141824ef";

export interface Props {
  name: string;
}

export interface State {
  name: string;
  consoleValue: string;
  inputValue: string;
}

class OSDemo extends React.Component<Props, State> {
  private contentRef: React.RefObject<HTMLIonContentElement>;
  private consoleRef: React.RefObject<HTMLDivElement>;
  private inputRef: React.RefObject<HTMLIonInputElement>;

  constructor(props: Props) {
    super(props);
    this.contentRef = React.createRef();
    this.consoleRef = React.createRef();
    this.inputRef = React.createRef();

    this.state = {
      name: props.name,
      inputValue: "",
      consoleValue: "",
    };
  }

  async componentDidMount() {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize(APP_ID);
    OneSignal.LiveActivities.setupDefault();

    OneSignal.Notifications.addEventListener(
      "foregroundWillDisplay",
      (event) => {
        this.OSLog("OneSignal: notification will show in foreground:", event);
        let notif = event.getNotification();

        event.preventDefault(false);
        // event.preventDefault(true); // use true to see the notification be discarded/not show bell in top bar

        // Async work with timeout
        setTimeout(() => {
          console.log("OneSignal Log: notification will display:", notif);
          // Call to display the notification after 5 second delay
          notif.display();
        }, 10000);
      }
    );

    OneSignal.Notifications.addEventListener("click", (event) => {
      this.OSLog("OneSignal: notification clicked:", event);
    });

    OneSignal.InAppMessages.addEventListener("click", (event) => {
      this.OSLog("OneSignal IAM clicked:", event);
    });

    OneSignal.InAppMessages.addEventListener("willDisplay", (event) => {
      this.OSLog("OneSignal: will display IAM: ", event);
    });

    OneSignal.InAppMessages.addEventListener("didDisplay", (event) => {
      this.OSLog("OneSignal: did display IAM: ", event);
    });

    OneSignal.InAppMessages.addEventListener("willDismiss", (event) => {
      this.OSLog("OneSignal: will dismiss IAM: ", event);
    });

    OneSignal.InAppMessages.addEventListener("didDismiss", (event) => {
      this.OSLog("OneSignal: did dismiss IAM: ", event);
    });

    OneSignal.User.pushSubscription.addEventListener(
      "change",
      (subscription) => {
        this.OSLog("OneSignal: subscription changed:", subscription);
      }
    );

    OneSignal.Notifications.addEventListener("permissionChange", (granted) => {
      this.OSLog("OneSignal: permission changed:", granted);
    });

    OneSignal.User.addEventListener("change", (event) => {
      this.OSLog("OneSignal: user changed: ", event);
    });
  }

  OSLog = (message: string, optionalArg: any = null) => {
    if (optionalArg !== null) {
      message = message + JSON.stringify(optionalArg);
    }

    console.log(message);

    let consoleValue;

    if (this.state.consoleValue) {
      consoleValue = `${this.state.consoleValue}\n${message}`;
    } else {
      consoleValue = message;
    }
    this.setState({ consoleValue }, () => {
      if (this.consoleRef.current) {
        this.consoleRef.current.scrollTop =
          this.consoleRef.current.scrollHeight;
      }
    });
  };

  inputChange = (e: CustomEvent) => {
    this.setState({ inputValue: (e.target as HTMLInputElement).value });
  };

  // Update state when text input loses focus
  handleBlur = () => {
    const inputValue = String(this.inputRef.current?.value ?? "");
    this.setState({ inputValue });
  };

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>OneSignal</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent ref={this.contentRef}>
          <div className="content-container">
            <div className="os-console" ref={this.consoleRef}>
              <OSConsole value={this.state.consoleValue} />
            </div>
            <IonButton
              fill="clear"
              className="clear-button"
              onClick={() => this.setState({ consoleValue: "" })}
            >
              {renderButtonView("X", () => {
                this.setState({ consoleValue: "" });
              })}
            </IonButton>
            <IonInput
              className="input-container"
              placeholder="Input"
              onIonChange={(e) => this.inputChange(e)}
              ref={this.inputRef}
              onBlur={this.handleBlur}
            ></IonInput>
            <div className="button-components">
              <OSButtons
                loggingFunction={this.OSLog}
                inputFieldValue={this.state.inputValue}
              />
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }
}

export default OSDemo;
