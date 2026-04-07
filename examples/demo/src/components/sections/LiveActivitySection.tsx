import { useState } from 'react';
import type { FC } from 'react';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

const ORDER_STATUSES = [
  {
    status: 'preparing',
    message: 'Your order is being prepared',
    estimatedTime: '15 min',
  },
  {
    status: 'on_the_way',
    message: 'Driver is heading your way',
    estimatedTime: '10 min',
  },
  {
    status: 'delivered',
    message: 'Order delivered!',
    estimatedTime: '',
  },
];

interface LiveActivitySectionProps {
  hasApiKey: boolean;
  onInfoTap?: () => void;
  onStart: (activityId: string, attributes: object, content: object) => void;
  onUpdate: (
    activityId: string,
    eventUpdates: Record<string, unknown>,
  ) => Promise<boolean>;
  onEnd: (activityId: string) => Promise<boolean>;
}

const LiveActivitySection: FC<LiveActivitySectionProps> = ({
  hasApiKey,
  onInfoTap,
  onStart,
  onUpdate,
  onEnd,
}) => {
  const [activityId, setActivityId] = useState('order-1');
  const [orderNumber, setOrderNumber] = useState('ORD-1234');
  const [statusIndex, setStatusIndex] = useState(0);
  const [updating, setUpdating] = useState(false);

  const handleStart = () => {
    setStatusIndex(0);
    const initial = ORDER_STATUSES[0];
    onStart(
      activityId,
      { orderNumber },
      {
        status: initial.status,
        message: initial.message,
        estimatedTime: initial.estimatedTime,
      },
    );
  };

  const handleUpdate = async () => {
    const nextIndex = (statusIndex + 1) % ORDER_STATUSES.length;
    const next = ORDER_STATUSES[nextIndex];
    setUpdating(true);
    try {
      const success = await onUpdate(activityId, {
        data: {
          status: next.status,
          message: next.message,
          estimatedTime: next.estimatedTime,
        },
      });
      if (success) {
        setStatusIndex(nextIndex);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleEnd = async () => {
    setUpdating(true);
    try {
      const success = await onEnd(activityId);
      if (success) {
        setStatusIndex(0);
      }
    } finally {
      setUpdating(false);
    }
  };

  const nextStatus = ORDER_STATUSES[(statusIndex + 1) % ORDER_STATUSES.length];
  const isEmpty = !activityId.trim();

  return (
    <SectionCard title="LIVE ACTIVITIES" onInfoTap={onInfoTap}>
      <div className="card">
        <div className="inline-input-row">
          <label className="inline-input-label" htmlFor="la-activity-id">
            Activity ID
          </label>
          <input
            id="la-activity-id"
            className="inline-input-field"
            type="text"
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
            placeholder="Activity ID"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
        <div className="divider" />
        <div className="inline-input-row">
          <label className="inline-input-label" htmlFor="la-order-number">
            Order #
          </label>
          <input
            id="la-order-number"
            className="inline-input-field"
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Order #"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
      </div>

      <ActionButton type="button" onClick={handleStart} disabled={isEmpty}>
        START LIVE ACTIVITY
      </ActionButton>

      <ActionButton
        type="button"
        onClick={handleUpdate}
        disabled={isEmpty || updating || !hasApiKey}
      >
        {`UPDATE → ${nextStatus.status.replace(/_/g, ' ').toUpperCase()}`}
      </ActionButton>

      <ActionButton
        variant="outline"
        type="button"
        onClick={handleEnd}
        disabled={isEmpty || updating || !hasApiKey}
      >
        END LIVE ACTIVITY
      </ActionButton>
    </SectionCard>
  );
};

export default LiveActivitySection;
