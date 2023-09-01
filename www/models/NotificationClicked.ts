import { OSNotification } from '../OSNotification';
import { NotificationWillDisplayEvent } from '../NotificationReceivedEvent';

export type NotificationEventName = "click" | "foregroundWillDisplay" | "permissionChange";

export type NotificationEventTypeMap = {
  click: NotificationClickEvent;
  foregroundWillDisplay: NotificationWillDisplayEvent;
  permissionChange: boolean;
};

/// An instance of this class represents a user interaction with
/// your push notification, ie. if they tap a button
export interface NotificationClickEvent {
    result          : NotificationClickResult;
    notification    : OSNotification;
}

/// Represents an action taken on a push notification, such as
/// tapping the notification (or a button on the notification),
/// or if your `inFocusDisplayType` is set to true - if they
/// tapped 'close'.
export interface NotificationClickResult {
    actionId   ?: string;
    url        ?: string;
}
