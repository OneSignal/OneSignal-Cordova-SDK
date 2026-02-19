import { IonContent, IonPage, IonToast } from '@ionic/react';
import { useEffect, useMemo, useState } from 'react';
import oneSignalLogo from '../assets/onesignal_logo.svg';
import ActionButton from '../components/ActionButton';
import LoadingOverlay from '../components/LoadingOverlay';
import LogView from '../components/LogView';
import CustomNotificationModal from '../components/modals/CustomNotificationModal';
import MultiPairInputModal from '../components/modals/MultiPairInputModal';
import MultiSelectRemoveModal from '../components/modals/MultiSelectRemoveModal';
import OutcomeModal from '../components/modals/OutcomeModal';
import PairInputModal from '../components/modals/PairInputModal';
import SingleInputModal from '../components/modals/SingleInputModal';
import TrackEventModal from '../components/modals/TrackEventModal';
import AliasesSection from '../components/sections/AliasesSection';
import AppSection from '../components/sections/AppSection';
import EmailsSection from '../components/sections/EmailsSection';
import InAppSection from '../components/sections/InAppSection';
import LocationSection from '../components/sections/LocationSection';
import OutcomesSection from '../components/sections/OutcomesSection';
import PushSection from '../components/sections/PushSection';
import SendIamSection from '../components/sections/SendIamSection';
import SendPushSection from '../components/sections/SendPushSection';
import SmsSection from '../components/sections/SmsSection';
import TagsSection from '../components/sections/TagsSection';
import TrackEventSection from '../components/sections/TrackEventSection';
import TriggersSection from '../components/sections/TriggersSection';
import { useAppContext } from '../context/AppContext';
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
    setConsentGiven,
    setPushEnabled,
    promptPush,
    setIamPaused,
    sendIamTrigger,
    logoutUser,
    addAlias,
    addAliases,
    addEmail,
    removeEmail,
    addSms,
    removeSms,
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
    () =>
      state.aliasesList
        .filter(([label]) => label !== 'external_id' && label !== 'onesignal_id')
        .map(([label, id]) => ({ key: label, value: id })),
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
    action().then(() => showToast(message));
  };

  const closeDialog = () => {
    setDialog({ type: 'none' });
  };

  useEffect(() => {
    void promptPush();
  }, [promptPush]);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div
          className="demo-app"
          style={{ background: Theme.colors.lightBackground }}
        >
          <header
            className="brand-header"
            style={{ background: Theme.colors.oneSignalRed }}
          >
            <div className="brand-title">
              <img className="brand-logo" src={oneSignalLogo} alt="OneSignal" />
              <span className="brand-subtitle">Sample App</span>
            </div>
          </header>
          <LogView />

          <main className="content">
            <AppSection
              appId={state.appId}
              consentRequired={state.consentRequired}
              privacyConsentGiven={state.privacyConsentGiven}
              onToggleConsent={(checked) =>
                runAction(`Consent required: ${checked}`, () =>
                  setConsentRequired(checked),
                )
              }
              onTogglePrivacyConsent={(checked) =>
                runAction(`Privacy consent: ${checked}`, () =>
                  setConsentGiven(checked),
                )
              }
            />

            <section className="section">
              <h2>USER</h2>
              <div className="card kv-card">
                <div className="kv-row">
                  <span>Status</span>
                  <span>{statusLabel}</span>
                </div>
                <div className="divider" />
                <div className="kv-row">
                  <span>External ID</span>
                  <span>{state.externalUserId ?? '-'}</span>
                </div>
              </div>
              <ActionButton
                onClick={() => setDialog({ type: 'login' })}
                type="button"
              >
                {state.externalUserId ? 'SWITCH USER' : 'LOGIN USER'}
              </ActionButton>
              {state.externalUserId ? (
                <ActionButton
                  variant="outline"
                  type="button"
                  onClick={() => runAction('Logged out', logoutUser)}
                >
                  LOGOUT USER
                </ActionButton>
              ) : null}
            </section>

            <PushSection
              pushSubscriptionId={state.pushSubscriptionId ?? null}
              isPushEnabled={state.isPushEnabled}
              hasNotificationPermission={state.hasNotificationPermission}
              onTogglePush={(checked) =>
                runAction(`Push ${checked ? 'enabled' : 'disabled'}`, () =>
                  setPushEnabled(checked),
                )
              }
              onPromptPush={() =>
                runAction('Push permission requested', promptPush)
              }
              onInfoTap={() => showToast('Push section tooltip')}
            />

            <SendPushSection
              onInfoTap={() =>
                showToast('SIMPLE: basic payload; WITH IMAGE: big_picture + ios_attachments; CUSTOM: open title/body modal')
              }
              onSendSimple={() =>
                runAction('Simple notification sent', sendSimpleNotification)
              }
              onSendImage={() =>
                runAction('Image notification sent', sendImageNotification)
              }
              onSendCustom={() => setDialog({ type: 'customNotification' })}
            />

            <InAppSection
              inAppMessagesPaused={state.inAppMessagesPaused}
              onInfoTap={() => showToast('In-app messaging info')}
              onTogglePaused={(checked) =>
                runAction(
                  checked ? 'In-app messages paused' : 'In-app messages resumed',
                  () => setIamPaused(checked),
                )
              }
            />

            <SendIamSection
              onInfoTap={() => showToast('Send IAM info')}
              onSendTopBanner={() =>
                runAction('Sent IAM: top_banner', () =>
                  sendIamTrigger('top_banner'),
                )
              }
              onSendBottomBanner={() =>
                runAction('Sent IAM: bottom_banner', () =>
                  sendIamTrigger('bottom_banner'),
                )
              }
              onSendCenterModal={() =>
                runAction('Sent IAM: center_modal', () =>
                  sendIamTrigger('center_modal'),
                )
              }
              onSendFullScreen={() =>
                runAction('Sent IAM: full_screen', () =>
                  sendIamTrigger('full_screen'),
                )
              }
            />

            <AliasesSection
              aliasItems={aliasItems}
              onInfoTap={() => showToast('Aliases info')}
              onAddAlias={() => setDialog({ type: 'addAlias' })}
              onAddMultipleAliases={() => setDialog({ type: 'addMultipleAliases' })}
            />

            <EmailsSection
              emails={state.emailsList}
              onInfoTap={() => showToast('Emails info')}
              onAddEmail={() => setDialog({ type: 'addEmail' })}
              onRemoveEmail={(email) =>
                runAction(`Email removed: ${email}`, () => removeEmail(email))
              }
            />

            <SmsSection
              smsNumbers={state.smsNumbersList}
              onInfoTap={() => showToast('SMS info')}
              onAddSms={() => setDialog({ type: 'addSms' })}
              onRemoveSms={(sms) =>
                runAction(`SMS removed: ${sms}`, () => removeSms(sms))
              }
            />

            <TagsSection
              tagItems={tagItems}
              onInfoTap={() => showToast('Tags info')}
              onRemoveTag={(key) =>
                runAction(`Tag removed: ${key}`, () => removeSelectedTags([key]))
              }
              onAddTag={() => setDialog({ type: 'addTag' })}
              onAddMultipleTags={() => setDialog({ type: 'addMultipleTags' })}
              onRemoveSelectedTags={() => setDialog({ type: 'removeSelectedTags' })}
            />

            <OutcomesSection
              onInfoTap={() => showToast('Outcome events info')}
              onSendOutcome={() => setDialog({ type: 'sendOutcome' })}
            />

            <TriggersSection
              triggerItems={triggerItems}
              onInfoTap={() => showToast('Triggers info')}
              onAddTrigger={() =>
                runAction('Trigger added', () =>
                  addTrigger('trigger_manual', 'manual'),
                )
              }
              onAddMultipleTriggers={() =>
                runAction('Multiple triggers added', () =>
                  addTriggers({ trigger_a: 'one', trigger_b: 'two' }),
                )
              }
              onRemoveSelectedTriggers={() =>
                setDialog({ type: 'removeSelectedTriggers' })
              }
              onClearTriggers={() =>
                runAction('All triggers cleared', clearTriggers)
              }
            />

            <TrackEventSection
              onInfoTap={() => showToast('Track event info')}
              onTrackEvent={() => setDialog({ type: 'trackEvent' })}
            />

            <LocationSection
              locationShared={state.locationShared}
              onInfoTap={() => showToast('Location info')}
              onToggleLocationShared={(checked) =>
                runAction(
                  checked
                    ? 'Location sharing enabled'
                    : 'Location sharing disabled',
                  () => setLocationShared(checked),
                )
              }
              onPromptLocation={() =>
                runAction(
                  'Location permission prompt shown',
                  requestLocationPermission,
                )
              }
            />

            <section className="section">
              <ActionButton
                type="button"
                onClick={() =>
                  runAction('Next activity tapped', () =>
                    trackEvent('next_activity_tapped'),
                  )
                }
              >
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
          onSubmit={(value) =>
            runAction(`Logged in as ${value}`, async () => {
              await loginUser(value);
              closeDialog();
            })
          }
        />

        <PairInputModal
          open={dialog.type === 'addAlias'}
          title="Add Alias"
          firstPlaceholder="Label"
          secondPlaceholder="ID"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(label, id) =>
            runAction(`Alias added: ${label}`, async () => {
              await addAlias(label, id);
              closeDialog();
            })
          }
        />

        <SingleInputModal
          open={dialog.type === 'addEmail'}
          title="Add Email"
          placeholder="Email Address"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(value) =>
            runAction(`Email added: ${value}`, async () => {
              await addEmail(value);
              closeDialog();
            })
          }
        />

        <SingleInputModal
          open={dialog.type === 'addSms'}
          title="Add SMS"
          placeholder="Phone Number"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(value) =>
            runAction(`SMS added: ${value}`, async () => {
              await addSms(value);
              closeDialog();
            })
          }
        />

        <PairInputModal
          open={dialog.type === 'addTag'}
          title="Add Tag"
          firstPlaceholder="Key"
          secondPlaceholder="Value"
          confirmLabel="Add"
          onClose={closeDialog}
          onSubmit={(key, value) =>
            runAction(`Tag added: ${key}`, async () => {
              await addTag(key, value);
              closeDialog();
            })
          }
        />

        <MultiPairInputModal
          open={dialog.type === 'addMultipleAliases'}
          title="Add Multiple Aliases"
          firstPlaceholder="Label"
          secondPlaceholder="ID"
          onClose={closeDialog}
          onSubmit={(pairs) =>
            runAction(
              `${Object.keys(pairs).length} alias(es) added`,
              async () => {
                await addAliases(pairs);
                closeDialog();
              },
            )
          }
        />

        <MultiPairInputModal
          open={dialog.type === 'addMultipleTags'}
          title="Add Multiple Tags"
          firstPlaceholder="Key"
          secondPlaceholder="Value"
          onClose={closeDialog}
          onSubmit={(pairs) =>
            runAction(`${Object.keys(pairs).length} tag(s) added`, async () => {
              await addTags(pairs);
              closeDialog();
            })
          }
        />

        <MultiSelectRemoveModal
          open={dialog.type === 'removeSelectedTags'}
          title="Remove Tags"
          items={state.tagsList}
          onClose={closeDialog}
          onSubmit={(keys) =>
            runAction(`${keys.length} tag(s) removed`, async () => {
              await removeSelectedTags(keys);
              closeDialog();
            })
          }
        />

        <MultiSelectRemoveModal
          open={dialog.type === 'removeSelectedTriggers'}
          title="Remove Triggers"
          items={state.triggersList}
          onClose={closeDialog}
          onSubmit={(keys) =>
            runAction(`${keys.length} trigger(s) removed`, async () => {
              await removeSelectedTriggers(keys);
              closeDialog();
            })
          }
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
          onSubmit={(name, properties) =>
            runAction(`Event tracked: ${name}`, async () => {
              await trackEvent(name, properties);
              closeDialog();
            })
          }
        />

        <CustomNotificationModal
          open={dialog.type === 'customNotification'}
          onClose={closeDialog}
          onSubmit={(title, body) =>
            runAction(`Notification sent: ${title}`, async () => {
              await sendCustomNotification(title, body);
              closeDialog();
            })
          }
        />

        <IonToast
          isOpen={toastOpen}
          message={toastMessage}
          duration={1600}
          onDidDismiss={() => setToastOpen(false)}
        />
        <LoadingOverlay visible={state.isLoading} />
      </IonContent>
    </IonPage>
  );
};

export default Home;
