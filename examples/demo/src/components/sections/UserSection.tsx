import type { FC } from 'react';
import ActionButton from '../ActionButton';

interface UserSectionProps {
  externalUserId: string | undefined;
  onLogin: () => void;
  onLogout: () => void;
}

const UserSection: FC<UserSectionProps> = ({
  externalUserId,
  onLogin,
  onLogout,
}) => {
  const isLoggedIn = Boolean(externalUserId);

  return (
    <section className="section">
      <h2>USER</h2>
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

export default UserSection;
