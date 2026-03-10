import type { FC } from 'react';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface SendPushSectionProps {
  onInfoTap: () => void;
  onSendSimple: () => void;
  onSendImage: () => void;
  onSendCustom: () => void;
  onClearAll: () => void;
}

const SendPushSection: FC<SendPushSectionProps> = ({
  onInfoTap,
  onSendSimple,
  onSendImage,
  onSendCustom,
  onClearAll,
}) => (
  <SectionCard title="SEND PUSH NOTIFICATION" onInfoTap={onInfoTap}>
    <ActionButton type="button" onClick={onSendSimple}>
      SIMPLE
    </ActionButton>
    <ActionButton type="button" onClick={onSendImage}>
      WITH IMAGE
    </ActionButton>
    <ActionButton type="button" onClick={onSendCustom}>
      CUSTOM
    </ActionButton>
    <ActionButton variant="outline" type="button" onClick={onClearAll}>
      CLEAR ALL
    </ActionButton>
  </SectionCard>
);

export default SendPushSection;
