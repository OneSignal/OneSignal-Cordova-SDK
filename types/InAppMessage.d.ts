export interface InAppMessageAction {
    closes_message  : boolean;
    first_click     : boolean;
    click_name      ?: string;
    click_url       ?: string;
}

export interface OSInAppMessage {
    messageId : string
}

export interface InAppMessageLifecycleHandlerObject {
    onWillDisplayInAppMessage       ?: (message: InAppMessage) => void;
    onDidDisplayInAppMessage        ?: (message: InAppMessage) => void;
    onWillDismissInAppMessage       ?: (message: InAppMessage) => void;
    onDidDismissInAppMessage        ?: (message: InAppMessage) => void;
}
