// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

// Represents the current user's push notification subscription state with OneSignal
export interface PushSubscriptionState {
    id                  ?: string;
    token               ?: string;
    optedIn             : boolean;
}

export default class PushSubscription {
    private _id?: string | null;
    private _token?: string | null;
    private _optedIn?: boolean;

    private _subscriptionObserverList: ((event:PushSubscriptionState)=>void)[] = [];

    private _processFunctionList(array: ((event:PushSubscriptionState)=>void)[], param: PushSubscriptionState): void {
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

        this.addObserver(event => {
            this._id = event.id;
            this._token = event.token;
            this._optedIn = event.optedIn;
        });
    }
    
    get id(): string | null | undefined {
        return this._id;
    }
    
    get token(): string | null | undefined {
        return this._token;
    }

    get optedIn(): boolean {
        return this._optedIn || false;
    }  

    /**
     * Add a callback that fires when the OneSignal push subscription state changes.
     * @param  {(event: PushSubscriptionState)=>void} observer
     * @returns void
     */
    addObserver(observer: (event: PushSubscriptionState) => void): void {
        this._subscriptionObserverList.push(observer);
        const subscriptionCallBackProcessor = (state: PushSubscriptionState) => {
            this._processFunctionList(this._subscriptionObserverList, state);
        };
        window.cordova.exec(subscriptionCallBackProcessor, function(){}, "OneSignalPush", "addPushSubscriptionObserver", []);
    };

    /**
     * Remove a push subscription observer that has been previously added.
     * @param  {(event: PushSubscriptionState)=>void} observer
     * @returns void
     */
    removeObserver(observer: (event: PushSubscriptionState) => void): void {
        let index = this._subscriptionObserverList.indexOf(observer);
        if (index !== -1) {
            this._subscriptionObserverList.splice(index, 1);
        }
    };
    
    /**
     * Call this method to receive push notifications on the device or to resume receiving of push notifications after calling optOut. If needed, this method will prompt the user for push notifications permission.
     * @returns void
     */
    optIn(): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "OptInPushSubscription");
    }

    /**
     * If at any point you want the user to stop receiving push notifications on the current device (regardless of system-level permission status), you can call this method to opt out.
     * @returns void
     */
    optOut(): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "optOutPushSubscription");
    }
}
