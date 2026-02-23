import { useEffect, useState } from 'react';
import type { FC } from 'react';
import ModalShell from './ModalShell';

interface PairInputModalProps {
  open: boolean;
  title: string;
  firstPlaceholder: string;
  secondPlaceholder: string;
  confirmLabel: string;
  onClose: () => void;
  onSubmit: (first: string, second: string) => void;
}

const PairInputModal: FC<PairInputModalProps> = ({
  open,
  title,
  firstPlaceholder,
  secondPlaceholder,
  confirmLabel,
  onClose,
  onSubmit,
}) => {
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');

  useEffect(() => {
    if (open) {
      setFirst('');
      setSecond('');
    }
  }, [open]);

  return (
    <ModalShell open={open}>
      <form
        autoCapitalize="off"
        onSubmit={(event) => {
          event.preventDefault();
          const firstValue = first.trim();
          const secondValue = second.trim();
          if (!firstValue || !secondValue) return;
          onSubmit(firstValue, secondValue);
        }}
      >
        <h3>{title}</h3>
        <div className="inline-fields">
          <input
            value={first}
            onChange={(event) => setFirst(event.target.value)}
            placeholder={firstPlaceholder}
          />
          <input
            value={second}
            onChange={(event) => setSecond(event.target.value)}
            placeholder={secondPlaceholder}
          />
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit">{confirmLabel}</button>
        </div>
      </form>
    </ModalShell>
  );
};

export default PairInputModal;
