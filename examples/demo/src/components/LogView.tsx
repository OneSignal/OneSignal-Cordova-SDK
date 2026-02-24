import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  MdDelete,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from 'react-icons/md';
import type { LogEntry } from '../services/LogManager';
import LogManager from '../services/LogManager';
import './LogView.css';

const manager = LogManager.getInstance();

const LogView: FC = () => {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    return manager.subscribe((entry) => {
      if (entry) {
        setEntries((prev) => [entry, ...prev]);
      } else {
        setEntries([]);
      }
    });
  }, []);

  return (
    <section className="logview-panel" data-testid="log_view_container">
      <div
        className="logview-header"
        data-testid="log_view_header"
        onClick={() => setCollapsed((value) => !value)}
      >
        <strong>LOGS</strong>
        <span className="logview-count" data-testid="log_view_count">
          ({entries.length})
        </span>
        {entries.length > 0 && (
          <button
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              manager.clear();
            }}
            type="button"
            aria-label="Clear logs"
            data-testid="log_view_clear_button"
          >
            <MdDelete />
          </button>
        )}
        <span
          className="icon-btn"
          aria-label={collapsed ? 'Expand logs' : 'Collapse logs'}
        >
          {collapsed ? <MdKeyboardArrowDown /> : <MdKeyboardArrowUp />}
        </span>
      </div>
      {!collapsed ? (
        <div className="logview-body" data-testid="log_view_list">
          {entries.length ? (
            entries.map((entry, index) => (
              <div
                key={`${entry.timestamp}-${index}`}
                className="logview-row"
                data-testid={`log_entry_${index}`}
              >
                <span
                  className="log-time"
                  data-testid={`log_entry_${index}_timestamp`}
                >
                  {entry.timestamp}
                </span>
                <span
                  className={`log-level log-level-${entry.level.toLowerCase()}`}
                  data-testid={`log_entry_${index}_level`}
                >
                  {entry.level}
                </span>
                <span
                  className="log-text"
                  data-testid={`log_entry_${index}_message`}
                >
                  {entry.tag}: {entry.message}
                </span>
              </div>
            ))
          ) : (
            <div className="logview-empty" data-testid="log_view_empty">
              No logs yet
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
};

export default LogView;
