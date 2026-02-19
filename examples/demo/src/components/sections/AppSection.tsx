import { IonToggle } from '@ionic/react';
import type { FC } from 'react';

interface AppSectionProps {
  appId: string;
  consentRequired: boolean;
  privacyConsentGiven: boolean;
  onToggleConsent: (checked: boolean) => void;
  onTogglePrivacyConsent: (checked: boolean) => void;
}

const AppSection: FC<AppSectionProps> = ({
  appId,
  consentRequired,
  privacyConsentGiven,
  onToggleConsent,
  onTogglePrivacyConsent,
}) => (
  <section className="section">
    <h2>APP</h2>
    <div className="card kv-card">
      <div className="kv-row">
        <span>App ID</span>
        <span className="id-value">{appId}</span>
      </div>
    </div>
    <div className="card tip-card">
      <div>Add your own App ID, then rebuild to fully test all functionality.</div>
      <div className="tip-link">Get your keys at onesignal.com</div>
    </div>
    <div className="card">
      <div className="toggle-card">
        <div>
          <div className="label">Consent Required</div>
          <div className="sub">Require consent before SDK processes data</div>
        </div>
        <IonToggle
          checked={consentRequired}
          onIonChange={(event) => onToggleConsent(event.detail.checked)}
        />
      </div>
      {consentRequired ? (
        <>
          <div className="divider" />
          <div className="toggle-card">
            <div>
              <div className="label">Privacy Consent</div>
              <div className="sub">Grant privacy consent for data processing</div>
            </div>
            <IonToggle
              checked={privacyConsentGiven}
              onIonChange={(event) => onTogglePrivacyConsent(event.detail.checked)}
            />
          </div>
        </>
      ) : null}
    </div>
  </section>
);

export default AppSection;
