import OSNotification from '../OSNotification';

// 0 = NotificationClicked, 1 = ButtonClicked
export type OpenedEventActionType = 0 | 1;

/// An instance of this class represents a user interaction with
/// your push notification, ie. if they tap a button
export interface OpenedEvent {
    action          : OpenedEventAction;
    notification    : OSNotification;
}

/// Represents an action taken on a push notification, such as
/// tapping the notification (or a button on the notification),
/// or if your `inFocusDisplayType` is set to true - if they
/// tapped 'close'.
export interface OpenedEventAction {
    actionId   ?: string;
    type       : OpenedEventActionType;
}
