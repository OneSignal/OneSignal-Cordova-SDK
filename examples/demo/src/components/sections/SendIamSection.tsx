import type { FC } from 'react';

import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface SendIamSectionProps {
  onSendIam: (iamType: string) => void;
  onInfoTap: () => void;
}

const iamButtons: { label: string; iamType: string }[] = [
  { label: 'TOP', iamType: 'top_banner' },
  { label: 'BOTTOM', iamType: 'bottom_banner' },
  { label: 'CENTER', iamType: 'center_modal' },
  { label: 'HTML', iamType: 'html' },
  { label: 'FULL', iamType: 'full_screen' },
  { label: 'FULL BLEED', iamType: 'full_bleed' },
  { label: 'CAROUSEL', iamType: 'carousel' },
  { label: 'CAROUSEL BLEED', iamType: 'carousel_bleed' },
];

const SendIamSection: FC<SendIamSectionProps> = ({ onSendIam, onInfoTap }) => (
  <SectionCard title="SEND IN-APP MESSAGE" onInfoTap={onInfoTap} sectionKey="send_iam">
    <div className="iam-grid">
      {iamButtons.map((btn) => (
        <ActionButton
          key={btn.iamType}
          type="button"
          onClick={() => onSendIam(btn.iamType)}
          data-testid={`send_iam_${btn.iamType}_button`}
        >
          {btn.label}
        </ActionButton>
      ))}
    </div>
  </SectionCard>
);

export default SendIamSection;
