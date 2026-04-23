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
  onSendIam: (iamType: string) => void;
  onInfoTap: () => void;
}

const iamButtons: {
  label: string;
  icon: ReactNode;
  key: string;
  iamType: string;
  testID: string;
}[] = [
  {
    label: 'TOP BANNER',
    icon: <MdOutlineVerticalAlignTop />,
    key: 'top',
    iamType: 'top_banner',
    testID: 'send_iam_top_banner_button',
  },
  {
    label: 'BOTTOM BANNER',
    icon: <MdOutlineVerticalAlignBottom />,
    key: 'bottom',
    iamType: 'bottom_banner',
    testID: 'send_iam_bottom_banner_button',
  },
  {
    label: 'CENTER MODAL',
    icon: <MdCropSquare />,
    key: 'center',
    iamType: 'center_modal',
    testID: 'send_iam_center_modal_button',
  },
  {
    label: 'FULL SCREEN',
    icon: <MdFullscreen />,
    key: 'full',
    iamType: 'full_screen',
    testID: 'send_iam_full_screen_button',
  },
];

const SendIamSection: FC<SendIamSectionProps> = ({ onSendIam, onInfoTap }) => (
  <SectionCard
    title="SEND IN-APP MESSAGE"
    onInfoTap={onInfoTap}
    sectionKey="send_iam"
  >
    {iamButtons.map((btn) => (
      <ActionButton
        key={btn.key}
        className="iam-btn"
        type="button"
        onClick={() => onSendIam(btn.iamType)}
        data-testid={btn.testID}
      >
        <span className="action-btn-content">
          <span className="action-btn-icon" aria-hidden>
            {btn.icon}
          </span>
          <span>{btn.label}</span>
        </span>
      </ActionButton>
    ))}
  </SectionCard>
);

export default SendIamSection;
