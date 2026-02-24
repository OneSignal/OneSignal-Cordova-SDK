import { noop, removeListener } from './helpers';
import type {
  InAppMessageClickEvent,
  InAppMessageDidDismissEvent,
  InAppMessageDidDisplayEvent,
  InAppMessageEventName,
  InAppMessageEventTypeMap,
  InAppMessageWillDismissEvent,
  InAppMessageWillDisplayEvent,
} from './types/InAppMessage';

export default class InAppMessages {
  private _inAppMessageClickListeners: ((
    action: InAppMessageClickEvent,
  ) => void)[] = [];
  private _willDisplayInAppMessageListeners: ((
    event: InAppMessageWillDisplayEvent,
  ) => void)[] = [];
  private _didDisplayInAppMessageListeners: ((
    event: InAppMessageDidDisplayEvent,
  ) => void)[] = [];
  private _willDismissInAppMessageListeners: ((
    event: InAppMessageWillDismissEvent,
  ) => void)[] = [];
  private _didDismissInAppMessageListeners: ((
    event: InAppMessageDidDismissEvent,
  ) => void)[] = [];

  // Track whether native handlers have been registered to avoid duplicate registrations
  private _clickHandlerRegistered = false;
  private _willDisplayHandlerRegistered = false;
  private _didDisplayHandlerRegistered = false;
  private _willDismissHandlerRegistered = false;
  private _didDismissHandlerRegistered = false;

  private _processFunctionList<T>(
    array: ((event: T) => void)[],
    param: T,
  ): void {
    for (let i = 0; i < array.length; i++) {
      array[i](param);
    }
  }

  /**
   * Add event listeners for In-App Message click and/or lifecycle events.
   * @param event
   * @param listener
   * @returns
   */
  addEventListener<K extends InAppMessageEventName>(
    event: K,
    listener: (event: InAppMessageEventTypeMap[K]) => void,
  ): void {
    if (event === 'click') {
      this._inAppMessageClickListeners.push(
        listener as (event: InAppMessageClickEvent) => void,
      );

      // Only register the native handler once
      if (!this._clickHandlerRegistered) {
        this._clickHandlerRegistered = true;
        const inAppMessageClickListener = (json: InAppMessageClickEvent) => {
          this._processFunctionList(this._inAppMessageClickListeners, json);
        };
        window.cordova.exec(
          inAppMessageClickListener,
          noop,
          'OneSignalPush',
          'setInAppMessageClickHandler',
          [],
        );
      }
    } else if (event === 'willDisplay') {
      this._willDisplayInAppMessageListeners.push(
        listener as (event: InAppMessageWillDisplayEvent) => void,
      );

      // Only register the native handler once
      if (!this._willDisplayHandlerRegistered) {
        this._willDisplayHandlerRegistered = true;
        const willDisplayCallBackProcessor = (
          event: InAppMessageWillDisplayEvent,
        ) => {
          this._processFunctionList(
            this._willDisplayInAppMessageListeners,
            event,
          );
        };
        window.cordova.exec(
          willDisplayCallBackProcessor,
          noop,
          'OneSignalPush',
          'setOnWillDisplayInAppMessageHandler',
          [],
        );
      }
    } else if (event === 'didDisplay') {
      this._didDisplayInAppMessageListeners.push(
        listener as (event: InAppMessageDidDisplayEvent) => void,
      );

      // Only register the native handler once
      if (!this._didDisplayHandlerRegistered) {
        this._didDisplayHandlerRegistered = true;
        const didDisplayCallBackProcessor = (
          event: InAppMessageDidDisplayEvent,
        ) => {
          this._processFunctionList(
            this._didDisplayInAppMessageListeners,
            event,
          );
        };
        window.cordova.exec(
          didDisplayCallBackProcessor,
          noop,
          'OneSignalPush',
          'setOnDidDisplayInAppMessageHandler',
          [],
        );
      }
    } else if (event === 'willDismiss') {
      this._willDismissInAppMessageListeners.push(
        listener as (event: InAppMessageWillDismissEvent) => void,
      );

      // Only register the native handler once
      if (!this._willDismissHandlerRegistered) {
        this._willDismissHandlerRegistered = true;
        const willDismissInAppMessageProcessor = (
          event: InAppMessageWillDismissEvent,
        ) => {
          this._processFunctionList(
            this._willDismissInAppMessageListeners,
            event,
          );
        };
        window.cordova.exec(
          willDismissInAppMessageProcessor,
          noop,
          'OneSignalPush',
          'setOnWillDismissInAppMessageHandler',
          [],
        );
      }
    } else if (event === 'didDismiss') {
      this._didDismissInAppMessageListeners.push(
        listener as (event: InAppMessageDidDismissEvent) => void,
      );

      // Only register the native handler once
      if (!this._didDismissHandlerRegistered) {
        this._didDismissHandlerRegistered = true;
        const didDismissInAppMessageCallBackProcessor = (
          event: InAppMessageDidDismissEvent,
        ) => {
          this._processFunctionList(
            this._didDismissInAppMessageListeners,
            event,
          );
        };
        window.cordova.exec(
          didDismissInAppMessageCallBackProcessor,
          noop,
          'OneSignalPush',
          'setOnDidDismissInAppMessageHandler',
          [],
        );
      }
    }
  }

