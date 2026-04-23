import type { FC } from 'react';
import { useState } from 'react';
import ActionButton from '../ActionButton';
import { SingleList } from '../ListWidgets';
import SingleInputModal from '../modals/SingleInputModal';
import SectionCard from '../SectionCard';

interface EmailsSectionProps {
  emails: string[];
  loading?: boolean;
  onAdd: (email: string) => void;
  onRemove: (email: string) => void;
  onInfoTap?: () => void;
}

const EmailsSection: FC<EmailsSectionProps> = ({
  emails,
  loading = false,
  onAdd,
  onRemove,
  onInfoTap,
}) => {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <SectionCard title="EMAILS" onInfoTap={onInfoTap} sectionKey="emails">
      <SingleList
        items={emails}
        emptyText="No emails added"
        loading={loading}
        onRemove={(email) => onRemove(email)}
        sectionKey="emails"
      />
      <ActionButton
        type="button"
        onClick={() => setAddOpen(true)}
        data-testid="add_email_button"
      >
        ADD EMAIL
      </ActionButton>
      <SingleInputModal
        open={addOpen}
        title="Add Email"
        placeholder="Email Address"
        confirmLabel="Add"
        inputTestId="email_input"
        onClose={() => setAddOpen(false)}
        onSubmit={(value) => {
          onAdd(value);
          setAddOpen(false);
        }}
      />
    </SectionCard>
  );
};

export default EmailsSection;
