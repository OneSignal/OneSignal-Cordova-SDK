import type { FC, ReactNode } from 'react';
import { MdInfoOutline } from 'react-icons/md';

interface SectionCardProps {
  title: string;
  onInfoTap?: () => void;
  children: ReactNode;
}

const SectionCard: FC<SectionCardProps> = ({ title, onInfoTap, children }) => (
  <section className="section">
    <div className="section-head">
      <h2>{title}</h2>
      {onInfoTap ? (
        <button
          className="icon-btn"
          type="button"
          onClick={onInfoTap}
          aria-label={`${title} info`}
        >
          <MdInfoOutline />
        </button>
      ) : null}
    </div>
    {children}
  </section>
);

export default SectionCard;
