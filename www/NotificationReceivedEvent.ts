import { noop } from './helpers';
import { OSNotification } from './OSNotification';

const defaultPreventedEvents = new WeakSet<NotificationWillDisplayEvent>();

export function isDefaultPrevented(event: NotificationWillDisplayEvent): boolean {
  return defaultPreventedEvents.has(event);
}

export class NotificationWillDisplayEvent {
  private notification: OSNotification;

  constructor(displayEvent: OSNotification) {
    this.notification = new OSNotification(displayEvent);
  }

  /**
   * Call this to prevent OneSignal from displaying the notification automatically.
   * This method can be called up to two times with false and then true, if processing time is needed.
   * Call this synchronously inside the listener before starting any asynchronous work.
   * Typically this is only possible within a short time-frame (~25 seconds) after the
   * notification is received on the device.
   * @param discard an [preventDefault] set to true to dismiss the notification with no
   * possibility of displaying it in the future.
   */
  preventDefault(discard: boolean = false): void {
    defaultPreventedEvents.add(this);
    window.cordova.exec(noop, noop, 'OneSignalPush', 'preventDefault', [
      this.notification.notificationId,
      discard,
    ]);
  }

  getNotification(): OSNotification {
    return this.notification;
  }
}
