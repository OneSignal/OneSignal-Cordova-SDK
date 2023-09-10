// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

// Represents the current user's push notification subscription state with OneSignal
export interface PushSubscriptionState {
    id                  ?: string;
    token               ?: string;
    optedIn             : boolean;
}

export interface PushSubscriptionChangedState {
    previous: PushSubscriptionState;
    current: PushSubscriptionState;
}

export default class PushSubscription {
    private _id?: string | null;
    private _token?: string | null;
    private _optedIn?: boolean;

    private _subscriptionObserverList: ((event:PushSubscriptionChangedState)=>void)[] = [];

    private _processFunctionList(array: ((event:PushSubscriptionChangedState)=>void)[], param: PushSubscriptionChangedState): void {
        for (let i = 0; i < array.length; i++) {
            array[i](param);
        }
    }

    /**
     * Sets initial Push Subscription properties and adds observer for changes
     */
    _setPropertiesAndObserver():void {
        /**
         * Receive push Id
         * @param obj 
         */
        const getIdCallback = (obj: {value: string}) => {
            this._id = obj.value;
        };
        window.cordova.exec(getIdCallback, function(){}, "OneSignalPush", "getPushSubscriptionId");

        /**
         * Receive token
         * @param obj 
         */
        const getTokenCallback = (obj: {value: string}) => {
            this._token = obj.value;
        };
        window.cordova.exec(getTokenCallback, function(){}, "OneSignalPush", "getPushSubscriptionToken");
        
        /**
         * Receive opted-in status
         * @param obj 
         */
        const getOptedInCallback = (obj: {value: boolean}) => {
            this._optedIn = obj.value;
        };
        window.cordova.exec(getOptedInCallback, function(){}, "OneSignalPush", "getPushSubscriptionOptedIn");
        
        this.addEventListener("change", (subscriptionChange) => {
            this._id = subscriptionChange.current.id;
            this._token = subscriptionChange.current.token;
            this._optedIn = subscriptionChange.current.optedIn;
        });
        
    }
    
    get id(): string | null | undefined {
        return this._id;
    }
    
    get token(): string | null | undefined {
        return this._token;
    }
    /**
     * Gets a boolean value indicating whether the current user is opted in to push notifications.
     * This returns true when the app has notifications permission and optOut() is NOT called.
     * Note: Does not take into account the existence of the subscription ID and push token.
     * This boolean may return true but push notifications may still not be received by the user.
     */
    get optedIn(): boolean {
        return this._optedIn || false;
    }

    /**
     * Add a callback that fires when the OneSignal push subscription state changes.
     * @param  {(event: PushSubscriptionChangedState)=>void} listener
     * @returns void
     */
    addEventListener(event: "change", listener: (event: PushSubscriptionChangedState) => void) {
        this._subscriptionObserverList.push(listener as (event: PushSubscriptionChangedState) => void);
        const subscriptionCallBackProcessor = (state: PushSubscriptionChangedState) => {
            this._processFunctionList(this._subscriptionObserverList, state);
        };
        window.cordova.exec(subscriptionCallBackProcessor, function(){}, "OneSignalPush", "addPushSubscriptionObserver", []);
    }

    /**
     * Remove a push subscription observer that has been previously added.
     * @param  {(event: PushSubscriptionChangedState)=>void} listener
     * @returns void
     */
    removeEventListener(event: "change", listener: (event: PushSubscriptionChangedState) => void) {
        let index = this._subscriptionObserverList.indexOf(listener);
        if (index !== -1) {
            this._subscriptionObserverList.splice(index, 1);
        }
    }
    
    /**
     * Call this method to receive push notifications on the device or to resume receiving of push notifications after calling optOut. If needed, this method will prompt the user for push notifications permission.
     * @returns void
     */
    optIn(): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "optInPushSubscription");
    }

    /**
     * If at any point you want the user to stop receiving push notifications on the current device (regardless of system-level permission status), you can call this method to opt out.
     * @returns void
     */
    optOut(): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "optOutPushSubscription");
    }
}
