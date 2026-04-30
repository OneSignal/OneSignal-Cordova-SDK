import { IonSpinner } from '@ionic/react';
import { type FC, useState } from 'react';
import { MdClose } from 'react-icons/md';

const COLLAPSE_THRESHOLD = 5;

export type PairItem = {
  key: string;
  value: string;
};

interface EmptyStateProps {
  text: string;
  testID?: string;
}

interface LoadingStateProps {
  testID?: string;
}

interface PairListProps {
  items: PairItem[];
  onRemove?: (key: string) => void;
  emptyText?: string;
  loading?: boolean;
  sectionKey?: string;
}

interface SingleListProps {
  items: string[];
  emptyText: string;
  onRemove?: (value: string) => void;
  loading?: boolean;
  sectionKey?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({ text, testID }) => (
  <p className="empty" data-testid={testID}>
    {text}
  </p>
);

export const LoadingState: FC<LoadingStateProps> = ({ testID }) => (
  <div className="list-loading" data-testid={testID}>
    <IonSpinner name="crescent" />
  </div>
);

export const PairList: FC<PairListProps> = ({
  items,
  onRemove,
  emptyText = 'No items',
  loading = false,
  sectionKey,
}) => (
  <div className="card list-card">
    {items.length ? (
      items.map((item) => (
        <div
          key={item.key}
          className="list-item two-line"
          data-testid={sectionKey ? `${sectionKey}_pair_${item.key}` : undefined}
        >
          <div>
            <span
              className="list-key"
              data-testid={sectionKey ? `${sectionKey}_pair_key_${item.key}` : undefined}
            >
              {item.key}
            </span>
            <span data-testid={sectionKey ? `${sectionKey}_pair_value_${item.key}` : undefined}>
              {item.value}
            </span>
          </div>
          {onRemove ? (
            <button
              type="button"
              className="delete-btn"
              onClick={() => onRemove(item.key)}
              aria-label={`Remove ${item.key}`}
              data-testid={sectionKey ? `${sectionKey}_remove_${item.key}` : undefined}
            >
              <MdClose />
            </button>
          ) : null}
        </div>
      ))
    ) : loading ? (
      <LoadingState testID={sectionKey ? `${sectionKey}_loading` : undefined} />
    ) : (
      <EmptyState text={emptyText} testID={sectionKey ? `${sectionKey}_empty` : undefined} />
    )}
  </div>
);

export const SingleList: FC<SingleListProps> = ({
  items,
  emptyText,
  onRemove,
  loading = false,
  sectionKey,
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
              <span data-testid={sectionKey ? `${sectionKey}_value_${item}` : undefined}>
                {item}
              </span>
              {onRemove ? (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => onRemove(item)}
                  aria-label={`Remove ${item}`}
                  data-testid={sectionKey ? `${sectionKey}_remove_${item}` : undefined}
                >
                  <MdClose />
                </button>
              ) : null}
            </div>
          ))}
          {!showAll && hiddenCount > 0 && (
            <button type="button" className="more-link" onClick={() => setExpanded(true)}>
              {hiddenCount} more
            </button>
          )}
        </>
      ) : loading ? (
        <LoadingState testID={sectionKey ? `${sectionKey}_loading` : undefined} />
      ) : (
        <EmptyState text={emptyText} testID={sectionKey ? `${sectionKey}_empty` : undefined} />
      )}
    </div>
  );
};
