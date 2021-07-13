function OSNotification (receivedEvent) {
    /// The OneSignal notification ID for this notification
    this.notificationId = receivedEvent.notificationId;
    /// The body (should contain most of the text)
    this.body = receivedEvent.body;
    /// The title for the notification
    this.title = receivedEvent.title;
    /// Any additional custom data you want to send along
    /// with this notification.
    this.additionalData = receivedEvent.additionalData;
    /// A hashmap object representing the raw key/value
    /// properties of the push notification
    if (typeof receivedEvent.rawPayload === 'string' || receivedEvent.rawPayload instanceof String) {
        this.rawPayload = JSON.parse(receivedEvent.rawPayload);
    } else {
        this.rawPayload = receivedEvent.rawPayload;
    }
    /// If set, he launch URL will be opened when the user
    /// taps on your push notification. You can control
    /// whether or not it opens in an in-app webview or
    /// in Safari (with iOS).
    this.launchURL = receivedEvent.launchURL;
    /// The sound file (ie. ping.aiff) that should be played
    /// when the notification is received
    this.sound = receivedEvent.sound;

    /// Any buttons you want to add to the notification.
    /// The notificationOpened handler will provide an
    /// OSNotificationAction object, which will contain
    /// the ID of the Action the user tapped.
    if (receivedEvent.actionButtons) {
        this.actionButtons = [];
        for (let btn of receivedEvent.actionButtons) {
            this.actionButtons.push(new OSActionButton(btn));
        }
    }

    // Android

    /// (Android only)
    /// All notifications with the same group key
    /// from the same app will be grouped together
    if (receivedEvent.groupKey) {
        this.groupKey = receivedEvent.groupKey;
    }
    /// (Android Only)
    /// The color to use to light up the LED (if
    /// applicable) when the notification is received
    /// Given in hex ARGB format.
    if (receivedEvent.ledColor) {
        this.ledColor = receivedEvent.ledColor;
    }
    /// (Android Only)
    /// The priority used with GCM/FCM to describe how
    /// urgent the notification is. A higher priority
    /// means the notification will be delivered faster.
    if (typeof(receivedEvent.priority) !== "undefined") {
        this.priority = receivedEvent.priority;
    }
    /// (Android Only)
    /// The filename of the image to use as the small
    /// icon for the notification
    if (receivedEvent.smallIcon) {
        this.smallIcon = receivedEvent.smallIcon;
    }
    /// (Android Only)
    /// The filename for the image to use as the large
    /// icon for the notification
    if (receivedEvent.largeIcon) {
        this.largeIcon = receivedEvent.largeIcon;
    }
    /// (Android Only)
    /// The URL or filename for the image to use as
    /// the big picture for the notification
    if (receivedEvent.bigPicture) {
        this.bigPicture = receivedEvent.bigPicture;
    }
    /// (Android Only)
    /// The collapse ID for the notification
    /// As opposed to groupKey (which causes stacking),
    /// the collapse ID will completely replace any
    /// previously received push notifications that
    /// use the same collapse_id
    if (receivedEvent.collapseId) {
        this.collapseId = receivedEvent.collapseId;
    }
    /// (Android only) Android 6 and earlier only
    /// The message to display when multiple
    /// notifications have been stacked together.
    /// Note: Android 7 allows groups (stacks)
    /// to be expanded, so group message is no
    /// longer necessary
    if (receivedEvent.groupMessage) {
        this.groupMessage = receivedEvent.groupMessage;
    }
    /// (Android Only)
    /// Tells you what project number/sender ID
    /// the notification was sent from
    if (receivedEvent.fromProjectNumber) {
        this.fromProjectNumber = receivedEvent.fromProjectNumber;
    }
    /// (Android Only)
    /// The accent color to use on the notification
    /// Hex value in ARGB format (it's a normal
    /// hex color value, but it includes the alpha
    /// channel in addition to red, green, blue)
    if (receivedEvent.smallIconAccentColor) {
        this.smallIconAccentColor = receivedEvent.smallIconAccentColor;
    }
    /// (Android only) API level 21+
    /// Sets the visibility of the notification
    ///  1 = Public (default)
    ///  0 = Private (hidden from lock screen
    ///    if user set 'Hide Sensitive content')
    ///  -1 = Secret (doesn't appear at all)
    if (receivedEvent.lockScreenVisibililty) {
        this.lockScreenVisibility = receivedEvent.lockScreenVisibililty;
    }
    /// (Android Only)
    /// The android notification ID (not same as  the OneSignal
    /// notification ID)
    if (receivedEvent.androidNotificationId) {
        this.androidNotificationId = receivedEvent.androidNotificationId;
    }
    /// (Android Only)
    /// Describes the background image layout of the
    /// notification (if set)
    if (receivedEvent.backgroundImageLayout) {
        this.backgroundImageLayout = new OSAndroidBackgroundImageLayout(receivedEvent.backgroundImageLayout);
    }
    /// (Android Only)
    /// Summary notifications grouped
    /// Notification payload will have the most recent notification received.
    if (receivedEvent.groupedNotifications && receivedEvent.groupedNotifications.length) {
        this.groupedNotifications = receivedEvent.groupedNotificationss.map(function(num) {
            return new OSNotification(item);
        });
    }

    // iOS

    /// (iOS Only)
    /// If you set the badge to a specific value, this integer
    /// property will be that value
    if (receivedEvent.badge) {
        this.badge = receivedEvent.badge;
    }
    /// (iOS Only)
    /// The category for this notification. This can trigger custom
    /// behavior (ie. if this notification should display a
    /// custom Content Extension for custom UI)
    if (receivedEvent.category) {
        this.category = receivedEvent.category;
    }
    /// (iOS Only)
    /// The subtitle of the notification
    if (receivedEvent.subtitle) {
        this.subtitle = receivedEvent.subtitle;
    }
    /// If this notification was created from a Template on the
    /// OneSignal dashboard, this will be the ID of that template
    if (receivedEvent.templateId) {
        this.templateId = receivedEvent.templateId;
    }
    /// (iOS Only)
    /// Any attachments (images, sounds, videos) you want
    /// to display with this notification.
    if (receivedEvent.attachments) {
        this.attachments = receivedEvent.attachments;
    }
    /// The name of the template (if any) that was used to
    /// create this push notification
    if (receivedEvent.templateName) {
        this.templateName = receivedEvent.templateName;
    }
    /// (iOS Only)
    /// Tells the system to launch the Notification Extension Service
    if (receivedEvent.mutableContent) {
        this.mutableContent = receivedEvent.mutableContent;
    }
    /// (iOS Only)
    /// If you want to increment the badge by some value, this
    /// integer will be the increment/decrement
    if (receivedEvent.badgeIncrement) {
        this.badgeIncrement = receivedEvent.badgeIncrement;
    }
    /// (iOS Only)
    /// Tells the system to launch your app in the background (ie. if
    /// content is available to download in the background)
    if (receivedEvent.contentAvailable) {
        this.contentAvailable = receivedEvent.contentAvailable;
    }
}
  
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
  
/// (Android Only)
/// This class represents the background image layout
/// used for push notifications that show a background image
class OSAndroidBackgroundImageLayout {
    constructor(json) {
        /// (Android Only)
        /// The image URL/filename to show as the background image
        if (json.image) {
            this.image = json.image;
        }
        /// (Android Only)
        /// The color of the title text
        if (json.titleTextColor) {
            this.titleTextColor = json.titleTextColor;
        }
        /// (Android Only)
        /// The color of the body text
        if (json.bodyTextColor) {
            this.bodyTextColor = json.bodyTextColor;
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
