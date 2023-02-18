// 0 = NotDetermined, 1 = Denied, 2 = Authorized, 3 = Provisional, 4 = Ephemeral
export type PermissionStatus = 0 | 1 | 2 | 3 | 4;


/* O B S E R V E R  C H A N G E  E V E N T S */
export interface ChangeEvent<ObserverChangeEvent> {
    from : ObserverChangeEvent;
    to   : ObserverChangeEvent;
}

export type ObserverChangeEvent = PermissionChange | PushSubscriptionState

export interface PermissionChange {
    status                  : PermissionStatus;
    hasPrompted             ?: boolean;   // ios
    provisional             ?: boolean;   // ios
}

/// Represents the current user's push notification subscription state with OneSignal
export interface PushSubscriptionState {
    id                  ?: string;
    token               ?: string;
    optedIn             : boolean;
}