// 0 = NotificationClicked, 1 = ButtonClicked
export type OpenedEventActionType = 0 | 1;

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
