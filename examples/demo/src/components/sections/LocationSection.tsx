import type { FC } from 'react';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';
import { useSnackbar } from '../ToastProvider';
import ToggleRow from '../ToggleRow';

interface LocationSectionProps {
  locationShared: boolean;
  onSetLocationShared: (shared: boolean) => void | Promise<void>;
  onRequestLocationPermission: () => void;
  onCheckLocationShared: () => Promise<boolean>;
  onInfoTap: () => void;
}

const LocationSection: FC<LocationSectionProps> = ({
  locationShared,
  onSetLocationShared,
  onRequestLocationPermission,
  onCheckLocationShared,
  onInfoTap,
}) => {
  const showSnackbar = useSnackbar();

  const handleCheckLocation = async (): Promise<void> => {
    const shared = await onCheckLocationShared();
    showSnackbar(`Location shared: ${shared}`);
  };

  return (
    <SectionCard title="LOCATION" onInfoTap={onInfoTap} sectionKey="location">
      <ToggleRow
        label="Location Shared"
        description="Share device location with OneSignal"
        checked={locationShared}
        onToggle={(value) => {
          void onSetLocationShared(value);
        }}
        testID="location_shared_toggle"
      />
      <ActionButton
        type="button"
        onClick={onRequestLocationPermission}
        data-testid="prompt_location_button"
      >
        PROMPT LOCATION
      </ActionButton>
      <ActionButton
        type="button"
        onClick={() => void handleCheckLocation()}
        data-testid="check_location_button"
      >
        CHECK LOCATION SHARED
      </ActionButton>
    </SectionCard>
  );
};

export default LocationSection;
