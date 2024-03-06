import { NotificationWillDisplayEvent } from "./NotificationReceivedEvent";
import { OSNotification } from './OSNotification';
import { NotificationEventName,
    NotificationEventTypeMap,
    NotificationClickEvent,
 } from "./models/NotificationClicked";

// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export enum OSNotificationPermission {
    NotDetermined = 0,
    Denied,
    Authorized,
    Provisional, // only available in iOS 12
    Ephemeral, // only available in iOS 14
}

export default class Notifications {
    private _permissionObserverList: ((event:boolean)=>void)[] = [];
    private _notificationClickedListeners: ((event: NotificationClickEvent) => void)[] = [];
    private _notificationWillDisplayListeners: ((event: NotificationWillDisplayEvent) => void)[] = [];

    private _processFunctionList(array: ((event:any)=>void)[], param: any): void {
        for (let i = 0; i < array.length; i++) {
            array[i](param);
        }
    }

    private _permission?: boolean;

    /**
     * Sets initial permission value and adds observer for changes.
     * This internal method is kept to support the deprecated method {@link hasPermission}.
     */
    _setPropertyAndObserver():void {
        const getPermissionCallback = (granted: boolean) => {
            this._permission = granted;
        };
        window.cordova.exec(getPermissionCallback, function(){}, "OneSignalPush", "getPermissionInternal");

        this.addEventListener("permissionChange", result => {
            this._permission = result;
        });
    }

    /**
     * @deprecated This method is deprecated. It has been replaced by {@link getPermissionAsync}.
     */
    hasPermission(): boolean {
        return this._permission || false;
    }

    /**
     * Whether this app has push notification permission. Returns true if the user has accepted permissions,
     * or if the app has ephemeral or provisional permission.
     */
    async getPermissionAsync(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            window.cordova.exec(resolve, reject, "OneSignalPush", "getPermissionInternal");       
        });
    }

    /** iOS Only.
     * Returns the enum for the native permission of the device. It will be one of:
     * OSNotificationPermissionNotDetermined,
     * OSNotificationPermissionDenied,
     * OSNotificationPermissionAuthorized,
     * OSNotificationPermissionProvisional - only available in iOS 12,
     * OSNotificationPermissionEphemeral - only available in iOS 14
     *
     * @returns {Promise<OSNotificationPermission>}
     *
     * */
    permissionNative(): Promise<OSNotificationPermission> {
        return new Promise<OSNotificationPermission>((resolve, reject) => {
            window.cordova.exec(resolve, reject, "OneSignalPush", "permissionNative", []);
        });
    }

    /**
     * Prompt the user for permission to receive push notifications. This will display the native system prompt to request push notification permission.
     * Use the fallbackToSettings parameter to prompt to open the settings app if a user has already declined push permissions.
     *
     *
     * @param  {boolean} fallbackToSettings
     * @returns {Promise<boolean>}
     */
    requestPermission(fallbackToSettings?: boolean): Promise<boolean> {
        let fallback = fallbackToSettings ?? false;

        return new Promise<boolean>((resolve, reject) => {
            window.cordova.exec(resolve, reject, "OneSignalPush", "requestPermission", [fallback]);
        });
    };

    /**
     * Whether attempting to request notification permission will show a prompt. Returns true if the device has not been prompted for push notification permission already.
     * @returns {Promise<boolean>}
     */
    canRequestPermission(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            window.cordova.exec(resolve, reject, "OneSignalPush", "canRequestPermission", []);
        });
    };

    /**
     * iOS Only
     */

    /**
     * Instead of having to prompt the user for permission to send them push notifications, your app can request provisional authorization.
     *
     * For more information: https://documentation.onesignal.com/docs/ios-customizations#provisional-push-notifications
     *
     * @param  {(response: boolean)=>void} handler
     * @returns void
     */
    registerForProvisionalAuthorization(handler?: (response: boolean) => void): void {
        window.cordova.exec(handler, function(){}, "OneSignalPush", "registerForProvisionalAuthorization", []);
    };

    /**
     * Add listeners for notification events.
     * @param event 
     * @param listener 
     * @returns 
     */
    addEventListener<K extends NotificationEventName>(event: K, listener: (event: NotificationEventTypeMap[K]) => void): void {
        if (event === "click") {
            this._notificationClickedListeners.push(listener as (event: NotificationClickEvent) => void);
            const clickParsingHandler = (json: NotificationClickEvent) => {
                this._processFunctionList(this._notificationClickedListeners, json);
            };
            window.cordova.exec(clickParsingHandler, function(){}, "OneSignalPush", "addNotificationClickListener", []);
        } else if (event === "foregroundWillDisplay") {
            this._notificationWillDisplayListeners.push(listener as (event: NotificationWillDisplayEvent) => void);
            const foregroundParsingHandler = (notification: OSNotification) => {
                this._notificationWillDisplayListeners.forEach(listener => {
                    listener(new NotificationWillDisplayEvent(notification));
                });
                window.cordova.exec(function(){}, function(){}, "OneSignalPush", "proceedWithWillDisplay", [notification.notificationId]);
            };
            window.cordova.exec(foregroundParsingHandler, function(){}, "OneSignalPush", "addForegroundLifecycleListener", []);
        } else if (event === "permissionChange") {
            this._permissionObserverList.push(listener as (event: boolean) => void);
            const permissionCallBackProcessor = (state: boolean) => {
                this._processFunctionList(this._permissionObserverList, state);
            };
            window.cordova.exec(permissionCallBackProcessor, function(){}, "OneSignalPush", "addPermissionObserver", []);
        }
        else {
            return;
        }
    }
    
    /**
     * Remove listeners for notification events.
     * @param event 
     * @param listener 
     * @returns 
     */
    removeEventListener<K extends NotificationEventName>(event: K, listener: (obj: NotificationEventTypeMap[K]) => void): void {
        if (event === "click") {
            let index = this._notificationClickedListeners.indexOf(listener as (event: NotificationClickEvent) => void);
            if (index !== -1) {
                this._notificationClickedListeners.splice(index, 1);
            }
        } else if (event === "foregroundWillDisplay") {
            let index = this._notificationWillDisplayListeners.indexOf(listener as (event: NotificationWillDisplayEvent) => void);
            if (index !== -1) {
                this._notificationWillDisplayListeners.splice(index, 1);
            }
        } else if (event === "permissionChange") {
            let index = this._permissionObserverList.indexOf(listener as (event: boolean) => void);
            if (index !== -1) {
                this._permissionObserverList.splice(index, 1);
            }
        }
        else {
            return;
        }
    }

    /**
     * Removes all OneSignal notifications.
     * @returns void
     */
    clearAll(): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "clearAllNotifications", []);
    };

    /**
     * Android Only 
     */
    
    /**
     * Android only.
     * Cancels a single OneSignal notification based on its Android notification integer ID. Use instead of Android's [android.app.NotificationManager.cancel], otherwise the notification will be restored when your app is restarted.
     * @param  {number} id - notification id to cancel
     * @returns void
     */
    removeNotification(id: number): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeNotification", [id]);
    };

    /**
     * Android only.
     * Cancels a group of OneSignal notifications with the provided group key. Grouping notifications is a OneSignal concept, there is no [android.app.NotificationManager] equivalent.
     * @param  {string} id - notification group id to cancel
     * @returns void
     */
    removeGroupedNotifications(id: string): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeGroupedNotifications", [id]);
    };
}
