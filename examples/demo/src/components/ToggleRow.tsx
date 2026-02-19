import type { ChangeEventHandler, FC } from 'react';

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

const ToggleRow: FC<ToggleRowProps> = ({ label, description, checked, onChange }) => (
  <div className="card toggle-card">
    <div>
      <div className="label">{label}</div>
      {description ? <div className="sub">{description}</div> : null}
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} />
  </div>
);

export default ToggleRow;
