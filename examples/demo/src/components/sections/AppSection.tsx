import { IonToggle } from '@ionic/react';
import type { FC } from 'react';
import ActionButton from '../ActionButton';

interface AppSectionProps {
  appId: string;
  consentRequired: boolean;
  privacyConsentGiven: boolean;
  externalUserId: string | undefined;
  onToggleConsent: (checked: boolean) => void;
  onTogglePrivacyConsent: (checked: boolean) => void;
  onLogin: () => void;
  onLogout: () => void;
}

const AppSection: FC<AppSectionProps> = ({
  appId,
  consentRequired,
  privacyConsentGiven,
  externalUserId,
  onToggleConsent,
  onTogglePrivacyConsent,
  onLogin,
  onLogout,
}) => {
  const isLoggedIn = Boolean(externalUserId);

  return (
    <section className="section">
      <h2>APP</h2>
      <div className="card kv-card">
        <div className="kv-row">
          <span>App ID</span>
          <span className="id-value">{appId}</span>
        </div>
      </div>
      <div className="card tip-card">
        <div>
          Add your own App ID, then rebuild to fully test all functionality.
        </div>
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
                <div className="sub">Consent given for data collection</div>
              </div>
              <IonToggle
                checked={privacyConsentGiven}
                onIonChange={(event) =>
                  onTogglePrivacyConsent(event.detail.checked)
                }
              />
            </div>
          </>
        ) : null}
      </div>
      <div className="card kv-card">
        <div className="kv-row">
          <span>Status</span>
          <span className={isLoggedIn ? 'text-success' : undefined}>
            {isLoggedIn ? 'Logged In' : 'Anonymous'}
          </span>
        </div>
        <div className="divider" />
        <div className="kv-row">
          <span>External ID</span>
          <span className="id-value">{externalUserId ?? '–'}</span>
        </div>
      </div>
      <ActionButton type="button" onClick={onLogin}>
        {isLoggedIn ? 'SWITCH USER' : 'LOGIN USER'}
      </ActionButton>
      {isLoggedIn ? (
        <ActionButton variant="outline" type="button" onClick={onLogout}>
          LOGOUT USER
        </ActionButton>
      ) : null}
    </section>
  );
};

export default AppSection;
