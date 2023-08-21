import OSNotificationWillDisplayEvent from "./NotificationReceivedEvent";
import OSNotification from './OSNotification';
import { NotificationEventName,
    NotificationEventTypeMap,
    ClickedEvent 
 } from "./models/NotificationClicked";

// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export default class Notifications {
    private _permissionObserverList: ((event:boolean)=>void)[] = [];
    private _notificationClickedListeners: ((action: ClickedEvent) => void)[] = [];
    private _notificationWillDisplayListeners: ((notification: OSNotificationWillDisplayEvent) => void)[] = [];

    private _processFunctionList(array: ((event:any)=>void)[], param: any): void {
        for (let i = 0; i < array.length; i++) {
            array[i](param);
        }
    }

    private _permission?: boolean;

    /**
     * Sets initial permission value and adds observer for changes
     */
    _setPropertyAndObserver():void {
        const getPermissionCallback = (obj: {value: boolean}) => {
            this._permission = obj.value;
        };
        window.cordova.exec(getPermissionCallback, function(){}, "OneSignalPush", "getPermissionInternal");

        this.addEventListener("permissionChange", result => {
            this._permission = result;
        });
    }

    get permission(): boolean {
        return this._permission || false;
    }

    /**
     * Prompt the user for permission to receive push notifications. This will display the native system prompt to request push notification permission.
     * Use the fallbackToSettings parameter to prompt to open the settings app if a user has already declined push permissions.
     *
     * Call with requestPermission(fallbackToSettings?, handler?)
     *
     * @param  {boolean} fallbackToSettings
     * @param  {(response:boolean)=>void} handler
     * @returns void
     */
    requestPermission(fallbackToSettingsOrHandler?: boolean | ((response: boolean) => void), handler?: (response: boolean) => void): void {
        var fallbackToSettings = false;

        if (typeof fallbackToSettingsOrHandler === "function") {
            // Method was called like requestPermission(handler: function)
            handler = fallbackToSettingsOrHandler;
        }
        else if (typeof fallbackToSettingsOrHandler === "boolean") {
            // Method was called like requestPermission(fallbackToSettings: boolean, handler?: function)
            fallbackToSettings = fallbackToSettingsOrHandler;
        }
        // Else method was called like requestPermission(), no need to modify

        const internalCallback = (response: boolean) => {
            if (handler) {
                handler(response);
            }
        };
        window.cordova.exec(internalCallback, function(){}, "OneSignalPush", "requestPermission", [fallbackToSettings]);
    };

    /**
     * Whether attempting to request notification permission will show a prompt. Returns true if the device has not been prompted for push notification permission already.
     * @param {(value: boolean) => void} handler
     * @returns void
     */
    canRequestPermission(handler: (value: boolean) => void): void {
        const canRequestPermissionCallback = (obj: {value: boolean}) => {
            handler(obj.value);
        };

        window.cordova.exec(canRequestPermissionCallback, function(){}, "OneSignalPush", "canRequestPermission", []);
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
            this._notificationClickedListeners.push(listener as (event: ClickedEvent) => void);
            const clickParsingHandler = (json: ClickedEvent) => {
                this._processFunctionList(this._notificationClickedListeners, json);
            };
            window.cordova.exec(clickParsingHandler, function(){}, "OneSignalPush", "addNotificationClickListener", []);
        } else if (event === "foregroundWillDisplay") {
            this._notificationWillDisplayListeners.push(listener as (event: OSNotificationWillDisplayEvent) => void);
            const foregroundParsingHandler = (notification: OSNotification) => {
                this._notificationWillDisplayListeners.forEach(listener => {
                    listener(new OSNotificationWillDisplayEvent(notification));
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
            let index = this._notificationClickedListeners.indexOf(listener as (ClickedEvent: ClickedEvent) => void);
            if (index !== -1) {
                this._notificationClickedListeners.splice(index, 1);
            }
        } else if (event === "foregroundWillDisplay") {
            let index = this._notificationWillDisplayListeners.indexOf(listener as (event: OSNotificationWillDisplayEvent) => void);
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
     * Cancels a single OneSignal notification based on its Android notification integer ID. Use instead of Android's [android.app.NotificationManager.cancel], otherwise the notification will be restored when your app is restarted.
     * @param  {number} id - notification id to cancel
     * @returns void
     */
    removeNotification(id: number): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeNotification", [id]);
    };

    /**
     * Cancels a group of OneSignal notifications with the provided group key. Grouping notifications is a OneSignal concept, there is no [android.app.NotificationManager] equivalent.
     * @param  {string} id - notification group id to cancel
     * @returns void
     */
    removeGroupedNotifications(id: string): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeGroupedNotifications", [id]);
    };
}
