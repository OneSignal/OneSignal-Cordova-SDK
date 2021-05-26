var OSNotification = require('./NotificationReceived').OSNotification;

/// An instance of this class represents a user interaction with
/// your push notification, ie. if they tap a button
function OSNotificationOpenedResult (json) {
    this.notification = new OSNotification(json.notification);

    if (json.action) {
        this.action = new OSNotificationAction(json.action);
    }
}

/// Represents an action taken on a push notification, such as
/// tapping the notification (or a button on the notification),
/// or if your `inFocusDisplayType` is set to true - if they
/// tapped 'close'.
function OSNotificationAction (json) {
    /// The ID of the button on your notification
    /// that the user tapped
    this.actionId = json.actionId;

    /// An int that represents whether the user `opened` or
    /// took a more specific `action` (such as tapping a button
    /// on the notification)
    this.type = json.type;
}

module.exports = OSNotificationOpenedResult;
