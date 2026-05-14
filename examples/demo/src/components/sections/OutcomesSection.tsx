import type { FC } from 'react';
import { useState } from 'react';

import ActionButton from '../ActionButton';
import OutcomeModal from '../modals/OutcomeModal';
import SectionCard from '../SectionCard';

interface OutcomesSectionProps {
  onSendNormal: (name: string) => void;
  onSendUnique: (name: string) => void;
  onSendWithValue: (name: string, value: number) => void;
  onInfoTap: () => void;
  onShowToast: (message: string) => void;
}

const OutcomesSection: FC<OutcomesSectionProps> = ({
  onSendNormal,
  onSendUnique,
  onSendWithValue,
  onInfoTap,
  onShowToast,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SectionCard title="OUTCOME EVENTS" onInfoTap={onInfoTap} sectionKey="outcomes">
      <ActionButton type="button" onClick={() => setOpen(true)} data-testid="send_outcome_button">
        SEND OUTCOME
      </ActionButton>
      <OutcomeModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(name, mode, value) => {
          if (mode === 'unique') {
            onSendUnique(name);
            onShowToast(`Unique outcome sent: ${name}`);
          } else if (mode === 'value' && value !== null) {
            onSendWithValue(name, value);
            onShowToast(`Outcome sent: ${name} = ${value}`);
          } else {
            onSendNormal(name);
            onShowToast(`Outcome sent: ${name}`);
          }
          setOpen(false);
        }}
      />
    </SectionCard>
  );
};

export default OutcomesSection;
