import { type FC, useState } from 'react';
import { MdClose } from 'react-icons/md';

const COLLAPSE_THRESHOLD = 5;

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
  onRemove?: (value: string) => void;
}

export const EmptyState: FC<EmptyStateProps> = ({ text }) => (
  <p className="empty">{text}</p>
);

export const PairList: FC<PairListProps> = ({
  items,
  onRemove,
  emptyText = 'No items',
}) => (
  <div className="card list-card">
    {items.length ? (
      items.map((item) => (
        <div key={item.key} className="list-item two-line">
          <div>
            <span className="list-key">{item.key}</span>
            <span>{item.value}</span>
          </div>
          {onRemove ? (
            <button
              type="button"
              className="delete-btn"
              onClick={() => onRemove(item.key)}
            >
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

export const SingleList: FC<SingleListProps> = ({
  items,
  emptyText,
  onRemove,
}) => {
  const [expanded, setExpanded] = useState(false);
  const showAll = expanded || items.length <= COLLAPSE_THRESHOLD;
  const displayItems = showAll ? items : items.slice(0, COLLAPSE_THRESHOLD);
  const hiddenCount = items.length - COLLAPSE_THRESHOLD;

  return (
    <div className="card list-card">
      {items.length ? (
        <>
          {displayItems.map((item) => (
            <div key={item} className="list-item">
              <span>{item}</span>
              {onRemove ? (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => onRemove(item)}
                >
                  <MdClose />
                </button>
              ) : null}
            </div>
          ))}
          {!showAll && hiddenCount > 0 && (
            <button
              type="button"
              className="more-link"
              onClick={() => setExpanded(true)}
            >
              {hiddenCount} more
            </button>
          )}
        </>
      ) : (
        <EmptyState text={emptyText} />
      )}
    </div>
  );
};
