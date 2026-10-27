import { IonSelect, IonSelectOption } from '@ionic/react';
import type { FC } from 'react';
import { useState } from 'react';

import ActionButton from '../ActionButton';
import SingleInputModal from '../modals/SingleInputModal';
import SectionCard from '../SectionCard';

const LANGUAGE_OPTIONS = [
  { name: 'Device Default', code: '' },
  { name: 'English', code: 'en' },
  { name: 'Arabic', code: 'ar' },
  { name: 'Azerbaijani', code: 'az' },
  { name: 'Bosnian', code: 'bs' },
  { name: 'Catalan', code: 'ca' },
  { name: 'Chinese (Simplified)', code: 'zh-Hans' },
  { name: 'Chinese (Traditional)', code: 'zh-Hant' },
  { name: 'Croatian', code: 'hr' },
  { name: 'Czech', code: 'cs' },
  { name: 'Danish', code: 'da' },
  { name: 'Dutch', code: 'nl' },
  { name: 'Estonian', code: 'et' },
  { name: 'Finnish', code: 'fi' },
  { name: 'French', code: 'fr' },
  { name: 'Georgian', code: 'ka' },
  { name: 'Bulgarian', code: 'bg' },
  { name: 'German', code: 'de' },
  { name: 'Greek', code: 'el' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Hebrew', code: 'he' },
  { name: 'Hungarian', code: 'hu' },
  { name: 'Indonesian', code: 'id' },
  { name: 'Italian', code: 'it' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Korean', code: 'ko' },
  { name: 'Latvian', code: 'lv' },
  { name: 'Lithuanian', code: 'lt' },
  { name: 'Malay', code: 'ms' },
  { name: 'Norwegian', code: 'nb' },
  { name: 'Persian', code: 'fa' },
  { name: 'Polish', code: 'pl' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Punjabi', code: 'pa' },
  { name: 'Romanian', code: 'ro' },
  { name: 'Russian', code: 'ru' },
  { name: 'Serbian', code: 'sr' },
  { name: 'Slovak', code: 'sk' },
  { name: 'Spanish', code: 'es' },
  { name: 'Swedish', code: 'sv' },
  { name: 'Thai', code: 'th' },
  { name: 'Turkish', code: 'tr' },
  { name: 'Ukrainian', code: 'uk' },
  { name: 'Vietnamese', code: 'vi' },
];

interface UserSectionProps {
  externalUserId: string | undefined;
  language: string;
  onLanguageChange: (language: string) => void;
  onLogin: (externalUserId: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

const UserSection: FC<UserSectionProps> = ({
  externalUserId,
  language,
  onLanguageChange,
  onLogin,
  onLogout,
}) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const isLoggedIn = Boolean(externalUserId);

  const handleLogin = async (value: string) => {
    try {
      await onLogin(value);
    } finally {
      setLoginOpen(false);
    }
  };

  const handleLogout = async () => {
    await onLogout();
  };

  return (
    <SectionCard title="USER" sectionKey="user">
      <div className="card kv-card">
        <div className="kv-row">
          <span>Status</span>
          <span className={isLoggedIn ? 'text-success' : undefined} data-testid="user_status_value">
            {isLoggedIn ? 'Logged In' : 'Anonymous'}
          </span>
        </div>
        <div className="divider" />
        <div className="kv-row">
          <span>External ID</span>
          <span className="id-value" data-testid="user_external_id_value">
            {externalUserId ?? '—'}
          </span>
        </div>
        <div className="divider" />
        <div className="kv-row">
          <span>Language</span>
          <IonSelect
            className="language-select"
            interface="popover"
            value={language}
            onIonChange={(event) => onLanguageChange(String(event.detail.value ?? ''))}
            aria-label="Language"
            data-testid="user_language_dropdown"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <IonSelectOption key={option.code} value={option.code}>
                {option.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </div>
      </div>
      <ActionButton
        type="button"
        onClick={() => setLoginOpen(true)}
        data-testid="login_user_button"
      >
        {isLoggedIn ? 'SWITCH USER' : 'LOGIN USER'}
      </ActionButton>
      {isLoggedIn ? (
        <ActionButton
          variant="outline"
          type="button"
          onClick={handleLogout}
          data-testid="logout_user_button"
        >
          LOGOUT USER
        </ActionButton>
      ) : null}
      <SingleInputModal
        open={loginOpen}
        title="Login User"
        placeholder="External User Id"
        confirmLabel="Login"
        onClose={() => setLoginOpen(false)}
        onSubmit={handleLogin}
        inputTestId="login_user_id_input"
      />
    </SectionCard>
  );
};

export default UserSection;
