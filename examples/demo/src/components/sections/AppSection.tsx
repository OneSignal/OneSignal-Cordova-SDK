import type { FC } from 'react';
import ToggleRow from '../ToggleRow';

interface AppSectionProps {
  appId: string;
  consentRequired: boolean;
  onToggleConsent: (checked: boolean) => void;
}

const AppSection: FC<AppSectionProps> = ({
  appId,
  consentRequired,
  onToggleConsent,
}) => (
  <section className="section">
    <h2>APP</h2>
    <div className="card kv-card">
      <div className="kv-row">
        <span>App ID</span>
        <span>{appId}</span>
      </div>
    </div>
    <div className="card tip-card">
      <div>Add your own App ID, then rebuild to fully test all functionality.</div>
      <div className="tip-link">Get your keys at onesignal.com</div>
    </div>
    <ToggleRow
      label="Consent Required"
      description="Require consent before SDK processes data"
      checked={consentRequired}
      onToggle={onToggleConsent}
    />
  </section>
);

export default AppSection;
