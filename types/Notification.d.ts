// 0 = NotificationClicked, 1 = ButtonClicked
export type OpenedEventActionType = 0 | 1;

 /* N O T I F I C A T I O N S */
export interface OSNotification {
    body            : string;
    sound           ?: string;
    title           ?: string;
    launchURL       ?: string;
    rawPayload      : object;
    actionButtons   ?: object[];
    additionalData  : object;
    notificationId  : string;
    // android only
    groupKey                ?: string;
    groupMessage            ?: string;
    ledColor                ?: string;
    priority                ?: number;
    smallIcon               ?: string;
    largeIcon               ?: string;
    bigPicture              ?: string;
    collapseId              ?: string;
    fromProjectNumber       ?: string;
    smallIconAccentColor    ?: string;
    lockScreenVisibility    ?: string;
    androidNotificationId   ?: number;
    // ios only
    badge               ?: string;
    badgeIncrement      ?: string;
    category            ?: string;
    threadId            ?: string;
    subtitle            ?: string;
    templateId          ?: string;
    templateName        ?: string;
    attachments         ?: object;
    mutableContent      ?: boolean;
    contentAvailable    ?: string;
    relevanceScore      ?: number;
    interruptionLevel   ?: string;
}

/* N O T I F I C A T I O N   &   I A M   E V E N T S */
export interface NotificationReceivedEvent {
    complete        : (notification?: OSNotification | null) => void;
    getNotification : () => OSNotification;
}

export interface OpenedEvent {
    action          : OpenedEventAction;
    notification    : OSNotification;
}

export interface OpenedEventAction {
    type : OpenedEventActionType
}
