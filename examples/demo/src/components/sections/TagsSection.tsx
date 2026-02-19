import type { FC } from 'react';
import type { PairItem } from '../ListWidgets';
import ActionButton from '../ActionButton';
import { PairList } from '../ListWidgets';
import SectionCard from '../SectionCard';

interface TagsSectionProps {
  tagItems: PairItem[];
  onInfoTap: () => void;
  onRemoveTag: (key: string) => void;
  onAddTag: () => void;
  onAddMultipleTags: () => void;
  onRemoveSelectedTags: () => void;
}

const TagsSection: FC<TagsSectionProps> = ({
  tagItems,
  onInfoTap,
  onRemoveTag,
  onAddTag,
  onAddMultipleTags,
  onRemoveSelectedTags,
}) => (
  <SectionCard title="TAGS" onInfoTap={onInfoTap}>
    <PairList
      items={tagItems}
      emptyText="No tags added"
      onRemove={onRemoveTag}
    />
    <ActionButton type="button" onClick={onAddTag}>
      ADD
    </ActionButton>
    <ActionButton type="button" onClick={onAddMultipleTags}>
      ADD MULTIPLE
    </ActionButton>
    <ActionButton
      variant="outline"
      type="button"
      onClick={onRemoveSelectedTags}
    >
      REMOVE SELECTED
    </ActionButton>
  </SectionCard>
);

export default TagsSection;
