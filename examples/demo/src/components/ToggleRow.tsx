import { IonToggle } from '@ionic/react';
import type { FC } from 'react';

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  testID?: string;
}

const ToggleRow: FC<ToggleRowProps> = ({ label, description, checked, onToggle, testID }) => (
  <div className="card toggle-card">
    <div>
      <div className="label">{label}</div>
      {description ? <div className="sub">{description}</div> : null}
    </div>
    <IonToggle
      checked={checked}
      onIonChange={(event) => onToggle(event.detail.checked)}
      data-testid={testID}
    />
  </div>
);

export default ToggleRow;
