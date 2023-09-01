export type InAppMessageEventName = "click" | "willDisplay" | "didDisplay" | "willDismiss" | "didDismiss";

export type InAppMessageEventTypeMap = {
  click: InAppMessageClickEvent;
  willDisplay: InAppMessageWillDisplayEvent;
  didDisplay: InAppMessageDidDisplayEvent;
  willDismiss: InAppMessageWillDismissEvent;
  didDismiss: InAppMessageDidDismissEvent;
};

export interface InAppMessageClickEvent {
    message             : OSInAppMessage
    result              : InAppMessageClickResult
}

export interface InAppMessageClickResult {
    closingMessage      : boolean;
    actionId            ?: string;
    url                 ?: string;
    urlTarget           ?: InAppMessageActionUrlType;
}

export type InAppMessageActionUrlType = "browser" | "webview" | "replacement"

export interface InAppMessageWillDisplayEvent {
    message : OSInAppMessage
}

export interface InAppMessageDidDisplayEvent {
    message : OSInAppMessage
}

export interface InAppMessageWillDismissEvent {
    message : OSInAppMessage
}

export interface InAppMessageDidDismissEvent {
    message : OSInAppMessage
}

export interface OSInAppMessage {
    messageId : string
}
