import { IonIcon } from '@ionic/react';
import { chevronDownOutline, chevronUpOutline, trashOutline } from 'ionicons/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import LogManager from '../services/LogManager';
import type { LogEntry } from '../services/LogManager';
import './LogView.css';

const manager = LogManager.getInstance();

const LogView: FC = () => {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return manager.subscribe(setEntries);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [entries]);

  const countText = useMemo(() => `(${entries.length})`, [entries.length]);

  return (
    <section className="logview-panel" data-testid="log_view_container">
      <div className="logview-header" data-testid="log_view_header">
        <strong>LOGS</strong>
        <span data-testid="log_view_count">{countText}</span>
        <button
          className="icon-btn"
          onClick={() => manager.clear()}
          type="button"
          aria-label="Clear logs"
          data-testid="log_view_clear_button"
        >
          <IonIcon icon={trashOutline} />
        </button>
        <button
          className="icon-btn"
          onClick={() => setCollapsed((value) => !value)}
          type="button"
          aria-label={collapsed ? 'Expand logs' : 'Collapse logs'}
        >
          <IonIcon icon={collapsed ? chevronDownOutline : chevronUpOutline} />
        </button>
      </div>
      {!collapsed ? (
        <div className="logview-body" ref={scrollRef} data-testid="log_view_list">
          {entries.length ? (
            entries.map((entry, index) => (
              <div key={`${entry.timestamp}-${index}`} className="logview-row" data-testid={`log_entry_${index}`}>
                <span className="log-time" data-testid={`log_entry_${index}_timestamp`}>{entry.timestamp}</span>
                <span className="log-level" data-testid={`log_entry_${index}_level`}>{entry.level}</span>
                <span className="log-text" data-testid={`log_entry_${index}_message`}>{entry.message}</span>
              </div>
            ))
          ) : (
            <div className="logview-empty" data-testid="log_view_empty">No logs yet</div>
          )}
        </div>
      ) : null}
    </section>
  );
};

export default LogView;
