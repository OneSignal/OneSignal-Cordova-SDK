/**
 * Modified MIT License
 *
 * Copyright 2019 OneSignal
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * 1. The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * 2. All copies of substantial portions of the Software may only be used in connection
 * with services provided by OneSignal.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import User from "./UserNamespace";
import Debug from "./DebugNamespace";
import Session from "./SessionNamespace";
import Location from "./LocationNamespace";
import InAppMessages from "./InAppMessagesNamespace";
import Notifications from "./NotificationsNamespace";
import LiveActivities from "./LiveActivitiesNamespace";

// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export interface UserJwtInvalidatedEvent {
    externalId: string;
}

export class OneSignalPlugin {
    User: User = new User();
    Debug: Debug = new Debug();
    Session: Session = new Session();
    Location: Location = new Location();
    InAppMessages: InAppMessages = new InAppMessages();
    Notifications: Notifications = new Notifications();
    LiveActivities: LiveActivities = new LiveActivities();

    private _appID = "";

    private _userJwtInvalidatedEventListenerList: ((event:UserJwtInvalidatedEvent)=>void)[] = [];

    private _processFunctionList(array: ((event:any)=>void)[], param: any): void {
        for (let i = 0; i < array.length; i++) {
            array[i](param);
        }
    }

    /**
     * Initializes the OneSignal SDK. This should be called during startup of the application.
     * @param  {string} appId
     * @returns void
     */
    initialize(appId: string): void {
        this._appID = appId;

        const observerCallback = () => {
            this.User.pushSubscription._setPropertiesAndObserver();
            this.Notifications._setPropertyAndObserver();
        }

        window.cordova.exec(observerCallback, function(){}, "OneSignalPush", "init", [this._appID]);
    };

    /**
     * Log in to OneSignal under the user identified by the [externalId] provided. The act of logging a user into the OneSignal SDK will switch the [user] context to that specific user.
     * @param {string} externalId
     * @param {string} jwtToken - Optional
     * @returns void
     */
    login(externalId: string, jwtToken?: string): void {
        // if no jwt token, pass null
        const args = jwtToken ? [externalId, jwtToken] : [externalId];
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "login", args);
    }

    /**
     * Log out the user previously logged in via [login]. The [user] property now references a new device-scoped user.
     * @returns void
     */
    logout(): void {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "logout");
    }

    /**
     * Update the JWT token for a user.
     * @param {string} externalId 
     * @param {string} token 
     */
    updateUserJwt(externalId: string, token: string): void {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "updateUserJwt", [externalId, token]);
    }

    /**
     * Add a callback that fires when the user's JWT is invalidated.
     * @param event 
     * @param listener 
     */
    addEventListener(event: "userJwtInvalidated", listener: (event: UserJwtInvalidatedEvent) => void) {
        this._userJwtInvalidatedEventListenerList.push(listener as (event: UserJwtInvalidatedEvent) => void);
        const userJwtInvalidatedCallBackProcessor = (event: UserJwtInvalidatedEvent) => {
            this._processFunctionList(this._userJwtInvalidatedEventListenerList, event);
        };
        window.cordova.exec(userJwtInvalidatedCallBackProcessor, function(){}, "OneSignalPush", "addUserJwtInvalidatedListener", []);
    }

    /**
     * Remove a UserJwtInvalidated Listener that has been previously added.
     * @param event
     * @param listener 
     */
    removeEventListener(event: "userJwtInvalidated", listener: (event: UserJwtInvalidatedEvent) => void) {
        let index = this._userJwtInvalidatedEventListenerList.indexOf(listener);
        if (index !== -1) {
            this._userJwtInvalidatedEventListenerList.splice(index, 1);
        }
    }

   /**
     * Determines whether a user must consent to privacy prior to their user data being sent up to OneSignal. This should be set to true prior to the invocation of initialization to ensure compliance.
     * @param  {boolean} required
     * @returns void
     */
    setConsentRequired(required: boolean): void {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "setPrivacyConsentRequired", [required]);
    };

    /**
     * Indicates whether privacy consent has been granted. This field is only relevant when the application has opted into data privacy protections.
     * @param  {boolean} granted
     * @returns void
     */
    setConsentGiven(granted: boolean): void {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "setPrivacyConsentGiven", [granted]);
    };
}

//-------------------------------------------------------------------

const OneSignal = new OneSignalPlugin();

if (!window.plugins) {
    window.plugins = {};
}

if (!window.plugins.OneSignal) {
    window.plugins.OneSignal = OneSignal;
}

// Exporting

export { LogLevel } from "./DebugNamespace";
export { OSNotification } from './OSNotification';
export { OSNotificationPermission } from "./NotificationsNamespace";
export { NotificationWillDisplayEvent } from "./NotificationReceivedEvent";

export {
    PushSubscriptionState,
    PushSubscriptionChangedState
} from "./PushSubscriptionNamespace"

export {
    NotificationClickEvent,
    NotificationClickResult,
} from "./models/NotificationClicked";

export {
    OSInAppMessage,
    InAppMessageWillDisplayEvent,
    InAppMessageDidDisplayEvent,
    InAppMessageWillDismissEvent,
    InAppMessageDidDismissEvent,
    InAppMessageClickEvent,
    InAppMessageClickResult,
    InAppMessageActionUrlType,
} from "./models/InAppMessage";

export {
    UserState,
    UserChangedState,
} from "./UserNamespace";

export default OneSignal;
