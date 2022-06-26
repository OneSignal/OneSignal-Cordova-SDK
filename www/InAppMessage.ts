export interface InAppMessageAction {
    closesMessage  : boolean;
    firstClick     : boolean;
    clickName      ?: string;
    clickUrl       ?: string;
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
