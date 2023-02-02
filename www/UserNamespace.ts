import PushSubscription from "./PushSubscriptionNamespace";

// Suppress TS warnings about window.cordova
declare let window: any; // turn off type checking

export default class User {
    // The push subscription associated to the current user.
    pushSubscription: PushSubscription = new PushSubscription();

    /**
     * Explicitly set a 2-character language code for the user.
     * @param  {string} language
     * @returns void
     */
    setLanguage(language: string): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "setLanguage", [language]);
    };

    /**
     * Aliases
     */

    /**
     * Set an alias for the current user. If this alias label already exists on this user, it will be overwritten with the new alias id.
     * @param  {string} label
     * @param  {string} id
     * @returns void
     */
    addAlias(label: string, id: string): void {
        const jsonKeyValue = {[label]: id};
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "addAliases", [jsonKeyValue]);
    };

    /**
     * Set aliases for the current user. If any alias already exists, it will be overwritten to the new values.
     * @param {object} aliases
     * @returns void
     */
    addAliases(aliases: object): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "addAliases", [aliases]);
    };

    /**
     * Remove an alias from the current user.
     * @param  {string} label
     * @returns void
     */
    removeAlias(label: string): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeAliases", [label]);
    };

    /**
     * Remove aliases from the current user.
     * @param  {string[]} labels
     * @returns void
     */
    removeAliases(labels: string[]): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeAliases", labels);
    };

    /**
     * Email
     */

    /**
     * Add a new email subscription to the current user.
     * @param  {string} email
     * @returns void
     */
    addEmail(email: string): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "addEmail", [email]);
    };

    /**
     * Remove an email subscription from the current user. Returns false if the specified email does not exist on the user within the SDK, and no request will be made.
     * @param {string} email
     * @returns void
     */
    removeEmail(email: string): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeEmail", [email]);
    };

    /**
     * SMS
     */

    /**
     * Add a new SMS subscription to the current user.
     * @param  {string} smsNumber
     * @returns void
     */
    addSms(smsNumber: string): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "addSms", [smsNumber]);        
    };

    /**
     * Remove an SMS subscription from the current user. Returns false if the specified SMS number does not exist on the user within the SDK, and no request will be made.
     * @param {string} smsNumber
     * @returns void
     */
    removeSms(smsNumber: string): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeSms", [smsNumber]);
    };

    /**
     * Tags
     */

    /**
     * Add a tag for the current user. Tags are key:value pairs used as building blocks for targeting specific users and/or personalizing messages. If the tag key already exists, it will be replaced with the value provided here.
     * @param  {string} key
     * @param  {string} value
     * @returns void
     */
    addTag(key: string, value: string): void {
        const jsonKeyValue = {[key]: value};
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "addTags", [jsonKeyValue]);
    };

    /**
     * Add multiple tags for the current user. Tags are key:value pairs used as building blocks for targeting specific users and/or personalizing messages. If the tag key already exists, it will be replaced with the value provided here.
     * @param  {object} tags
     * @returns void
     */
    addTags(tags: object): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "addTags", [tags]);
    };

    /**
     * Remove the data tag with the provided key from the current user.
     * @param  {string} key
     * @returns void
     */
    removeTag(key: string): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeTags", [key]);
    };

    /**
     * Remove multiple tags with the provided keys from the current user.
     * @param  {string[]} keys
     * @returns void
     */
    removeTags(keys: string[]): void {
        window.cordova.exec(function(){}, function(){}, "OneSignalPush", "removeTags", keys);
    };
}
