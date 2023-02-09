import { OpenedEvent } from "./models/NotificationOpened";
import NotificationReceivedEvent from "./NotificationReceivedEvent";
import OSNotification from './OSNotification';

// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export default class Notifications {
    private _permissionObserverList: ((event:boolean)=>void)[] = [];
    private _notificationOpenedDelegate = function(notificationOpened: OpenedEvent) {};
    private _notificationWillShowInForegroundDelegate = function(notificationReceived: NotificationReceivedEvent) {};

    private _processFunctionList(array: ((event:boolean)=>void)[], param: boolean): void {
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
     * @param  {(event:ChangeEvent<PermissionChange>)=>void} observer
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
     * @param  {(event:ChangeEvent<PermissionChange>)=>void} observer
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
     * @param {(value: boolean) => void} handler
     * @returns void
     */
    canRequestPermission(handler: (value: boolean) => void): void {
        const canRequestPermissionCallback = (obj: {value: boolean}) => {
            handler(obj.value);
        };

        window.cordova.exec(canRequestPermissionCallback, function(){}, "OneSignalPush", "canRequestPermission", []);
    }

    /**
     * iOS Only
     */

    /**
     * Instead of having to prompt the user for permission to send them push notifications, your app can request provisional authorization.
     *
     * For more information: https://documentation.onesignal.com/docs/ios-customizations#provisional-push-notifications
     *
     * @param  {(response:{accepted:boolean})=>void} handler
     * @returns void
     */
    registerForProvisionalAuthorization(handler?: (response: { accepted: boolean }) => void): void {
        // TODO: Update the response in GA release to just boolean
        window.cordova.exec(handler, function(){}, "OneSignalPush", "registerForProvisionalAuthorization", []);
    };

    /**
     * Sets a handler that will run whenever a notification is opened by the user.
     * @param  {(openedEvent:OpenedEvent) => void} handler
     * @returns void
     */
    setNotificationOpenedHandler(handler: (openedEvent: OpenedEvent) => void): void {
        this._notificationOpenedDelegate = handler;

        const notificationOpenedHandler = (json: OpenedEvent) => {
            this._notificationOpenedDelegate(json);
        };

        window.cordova.exec(notificationOpenedHandler, function(){}, "OneSignalPush", "setNotificationOpenedHandler", []);
    };

    /**
     * Sets the handler to run before displaying a notification while the app is in focus. Use this handler to read notification data and change it or decide if the notification should show or not.
     * Note: this runs after the Notification Service Extension which can be used to modify the notification before showing it.
     * @param  {(event:NotificationReceivedEvent)=>void} handler
     * @returns void
     */
    setNotificationWillShowInForegroundHandler(handler: (event: NotificationReceivedEvent) => void): void {
        this._notificationWillShowInForegroundDelegate = handler;

        const foregroundParsingHandler = (notificationReceived: OSNotification) => {
            this._notificationWillShowInForegroundDelegate(new NotificationReceivedEvent(notificationReceived));
        };

        window.cordova.exec(foregroundParsingHandler, function(){}, "OneSignalPush", "setNotificationWillShowInForegroundHandler", []);
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
