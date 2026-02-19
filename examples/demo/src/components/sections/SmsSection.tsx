import type { FC } from 'react';
import ActionButton from '../ActionButton';
import { SingleList } from '../ListWidgets';
import SectionCard from '../SectionCard';

interface SmsSectionProps {
  smsNumbers: string[];
  onInfoTap: () => void;
  onAddSms: () => void;
  onRemoveSms: (sms: string) => void;
}

const SmsSection: FC<SmsSectionProps> = ({
  smsNumbers,
  onInfoTap,
  onAddSms,
  onRemoveSms,
}) => (
  <SectionCard title="SMS" onInfoTap={onInfoTap}>
    <SingleList
      items={smsNumbers}
      emptyText="No SMS added"
      onRemove={onRemoveSms}
    />
    <ActionButton type="button" onClick={onAddSms}>
      ADD SMS
    </ActionButton>
  </SectionCard>
);

export default SmsSection;
