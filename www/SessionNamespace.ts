// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export default class Session {
    /**
     * Outcomes
     */
    
    /**
     * Add an outcome with the provided name, captured against the current session.
     * @param  {string} name
     * @returns void
     */
    addOutcome(name: string): void {
        window.cordova.exec(function(){}, function() {}, "OneSignalPush", "addOutcome", [name]);
    };

    /**
     * Add a unique outcome with the provided name, captured against the current session.
     * @param  {string} name
     * @returns void
     */
    addUniqueOutcome(name: string): void {
        window.cordova.exec(function(){}, function() {}, "OneSignalPush", "addUniqueOutcome", [name]);
    };

    /**
     * Add an outcome with the provided name and value, captured against the current session.
     * @param  {string} name
     * @param  {number} value
     * @returns void
     */
    addOutcomeWithValue(name: string, value: number): void {
        window.cordova.exec(function(){}, function() {}, "OneSignalPush", "addOutcomeWithValue", [name, value]);
    };
}
