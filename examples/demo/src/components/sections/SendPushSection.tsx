import type { FC } from 'react';
import { useState } from 'react';
import { NotificationType } from '../../models/NotificationType';
import ActionButton from '../ActionButton';
import CustomNotificationModal from '../modals/CustomNotificationModal';
import SectionCard from '../SectionCard';

interface SendPushSectionProps {
  onSendNotification: (type: NotificationType) => void | Promise<void>;
  onSendCustomNotification: (
    title: string,
    body: string,
  ) => void | Promise<void>;
  onClearAll: () => void;
  onInfoTap: () => void;
}

const SendPushSection: FC<SendPushSectionProps> = ({
  onSendNotification,
  onSendCustomNotification,
  onClearAll,
  onInfoTap,
}) => {
  const [customOpen, setCustomOpen] = useState(false);

  return (
    <SectionCard
      title="SEND PUSH NOTIFICATION"
      onInfoTap={onInfoTap}
      sectionKey="send_push"
    >
      <ActionButton
        type="button"
        onClick={() => void onSendNotification(NotificationType.Simple)}
        data-testid="send_simple_button"
      >
        SIMPLE
      </ActionButton>
      <ActionButton
        type="button"
        onClick={() => void onSendNotification(NotificationType.WithImage)}
        data-testid="send_image_button"
      >
        WITH IMAGE
      </ActionButton>
      <ActionButton
        type="button"
        onClick={() => setCustomOpen(true)}
        data-testid="send_custom_button"
      >
        CUSTOM
      </ActionButton>
      <ActionButton
        variant="outline"
        type="button"
        onClick={onClearAll}
        data-testid="clear_all_button"
      >
        CLEAR ALL
      </ActionButton>
      <CustomNotificationModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSubmit={(title, body) => {
          void onSendCustomNotification(title, body);
          setCustomOpen(false);
        }}
      />
    </SectionCard>
  );
};

export default SendPushSection;
