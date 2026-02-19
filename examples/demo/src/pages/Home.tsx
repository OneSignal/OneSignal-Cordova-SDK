import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ActionButton from '../components/ActionButton';
import { PairList, SingleList } from '../components/ListWidgets';
import LogView from '../components/LogView';
import SectionCard from '../components/SectionCard';
import ToggleRow from '../components/ToggleRow';
import CustomNotificationModal from '../components/modals/CustomNotificationModal';
import MultiPairInputModal from '../components/modals/MultiPairInputModal';
import MultiSelectRemoveModal from '../components/modals/MultiSelectRemoveModal';
import OutcomeModal from '../components/modals/OutcomeModal';
import PairInputModal from '../components/modals/PairInputModal';
import SingleInputModal from '../components/modals/SingleInputModal';
import TrackEventModal from '../components/modals/TrackEventModal';
import { Theme } from '../theme/tokens';
import './Home.css';

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
  | { type: 'removeSelectedTriggers' }
  | { type: 'sendOutcome' }
  | { type: 'trackEvent' }
  | { type: 'customNotification' };

const Home: React.FC = () => {
  const {
    state,
    loginUser,
    setConsentRequired,
    setPushEnabled,
    promptPush,
    setIamPaused,
    sendIamTrigger,
    logoutUser,
    addAlias,
    addAliases,
    addEmail,
    addSms,
    addTag,
    addTags,
    addTrigger,
    addTriggers,
    removeSelectedTriggers,
    clearTriggers,
    removeSelectedTags,
    sendOutcome,
    sendUniqueOutcome,
    sendOutcomeWithValue,
    trackEvent,
    setLocationShared,
    requestLocationPermission,
    sendSimpleNotification,
    sendImageNotification,
    sendCustomNotification,
  } = useAppContext();

  const [dialog, setDialog] = useState<DialogState>({ type: 'none' });
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  const statusLabel = useMemo(
    () => (state.externalUserId ? 'Logged In' : 'Anonymous'),
    [state.externalUserId],
  );
  const aliasItems = useMemo(
    () => state.aliasesList.map(([label, id]) => ({ key: label, value: id })),
    [state.aliasesList],
  );
  const tagItems = useMemo(
    () => state.tagsList.map(([key, value]) => ({ key, value })),
    [state.tagsList],
  );
  const triggerItems = useMemo(
    () => state.triggersList.map(([key, value]) => ({ key, value })),
    [state.triggersList],
  );

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  };

  const runAction = (message: string, action: () => Promise<void>) => {
    action()
      .then(() => showToast(message))
      .catch(() => showToast('Action failed'));
  };

  const closeDialog = () => {
    setDialog({ type: 'none' });
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="demo-app" style={{ background: Theme.colors.lightBackground }}>
          <header className="brand-header" style={{ background: Theme.colors.oneSignalRed }}>
            <div className="brand-title">OneSignal Sample App</div>
          </header>
          <LogView />

          <main className="content">
            <section className="section">
              <h2>APP</h2>
              <div className="card kv-card">
                <div className="kv-row"><span>App ID</span><span>{state.appId}</span></div>
              </div>
              <div className="card tip-card">
                <div>Add your own App ID, then rebuild to fully test all functionality.</div>
                <div className="tip-link">Get your keys at onesignal.com</div>
              </div>
              <ToggleRow
                label="Consent Required"
                description="Require consent before SDK processes data"
                checked={state.consentRequired}
                onToggle={(checked) =>
                  runAction(`Consent required: ${checked}`, () => setConsentRequired(checked))
                }
              />
            </section>

            <section className="section">
              <h2>USER</h2>
              <div className="card kv-card">
                <div className="kv-row"><span>Status</span><span>{statusLabel}</span></div>
                <div className="divider" />
                <div className="kv-row"><span>External ID</span><span>{state.externalUserId ?? '—'}</span></div>
              </div>
              <ActionButton onClick={() => setDialog({ type: 'login' })} type="button">LOGIN USER</ActionButton>
              <ActionButton
                variant="outline"
                type="button"
                onClick={() => runAction('Logged out', logoutUser)}
              >
                LOGOUT USER
              </ActionButton>
            </section>

            <SectionCard title="PUSH" onInfoTap={() => showToast('Push section tooltip')}>
              <div className="card kv-card">
                <div className="kv-row"><span>Push ID</span><span>{state.pushSubscriptionId ?? '—'}</span></div>
              </div>
              <ToggleRow
                label="Enabled"
                checked={state.isPushEnabled}
                onToggle={(checked) =>
                  runAction(`Push ${checked ? 'enabled' : 'disabled'}`, () => setPushEnabled(checked))
                }
              />
              <ActionButton variant="outline" type="button" onClick={() => runAction('Push permission requested', promptPush)}>
                PROMPT PUSH
              </ActionButton>
            </SectionCard>

            <SectionCard title="SEND PUSH NOTIFICATION" onInfoTap={() => showToast('Push notification info')}>
              <ActionButton type="button" onClick={() => runAction('Simple notification sent', sendSimpleNotification)}>SIMPLE</ActionButton>
              <ActionButton type="button" onClick={() => runAction('Image notification sent', sendImageNotification)}>WITH IMAGE</ActionButton>
              <ActionButton type="button" onClick={() => setDialog({ type: 'customNotification' })}>CUSTOM</ActionButton>
            </SectionCard>

            <SectionCard title="IN-APP MESSAGING" onInfoTap={() => showToast('In-app messaging info')}>
              <ToggleRow
                label="Pause In-App Messages"
                description="Toggle in-app message display"
                checked={state.inAppMessagesPaused}
                onToggle={(checked) => runAction(
                  checked ? 'In-app messages paused' : 'In-app messages resumed',
                  () => setIamPaused(checked),
                )}
              />
            </SectionCard>

            <SectionCard title="SEND IN-APP MESSAGE" onInfoTap={() => showToast('Send IAM info')}>
              <ActionButton type="button" onClick={() => runAction('Sent IAM: top_banner', () => sendIamTrigger('top_banner'))}>TOP BANNER</ActionButton>
              <ActionButton type="button" onClick={() => runAction('Sent IAM: bottom_banner', () => sendIamTrigger('bottom_banner'))}>BOTTOM BANNER</ActionButton>
              <ActionButton type="button" onClick={() => runAction('Sent IAM: center_modal', () => sendIamTrigger('center_modal'))}>CENTER MODAL</ActionButton>
              <ActionButton type="button" onClick={() => runAction('Sent IAM: full_screen', () => sendIamTrigger('full_screen'))}>FULL SCREEN</ActionButton>
            </SectionCard>

            <SectionCard title="ALIASES" onInfoTap={() => showToast('Aliases info')}>
              <PairList items={aliasItems} />
              <ActionButton type="button" onClick={() => setDialog({ type: 'addAlias' })}>ADD</ActionButton>
              <ActionButton type="button" onClick={() => setDialog({ type: 'addMultipleAliases' })}>ADD MULTIPLE</ActionButton>
            </SectionCard>

            <SectionCard title="EMAILS" onInfoTap={() => showToast('Emails info')}>
              <SingleList items={state.emailsList} emptyText="No emails added" />
              <ActionButton type="button" onClick={() => setDialog({ type: 'addEmail' })}>ADD EMAIL</ActionButton>
            </SectionCard>

            <SectionCard title="SMS" onInfoTap={() => showToast('SMS info')}>
              <SingleList items={state.smsNumbersList} emptyText="No SMS added" />
              <ActionButton type="button" onClick={() => setDialog({ type: 'addSms' })}>ADD SMS</ActionButton>
            </SectionCard>

            <SectionCard title="TAGS" onInfoTap={() => showToast('Tags info')}>
              <PairList
                items={tagItems}
                onRemove={(key) => runAction(`Tag removed: ${key}`, () => removeSelectedTags([key]))}
              />
              <ActionButton type="button" onClick={() => setDialog({ type: 'addTag' })}>ADD</ActionButton>
              <ActionButton type="button" onClick={() => setDialog({ type: 'addMultipleTags' })}>ADD MULTIPLE</ActionButton>
              <ActionButton variant="outline" type="button" onClick={() => setDialog({ type: 'removeSelectedTags' })}>REMOVE SELECTED</ActionButton>
            </SectionCard>

            <SectionCard title="OUTCOME EVENTS" onInfoTap={() => showToast('Outcome events info')}>
              <ActionButton type="button" onClick={() => setDialog({ type: 'sendOutcome' })}>SEND OUTCOME</ActionButton>
            </SectionCard>

            <SectionCard title="TRIGGERS" onInfoTap={() => showToast('Triggers info')}>
              <PairList items={triggerItems} />
              <ActionButton type="button" onClick={() => runAction('Trigger added', () => addTrigger('trigger_manual', 'manual'))}>ADD</ActionButton>
              <ActionButton type="button" onClick={() => runAction('Multiple triggers added', () => addTriggers({ trigger_a: 'one', trigger_b: 'two' }))}>ADD MULTIPLE</ActionButton>
              <ActionButton variant="outline" type="button" onClick={() => setDialog({ type: 'removeSelectedTriggers' })}>REMOVE SELECTED</ActionButton>
              <ActionButton variant="outline" type="button" onClick={() => runAction('All triggers cleared', clearTriggers)}>CLEAR</ActionButton>
            </SectionCard>

            <SectionCard title="TRACK EVENT" onInfoTap={() => showToast('Track event info')}>
              <ActionButton type="button" onClick={() => setDialog({ type: 'trackEvent' })}>TRACK EVENT</ActionButton>
            </SectionCard>

            <SectionCard title="LOCATION" onInfoTap={() => showToast('Location info')}>
              <ToggleRow
                label="Location Shared"
                description="Share device location with OneSignal"
                checked={state.locationShared}
                onToggle={(checked) =>
                  runAction(
                    checked ? 'Location sharing enabled' : 'Location sharing disabled',
                    () => setLocationShared(checked),
                  )}
              />
              <ActionButton type="button" onClick={() => runAction('Location permission prompt shown', requestLocationPermission)}>
                PROMPT LOCATION
              </ActionButton>
            </SectionCard>

            <section className="section">
              <ActionButton type="button" onClick={() => runAction('Next activity tapped', () => trackEvent('next_activity_tapped'))}>
                NEXT ACTIVITY
              </ActionButton>
            </section>
          </main>
        </div>

        <SingleInputModal
          open={dialog.type === 'login'}
          title="Login User"
          placeholder="External User Id"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(value) => runAction(`Logged in as ${value}`, async () => {
            await loginUser(value);
            closeDialog();
          })}
        />

        <PairInputModal
          open={dialog.type === 'addAlias'}
          title="Add Alias"
          firstPlaceholder="Label"
          secondPlaceholder="ID"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(label, id) => runAction(`Alias added: ${label}`, async () => {
            await addAlias(label, id);
            closeDialog();
          })}
        />

        <SingleInputModal
          open={dialog.type === 'addEmail'}
          title="Add Email"
          placeholder="Email Address"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(value) => runAction(`Email added: ${value}`, async () => {
            await addEmail(value);
            closeDialog();
          })}
        />

        <SingleInputModal
          open={dialog.type === 'addSms'}
          title="Add SMS"
          placeholder="Phone Number"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(value) => runAction(`SMS added: ${value}`, async () => {
            await addSms(value);
            closeDialog();
          })}
        />

        <PairInputModal
          open={dialog.type === 'addTag'}
          title="Add Tag"
          firstPlaceholder="Key"
          secondPlaceholder="Value"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(key, value) => runAction(`Tag added: ${key}`, async () => {
            await addTag(key, value);
            closeDialog();
          })}
        />

        <MultiPairInputModal
          open={dialog.type === 'addMultipleAliases'}
          title="Add Multiple Aliases"
          firstPlaceholder="Label"
          secondPlaceholder="ID"
          onClose={closeDialog}
          onSubmit={(pairs) => runAction(`${Object.keys(pairs).length} alias(es) added`, async () => {
            await addAliases(pairs);
            closeDialog();
          })}
        />

        <MultiPairInputModal
          open={dialog.type === 'addMultipleTags'}
          title="Add Multiple Tags"
          firstPlaceholder="Key"
          secondPlaceholder="Value"
          onClose={closeDialog}
          onSubmit={(pairs) => runAction(`${Object.keys(pairs).length} tag(s) added`, async () => {
            await addTags(pairs);
            closeDialog();
          })}
        />

        <MultiSelectRemoveModal
          open={dialog.type === 'removeSelectedTags'}
          title="Remove Tags"
          items={state.tagsList}
          onClose={closeDialog}
          onSubmit={(keys) => runAction(`${keys.length} tag(s) removed`, async () => {
            await removeSelectedTags(keys);
            closeDialog();
          })}
        />

        <MultiSelectRemoveModal
          open={dialog.type === 'removeSelectedTriggers'}
          title="Remove Triggers"
          items={state.triggersList}
          onClose={closeDialog}
          onSubmit={(keys) => runAction(`${keys.length} trigger(s) removed`, async () => {
            await removeSelectedTriggers(keys);
            closeDialog();
          })}
        />

        <OutcomeModal
          open={dialog.type === 'sendOutcome'}
          onClose={closeDialog}
          onSubmit={(name, mode, value) => {
            if (mode === 'unique') {
              runAction(`Unique outcome sent: ${name}`, async () => {
                await sendUniqueOutcome(name);
                closeDialog();
              });
              return;
            }
            if (mode === 'value' && value !== null) {
              runAction(`Outcome with value sent: ${name}`, async () => {
                await sendOutcomeWithValue(name, value);
                closeDialog();
              });
              return;
            }
            runAction(`Outcome sent: ${name}`, async () => {
              await sendOutcome(name);
              closeDialog();
            });
          }}
        />

        <TrackEventModal
          open={dialog.type === 'trackEvent'}
          onClose={closeDialog}
          onSubmit={(name, properties) => runAction(`Event tracked: ${name}`, async () => {
            await trackEvent(name, properties);
            closeDialog();
          })}
        />

        <CustomNotificationModal
          open={dialog.type === 'customNotification'}
          onClose={closeDialog}
          onSubmit={(title, body) => runAction(`Notification sent: ${title}`, async () => {
            await sendCustomNotification(title, body);
            closeDialog();
          })}
        />

        <IonToast
          isOpen={toastOpen}
          message={toastMessage}
          duration={1600}
          onDidDismiss={() => setToastOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
