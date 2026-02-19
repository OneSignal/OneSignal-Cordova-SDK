import type { FC, ReactNode } from 'react';

interface ModalShellProps {
  open: boolean;
  children: ReactNode;
}

const ModalShell: FC<ModalShellProps> = ({ open, children }) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">{children}</div>
    </div>
  );
};

export default ModalShell;
