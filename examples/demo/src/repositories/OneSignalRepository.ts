import { Capacitor } from '@capacitor/core';
import OneSignal from 'onesignal-cordova-plugin';
import type { NotificationType } from '../models/NotificationType';
import type { UserData } from '../models/UserData';
import OneSignalApiService from '../services/OneSignalApiService';

export default class OneSignalRepository {
  private readonly apiService: OneSignalApiService;

  constructor(apiService: OneSignalApiService = OneSignalApiService.getInstance()) {
    this.apiService = apiService;
  }

  private isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  initialize(appId: string): void {
    this.apiService.setAppId(appId);
    if (!this.isNative()) return;
    OneSignal.initialize(appId);
  }

  loginUser(externalId: string): void {
    if (!this.isNative()) return;
    OneSignal.login(externalId);
  }

  logoutUser(): void {
    if (!this.isNative()) return;
    OneSignal.logout();
  }

  setConsentRequired(required: boolean): void {
    if (!this.isNative()) return;
    OneSignal.setConsentRequired(required);
  }

  setConsentGiven(granted: boolean): void {
    if (!this.isNative()) return;
    OneSignal.setConsentGiven(granted);
  }

  async getPushSubscriptionId(): Promise<string | null> {
    if (!this.isNative()) return null;
    return OneSignal.User.pushSubscription.getIdAsync();
  }

  async isPushOptedIn(): Promise<boolean> {
    if (!this.isNative()) return false;
    return OneSignal.User.pushSubscription.getOptedInAsync();
  }

  optInPush(): void {
    if (!this.isNative()) return;
    OneSignal.User.pushSubscription.optIn();
  }

  optOutPush(): void {
    if (!this.isNative()) return;
    OneSignal.User.pushSubscription.optOut();
  }

  hasPermission(): boolean {
    if (!this.isNative()) return false;
    return OneSignal.Notifications.hasPermission();
  }

  requestPermission(fallbackToSettings = true): Promise<boolean> {
    if (!this.isNative()) return Promise.resolve(false);
    return OneSignal.Notifications.requestPermission(fallbackToSettings);
  }

  setPaused(paused: boolean): void {
    if (!this.isNative()) return;
    OneSignal.InAppMessages.setPaused(paused);
  }

  addAlias(label: string, id: string): void {
    if (!this.isNative()) return;
    OneSignal.User.addAlias(label, id);
  }

  addAliases(aliases: Record<string, string>): void {
    if (!this.isNative()) return;
    OneSignal.User.addAliases(aliases);
  }

  addEmail(email: string): void {
    if (!this.isNative()) return;
    OneSignal.User.addEmail(email);
  }

  removeEmail(email: string): void {
    if (!this.isNative()) return;
    OneSignal.User.removeEmail(email);
  }

  addSms(sms: string): void {
    if (!this.isNative()) return;
    OneSignal.User.addSms(sms);
  }

  removeSms(sms: string): void {
    if (!this.isNative()) return;
    OneSignal.User.removeSms(sms);
  }

  addTag(key: string, value: string): void {
    if (!this.isNative()) return;
    OneSignal.User.addTag(key, value);
  }

  addTags(tags: Record<string, string>): void {
    if (!this.isNative()) return;
    OneSignal.User.addTags(tags);
  }

  removeTags(keys: string[]): void {
    if (!this.isNative()) return;
    OneSignal.User.removeTags(keys);
  }

  addTrigger(key: string, value: string): void {
    if (!this.isNative()) return;
    OneSignal.InAppMessages.addTrigger(key, value);
  }

  addTriggers(triggers: Record<string, string>): void {
    if (!this.isNative()) return;
    OneSignal.InAppMessages.addTriggers(triggers);
  }

  removeTriggers(keys: string[]): void {
    if (!this.isNative()) return;
    OneSignal.InAppMessages.removeTriggers(keys);
  }

  clearTriggers(): void {
    if (!this.isNative()) return;
    OneSignal.InAppMessages.clearTriggers();
  }

  sendOutcome(name: string): void {
    if (!this.isNative()) return;
    OneSignal.Session.addOutcome(name);
  }

  sendUniqueOutcome(name: string): void {
    if (!this.isNative()) return;
    OneSignal.Session.addUniqueOutcome(name);
  }

  sendOutcomeWithValue(name: string, value: number): void {
    if (!this.isNative()) return;
    OneSignal.Session.addOutcomeWithValue(name, value);
  }

  trackEvent(name: string, properties?: Record<string, unknown>): void {
    if (!this.isNative()) return;
    OneSignal.User.trackEvent(name, properties);
  }

  setLocationShared(shared: boolean): void {
    if (!this.isNative()) return;
    OneSignal.Location.setShared(shared);
  }

  requestLocationPermission(): void {
    if (!this.isNative()) return;
    OneSignal.Location.requestPermission();
  }

  getExternalId(): Promise<string | null> {
    if (!this.isNative()) return Promise.resolve(null);
    return OneSignal.User.getExternalId();
  }

  getOnesignalId(): Promise<string | null> {
    if (!this.isNative()) return Promise.resolve(null);
    return OneSignal.User.getOnesignalId();
  }

  async sendNotification(type: NotificationType): Promise<boolean> {
    const subscriptionId = await this.getPushSubscriptionId();
    if (!subscriptionId) {
      return false;
    }
    return this.apiService.sendNotification(type, subscriptionId);
  }

  async sendCustomNotification(title: string, body: string): Promise<boolean> {
    const subscriptionId = await this.getPushSubscriptionId();
    if (!subscriptionId) {
      return false;
    }
    return this.apiService.sendCustomNotification(title, body, subscriptionId);
  }

  fetchUser(onesignalId: string): Promise<UserData | null> {
    return this.apiService.fetchUser(onesignalId);
  }
}
