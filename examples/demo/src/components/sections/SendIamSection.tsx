import type { FC, ReactNode } from 'react';
import {
  MdCropSquare,
  MdFullscreen,
  MdOutlineVerticalAlignBottom,
  MdOutlineVerticalAlignTop,
} from 'react-icons/md';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface SendIamSectionProps {
  onInfoTap: () => void;
  onSendTopBanner: () => void;
  onSendBottomBanner: () => void;
  onSendCenterModal: () => void;
  onSendFullScreen: () => void;
}

const iamButtons: { label: string; icon: ReactNode; key: string }[] = [
  { label: 'TOP BANNER', icon: <MdOutlineVerticalAlignTop />, key: 'top' },
  { label: 'BOTTOM BANNER', icon: <MdOutlineVerticalAlignBottom />, key: 'bottom' },
  { label: 'CENTER MODAL', icon: <MdCropSquare />, key: 'center' },
  { label: 'FULL SCREEN', icon: <MdFullscreen />, key: 'full' },
];

const SendIamSection: FC<SendIamSectionProps> = ({
  onInfoTap,
  onSendTopBanner,
  onSendBottomBanner,
  onSendCenterModal,
  onSendFullScreen,
}) => {
  const handlers = [onSendTopBanner, onSendBottomBanner, onSendCenterModal, onSendFullScreen];

  return (
    <SectionCard title="SEND IN-APP MESSAGE" onInfoTap={onInfoTap}>
      {iamButtons.map((btn, i) => (
        <ActionButton key={btn.key} className="iam-btn" type="button" onClick={handlers[i]}>
          <span className="action-btn-content">
            <span className="action-btn-icon" aria-hidden>{btn.icon}</span>
            <span>{btn.label}</span>
          </span>
        </ActionButton>
      ))}
    </SectionCard>
  );
};

export default SendIamSection;
