import { IonToggle } from '@ionic/react';
import type { FC } from 'react';
import SectionCard from '../SectionCard';
import { maskValue } from '../../utils/maskValue';

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
}) => {
  return (
    <SectionCard title="APP" sectionKey="app">
      <div className="card kv-card">
        <div className="kv-row">
          <span>App ID</span>
          <span className="id-value" data-testid="app_id_value">
            {maskValue(appId)}
          </span>
        </div>
      </div>
      <div className="card tip-card">
        <div>
          Add your own App ID, then rebuild to fully test all functionality.
        </div>
        <a
          className="tip-link"
          href="https://onesignal.com"
          target="_blank"
          rel="noreferrer"
        >
          Get your keys at onesignal.com
        </a>
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
            data-testid="consent_required_toggle"
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
                data-testid="privacy_consent_toggle"
              />
            </div>
          </>
        ) : null}
      </div>
    </SectionCard>
  );
};

export default AppSection;
