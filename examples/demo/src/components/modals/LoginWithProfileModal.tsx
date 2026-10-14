import type { OneSignalUserProfile } from 'onesignal-cordova-plugin';
import { useEffect, useState } from 'react';
import type { FC } from 'react';

import ModalShell from './ModalShell';

interface LoginWithProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (externalUserId: string, profile: OneSignalUserProfile, jwt?: string) => void;
}

const LoginWithProfileModal: FC<LoginWithProfileModalProps> = ({ open, onClose, onSubmit }) => {
  const [externalUserId, setExternalUserId] = useState('');
  const [email, setEmail] = useState('');
  const [sms, setSms] = useState('');
  const [jwt, setJwt] = useState('');

  useEffect(() => {
    if (open) {
      setExternalUserId('');
      setEmail('');
      setSms('');
      setJwt('');
    }
  }, [open]);

  return (
    <ModalShell open={open}>
      <form
        autoCapitalize="off"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmedId = externalUserId.trim();
          if (!trimmedId) return;
          const profile: OneSignalUserProfile = {};
          if (email.trim()) profile.email = email.trim();
          if (sms.trim()) profile.sms = sms.trim();
          onSubmit(trimmedId, profile, jwt.trim() || undefined);
        }}
      >
        <h3>Login With Profile</h3>
        <input
          value={externalUserId}
          onChange={(event) => setExternalUserId(event.target.value)}
          placeholder="External User Id"
          data-testid="composite_login_user_id_input"
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email (optional)"
          type="email"
          data-testid="composite_login_email_input"
        />
        <input
          value={sms}
          onChange={(event) => setSms(event.target.value)}
          placeholder="SMS (optional)"
          type="tel"
          data-testid="composite_login_sms_input"
        />
        <input
          value={jwt}
          onChange={(event) => setJwt(event.target.value)}
          placeholder="JWT Token (optional)"
          data-testid="composite_login_jwt_input"
        />
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" data-testid="composite_login_confirm_button">
            Login
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default LoginWithProfileModal;
