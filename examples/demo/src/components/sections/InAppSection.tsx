import type { FC } from 'react';
import SectionCard from '../SectionCard';
import ToggleRow from '../ToggleRow';

interface InAppSectionProps {
  inAppMessagesPaused: boolean;
  onInfoTap: () => void;
  onTogglePaused: (checked: boolean) => void;
}

const InAppSection: FC<InAppSectionProps> = ({
  inAppMessagesPaused,
  onInfoTap,
  onTogglePaused,
}) => (
  <SectionCard title="IN-APP MESSAGING" onInfoTap={onInfoTap}>
    <ToggleRow
      label="Pause In-App Messages"
      description="Toggle in-app message display"
      checked={inAppMessagesPaused}
      onToggle={onTogglePaused}
    />
  </SectionCard>
);

export default InAppSection;
