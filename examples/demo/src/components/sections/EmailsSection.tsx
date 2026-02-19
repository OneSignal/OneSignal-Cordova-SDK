import type { FC } from 'react';
import ActionButton from '../ActionButton';
import { SingleList } from '../ListWidgets';
import SectionCard from '../SectionCard';

interface EmailsSectionProps {
  emails: string[];
  onInfoTap: () => void;
  onAddEmail: () => void;
  onRemoveEmail: (email: string) => void;
}

const EmailsSection: FC<EmailsSectionProps> = ({
  emails,
  onInfoTap,
  onAddEmail,
  onRemoveEmail,
}) => (
  <SectionCard title="EMAILS" onInfoTap={onInfoTap}>
    <SingleList
      items={emails}
      emptyText="No emails added"
      onRemove={onRemoveEmail}
    />
    <ActionButton type="button" onClick={onAddEmail}>
      ADD EMAIL
    </ActionButton>
  </SectionCard>
);

export default EmailsSection;
