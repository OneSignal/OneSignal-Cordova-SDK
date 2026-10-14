import { useEffect, useRef, useState, type FC } from 'react';
import { MdDelete, MdExpandLess, MdExpandMore } from 'react-icons/md';

import { clearLogs, useLogs } from '../services/LogService';

const LogView: FC = () => {
  const logs = useLogs();
  const listRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [logs, collapsed]);

  return (
    <section className="log-view" data-testid="log_view">
      <div className="log-head">
        <span>LOGS ({logs.length})</span>
        <div className="log-actions">
          <button
            type="button"
            className="log-clear"
            onClick={clearLogs}
            aria-label="Clear logs"
            data-testid="log_clear_button"
          >
            <MdDelete />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expand logs' : 'Collapse logs'}
            data-testid="log_toggle_button"
          >
            {collapsed ? <MdExpandMore /> : <MdExpandLess />}
          </button>
        </div>
      </div>
      <div className="log-list" ref={listRef} hidden={collapsed}>
        {logs.length === 0 ? (
          <div className="log-empty">No logs yet</div>
        ) : (
          logs.map((entry, index) => (
            <div key={entry.id} className="log-entry" data-testid={`log_entry_${index}`}>
              <span className="log-time">{entry.time}</span> {entry.message}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default LogView;
