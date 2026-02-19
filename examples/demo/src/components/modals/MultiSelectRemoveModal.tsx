import { useEffect, useState } from 'react';
import type { FC } from 'react';
import ModalShell from './ModalShell';

interface MultiSelectRemoveModalProps {
  open: boolean;
  title: string;
  items: [string, string][];
  onClose: () => void;
  onSubmit: (keys: string[]) => void;
}

const MultiSelectRemoveModal: FC<MultiSelectRemoveModalProps> = ({
  open,
  title,
  items,
  onClose,
  onSubmit,
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSelectedKeys([]);
    }
  }, [open]);

  return (
    <ModalShell open={open}>
      <div className="multi-select-remove-modal">
        <h3>{title}</h3>
        <div className="checkbox-list">
          {items.map(([key]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={selectedKeys.includes(key)}
                onChange={(event) => {
                  if (event.target.checked) {
                    setSelectedKeys((prev) => [...prev, key]);
                  } else {
                    setSelectedKeys((prev) =>
                      prev.filter((selectedKey) => selectedKey !== key),
                    );
                  }
                }}
              />
              <span>{key}</span>
            </label>
          ))}
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit(selectedKeys)}
            disabled={!selectedKeys.length}
          >
            Remove ({selectedKeys.length})
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default MultiSelectRemoveModal;
