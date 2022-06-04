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
    onWillDisplayInAppMessage       ?: (message: OSInAppMessage) => void;
    onDidDisplayInAppMessage        ?: (message: OSInAppMessage) => void;
    onWillDismissInAppMessage       ?: (message: OSInAppMessage) => void;
    onDidDismissInAppMessage        ?: (message: OSInAppMessage) => void;
}
