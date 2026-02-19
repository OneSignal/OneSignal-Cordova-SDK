import { IonContent, IonPage } from '@ionic/react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import './Home.css';

type AliasItem = {
  label: string;
  id: string;
};

type TagItem = {
  key: string;
  value: string;
};

type OutcomeMode = 'normal' | 'unique' | 'value';

type DialogState =
  | { type: 'none' }
  | { type: 'login' }
  | { type: 'addAlias' }
  | { type: 'addMultipleAliases' }
  | { type: 'addEmail' }
  | { type: 'addSms' }
  | { type: 'addTag' }
  | { type: 'addMultipleTags' }
  | { type: 'removeSelectedTags' }
  | { type: 'sendOutcome' }
  | { type: 'trackEvent' }
  | { type: 'customNotification' };

const ONE_SIGNAL_APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

const Home: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([
    '[main] ApplicationService.onActivityStopped(3, APP_OPEN)',
    'Parsed user data: aliases=0, tags=2, emails=0, sms=0',
    'User data fetched successfully, parsing response...',
    '[main] NotificationsManager.requestPermission()',
  ]);
  const [logsCollapsed, setLogsCollapsed] = useState(false);

  const [consentRequired, setConsentRequired] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [iamPaused, setIamPaused] = useState(false);
  const [locationShared, setLocationShared] = useState(false);

  const [externalUserId, setExternalUserId] = useState<string | null>(null);
  const [aliases, setAliases] = useState<AliasItem[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [smsNumbers, setSmsNumbers] = useState<string[]>([]);
  const [tags, setTags] = useState<TagItem[]>([
    { key: 'newestOutcome', value: 'true' },
    { key: 'somanem', value: 'somevalue' },
  ]);
  const [triggers, setTriggers] = useState<string[]>([]);

  const [dialog, setDialog] = useState<DialogState>({ type: 'none' });

  const [singleLabel, setSingleLabel] = useState('');
  const [singleId, setSingleId] = useState('');
  const [singleValue, setSingleValue] = useState('');
  const [multiRows, setMultiRows] = useState<AliasItem[]>([{ label: '', id: '' }]);

  const [selectedTagKeys, setSelectedTagKeys] = useState<string[]>([]);

  const [outcomeMode, setOutcomeMode] = useState<OutcomeMode>('normal');
  const [outcomeName, setOutcomeName] = useState('');
  const [outcomeValue, setOutcomeValue] = useState('');

  const [eventName, setEventName] = useState('');
  const [eventProperties, setEventProperties] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');

  const statusLabel = useMemo(() => (externalUserId ? 'Logged In' : 'Anonymous'), [externalUserId]);

  const pushId = '1b15279f-44c5-4b3c-8cd9-b27ccee1136e';

  const addLog = (message: string) => {
    setLogs((prev) => [message, ...prev].slice(0, 100));
  };

  const resetDialogFields = () => {
    setSingleLabel('');
    setSingleId('');
    setSingleValue('');
    setMultiRows([{ label: '', id: '' }]);
    setSelectedTagKeys([]);
    setOutcomeMode('normal');
    setOutcomeName('');
    setOutcomeValue('');
    setEventName('');
    setEventProperties('');
    setJsonError(null);
    setCustomTitle('');
    setCustomBody('');
  };

  const closeDialog = () => {
    setDialog({ type: 'none' });
    resetDialogFields();
  };

  const onAddAlias = (e: FormEvent) => {
    e.preventDefault();
    if (!singleLabel.trim() || !singleId.trim()) return;
    setAliases((prev) => [...prev, { label: singleLabel.trim(), id: singleId.trim() }]);
    addLog(`Alias added: ${singleLabel.trim()}`);
    closeDialog();
  };

  const onAddMultipleAliases = (e: FormEvent) => {
    e.preventDefault();
    const valid = multiRows.filter((r) => r.label.trim() && r.id.trim());
    if (!valid.length) return;
    setAliases((prev) => [...prev, ...valid.map((r) => ({ label: r.label.trim(), id: r.id.trim() }))]);
    addLog(`Added ${valid.length} aliases`);
    closeDialog();
  };

  const onAddEmail = (e: FormEvent) => {
    e.preventDefault();
    const value = singleValue.trim();
    if (!value) return;
    setEmails((prev) => [...prev, value]);
    addLog(`Email added: ${value}`);
    closeDialog();
  };

  const onAddSms = (e: FormEvent) => {
    e.preventDefault();
    const value = singleValue.trim();
    if (!value) return;
    setSmsNumbers((prev) => [...prev, value]);
    addLog(`SMS added: ${value}`);
    closeDialog();
  };

  const onAddTag = (e: FormEvent) => {
    e.preventDefault();
    if (!singleLabel.trim() || !singleValue.trim()) return;
    setTags((prev) => [...prev, { key: singleLabel.trim(), value: singleValue.trim() }]);
    addLog(`Tag added: ${singleLabel.trim()}`);
    closeDialog();
  };

  const onAddMultipleTags = (e: FormEvent) => {
    e.preventDefault();
    const valid = multiRows.filter((r) => r.label.trim() && r.id.trim());
    if (!valid.length) return;
    setTags((prev) => [...prev, ...valid.map((r) => ({ key: r.label.trim(), value: r.id.trim() }))]);
    addLog(`Added ${valid.length} tags`);
    closeDialog();
  };

  const onRemoveSelectedTags = () => {
    if (!selectedTagKeys.length) return;
    setTags((prev) => prev.filter((tag) => !selectedTagKeys.includes(tag.key)));
    addLog(`Removed ${selectedTagKeys.length} tags`);
    closeDialog();
  };

  const onSendOutcome = (e: FormEvent) => {
    e.preventDefault();
    if (!outcomeName.trim()) return;
    addLog(`Outcome sent (${outcomeMode}): ${outcomeName.trim()}`);
    closeDialog();
  };

  const onTrackEvent = (e: FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;
    if (eventProperties.trim()) {
      try {
        JSON.parse(eventProperties);
      } catch {
        setJsonError('Properties must be valid JSON');
        return;
      }
    }
    addLog(`Track event: ${eventName.trim()}`);
    closeDialog();
  };

  const onSendCustomNotification = (e: FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customBody.trim()) return;
    addLog(`Custom notification queued: ${customTitle.trim()}`);
    closeDialog();
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="demo-app">
          <header className="brand-header">
            <div className="brand-title">OneSignal Sample App</div>
          </header>

          <section className="logs-panel">
            <div className="logs-header">
              <strong>LOGS</strong>
              <span>({logs.length})</span>
              <button className="icon-btn" onClick={() => setLogs([])} type="button" aria-label="Clear logs">
                🗑
              </button>
              <button
                className="icon-btn"
                onClick={() => setLogsCollapsed((v) => !v)}
                type="button"
                aria-label={logsCollapsed ? 'Expand logs' : 'Collapse logs'}
              >
                {logsCollapsed ? '⌄' : '⌃'}
              </button>
            </div>
            {!logsCollapsed && (
              <div className="logs-body">
                {logs.map((line, idx) => (
                  <div key={`${line}-${idx}`} className="log-row">
                    <span className="log-time">16:39:40</span>
                    <span className="log-level">D</span>
                    <span className="log-text">{line}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <main className="content">
            <section className="section">
              <h2>APP</h2>
              <div className="card kv-card">
                <div className="kv-row"><span>App ID</span><span>{ONE_SIGNAL_APP_ID}</span></div>
              </div>
              <div className="card tip-card">
                <div>Add your own App ID, then rebuild to fully test all functionality.</div>
                <div className="tip-link">Get your keys at onesignal.com</div>
              </div>
              <div className="card toggle-card">
                <div>
                  <div className="label">Consent Required</div>
                  <div className="sub">Require consent before SDK processes data</div>
                </div>
                <input type="checkbox" checked={consentRequired} onChange={(e) => setConsentRequired(e.target.checked)} />
              </div>
            </section>

            <section className="section">
              <h2>USER</h2>
              <div className="card kv-card">
                <div className="kv-row"><span>Status</span><span>{statusLabel}</span></div>
                <div className="divider" />
                <div className="kv-row"><span>External ID</span><span>{externalUserId ?? '—'}</span></div>
              </div>
              <button className="action-btn" onClick={() => setDialog({ type: 'login' })} type="button">LOGIN USER</button>
            </section>

            <section className="section">
              <div className="section-head"><h2>PUSH</h2><button className="icon-btn" type="button">ⓘ</button></div>
              <div className="card kv-card">
                <div className="kv-row"><span>Push ID</span><span>{pushId}</span></div>
                <div className="divider" />
                <div className="kv-row">
                  <span>Enabled</span>
                  <input type="checkbox" checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} />
                </div>
              </div>
            </section>

            <section className="section">
              <div className="section-head"><h2>SEND PUSH NOTIFICATION</h2><button className="icon-btn" type="button">ⓘ</button></div>
              <button className="action-btn" type="button" onClick={() => addLog('Simple notification queued')}>SIMPLE</button>
              <button className="action-btn" type="button" onClick={() => addLog('Image notification queued')}>WITH IMAGE</button>
              <button className="action-btn" type="button" onClick={() => setDialog({ type: 'customNotification' })}>CUSTOM</button>
            </section>

            <section className="section">
              <div className="section-head"><h2>IN-APP MESSAGING</h2><button className="icon-btn" type="button">ⓘ</button></div>
              <div className="card toggle-card">
                <div>
                  <div className="label">Pause In-App Messages</div>
                  <div className="sub">Toggle in-app message display</div>
                </div>
                <input type="checkbox" checked={iamPaused} onChange={(e) => setIamPaused(e.target.checked)} />
              </div>
            </section>

            <section className="section">
              <div className="section-head"><h2>SEND IN-APP MESSAGE</h2><button className="icon-btn" type="button">ⓘ</button></div>
              <button className="action-btn" type="button" onClick={() => setTriggers((p) => [...p, 'top_banner'])}>TOP BANNER</button>
              <button className="action-btn" type="button" onClick={() => setTriggers((p) => [...p, 'bottom_banner'])}>BOTTOM BANNER</button>
              <button className="action-btn" type="button" onClick={() => setTriggers((p) => [...p, 'center_modal'])}>CENTER MODAL</button>
              <button className="action-btn" type="button" onClick={() => setTriggers((p) => [...p, 'full_screen'])}>FULL SCREEN</button>
            </section>

            <section className="section">
              <div className="section-head"><h2>ALIASES</h2><button className="icon-btn" type="button">ⓘ</button></div>
              <div className="card list-card">{aliases.length ? aliases.map((a) => <div key={`${a.label}:${a.id}`} className="list-item"><strong>{a.label}</strong><span>{a.id}</span></div>) : <p className="empty">No aliases added</p>}</div>
              <button className="action-btn" type="button" onClick={() => setDialog({ type: 'addAlias' })}>ADD</button>
              <button className="action-btn" type="button" onClick={() => setDialog({ type: 'addMultipleAliases' })}>ADD MULTIPLE</button>
            </section>

            <section className="section">
              <div className="section-head"><h2>EMAILS</h2><button className="icon-btn" type="button">ⓘ</button></div>
              <div className="card list-card">{emails.length ? emails.map((email) => <div key={email} className="list-item"><span>{email}</span></div>) : <p className="empty">No emails added</p>}</div>
              <button className="action-btn" type="button" onClick={() => setDialog({ type: 'addEmail' })}>ADD EMAIL</button>
            </section>

            <section className="section">
              <div className="section-head"><h2>SMS</h2><button className="icon-btn" type="button">ⓘ</button></div>
              <div className="card list-card">{smsNumbers.length ? smsNumbers.map((sms) => <div key={sms} className="list-item"><span>{sms}</span></div>) : <p className="empty">No SMS added</p>}</div>
              <button className="action-btn" type="button" onClick={() => setDialog({ type: 'addSms' })}>ADD SMS</button>
            </section>

            <section className="section">
              <div className="section-head"><h2>TAGS</h2><button className="icon-btn" type="button">ⓘ</button></div>
              <div className="card list-card">
                {tags.length ? tags.map((tag) => (
                  <div key={tag.key} className="list-item two-line">
                    <div><strong>{tag.key}</strong><span>{tag.value}</span></div>
                    <button type="button" className="delete-btn" onClick={() => setTags((prev) => prev.filter((t) => t.key !== tag.key))}>✕</button>
                  </div>
                )) : <p className="empty">No tags added</p>}
              </div>
              <button className="action-btn" type="button" onClick={() => setDialog({ type: 'addTag' })}>ADD</button>
              <button className="action-btn" type="button" onClick={() => setDialog({ type: 'addMultipleTags' })}>ADD MULTIPLE</button>
              <button className="action-btn outline" type="button" onClick={() => setDialog({ type: 'removeSelectedTags' })}>REMOVE SELECTED</button>
            </section>

            <section className="section">
              <div className="section-head"><h2>OUTCOME EVENTS</h2><button className="icon-btn" type="button">ⓘ</button></div>
              <button className="action-btn" type="button" onClick={() => setDialog({ type: 'sendOutcome' })}>SEND OUTCOME</button>
            </section>

            <section className="section">
              <div className="section-head"><h2>TRIGGERS</h2><button className="icon-btn" type="button">ⓘ</button></div>
              <div className="card list-card">{triggers.length ? triggers.map((trigger, idx) => <div key={`${trigger}-${idx}`} className="list-item"><span>{trigger}</span></div>) : <p className="empty">No triggers added</p>}</div>
              <button className="action-btn" type="button" onClick={() => setTriggers((prev) => [...prev, `trigger_${prev.length + 1}`])}>ADD</button>
              <button className="action-btn" type="button" onClick={() => setTriggers((prev) => [...prev, `trigger_${prev.length + 1}`, `trigger_${prev.length + 2}`])}>ADD MULTIPLE</button>
            </section>

            <section className="section">
              <div className="section-head"><h2>TRACK EVENT</h2><button className="icon-btn" type="button">ⓘ</button></div>
              <button className="action-btn" type="button" onClick={() => setDialog({ type: 'trackEvent' })}>TRACK EVENT</button>
            </section>

            <section className="section">
              <div className="section-head"><h2>LOCATION</h2><button className="icon-btn" type="button">ⓘ</button></div>
              <div className="card toggle-card">
                <div>
                  <div className="label">Location Shared</div>
                  <div className="sub">Share device location with OneSignal</div>
                </div>
                <input type="checkbox" checked={locationShared} onChange={(e) => setLocationShared(e.target.checked)} />
              </div>
              <button className="action-btn" type="button" onClick={() => addLog('Location permission prompt triggered')}>PROMPT LOCATION</button>
            </section>

            <section className="section">
              <button className="action-btn" type="button" onClick={() => addLog('Next Activity tapped')}>NEXT ACTIVITY</button>
            </section>
          </main>
        </div>

        {dialog.type !== 'none' && (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal-card">
              {dialog.type === 'login' && (
                <form onSubmit={(e) => { e.preventDefault(); setExternalUserId(singleValue.trim() || null); addLog(`Login user: ${singleValue.trim() || 'anonymous'}`); closeDialog(); }}>
                  <h3>Login User</h3>
                  <input value={singleValue} onChange={(e) => setSingleValue(e.target.value)} placeholder="External User Id" />
                  <div className="modal-actions"><button type="button" onClick={closeDialog}>Cancel</button><button type="submit">Add</button></div>
                </form>
              )}

              {dialog.type === 'addAlias' && (
                <form onSubmit={onAddAlias}>
                  <h3>Add Alias</h3>
                  <div className="inline-fields">
                    <input value={singleLabel} onChange={(e) => setSingleLabel(e.target.value)} placeholder="Label" />
                    <input value={singleId} onChange={(e) => setSingleId(e.target.value)} placeholder="ID" />
                  </div>
                  <div className="modal-actions"><button type="button" onClick={closeDialog}>Cancel</button><button type="submit">Add</button></div>
                </form>
              )}

              {(dialog.type === 'addMultipleAliases' || dialog.type === 'addMultipleTags') && (
                <form onSubmit={dialog.type === 'addMultipleAliases' ? onAddMultipleAliases : onAddMultipleTags}>
                  <h3>{dialog.type === 'addMultipleAliases' ? 'Add Multiple Aliases' : 'Add Multiple Tags'}</h3>
                  {multiRows.map((row, idx) => (
                    <div className="inline-fields row-with-remove" key={`row-${idx}`}>
                      <input
                        value={row.label}
                        onChange={(e) => setMultiRows((prev) => prev.map((r, i) => (i === idx ? { ...r, label: e.target.value } : r)))}
                        placeholder={dialog.type === 'addMultipleAliases' ? 'Label' : 'Key'}
                      />
                      <input
                        value={row.id}
                        onChange={(e) => setMultiRows((prev) => prev.map((r, i) => (i === idx ? { ...r, id: e.target.value } : r)))}
                        placeholder={dialog.type === 'addMultipleAliases' ? 'ID' : 'Value'}
                      />
                      {multiRows.length > 1 && (
                        <button type="button" className="delete-btn" onClick={() => setMultiRows((prev) => prev.filter((_, i) => i !== idx))}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="text-btn" onClick={() => setMultiRows((prev) => [...prev, { label: '', id: '' }])}>
                    + Add Row
                  </button>
                  <div className="modal-actions"><button type="button" onClick={closeDialog}>Cancel</button><button type="submit">Add All</button></div>
                </form>
              )}

              {(dialog.type === 'addEmail' || dialog.type === 'addSms') && (
                <form onSubmit={dialog.type === 'addEmail' ? onAddEmail : onAddSms}>
                  <h3>{dialog.type === 'addEmail' ? 'Add Email' : 'Add SMS'}</h3>
                  <input
                    value={singleValue}
                    onChange={(e) => setSingleValue(e.target.value)}
                    placeholder={dialog.type === 'addEmail' ? 'Email Address' : 'Phone Number'}
                  />
                  <div className="modal-actions"><button type="button" onClick={closeDialog}>Cancel</button><button type="submit">Add</button></div>
                </form>
              )}

              {dialog.type === 'addTag' && (
                <form onSubmit={onAddTag}>
                  <h3>Add Tag</h3>
                  <div className="inline-fields">
                    <input value={singleLabel} onChange={(e) => setSingleLabel(e.target.value)} placeholder="Key" />
                    <input value={singleValue} onChange={(e) => setSingleValue(e.target.value)} placeholder="Value" />
                  </div>
                  <div className="modal-actions"><button type="button" onClick={closeDialog}>Cancel</button><button type="submit">Add</button></div>
                </form>
              )}

              {dialog.type === 'removeSelectedTags' && (
                <div>
                  <h3>Remove Tags</h3>
                  <div className="checkbox-list">
                    {tags.map((tag) => (
                      <label key={tag.key}>
                        <input
                          type="checkbox"
                          checked={selectedTagKeys.includes(tag.key)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedTagKeys((prev) => [...prev, tag.key]);
                            else setSelectedTagKeys((prev) => prev.filter((k) => k !== tag.key));
                          }}
                        />
                        <span>{tag.key}</span>
                      </label>
                    ))}
                  </div>
                  <div className="modal-actions"><button type="button" onClick={closeDialog}>Cancel</button><button type="button" onClick={onRemoveSelectedTags}>Remove ({selectedTagKeys.length})</button></div>
                </div>
              )}

              {dialog.type === 'sendOutcome' && (
                <form onSubmit={onSendOutcome}>
                  <h3>Send Outcome</h3>
                  <div className="radio-list">
                    <label><input type="radio" checked={outcomeMode === 'normal'} onChange={() => setOutcomeMode('normal')} /> Normal Outcome</label>
                    <label><input type="radio" checked={outcomeMode === 'unique'} onChange={() => setOutcomeMode('unique')} /> Unique Outcome</label>
                    <label><input type="radio" checked={outcomeMode === 'value'} onChange={() => setOutcomeMode('value')} /> Outcome with Value</label>
                  </div>
                  <input value={outcomeName} onChange={(e) => setOutcomeName(e.target.value)} placeholder="Outcome Name" />
                  {outcomeMode === 'value' && <input value={outcomeValue} onChange={(e) => setOutcomeValue(e.target.value)} placeholder="Outcome Value" />}
                  <div className="modal-actions"><button type="button" onClick={closeDialog}>Cancel</button><button type="submit">Send</button></div>
                </form>
              )}

              {dialog.type === 'trackEvent' && (
                <form onSubmit={onTrackEvent}>
                  <h3>Track Event</h3>
                  <input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Event Name" />
                  <textarea value={eventProperties} onChange={(e) => { setEventProperties(e.target.value); setJsonError(null); }} placeholder="Properties (JSON, optional)" />
                  {jsonError && <p className="error">{jsonError}</p>}
                  <div className="modal-actions"><button type="button" onClick={closeDialog}>Cancel</button><button type="submit">Track</button></div>
                </form>
              )}

              {dialog.type === 'customNotification' && (
                <form onSubmit={onSendCustomNotification}>
                  <h3>Custom Notification</h3>
                  <input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Title" />
                  <textarea value={customBody} onChange={(e) => setCustomBody(e.target.value)} placeholder="Body" />
                  <div className="modal-actions"><button type="button" onClick={closeDialog}>Cancel</button><button type="submit">Send</button></div>
                </form>
              )}
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
