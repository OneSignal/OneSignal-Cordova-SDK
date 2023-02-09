export interface InAppMessageAction {
    closesMessage       : boolean;
    isFirstClick        : boolean;
    clickName           ?: string;
    clickUrl            ?: string;
    
    // Not currently exposed in Android 5.0.0-beta1
    // outcomes            ?: object[];
    // tags                ?: object;
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
