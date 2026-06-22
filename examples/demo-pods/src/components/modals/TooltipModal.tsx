import type { FC } from 'react';

import type { TooltipData } from '../../services/TooltipHelper';
import ModalShell from './ModalShell';

interface TooltipModalProps {
  open: boolean;
  tooltip: TooltipData | null;
  onClose: () => void;
}

const TooltipModal: FC<TooltipModalProps> = ({ open, tooltip, onClose }) => (
  <ModalShell open={open}>
    <h3 data-testid="tooltip_title">{tooltip?.title ?? 'Info'}</h3>
    <p data-testid="tooltip_description">{tooltip?.description ?? ''}</p>
    {tooltip?.options?.length ? (
      <div className="tooltip-options">
        {tooltip.options.map((option) => (
          <div key={option.name} className="tooltip-option">
            <strong>{option.name}</strong>
            <p>{option.description}</p>
          </div>
        ))}
      </div>
    ) : null}
    <div className="modal-actions">
      <button type="button" onClick={onClose} data-testid="tooltip_ok_button">
        OK
      </button>
    </div>
  </ModalShell>
);

export default TooltipModal;
