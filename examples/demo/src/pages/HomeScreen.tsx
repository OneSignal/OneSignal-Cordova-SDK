import { Capacitor } from '@capacitor/core';
import { IonContent, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { useHistory } from 'react-router-dom';

import oneSignalLogo from '../assets/onesignal_logo.svg';
import ActionButton from '../components/ActionButton';
import TooltipModal from '../components/modals/TooltipModal';
import AliasesSection from '../components/sections/AliasesSection';
import AppSection from '../components/sections/AppSection';
import CustomEventsSection from '../components/sections/CustomEventsSection';
import EmailsSection from '../components/sections/EmailsSection';
import InAppSection from '../components/sections/InAppSection';
import LiveActivitySection from '../components/sections/LiveActivitySection';
import LocationSection from '../components/sections/LocationSection';
import OutcomesSection from '../components/sections/OutcomesSection';
import PushSection from '../components/sections/PushSection';
import SendIamSection from '../components/sections/SendIamSection';
import SendPushSection from '../components/sections/SendPushSection';
import SmsSection from '../components/sections/SmsSection';
import TagsSection from '../components/sections/TagsSection';
import TriggersSection from '../components/sections/TriggersSection';
import UserSection from '../components/sections/UserSection';
import { useOneSignal } from '../hooks/useOneSignal';
import OneSignalApiService from '../services/OneSignalApiService';
import TooltipHelper from '../services/TooltipHelper';
import type { TooltipData } from '../services/TooltipHelper';

import './HomeScreen.css';

const HomeScreen: FC = () => {
  const os = useOneSignal();
  const history = useHistory();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    if (os.isReady) {
      void os.promptPush();
    }
  }, [os]);

  const showTooltipModal = (key: string): void => {
    const tooltip = TooltipHelper.getInstance().getTooltip(key);
    if (tooltip) {
      setActiveTooltip(tooltip);
      setTooltipVisible(true);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="demo-app">
          <header className="brand-header">
            <div className="brand-title">
              <img className="brand-logo" src={oneSignalLogo} alt="OneSignal" />
              <span className="brand-subtitle">Cordova</span>
            </div>
          </header>

          <main className="content" data-testid="main_scroll_view">
            <AppSection
              appId={os.appId}
              consentRequired={os.consentRequired}
              privacyConsentGiven={os.privacyConsentGiven}
              onToggleConsent={os.setConsentRequired}
              onTogglePrivacyConsent={os.setConsentGiven}
            />

            <UserSection
              externalUserId={os.externalUserId}
              onLogin={os.loginUser}
              onLogout={os.logoutUser}
            />

            <PushSection
              pushSubscriptionId={os.pushSubscriptionId}
              isPushEnabled={os.isPushEnabled}
              hasNotificationPermission={os.hasNotificationPermission}
              onTogglePush={os.setPushEnabled}
              onPromptPush={() => {
                void os.promptPush();
              }}
              onInfoTap={() => showTooltipModal('push')}
            />

            <SendPushSection
              onSendNotification={os.sendNotification}
              onSendCustomNotification={os.sendCustomNotification}
              onClearAll={os.clearAllNotifications}
              onInfoTap={() => showTooltipModal('sendPushNotification')}
            />

            <InAppSection
              inAppMessagesPaused={os.inAppMessagesPaused}
              onTogglePaused={os.setIamPaused}
              onInfoTap={() => showTooltipModal('inAppMessaging')}
            />

            <SendIamSection
              onSendIam={os.sendIamTrigger}
              onInfoTap={() => showTooltipModal('sendInAppMessage')}
            />

            <AliasesSection
              aliases={os.aliasesList}
              loading={os.isLoading}
              onAdd={os.addAlias}
              onAddMultiple={os.addAliases}
              onInfoTap={() => showTooltipModal('aliases')}
            />

            <EmailsSection
              emails={os.emailsList}
              loading={os.isLoading}
              onAdd={os.addEmail}
              onRemove={os.removeEmail}
              onInfoTap={() => showTooltipModal('emails')}
            />

            <SmsSection
              smsNumbers={os.smsNumbersList}
              loading={os.isLoading}
              onAdd={os.addSms}
              onRemove={os.removeSms}
              onInfoTap={() => showTooltipModal('sms')}
            />

            <TagsSection
              tags={os.tagsList}
              loading={os.isLoading}
              onAdd={os.addTag}
              onAddMultiple={os.addTags}
              onRemoveSelected={os.removeSelectedTags}
              onInfoTap={() => showTooltipModal('tags')}
            />

            <OutcomesSection
              onSendNormal={os.sendOutcome}
              onSendUnique={os.sendUniqueOutcome}
              onSendWithValue={os.sendOutcomeWithValue}
              onInfoTap={() => showTooltipModal('outcomes')}
            />

            <TriggersSection
              triggers={os.triggersList}
              onAdd={os.addTrigger}
              onAddMultiple={os.addTriggers}
              onRemoveSelected={os.removeSelectedTriggers}
              onClearAll={os.clearTriggers}
              onInfoTap={() => showTooltipModal('triggers')}
            />

            <CustomEventsSection
              onTrackEvent={os.trackEvent}
              onInfoTap={() => showTooltipModal('customEvents')}
            />

            <LocationSection
              locationShared={os.locationShared}
              onSetLocationShared={os.setLocationShared}
              onRequestLocationPermission={os.requestLocationPermission}
              onInfoTap={() => showTooltipModal('location')}
            />

            {Capacitor.getPlatform() === 'ios' && (
              <LiveActivitySection
                hasApiKey={OneSignalApiService.getInstance().hasApiKey()}
                onStart={os.startDefaultLiveActivity}
                onUpdate={os.updateLiveActivity}
                onEnd={os.endLiveActivity}
                onInfoTap={() => showTooltipModal('liveActivities')}
              />
            )}

            <section className="section">
              <ActionButton
                type="button"
                onClick={() => history.push('/secondary')}
                data-testid="next_screen_button"
              >
                NEXT ACTIVITY
              </ActionButton>
            </section>
          </main>
        </div>

        <TooltipModal
          open={tooltipVisible}
          tooltip={activeTooltip}
          onClose={() => setTooltipVisible(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default HomeScreen;
