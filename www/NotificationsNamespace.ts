import { ClickedEvent } from "./models/NotificationOpened";
import OSNotificationWillDisplayEvent from "./NotificationReceivedEvent";
import OSNotification from './OSNotification';

// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export default class Notifications {
    private _permissionObserverList: ((event:boolean)=>void)[] = [];
    private _notificationClickedListeners = [function(notificationClicked: ClickedEvent) {}];
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
        window.cordova.exec(getPermissionCallback, function(){}, "OneSignalPush", "getPermission");

        this.addPermissionObserver(result => {
            this._permission = result;
        });
    }

    get permission(): boolean {
        return this._permission || false;
    }  

    /**
     * Add a callback that fires when the native push permission changes.
     * @param  {(event: boolean) => void} observer
     * @returns void
     */
    addPermissionObserver(observer: (event: boolean) => void): void {
        this._permissionObserverList.push(observer);
        const permissionCallBackProcessor = (state: boolean) => {
            this._processFunctionList(this._permissionObserverList, state);
        };

        window.cordova.exec(permissionCallBackProcessor, function(){}, "OneSignalPush", "addPermissionObserver", []);
    };

    /**
     * Remove a push permission observer that has been previously added.
     * @param  {(observer: (event: boolean) => void)} observer
     * @returns void
     */
    removePermissionObserver(observer: (event: boolean) => void): void {
        let index = this._permissionObserverList.indexOf(observer);
        if (index !== -1) {
            this._permissionObserverList.splice(index, 1);
        }
    };

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
            // Method was called like promptForPushNotificationsWithUserResponse(handler: function)
            handler = fallbackToSettingsOrHandler;
        }
        else if (typeof fallbackToSettingsOrHandler === "boolean") {
            // Method was called like promptForPushNotificationsWithUserResponse(fallbackToSettings: boolean, handler?: function)
            fallbackToSettings = fallbackToSettingsOrHandler;
        }
        // Else method was called like promptForPushNotificationsWithUserResponse(), no need to modify

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
     * Adds a listener that will run whenever a notification is clicked by the user.
     * @param  {(ClickedEvent:ClickedEvent) => void} listener
     * @returns void
     */
    addClickListener(listener: (ClickedEvent: ClickedEvent) => void): void {
        this._notificationClickedListeners.push(listener);

        const notificationClickedListener = (json: ClickedEvent) => {
            this._processFunctionList(this._notificationClickedListeners, json);
        };

        window.cordova.exec(notificationClickedListener, function(){}, "OneSignalPush", "addNotificationClickListener", []);
    };

    /**
     * Removes a listener that runs whenever a notification is clicked by the user.
     * @param  {(ClickedEvent:ClickedEvent) => void} listener
     * @returns void
     */
    removeClickListener(listener: (ClickedEvent: ClickedEvent) => void): void {
        let index = this._notificationClickedListeners.indexOf(listener);
        if (index !== -1) {
            this._notificationClickedListeners.splice(index, 1);
        }
    };

    /**
     * Add a listener to run before displaying a notification while the app is in focus. Use this listener to read notification data and change it or decide if the notification should show or not.
     * Note: this runs after the Notification Service Extension which can be used to modify the notification before showing it.
     * @param  {(event:OSNotificationWillDisplayEvent)=>void} listener
     * @returns void
     */
    addForegroundWillDisplayListener(listener: (event: OSNotificationWillDisplayEvent) => void): void {
        this._notificationWillDisplayListeners.push(listener);
        const foregroundParsingHandler = (notification: OSNotification) => {
            this._notificationWillDisplayListeners.forEach(listener => {
                listener(new OSNotificationWillDisplayEvent(notification));
            });
            window.cordova.exec(function(){}, function(){}, "OneSignalPush", "proceedWithWillDisplay", [notification.notificationId]);
        };

        window.cordova.exec(foregroundParsingHandler, function(){}, "OneSignalPush", "addForegroundLifecycleListener", []);
    };

    /**
     * Remove a listener that runs before displaying a notification while the app is in focus.
     * @param  {(event:OSNotificationWillDisplayEvent)=>void} listener
     * @returns void
     */
    removeForegroundWillDisplayListener(listener: (event: OSNotificationWillDisplayEvent) => void): void {
        let index = this._notificationWillDisplayListeners.indexOf(listener);
        if (index !== -1) {
            this._notificationWillDisplayListeners.splice(index, 1);
        }
    };

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
