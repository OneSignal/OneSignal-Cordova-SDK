import { IonToggle } from '@ionic/react';
import type { FC } from 'react';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface PushSectionProps {
  pushSubscriptionId: string | null | undefined;
  isPushEnabled: boolean;
  hasNotificationPermission: boolean;
  onTogglePush: (checked: boolean) => void;
  onPromptPush: () => void;
  onInfoTap: () => void;
}

const PushSection: FC<PushSectionProps> = ({
  pushSubscriptionId,
  isPushEnabled,
  hasNotificationPermission,
  onTogglePush,
  onPromptPush,
  onInfoTap,
}) => (
  <SectionCard title="PUSH" onInfoTap={onInfoTap}>
    <div className="card kv-card push-card">
      <div className="kv-row">
        <span>Push ID</span>
        <span className="id-value">{pushSubscriptionId ?? '—'}</span>
      </div>
      <div className="divider" />
      <div className="kv-row kv-row-toggle">
        <span>Push Enabled</span>
        <IonToggle
          checked={isPushEnabled}
          onIonChange={(event) => onTogglePush(event.detail.checked)}
          aria-label="Push enabled"
          disabled={!hasNotificationPermission}
        />
      </div>
    </div>
    {!hasNotificationPermission ? (
      <ActionButton type="button" onClick={onPromptPush}>
        PROMPT PUSH
      </ActionButton>
    ) : null}
  </SectionCard>
);

export default PushSection;
