import type { FC } from 'react';
import { useMemo, useState } from 'react';

import ActionButton from '../ActionButton';
import { PairList } from '../ListWidgets';
import MultiPairInputModal from '../modals/MultiPairInputModal';
import MultiSelectRemoveModal from '../modals/MultiSelectRemoveModal';
import PairInputModal from '../modals/PairInputModal';
import SectionCard from '../SectionCard';

interface TagsSectionProps {
  tags: [string, string][];
  loading?: boolean;
  onAdd: (key: string, value: string) => void;
  onAddMultiple: (pairs: Record<string, string>) => void;
  onRemoveSelected: (keys: string[]) => void;
  onInfoTap?: () => void;
}

const TagsSection: FC<TagsSectionProps> = ({
  tags,
  loading = false,
  onAdd,
  onAddMultiple,
  onRemoveSelected,
  onInfoTap,
}) => {
  const [addOpen, setAddOpen] = useState(false);
  const [addMultipleOpen, setAddMultipleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const items = useMemo(() => tags.map(([key, value]) => ({ key, value })), [tags]);

  return (
    <SectionCard title="TAGS" onInfoTap={onInfoTap} sectionKey="tags">
      <PairList
        items={items}
        emptyText="No tags added"
        loading={loading}
        onRemove={(key) => onRemoveSelected([key])}
        sectionKey="tags"
      />
      <ActionButton type="button" onClick={() => setAddOpen(true)} data-testid="add_tag_button">
        ADD TAG
      </ActionButton>
      <ActionButton
        type="button"
        onClick={() => setAddMultipleOpen(true)}
        data-testid="add_multiple_tags_button"
      >
        ADD MULTIPLE TAGS
      </ActionButton>
      {tags.length > 0 ? (
        <ActionButton
          variant="outline"
          type="button"
          onClick={() => setRemoveOpen(true)}
          data-testid="remove_tags_button"
        >
          REMOVE TAGS
        </ActionButton>
      ) : null}
      <PairInputModal
        open={addOpen}
        title="Add Tag"
        keyPlaceholder="Key"
        valuePlaceholder="Value"
        confirmLabel="Add"
        keyTestID="tag_key_input"
        valueTestID="tag_value_input"
        onClose={() => setAddOpen(false)}
        onSubmit={(key, value) => {
          onAdd(key, value);
          setAddOpen(false);
        }}
      />
      <MultiPairInputModal
        open={addMultipleOpen}
        title="Add Multiple Tags"
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
        title="Remove Tags"
        items={tags}
        onClose={() => setRemoveOpen(false)}
        onSubmit={(keys) => {
          onRemoveSelected(keys);
          setRemoveOpen(false);
        }}
      />
    </SectionCard>
  );
};

export default TagsSection;
