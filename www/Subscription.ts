// 0 = NotDetermined, 1 = Denied, 2 = Authorized, 3 = Provisional, 4 = Ephemeral
export type PermissionStatus = 0 | 1 | 2 | 3 | 4;

/* D E V I C E */
export class DeviceState {
    userId                          : string;
    pushToken                       : string;
    emailUserId                     : string;
    emailAddress                    : string;
    smsUserId                       : string;
    smsNumber                       : string;
    subscribed                      : boolean;
    pushDisabled                    : boolean;
    emailSubscribed                 : boolean;
    smsSubscribed                   : boolean;
    hasNotificationPermission       : boolean;
    notificationPermissionStatus    ?: PermissionStatus;  // ios only
    // areNotificationsEnabled (android) not included since it is converted to hasNotificationPermission below

    constructor(deviceState: any) {
        this.userId = deviceState.userId;
        this.pushToken = deviceState.pushToken;
        this.emailUserId = deviceState.emailUserId;
        this.emailAddress = deviceState.emailAddress;
        this.smsUserId = deviceState.smsUserId;
        this.smsNumber = deviceState.smsNumber;
        // rename the subscribed properties to align with existing type definition
        this.pushDisabled = deviceState.isPushDisabled;
        this.subscribed = deviceState.isSubscribed;
        this.emailSubscribed = deviceState.isEmailSubscribed;
        this.smsSubscribed = deviceState.isSMSSubscribed;
        if (deviceState.areNotificationsEnabled !== undefined) {
            this.hasNotificationPermission = deviceState.areNotificationsEnabled;
        } else {
            this.hasNotificationPermission = deviceState.hasNotificationPermission;
        }
    }
}

/* O B S E R V E R  C H A N G E  E V E N T S */
export interface ChangeEvent<ObserverChangeEvent> {
    from : ObserverChangeEvent;
    to   : ObserverChangeEvent;
}

export type ObserverChangeEvent = PermissionChange | SubscriptionChange | EmailSubscriptionChange | SMSSubscriptionChange

export interface PermissionChange {
    status                  : PermissionStatus;
    hasPrompted             ?: boolean;   // ios
    provisional             ?: boolean;   // ios
}

/// Represents the current user's push notification subscription state with OneSignal
export interface SubscriptionChange {
    userId                  ?: string;
    pushToken               ?: string;
    isSubscribed            : boolean;
}

/// Represents the user's OneSignal email subscription state,
export interface EmailSubscriptionChange {
    emailAddress        ?: string;
    emailUserId         ?: string;
    isEmailSubscribed   : boolean; // renamed from isSubscribed
}

/// Represents the user's OneSignal SMS subscription state,
export interface SMSSubscriptionChange {
    smsNumber         ?: string;
    smsUserId         ?: string;
    isSMSSubscribed   : boolean; // renamed from isSubscribed
}
