import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import ModalShell from './ModalShell';

type Row = { key: string; value: string };

interface MultiPairInputModalProps {
  open: boolean;
  title: string;
  firstPlaceholder: string;
  secondPlaceholder: string;
  onClose: () => void;
  onSubmit: (pairs: Record<string, string>) => void;
}

const MultiPairInputModal: FC<MultiPairInputModalProps> = ({
  open,
  title,
  firstPlaceholder,
  secondPlaceholder,
  onClose,
  onSubmit,
}) => {
  const [rows, setRows] = useState<Row[]>([{ key: '', value: '' }]);

  useEffect(() => {
    if (open) {
      setRows([{ key: '', value: '' }]);
    }
  }, [open]);

  const isValid = useMemo(
    () => rows.length > 0 && rows.every((row) => row.key.trim().length > 0 && row.value.trim().length > 0),
    [rows],
  );

  return (
    <ModalShell open={open}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!isValid) return;
          const pairs: Record<string, string> = {};
          rows.forEach((row) => {
            pairs[row.key.trim()] = row.value.trim();
          });
          onSubmit(pairs);
        }}
      >
        <h3>{title}</h3>
        {rows.map((row, index) => (
          <div className="inline-fields row-with-remove" key={`row-${index}`}>
            <input
              value={row.key}
              onChange={(event) =>
                setRows((prev) =>
                  prev.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, key: event.target.value } : entry,
                  ),
                )
              }
              placeholder={firstPlaceholder}
            />
            <input
              value={row.value}
              onChange={(event) =>
                setRows((prev) =>
                  prev.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, value: event.target.value } : entry,
                  ),
                )
              }
              placeholder={secondPlaceholder}
            />
            {rows.length > 1 ? (
              <button
                type="button"
                className="delete-btn"
                onClick={() => setRows((prev) => prev.filter((_, entryIndex) => entryIndex !== index))}
              >
                ✕
              </button>
            ) : null}
          </div>
        ))}
        <button type="button" className="text-btn" onClick={() => setRows((prev) => [...prev, { key: '', value: '' }])}>
          + Add Row
        </button>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={!isValid}>Add All</button>
        </div>
      </form>
    </ModalShell>
  );
};

export default MultiPairInputModal;
