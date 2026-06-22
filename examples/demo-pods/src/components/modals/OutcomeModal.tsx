import { useEffect, useState } from 'react';
import type { FC } from 'react';

import ModalShell from './ModalShell';

export type OutcomeMode = 'normal' | 'unique' | 'value';

interface OutcomeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, mode: OutcomeMode, value: number | null) => void;
}

const OutcomeModal: FC<OutcomeModalProps> = ({ open, onClose, onSubmit }) => {
  const [mode, setMode] = useState<OutcomeMode>('normal');
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) {
      setMode('normal');
      setName('');
      setValue('');
    }
  }, [open]);

  return (
    <ModalShell open={open}>
      <form
        autoCapitalize="off"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = name.trim();
          if (!trimmed) return;
          if (mode === 'value') {
            const numericValue = Number(value);
            if (Number.isNaN(numericValue)) return;
            onSubmit(trimmed, mode, numericValue);
            return;
          }
          onSubmit(trimmed, mode, null);
        }}
      >
        <h3 className="outcome-title">Send Outcome</h3>
        <div className="radio-list outcome-radio-list">
          <label>
            <input
              type="radio"
              checked={mode === 'normal'}
              onChange={() => setMode('normal')}
              data-testid="outcome_type_normal_radio"
            />
            Normal Outcome
          </label>
          <label>
            <input
              type="radio"
              checked={mode === 'unique'}
              onChange={() => setMode('unique')}
              data-testid="outcome_type_unique_radio"
            />
            Unique Outcome
          </label>
          <label>
            <input
              type="radio"
              checked={mode === 'value'}
              onChange={() => setMode('value')}
              data-testid="outcome_type_value_radio"
            />
            Outcome with Value
          </label>
        </div>
        <input
          className="outcome-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Outcome Name"
          data-testid="outcome_name_input"
        />
        {mode === 'value' ? (
          <input
            className="outcome-input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Outcome Value"
            data-testid="outcome_value_input"
          />
        ) : null}
        <div className="modal-actions outcome-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" data-testid="outcome_send_button">
            Send
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default OutcomeModal;
