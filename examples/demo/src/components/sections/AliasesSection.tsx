import type { FC } from 'react';
import type { PairItem } from '../ListWidgets';
import ActionButton from '../ActionButton';
import { PairList } from '../ListWidgets';
import SectionCard from '../SectionCard';

interface AliasesSectionProps {
  aliasItems: PairItem[];
  onInfoTap: () => void;
  onAddAlias: () => void;
  onAddMultipleAliases: () => void;
}

const AliasesSection: FC<AliasesSectionProps> = ({
  aliasItems,
  onInfoTap,
  onAddAlias,
  onAddMultipleAliases,
}) => (
  <SectionCard title="ALIASES" onInfoTap={onInfoTap}>
    <PairList items={aliasItems} emptyText="No Aliases Added" />
    <ActionButton type="button" onClick={onAddAlias}>
      ADD
    </ActionButton>
    <ActionButton type="button" onClick={onAddMultipleAliases}>
      ADD MULTIPLE
    </ActionButton>
  </SectionCard>
);

export default AliasesSection;
