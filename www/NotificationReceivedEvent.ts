import { OSNotification } from "./OSNotification";

declare let cordova: any;
// Suppress TS warnings about window.cordova

declare let window: any; // turn off type checking

export class NotificationWillDisplayEvent {
  private notification: OSNotification;

  constructor(displayEvent: OSNotification) {
    this.notification = new OSNotification(displayEvent);
  }

  /**
   * Call this to prevent OneSignal from displaying the notification automatically.
   * This method can be called up to two times with false and then true, if processing time is needed.
   * Typically this is only possible within a short
   * time-frame (~30 seconds) after the notification is received on the device.
   * @param discard an [preventDefault] set to true to dismiss the notification with no
   * possibility of displaying it in the future.
   */
  preventDefault(discard: boolean = false): void {
    window.cordova.exec(
      function () {},
      function () {},
      "OneSignalPush",
      "preventDefault",
      [this.notification.notificationId, discard]
    );
    return;
  }

  getNotification(): OSNotification {
    return this.notification;
  }
}
