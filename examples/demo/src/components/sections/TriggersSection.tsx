import type { FC } from 'react';
import type { PairItem } from '../ListWidgets';
import ActionButton from '../ActionButton';
import { PairList } from '../ListWidgets';
import SectionCard from '../SectionCard';

interface TriggersSectionProps {
  triggerItems: PairItem[];
  onInfoTap: () => void;
  onAddTrigger: () => void;
  onAddMultipleTriggers: () => void;
  onRemoveSelectedTriggers: () => void;
  onClearTriggers: () => void;
}

const TriggersSection: FC<TriggersSectionProps> = ({
  triggerItems,
  onInfoTap,
  onAddTrigger,
  onAddMultipleTriggers,
  onRemoveSelectedTriggers,
  onClearTriggers,
}) => (
  <SectionCard title="TRIGGERS" onInfoTap={onInfoTap}>
    <PairList items={triggerItems} emptyText="No triggers added" />
    <ActionButton type="button" onClick={onAddTrigger}>
      ADD
    </ActionButton>
    <ActionButton type="button" onClick={onAddMultipleTriggers}>
      ADD MULTIPLE
    </ActionButton>
    <ActionButton variant="outline" type="button" onClick={onRemoveSelectedTriggers}>
      REMOVE SELECTED
    </ActionButton>
    <ActionButton variant="outline" type="button" onClick={onClearTriggers}>
      CLEAR
    </ActionButton>
  </SectionCard>
);

export default TriggersSection;
