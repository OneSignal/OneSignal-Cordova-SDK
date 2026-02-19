import type { FC } from 'react';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';
import ToggleRow from '../ToggleRow';

interface LocationSectionProps {
  locationShared: boolean;
  onInfoTap: () => void;
  onToggleLocationShared: (checked: boolean) => void;
  onPromptLocation: () => void;
}

const LocationSection: FC<LocationSectionProps> = ({
  locationShared,
  onInfoTap,
  onToggleLocationShared,
  onPromptLocation,
}) => (
  <SectionCard title="LOCATION" onInfoTap={onInfoTap}>
    <ToggleRow
      label="Location Shared"
      description="Share device location with OneSignal"
      checked={locationShared}
      onToggle={onToggleLocationShared}
    />
    <ActionButton type="button" onClick={onPromptLocation}>
      PROMPT LOCATION
    </ActionButton>
  </SectionCard>
);

export default LocationSection;
