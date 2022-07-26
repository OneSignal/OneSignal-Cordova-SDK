import OSNotification from './OSNotification';
declare let cordova: any;

export default class NotificationReceivedEvent {
    private notification: OSNotification;

    constructor(receivedEvent: OSNotification) {
        this.notification = new OSNotification(receivedEvent);
    }

    complete(notification?: OSNotification): void {
        if (!notification) {
            // if the notificationReceivedEvent is null, we want to call the native-side
            // complete/completion with null to silence the notification
            cordova.exec(function(){}, function(){}, "OneSignalPush", "completeNotification", [this.notification.notificationId, false]);
            return;
        }

        // if the notificationReceivedEvent is not null, we want to pass the specific event
        // future: Android side: make the notification modifiable
        // iOS & Android: the notification id is associated with the native-side complete handler / completion block
        cordova.exec(function(){}, function(){}, "OneSignalPush", "completeNotification", [this.notification.notificationId, true]);
    }

    getNotification(): OSNotification {
        return this.notification;
    }
}
