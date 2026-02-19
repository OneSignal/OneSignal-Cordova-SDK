import type { FC } from 'react';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface SendPushSectionProps {
  onInfoTap: () => void;
  onSendSimple: () => void;
  onSendImage: () => void;
  onSendCustom: () => void;
}

const SendPushSection: FC<SendPushSectionProps> = ({
  onInfoTap,
  onSendSimple,
  onSendImage,
  onSendCustom,
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
  </SectionCard>
);

export default SendPushSection;
