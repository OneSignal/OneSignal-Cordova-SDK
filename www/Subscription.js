function OSDeviceState(json) {
    if (json.hasNotificationPermission) {
        this.hasNotificationPermission = json.hasNotificationPermission;
    } else {
        this.hasNotificationPermission = json.areNotificationsEnabled;
    }

    if (json.notificationPermissionStatus !== null) {
        this.notificationPermissionStatus = json.notificationPermissionStatus;
    }
    
    this.pushDisabled = json.isPushDisabled;
    this.subscribed = json.isSubscribed;
    this.emailSubscribed = json.isEmailSubscribed;
    this.smsSubscribed = json.isSMSSubscribed;
    this.userId = json.userId;
    this.pushToken = json.pushToken;
    this.emailUserId = json.emailUserId;
    this.emailAddress = json.emailAddress;
    this.smsUserId = json.smsUserId;
    this.smsNumber = json.smsNumber;
}

function OSPermissionState(json) {
    if (json.status !== null) {
        this.status = json.status;
    } else {
        this.status = json.areNotificationsEnabled ? OneSignal.prototype.OSNotificationPermission.Authorized : OneSignal.prototype.OSNotificationPermission.Denied;
    }

    // iOS only
    if (json.provisional !== null) {
        this.provisional = json.provisional;
    } else {
        this.provisional = false;
    }

    // iOS only
    if (json.hasPrompted !== null) {
        this.hasPrompted = json.hasPrompted;
    } else {
        this.hasPrompted = false;
    }
}
  
function OSPermissionStateChanges(json) {
    if (json.from) {
        this.from = new OSPermissionState(json.from);
    }
    if (json.to) {
        this.to = new OSPermissionState(json.to);
    }
}

/// Represents the current user's subscription state with OneSignal
function OSSubscriptionState(json) {
    /// A boolean parameter that indicates if the  user
    /// is subscribed to your app with OneSignal
    /// This is only true if the `userId`, `pushToken`, and
    /// `userSubscriptionSetting` parameters are defined/true.
    this.isSubscribed = json.isSubscribed;

    /// The current user's User ID (AKA playerID) with OneSignal
    this.userId = json.userId;

    /// The APNS (iOS), GCM/FCM (Android) push token
    this.pushToken = json.pushToken;
}

/// An instance of this class describes a change in the user's OneSignal
/// push notification subscription state, ie. the user subscribed to
/// push notifications with your app.
function OSSubscriptionStateChanges(json) {
    if (json.from) {
        this.from = new OSSubscriptionState(json.from);
    }
    if (json.to) {
        this.to = new OSSubscriptionState(json.to);
    }
}

/// Represents the user's OneSignal email subscription state,
function OSEmailSubscriptionState(json) {
    this.isEmailSubscribed = json.isSubscribed;
    this.emailAddress = json.emailAddress;
    this.emailUserId = json.emailUserId;
}

/// An instance of this class describes a change in the user's
/// email subscription state with OneSignal
function OSEmailSubscriptionStateChanges(json) {
    if (json.from) {
        this.from = new OSEmailSubscriptionState(json.from);
    }
    if (json.to) {
        this.to = new OSEmailSubscriptionState(json.to);
    }
}

/// Represents the user's OneSignal SMS subscription state,
function OSSMSSubscriptionState(json) {
    this.isSMSSubscribed = json.isSubscribed;
    this.smsNumber = json.smsNumber;
    this.smsUserId = json.smsUserId;
}

/// An instance of this class describes a change in the user's
/// SMS subscription state with OneSignal
function OSSMSSubscriptionStateChanges(json) {
    if (json.from) {
        this.from = new OSSMSSubscriptionState(json.from);
    }
    if (json.to) {
        this.to = new OSSMSSubscriptionState(json.to);
    }
}

module.exports = {
    OSDeviceState: OSDeviceState,
    OSPermissionStateChanges: OSPermissionStateChanges,
    OSSubscriptionStateChanges: OSSubscriptionStateChanges,
    OSEmailSubscriptionStateChanges: OSEmailSubscriptionStateChanges,
    OSSMSSubscriptionStateChanges: OSSMSSubscriptionStateChanges,
};
