import type { FC } from 'react';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface TrackEventSectionProps {
  onInfoTap: () => void;
  onTrackEvent: () => void;
}

const TrackEventSection: FC<TrackEventSectionProps> = ({
  onInfoTap,
  onTrackEvent,
}) => (
  <SectionCard title="TRACK EVENT" onInfoTap={onInfoTap}>
    <ActionButton type="button" onClick={onTrackEvent}>
      TRACK EVENT
    </ActionButton>
  </SectionCard>
);

export default TrackEventSection;
