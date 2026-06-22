import type { FC } from 'react';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface SendIamSectionProps {
  onSendIam: (iamType: string) => void;
  onInfoTap: () => void;
}

const iamButtons: {
  label: string;
  key: string;
  iamType: string;
  testID: string;
}[] = [
  {
    label: 'TOP BANNER',
    key: 'top',
    iamType: 'top_banner',
    testID: 'send_iam_top_banner_button',
  },
  {
    label: 'BOTTOM BANNER',
    key: 'bottom',
    iamType: 'bottom_banner',
    testID: 'send_iam_bottom_banner_button',
  },
  {
    label: 'CENTER MODAL',
    key: 'center',
    iamType: 'center_modal',
    testID: 'send_iam_center_modal_button',
  },
  {
    label: 'FULL SCREEN',
    key: 'full',
    iamType: 'full_screen',
    testID: 'send_iam_full_screen_button',
  },
];

const SendIamSection: FC<SendIamSectionProps> = ({ onSendIam, onInfoTap }) => (
  <SectionCard title="SEND IN-APP MESSAGE" onInfoTap={onInfoTap} sectionKey="send_iam">
    {iamButtons.map((btn) => (
      <ActionButton
        key={btn.key}
        type="button"
        onClick={() => onSendIam(btn.iamType)}
        data-testid={btn.testID}
      >
        {btn.label}
      </ActionButton>
    ))}
  </SectionCard>
);

export default SendIamSection;
