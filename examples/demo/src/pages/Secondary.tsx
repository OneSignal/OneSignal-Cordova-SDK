import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import './Secondary.css';

const Secondary: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" text="" />
        </IonButtons>
        <IonTitle>Secondary Activity</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <div className="secondary-body">Secondary Activity</div>
    </IonContent>
  </IonPage>
);

export default Secondary;
