
import { OutcomeEvent } from "./models/Outcomes";

// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export default class Session {
    /**
     * Outcomes
     */
    
    /**
     * Add an outcome with the provided name, captured against the current session.
     * @param  {string} name
     * @param  {(event:OutcomeEvent)=>void} handler
     * @returns void
     */
    addOutcome(name: string, handler?: (event: OutcomeEvent) => void): void {
        const sendOutcomeCallback = (result: OutcomeEvent) => {
            if (handler) {
                handler(result);
            }
        };

        window.cordova.exec(sendOutcomeCallback, function() {}, "OneSignalPush", "addOutcome", [name]);
    };

    /**
     * Add a unique outcome with the provided name, captured against the current session.
     * @param  {string} name
     * @param  {(event:OutcomeEvent)=>void} handler
     * @returns void
     */
    addUniqueOutcome(name: string, handler?: (event: OutcomeEvent) => void): void {
        const sendUniqueOutcomeCallback = (result: OutcomeEvent) => {
            if (handler) {
                handler(result);
            }
        };

        window.cordova.exec(sendUniqueOutcomeCallback, function() {}, "OneSignalPush", "addUniqueOutcome", [name]);
    };

    /**
     * Add an outcome with the provided name and value, captured against the current session.
     * @param  {string} name
     * @param  {string|number} value
     * @param  {(event:OutcomeEvent)=>void} handler
     * @returns void
     */
    addOutcomeWithValue(name: string, value: string|number, handler?: (event: OutcomeEvent) => void): void {
        if (typeof handler === "undefined") {
            handler = function() {};
        }

        if (typeof handler !== "function") {
            console.error("OneSignal: addOutcomeWithValue: must provide a valid callback");
            return;
        }

        const sendOutcomeWithValueCallback = (result: OutcomeEvent) => {
            if (handler) {
                handler(result);
            }
        };

        window.cordova.exec(sendOutcomeWithValueCallback, function() {}, "OneSignalPush", "addOutcomeWithValue", [name, Number(value)]);
    };
}
