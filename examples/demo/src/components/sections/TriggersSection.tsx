import type { FC } from 'react';
import type { PairItem } from '../ListWidgets';
import ActionButton from '../ActionButton';
import { PairList } from '../ListWidgets';
import SectionCard from '../SectionCard';

interface TriggersSectionProps {
  triggerItems: PairItem[];
  onInfoTap: () => void;
  onRemoveTrigger: (key: string) => void;
  onAddTrigger: () => void;
  onAddMultipleTriggers: () => void;
  onRemoveSelectedTriggers: () => void;
  onClearTriggers: () => void;
}

const TriggersSection: FC<TriggersSectionProps> = ({
  triggerItems,
  onInfoTap,
  onRemoveTrigger,
  onAddTrigger,
  onAddMultipleTriggers,
  onRemoveSelectedTriggers,
  onClearTriggers,
}) => (
  <SectionCard title="TRIGGERS" onInfoTap={onInfoTap}>
    <PairList
      items={triggerItems}
      emptyText="No Triggers Added"
      onRemove={onRemoveTrigger}
    />
    <ActionButton type="button" onClick={onAddTrigger}>
      ADD
    </ActionButton>
    <ActionButton type="button" onClick={onAddMultipleTriggers}>
      ADD MULTIPLE
    </ActionButton>
    {triggerItems.length ? (
      <ActionButton
        variant="outline"
        type="button"
        onClick={onRemoveSelectedTriggers}
      >
        REMOVE SELECTED
      </ActionButton>
    ) : null}
    {triggerItems.length ? (
      <ActionButton variant="outline" type="button" onClick={onClearTriggers}>
        CLEAR ALL
      </ActionButton>
    ) : null}
  </SectionCard>
);

export default TriggersSection;
