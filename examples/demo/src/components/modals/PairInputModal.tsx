import { useEffect, useState } from 'react';
import type { FC } from 'react';
import ModalShell from './ModalShell';

interface PairInputModalProps {
  open: boolean;
  title: string;
  keyPlaceholder: string;
  valuePlaceholder: string;
  confirmLabel: string;
  onClose: () => void;
  onSubmit: (key: string, value: string) => void;
  keyTestID?: string;
  valueTestID?: string;
}

const PairInputModal: FC<PairInputModalProps> = ({
  open,
  title,
  keyPlaceholder,
  valuePlaceholder,
  confirmLabel,
  onClose,
  onSubmit,
  keyTestID,
  valueTestID,
}) => {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) {
      setKey('');
      setValue('');
    }
  }, [open]);

  return (
    <ModalShell open={open}>
      <form
        autoCapitalize="off"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmedKey = key.trim();
          const trimmedValue = value.trim();
          if (!trimmedKey || !trimmedValue) return;
          onSubmit(trimmedKey, trimmedValue);
        }}
      >
        <h3>{title}</h3>
        <div className="inline-fields">
          <input
            value={key}
            onChange={(event) => setKey(event.target.value)}
            placeholder={keyPlaceholder}
            data-testid={keyTestID}
          />
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={valuePlaceholder}
            data-testid={valueTestID}
          />
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" data-testid="singlepair_confirm_button">
            {confirmLabel}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default PairInputModal;
