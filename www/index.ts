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

export class OneSignalPlugin {
    User: User = new User();
    Debug: Debug = new Debug();
    Session: Session = new Session();
    Location: Location = new Location();
    InAppMessages: InAppMessages = new InAppMessages();
    Notifications: Notifications = new Notifications();
    LiveActivities: LiveActivities = new LiveActivities();

    private _appID = "";

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
     * Login to OneSignal under the user identified by the [externalId] provided. The act of logging a user into the OneSignal SDK will switch the [user] context to that specific user.
     * @param  {string} externalId
     * @returns void
     */
    login(externalId: string): void {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "login", [externalId]);
    }

    /**
     * Logout the user previously logged in via [login]. The [user] property now references a new device-scoped user.
     * @param  {string} externalId
     * @returns void
     */
    logout(): void {
        window.cordova.exec(function () { }, function () { }, "OneSignalPush", "logout");
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