  /**
   * Remove event listeners for In-App Message click and/or lifecycle events.
   * @param event
   * @param listener
   * @returns
   */
  removeEventListener<K extends InAppMessageEventName>(
    event: K,
    listener: (obj: InAppMessageEventTypeMap[K]) => void,
  ): void {
    if (event === 'click') {
      removeListener(this._inAppMessageClickListeners, listener);
    } else if (event === 'willDisplay') {
      removeListener(this._willDisplayInAppMessageListeners, listener);
    } else if (event === 'didDisplay') {
      removeListener(this._didDisplayInAppMessageListeners, listener);
    } else if (event === 'willDismiss') {
      removeListener(this._willDismissInAppMessageListeners, listener);
    } else if (event === 'didDismiss') {
      removeListener(this._didDismissInAppMessageListeners, listener);
    }
  }

  /**
   * Add a trigger for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be displayed to the user.
   * @param  {string} key
   * @param  {string} value
   * @returns void
   */
  addTrigger(key: string, value: string): void {
    const obj = { [key]: value };
    this.addTriggers(obj);
  }

  /**
   * Add multiple triggers for the current user. Triggers are currently explicitly used to determine whether a specific IAM should be displayed to the user.
   * @param  {[key: string]: string} triggers
   * @returns void
   */

  addTriggers(triggers: { [key: string]: string }): void {
    Object.keys(triggers).forEach(function (key) {
      // forces values to be string types
      if (typeof triggers[key] !== 'string') {
        triggers[key] = JSON.stringify(triggers[key]);
      }
    });

    window.cordova.exec(noop, noop, 'OneSignalPush', 'addTriggers', [triggers]);
  }

  /**
   * Remove the trigger with the provided key from the current user.
   * @param  {string} key
   * @returns void
   */
  removeTrigger(key: string): void {
    this.removeTriggers([key]);
  }

  /**
   * Remove multiple triggers from the current user.
   * @param  {string[]} keys
   * @returns void
   */
  removeTriggers(keys: string[]): void {
    if (!Array.isArray(keys)) {
      console.error(
        'OneSignal: removeTriggers: argument must be of type Array',
      );
    }

    window.cordova.exec(noop, noop, 'OneSignalPush', 'removeTriggers', [keys]);
  }

  /**
   * Clear all triggers from the current user.
   * @returns void
   */
  clearTriggers(): void {
    window.cordova.exec(noop, noop, 'OneSignalPush', 'clearTriggers');
  }

  /**
   * Set whether in-app messaging is currently paused.
   * When set to true no IAM will be presented to the user regardless of whether they qualify for them.
   * When set to 'false` any IAMs the user qualifies for will be presented to the user at the appropriate time.
   * @param  {boolean} pause
   * @returns void
   */
  setPaused(pause: boolean): void {
    window.cordova.exec(noop, noop, 'OneSignalPush', 'setPaused', [pause]);
  }

  /**
   * Whether in-app messaging is currently paused.
   * @returns {Promise<boolean>}
   */
  getPaused(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      window.cordova.exec(resolve, reject, 'OneSignalPush', 'isPaused', []);
    });
  }
}
