import type { FC, ReactNode } from 'react';
import { MdInfoOutline } from 'react-icons/md';

interface SectionCardProps {
  title: string;
  onInfoTap?: () => void;
  sectionKey?: string;
  children: ReactNode;
}

const SectionCard: FC<SectionCardProps> = ({ title, onInfoTap, sectionKey, children }) => (
  <section className="section" data-testid={sectionKey ? `${sectionKey}_section` : undefined}>
    <div className="section-head">
      <h2>{title}</h2>
      {onInfoTap ? (
        <button
          className="icon-btn"
          type="button"
          onClick={onInfoTap}
          aria-label={`${title} info`}
          data-testid={sectionKey ? `${sectionKey}_info_icon` : undefined}
        >
          <MdInfoOutline />
        </button>
      ) : null}
    </div>
    {children}
  </section>
);

export default SectionCard;
