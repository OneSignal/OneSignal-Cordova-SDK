import { useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { MdClose } from 'react-icons/md';

import ModalShell from './ModalShell';

type Row = { id: number; key: string; value: string };

let nextRowId = 0;

function makeRow(): Row {
  nextRowId += 1;
  return { id: nextRowId, key: '', value: '' };
}

interface MultiPairInputModalProps {
  open: boolean;
  title: string;
  keyPlaceholder: string;
  valuePlaceholder: string;
  onClose: () => void;
  onSubmit: (pairs: Record<string, string>) => void;
}

const MultiPairInputModal: FC<MultiPairInputModalProps> = ({
  open,
  title,
  keyPlaceholder,
  valuePlaceholder,
  onClose,
  onSubmit,
}) => {
  const [rows, setRows] = useState<Row[]>(() => [makeRow()]);

  useEffect(() => {
    if (open) {
      setRows([makeRow()]);
    }
  }, [open]);

  const isValid = useMemo(
    () =>
      rows.length > 0 &&
      rows.every((row) => row.key.trim().length > 0 && row.value.trim().length > 0),
    [rows],
  );

  return (
    <ModalShell open={open}>
      <form
        autoCapitalize="off"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isValid) return;
          const pairs = Object.fromEntries(
            rows.map((row) => [row.key.trim(), row.value.trim()]),
          );
          onSubmit(pairs);
        }}
      >
        <h3>{title}</h3>
        {rows.map((row, index) => (
          <div key={row.id}>
            <div className="inline-fields row-with-remove">
              <input
                value={row.key}
                onChange={(event) =>
                  setRows((prev) =>
                    prev.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, key: event.target.value } : entry,
                    ),
                  )
                }
                placeholder={keyPlaceholder}
                data-testid={`multipair_key_${index}`}
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
                placeholder={valuePlaceholder}
                data-testid={`multipair_value_${index}`}
              />
              {rows.length > 1 ? (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() =>
                    setRows((prev) => prev.filter((_, entryIndex) => entryIndex !== index))
                  }
                >
                  <MdClose />
                </button>
              ) : null}
            </div>
            {index < rows.length - 1 ? <div className="multi-row-divider" /> : null}
          </div>
        ))}
        <button
          type="button"
          className="text-btn text-btn-center"
          onClick={() => setRows((prev) => [...prev, makeRow()])}
          data-testid="multipair_add_row_button"
        >
          + Add Row
        </button>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={!isValid} data-testid="multipair_confirm_button">
            Add All
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default MultiPairInputModal;
