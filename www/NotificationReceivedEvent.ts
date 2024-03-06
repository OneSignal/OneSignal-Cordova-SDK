import { OSNotification } from './OSNotification';

declare let cordova: any;
// Suppress TS warnings about window.cordova

declare let window: any; // turn off type checking

export class NotificationWillDisplayEvent {
    private notification: OSNotification;

    constructor(displayEvent: OSNotification) {
        this.notification = new OSNotification(displayEvent);
    }

    preventDefault(): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "preventDefault", [this.notification.notificationId]);
        return;
    }

    getNotification(): OSNotification {
        return this.notification;
    }
}
