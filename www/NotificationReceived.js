/// Represents a button sent as part of a push notification
class OSActionButton {
  constructor(json) {
        /// The custom unique ID for this button
        this.id = json.id;
        /// The text to display for the button
        this.text = json.text;
    
        /// (Android only)
        /// The URL/filename to show as the
        /// button's icon
        if (json.icon) {
            this.icon = json.icon;
        }
    }
}

var OSNotificationReceivedEvent = {
    notification: null,
    create : function (receivedEvent) {
        if (receivedEvent.notification) {
            // Android case
            this.notification = new OSNotification(receivedEvent.notification);
        } else {
            // iOS case
            this.notification = new OSNotification(receivedEvent);
        }
        return this;
    },
    complete : function (notification) {
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
    },
    getNotification: function() {
        return this.notification; 
    }
};

module.exports = {
    OSNotification: OSNotification,
    OSNotificationReceivedEvent: OSNotificationReceivedEvent
};
