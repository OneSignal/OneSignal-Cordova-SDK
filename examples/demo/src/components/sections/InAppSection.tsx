import type { FC } from 'react';
import SectionCard from '../SectionCard';
import ToggleRow from '../ToggleRow';

interface InAppSectionProps {
  inAppMessagesPaused: boolean;
  onTogglePaused: (checked: boolean) => void;
  onInfoTap: () => void;
}

const InAppSection: FC<InAppSectionProps> = ({
  inAppMessagesPaused,
  onTogglePaused,
  onInfoTap,
}) => (
  <SectionCard title="IN-APP MESSAGING" onInfoTap={onInfoTap} sectionKey="iam">
    <ToggleRow
      label="Pause In-App Messages"
      description="Toggle in-app message display"
      checked={inAppMessagesPaused}
      onToggle={onTogglePaused}
      testID="pause_iam_toggle"
    />
  </SectionCard>
);

export default InAppSection;
