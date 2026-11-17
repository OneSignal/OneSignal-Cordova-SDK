import type { FC, ReactNode } from 'react';

interface ButtonGridProps {
  children: ReactNode;
}

const ButtonGrid: FC<ButtonGridProps> = ({ children }) => (
  <div className="button-grid">{children}</div>
);

export default ButtonGrid;
