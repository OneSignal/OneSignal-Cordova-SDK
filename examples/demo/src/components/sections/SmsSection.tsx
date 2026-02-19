import type { FC } from 'react';
import ActionButton from '../ActionButton';
import { SingleList } from '../ListWidgets';
import SectionCard from '../SectionCard';

interface SmsSectionProps {
  smsNumbers: string[];
  onInfoTap: () => void;
  onAddSms: () => void;
}

const SmsSection: FC<SmsSectionProps> = ({ smsNumbers, onInfoTap, onAddSms }) => (
  <SectionCard title="SMS" onInfoTap={onInfoTap}>
    <SingleList items={smsNumbers} emptyText="No SMS added" />
    <ActionButton type="button" onClick={onAddSms}>
      ADD SMS
    </ActionButton>
  </SectionCard>
);

export default SmsSection;
