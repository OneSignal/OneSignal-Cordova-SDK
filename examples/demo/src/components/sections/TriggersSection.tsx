import type { FC } from 'react';
import { useMemo, useState } from 'react';
import ActionButton from '../ActionButton';
import { PairList } from '../ListWidgets';
import MultiPairInputModal from '../modals/MultiPairInputModal';
import MultiSelectRemoveModal from '../modals/MultiSelectRemoveModal';
import PairInputModal from '../modals/PairInputModal';
import SectionCard from '../SectionCard';

interface TriggersSectionProps {
  triggers: [string, string][];
  onAdd: (key: string, value: string) => void;
  onAddMultiple: (pairs: Record<string, string>) => void;
  onRemoveSelected: (keys: string[]) => void;
  onClearAll: () => void;
  onInfoTap?: () => void;
}

const TriggersSection: FC<TriggersSectionProps> = ({
  triggers,
  onAdd,
  onAddMultiple,
  onRemoveSelected,
  onClearAll,
  onInfoTap,
}) => {
  const [addOpen, setAddOpen] = useState(false);
  const [addMultipleOpen, setAddMultipleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const items = useMemo(
    () => triggers.map(([key, value]) => ({ key, value })),
    [triggers],
  );

  return (
    <SectionCard title="TRIGGERS" onInfoTap={onInfoTap} sectionKey="triggers">
      <PairList
        items={items}
        emptyText="No triggers added"
        onRemove={(key) => onRemoveSelected([key])}
        sectionKey="triggers"
      />
      <ActionButton
        type="button"
        onClick={() => setAddOpen(true)}
        data-testid="add_trigger_button"
      >
        ADD TRIGGER
      </ActionButton>
      <ActionButton
        type="button"
        onClick={() => setAddMultipleOpen(true)}
        data-testid="add_multiple_triggers_button"
      >
        ADD MULTIPLE TRIGGERS
      </ActionButton>
      {triggers.length > 0 ? (
        <>
          <ActionButton
            variant="outline"
            type="button"
            onClick={() => setRemoveOpen(true)}
            data-testid="remove_triggers_button"
          >
            REMOVE TRIGGERS
          </ActionButton>
          <ActionButton
            variant="outline"
            type="button"
            onClick={onClearAll}
            data-testid="clear_triggers_button"
          >
            CLEAR ALL TRIGGERS
          </ActionButton>
        </>
      ) : null}
      <PairInputModal
        open={addOpen}
        title="Add Trigger"
        keyPlaceholder="Key"
        valuePlaceholder="Value"
        confirmLabel="Add"
        keyTestID="trigger_key_input"
        valueTestID="trigger_value_input"
        onClose={() => setAddOpen(false)}
        onSubmit={(key, value) => {
          onAdd(key, value);
          setAddOpen(false);
        }}
      />
      <MultiPairInputModal
        open={addMultipleOpen}
        title="Add Multiple Triggers"
        keyPlaceholder="Key"
        valuePlaceholder="Value"
        onClose={() => setAddMultipleOpen(false)}
        onSubmit={(pairs) => {
          onAddMultiple(pairs);
          setAddMultipleOpen(false);
        }}
      />
      <MultiSelectRemoveModal
        open={removeOpen}
        title="Remove Triggers"
        items={triggers}
        onClose={() => setRemoveOpen(false)}
        onSubmit={(keys) => {
          onRemoveSelected(keys);
          setRemoveOpen(false);
        }}
      />
    </SectionCard>
  );
};

export default TriggersSection;
