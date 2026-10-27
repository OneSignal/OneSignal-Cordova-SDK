import { IonToggle } from '@ionic/react';
import type { FC } from 'react';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface PushSectionProps {
  pushSubscriptionId: string | null | undefined;
  pushSubscriptionToken: string | null | undefined;
  isPushEnabled: boolean;
  hasNotificationPermission: boolean;
  onTogglePush: (checked: boolean) => void;
  onPromptPush: () => void;
  onInfoTap: () => void;
}

const PushSection: FC<PushSectionProps> = ({
  pushSubscriptionId,
  pushSubscriptionToken,
  isPushEnabled,
  hasNotificationPermission,
  onTogglePush,
  onPromptPush,
  onInfoTap,
}) => (
  <SectionCard title="PUSH" onInfoTap={onInfoTap} sectionKey="push">
    <div className="card kv-card push-card">
      <div className="kv-row">
        <span>Push ID</span>
        <span className="id-value" data-testid="push_id_value">
          {pushSubscriptionId ?? '—'}
        </span>
      </div>
      <div className="divider" />
      <div className="kv-row">
        <span>Status</span>
        <span data-testid="push_subscription_status">
          {isPushEnabled && hasNotificationPermission && pushSubscriptionToken
            ? 'Subscribed'
            : 'Unsubscribed'}
        </span>
      </div>
      <div className="divider" />
      <div className="kv-row kv-row-toggle">
        <span>Opted In</span>
        <IonToggle
          checked={isPushEnabled}
          onIonChange={(event) => onTogglePush(event.detail.checked)}
          aria-label="Push opted in"
          disabled={!hasNotificationPermission}
          data-testid="push_enabled_toggle"
        />
      </div>
    </div>
    {!hasNotificationPermission ? (
      <ActionButton type="button" onClick={onPromptPush} data-testid="prompt_push_button">
        PROMPT PUSH
      </ActionButton>
    ) : null}
  </SectionCard>
);

export default PushSection;
