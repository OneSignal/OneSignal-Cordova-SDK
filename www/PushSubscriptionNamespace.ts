import { ChangeEvent,
    PushSubscriptionChange } from "./Subscription";

// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export default class PushSubscription {
    private _id?: string | null;
    private _token?: string | null;
    private _optedIn?: boolean;

    private _subscriptionObserverList: ((event:ChangeEvent<PushSubscriptionChange>)=>void)[] = [];

    private _processFunctionList<ObserverChangeEvent>(array: ((event:ChangeEvent<ObserverChangeEvent>)=>void)[], param: ChangeEvent<ObserverChangeEvent>): void {
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
        window.cordova.exec(getIdCallback, function(){}, "OneSignalPush", "getId");

        /**
         * Receive token
         * @param obj 
         */
        const getTokenCallback = (obj: {value: string}) => {
            this._token = obj.value;
        };
        window.cordova.exec(getTokenCallback, function(){}, "OneSignalPush", "getToken");
        
        /**
         * Receive opted-in status
         * @param obj 
         */
        const getOptedInCallback = (obj: {value: boolean}) => {
            this._optedIn = obj.value;
        };
        window.cordova.exec(getOptedInCallback, function(){}, "OneSignalPush", "getOptedIn");

        this.addObserver(event => {
            this._id = event.to.id;
            this._token = event.to.token;
            this._optedIn = event.to.optedIn;
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
     * The OSPushSubscriptionObserver.onOSPushSubscriptionChanged method will be fired on the passed-in object when the push subscription changes. 
     * This method returns the current OSPushSubscriptionState at the time of adding this observer.
     * @param  {(event:ChangeEvent<SubscriptionChange>)=>void} observer
     * @returns void
     */
    addObserver(observer: (event: ChangeEvent<PushSubscriptionChange>) => void): void {
        this._subscriptionObserverList.push(observer);
        const subscriptionCallBackProcessor = (state: ChangeEvent<PushSubscriptionChange>) => {
            this._processFunctionList(this._subscriptionObserverList, state);
        };
        window.cordova.exec(subscriptionCallBackProcessor, function(){}, "OneSignalPush", "addPushSubscriptionObserver", []);
    };

    /**
     * Remove a push subscription observer that has been previously added.
     * @returns void
     */
    removeObserver(): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removePushSubscriptionObserver", []);
    }
    
    /**
     * Call this method to receive push notifications on the device or to resume receiving of push notifications after calling optOut. If needed, this method will prompt the user for push notifications permission.
     * @returns void
     */
    optIn(): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "optIn");
    }

    /**
     * If at any point you want the user to stop receiving push notifications on the current device (regardless of system-level permission status), you can call this method to opt out.
     * @returns void
     */
    optOut(): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "optOut");
    }
}
