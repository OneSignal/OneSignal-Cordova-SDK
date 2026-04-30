import type { FC } from 'react';
import { useState } from 'react';

import { showSnackbar } from '../../utils/showSnackbar';
import ActionButton from '../ActionButton';
import TrackEventModal from '../modals/TrackEventModal';
import SectionCard from '../SectionCard';

interface CustomEventsSectionProps {
  onTrackEvent: (name: string, properties?: Record<string, unknown>) => void;
  onInfoTap: () => void;
}

const CustomEventsSection: FC<CustomEventsSectionProps> = ({ onTrackEvent, onInfoTap }) => {
  const [open, setOpen] = useState(false);

  return (
    <SectionCard title="CUSTOM EVENTS" onInfoTap={onInfoTap} sectionKey="custom_events">
      <ActionButton type="button" onClick={() => setOpen(true)} data-testid="track_event_button">
        TRACK EVENT
      </ActionButton>
      <TrackEventModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(name, properties) => {
          onTrackEvent(name, properties);
          showSnackbar(`Event tracked: ${name}`);
          setOpen(false);
        }}
      />
    </SectionCard>
  );
};

export default CustomEventsSection;
