import type { FC } from 'react';
import { useState } from 'react';
import ActionButton from '../ActionButton';
import { SingleList } from '../ListWidgets';
import SingleInputModal from '../modals/SingleInputModal';
import SectionCard from '../SectionCard';

interface SmsSectionProps {
  smsNumbers: string[];
  loading?: boolean;
  onAdd: (sms: string) => void;
  onRemove: (sms: string) => void;
  onInfoTap?: () => void;
}

const SmsSection: FC<SmsSectionProps> = ({
  smsNumbers,
  loading = false,
  onAdd,
  onRemove,
  onInfoTap,
}) => {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <SectionCard title="SMS" onInfoTap={onInfoTap} sectionKey="sms">
      <SingleList
        items={smsNumbers}
        emptyText="No SMS added"
        loading={loading}
        onRemove={(sms) => onRemove(sms)}
        sectionKey="sms"
      />
      <ActionButton
        type="button"
        onClick={() => setAddOpen(true)}
        data-testid="add_sms_button"
      >
        ADD SMS
      </ActionButton>
      <SingleInputModal
        open={addOpen}
        title="Add SMS"
        placeholder="Phone Number"
        confirmLabel="Add"
        inputTestId="sms_input"
        onClose={() => setAddOpen(false)}
        onSubmit={(value) => {
          onAdd(value);
          setAddOpen(false);
        }}
      />
    </SectionCard>
  );
};

export default SmsSection;
