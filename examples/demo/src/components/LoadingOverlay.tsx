import { IonSpinner } from '@ionic/react';
import type { FC } from 'react';

interface LoadingOverlayProps {
  visible: boolean;
}

const LoadingOverlay: FC<LoadingOverlayProps> = ({ visible }) =>
  visible ? (
    <div className="loading-overlay">
      <IonSpinner name="crescent" />
    </div>
  ) : null;

export default LoadingOverlay;
