import type { FC } from 'react';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface OutcomesSectionProps {
  onInfoTap: () => void;
  onSendOutcome: () => void;
}

const OutcomesSection: FC<OutcomesSectionProps> = ({ onInfoTap, onSendOutcome }) => (
  <SectionCard title="OUTCOME EVENTS" onInfoTap={onInfoTap}>
    <ActionButton type="button" onClick={onSendOutcome}>
      SEND OUTCOME
    </ActionButton>
  </SectionCard>
);

export default OutcomesSection;
