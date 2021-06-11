// 0 = NotDetermined, 1 = Denied, 2 = Authorized, 3 = Provisional, 4 = Ephemeral
export type IosPermissionStatus = 0 | 1 | 2 | 3 | 4; 

/* D E V I C E */
export interface DeviceState {
    userId                          : string;
    pushToken                       : string;
    emailUserId                     : string;
    emailAddress                    : string;
    smsUserId                       : string;
    smsNumber                       : string;
    isSubscribed                    : boolean;
    isPushDisabled                  : boolean;
    isEmailSubscribed               : boolean;
    isSMSSubscribed                 : boolean;
    hasNotificationPermission       ?: boolean;
    notificationPermissionStatus    ?: IosPermissionStatus;  // ios only
    // areNotificationsEnabled (android) not included since it is converted to hasNotificationPermission in bridge
}

export interface PermissionChange {
    status                  ?: IosPermissionStatus;    // ios
    hasPrompted             ?: boolean;   // ios
    provisional             ?: boolean;   // ios
    areNotificationsEnabled ?: boolean;   // android
}

export interface SubscriptionChange {
    userId                  ?: string;
    pushToken               ?: string;
    isSubscribed            : boolean;
    isPushDisabled          : boolean;
}

export interface EmailSubscriptionChange {
    emailAddress        ?: string;
    emailUserId         ?: string;
    isEmailSubscribed   : boolean;
}

export interface SMSSubscriptionChange {
    smsNumber         ?: string;
    smsUserId         ?: string;
    isSMSSubscribed   : boolean;
}
