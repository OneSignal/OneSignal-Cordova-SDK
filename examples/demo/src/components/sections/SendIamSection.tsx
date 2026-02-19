import type { FC } from 'react';
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

const SendIamSection: FC<SendIamSectionProps> = ({
  onInfoTap,
  onSendTopBanner,
  onSendBottomBanner,
  onSendCenterModal,
  onSendFullScreen,
}) => (
  <SectionCard title="SEND IN-APP MESSAGE" onInfoTap={onInfoTap}>
    <ActionButton className="iam-btn" type="button" onClick={onSendTopBanner}>
      <span className="action-btn-content">
        <span className="action-btn-icon" aria-hidden>
          <MdOutlineVerticalAlignTop />
        </span>
        <span>TOP BANNER</span>
      </span>
    </ActionButton>
    <ActionButton
      className="iam-btn"
      type="button"
      onClick={onSendBottomBanner}
    >
      <span className="action-btn-content">
        <span className="action-btn-icon" aria-hidden>
          <MdOutlineVerticalAlignBottom />
        </span>
        <span>BOTTOM BANNER</span>
      </span>
    </ActionButton>
    <ActionButton className="iam-btn" type="button" onClick={onSendCenterModal}>
      <span className="action-btn-content">
        <span className="action-btn-icon" aria-hidden>
          <MdCropSquare />
        </span>
        <span>CENTER MODAL</span>
      </span>
    </ActionButton>
    <ActionButton className="iam-btn" type="button" onClick={onSendFullScreen}>
      <span className="action-btn-content">
        <span className="action-btn-icon" aria-hidden>
          <MdFullscreen />
        </span>
        <span>FULL SCREEN</span>
      </span>
    </ActionButton>
  </SectionCard>
);

export default SendIamSection;
