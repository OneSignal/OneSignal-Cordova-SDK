import OSNotification from '../OSNotification';
import OSNotificationWillDisplayEvent from '../NotificationReceivedEvent';

export type NotificationEventName = "click" | "foregroundWillDisplay";

export type NotificationEventTypeMap = {
  click: ClickedEvent;
  foregroundWillDisplay: OSNotificationWillDisplayEvent;
};

// 0 = NotificationClicked, 1 = ButtonClicked
export type ClickedEventActionType = 0 | 1;

/// An instance of this class represents a user interaction with
/// your push notification, ie. if they tap a button
export interface ClickedEvent {
    action          : ClickedEventAction;
    notification    : OSNotification;
}

/// Represents an action taken on a push notification, such as
/// tapping the notification (or a button on the notification),
/// or if your `inFocusDisplayType` is set to true - if they
/// tapped 'close'.
export interface ClickedEventAction {
    actionId   ?: string;
    type       : ClickedEventActionType;
}
