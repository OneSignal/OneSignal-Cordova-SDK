import { useEffect, useState } from 'react';
import type { FC } from 'react';
import ModalShell from './ModalShell';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

interface TrackEventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, properties?: Record<string, unknown>) => void;
}

const TrackEventModal: FC<TrackEventModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [properties, setProperties] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setProperties('');
      setError(null);
    }
  }, [open]);

  return (
    <ModalShell open={open}>
      <form
        autoCapitalize="off"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmedName = name.trim();
          if (!trimmedName) return;
          if (!properties.trim()) {
            onSubmit(trimmedName, undefined);
            return;
          }
          try {
            const parsed = JSON.parse(properties);
            if (!isRecord(parsed)) {
              setError('Properties must be a JSON object');
              return;
            }
            onSubmit(trimmedName, parsed);
          } catch {
            setError('Properties must be valid JSON');
          }
        }}
      >
        <h3>Track Event</h3>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Event Name"
        />
        <textarea
          value={properties}
          onChange={(event) => {
            setProperties(event.target.value);
            setError(null);
          }}
          placeholder="Properties (JSON, optional)"
        />
        {error ? <p className="error">{error}</p> : null}
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">Track</button>
        </div>
      </form>
    </ModalShell>
  );
};

export default TrackEventModal;
