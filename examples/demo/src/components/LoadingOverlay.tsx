import { IonSpinner } from '@ionic/react';
import type { CSSProperties, FC } from 'react';

interface LoadingOverlayProps {
  visible: boolean;
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.24)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 60,
};

const LoadingOverlay: FC<LoadingOverlayProps> = ({ visible }) =>
  visible ? (
    <div style={overlayStyle}>
      <IonSpinner name="crescent" />
    </div>
  ) : null;

export default LoadingOverlay;
