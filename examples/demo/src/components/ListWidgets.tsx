import type { FC } from 'react';
import { MdClose } from 'react-icons/md';

export type PairItem = {
  key: string;
  value: string;
};

interface EmptyStateProps {
  text: string;
}

interface PairListProps {
  items: PairItem[];
  onRemove?: (key: string) => void;
  emptyText?: string;
}

interface SingleListProps {
  items: string[];
  emptyText: string;
}

export const EmptyState: FC<EmptyStateProps> = ({ text }) => <p className="empty">{text}</p>;

export const PairList: FC<PairListProps> = ({ items, onRemove, emptyText = 'No items' }) => (
  <div className="card list-card">
    {items.length ? (
      items.map((item) => (
        <div key={item.key} className="list-item two-line">
          <div>
            <strong>{item.key}</strong>
            <span>{item.value}</span>
          </div>
          {onRemove ? (
            <button type="button" className="delete-btn" onClick={() => onRemove(item.key)}>
              <MdClose />
            </button>
          ) : null}
        </div>
      ))
    ) : (
      <EmptyState text={emptyText} />
    )}
  </div>
);

export const SingleList: FC<SingleListProps> = ({ items, emptyText }) => (
  <div className="card list-card">
    {items.length ? (
      items.map((item) => (
        <div key={item} className="list-item">
          <span>{item}</span>
        </div>
      ))
    ) : (
      <EmptyState text={emptyText} />
    )}
  </div>
);
