import { useEffect, useState } from 'react';
import type { FC } from 'react';

import ModalShell from './ModalShell';

interface SingleInputModalProps {
  open: boolean;
  title: string;
  placeholder: string;
  confirmLabel: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
  inputTestId?: string;
}

const SingleInputModal: FC<SingleInputModalProps> = ({
  open,
  title,
  placeholder,
  confirmLabel,
  onClose,
  onSubmit,
  inputTestId,
}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) {
      setValue('');
    }
  }, [open]);

  return (
    <ModalShell open={open}>
      <form
        autoCapitalize="off"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = value.trim();
          if (!trimmed) return;
          onSubmit(trimmed);
        }}
      >
        <h3>{title}</h3>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          data-testid={inputTestId}
        />
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" data-testid="singleinput_confirm_button">
            {confirmLabel}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default SingleInputModal;
