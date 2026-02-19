import { IonToggle } from '@ionic/react';
import type { FC } from 'react';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface PushSectionProps {
  pushSubscriptionId: string | null | undefined;
  isPushEnabled: boolean;
  onTogglePush: (checked: boolean) => void;
  onPromptPush: () => void;
  onInfoTap: () => void;
}

const PushSection: FC<PushSectionProps> = ({
  pushSubscriptionId,
  isPushEnabled,
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
        <span>Enabled</span>
        <IonToggle
          checked={isPushEnabled}
          onIonChange={(event) => onTogglePush(event.detail.checked)}
          aria-label="Push enabled"
        />
      </div>
    </div>
    <ActionButton variant="outline" type="button" onClick={onPromptPush}>
      PROMPT PUSH
    </ActionButton>
  </SectionCard>
);

export default PushSection;
