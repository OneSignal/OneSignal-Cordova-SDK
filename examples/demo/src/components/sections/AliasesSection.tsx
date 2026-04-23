import type { FC } from 'react';
import { useMemo, useState } from 'react';
import ActionButton from '../ActionButton';
import { PairList } from '../ListWidgets';
import MultiPairInputModal from '../modals/MultiPairInputModal';
import PairInputModal from '../modals/PairInputModal';
import SectionCard from '../SectionCard';

const FILTERED_KEYS = ['external_id', 'onesignal_id'];

interface AliasesSectionProps {
  aliases: [string, string][];
  loading?: boolean;
  onAdd: (label: string, id: string) => void;
  onAddMultiple: (pairs: Record<string, string>) => void;
  onInfoTap?: () => void;
}

const AliasesSection: FC<AliasesSectionProps> = ({
  aliases,
  loading = false,
  onAdd,
  onAddMultiple,
  onInfoTap,
}) => {
  const [addOpen, setAddOpen] = useState(false);
  const [addMultipleOpen, setAddMultipleOpen] = useState(false);

  const items = useMemo(
    () =>
      aliases
        .filter(([key]) => !FILTERED_KEYS.includes(key))
        .map(([key, value]) => ({ key, value })),
    [aliases],
  );

  return (
    <SectionCard title="ALIASES" onInfoTap={onInfoTap} sectionKey="aliases">
      <PairList
        items={items}
        emptyText="No aliases added"
        loading={loading}
        sectionKey="aliases"
      />
      <ActionButton
        type="button"
        onClick={() => setAddOpen(true)}
        data-testid="add_alias_button"
      >
        ADD ALIAS
      </ActionButton>
      <ActionButton
        type="button"
        onClick={() => setAddMultipleOpen(true)}
        data-testid="add_multiple_aliases_button"
      >
        ADD MULTIPLE ALIASES
      </ActionButton>
      <PairInputModal
        open={addOpen}
        title="Add Alias"
        keyPlaceholder="Label"
        valuePlaceholder="ID"
        confirmLabel="Add"
        keyTestID="alias_label_input"
        valueTestID="alias_id_input"
        onClose={() => setAddOpen(false)}
        onSubmit={(label, id) => {
          onAdd(label, id);
          setAddOpen(false);
        }}
      />
      <MultiPairInputModal
        open={addMultipleOpen}
        title="Add Multiple Aliases"
        keyPlaceholder="Label"
        valuePlaceholder="ID"
        onClose={() => setAddMultipleOpen(false)}
        onSubmit={(pairs) => {
          onAddMultiple(pairs);
          setAddMultipleOpen(false);
        }}
      />
    </SectionCard>
  );
};

export default AliasesSection;
