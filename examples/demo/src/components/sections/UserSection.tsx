import type { OneSignalUserProfile } from 'onesignal-cordova-plugin';
import type { FC } from 'react';
import { useState } from 'react';

import ActionButton from '../ActionButton';
import LoginWithProfileModal from '../modals/LoginWithProfileModal';
import SingleInputModal from '../modals/SingleInputModal';
import SectionCard from '../SectionCard';

interface UserSectionProps {
  externalUserId: string | undefined;
  onLogin: (externalUserId: string) => Promise<void>;
  onLoginWithProfile: (
    externalUserId: string,
    profile: OneSignalUserProfile,
    jwt?: string,
  ) => Promise<void>;
  showLoginWithProfile: boolean;
  onLogout: () => Promise<void>;
}

const UserSection: FC<UserSectionProps> = ({
  externalUserId,
  onLogin,
  onLoginWithProfile,
  showLoginWithProfile,
  onLogout,
}) => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginWithProfileOpen, setLoginWithProfileOpen] = useState(false);
  const isLoggedIn = Boolean(externalUserId);

  const handleLogin = async (value: string) => {
    try {
      await onLogin(value);
    } finally {
      setLoginOpen(false);
    }
  };

  const handleLoginWithProfile = async (
    value: string,
    profile: OneSignalUserProfile,
    jwt?: string,
  ) => {
    try {
      await onLoginWithProfile(value, profile, jwt);
    } finally {
      setLoginWithProfileOpen(false);
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
      </div>
      <ActionButton
        type="button"
        onClick={() => setLoginOpen(true)}
        data-testid="login_user_button"
      >
        {isLoggedIn ? 'SWITCH USER' : 'LOGIN USER'}
      </ActionButton>
      {showLoginWithProfile ? (
        <ActionButton
          variant="outline"
          type="button"
          onClick={() => setLoginWithProfileOpen(true)}
          data-testid="composite_login_button"
        >
          LOGIN WITH PROFILE
        </ActionButton>
      ) : null}
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
      <LoginWithProfileModal
        open={loginWithProfileOpen}
        onClose={() => setLoginWithProfileOpen(false)}
        onSubmit={handleLoginWithProfile}
      />
    </SectionCard>
  );
};

export default UserSection;
