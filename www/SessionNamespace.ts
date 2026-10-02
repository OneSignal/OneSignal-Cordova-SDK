import { isMissing, noop } from './helpers';

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
    if (isMissing(name, 'addOutcome: name')) return;
    window.cordova.exec(noop, noop, 'OneSignalPush', 'addOutcome', [name]);
  }

  /**
   * Add a unique outcome with the provided name, captured against the current session.
   * @param  {string} name
   * @returns void
   */
  addUniqueOutcome(name: string): void {
    if (isMissing(name, 'addUniqueOutcome: name')) return;
    window.cordova.exec(noop, noop, 'OneSignalPush', 'addUniqueOutcome', [name]);
  }

  /**
   * Add an outcome with the provided name and value, captured against the current session.
   * @param  {string} name
   * @param  {number} value
   * @returns void
   */
  addOutcomeWithValue(name: string, value: number): void {
    if (isMissing(name, 'addOutcomeWithValue: name')) return;
    // NaN and Infinity serialize to null across the bridge.
    if (!Number.isFinite(value)) {
      console.error('[OneSignal] addOutcomeWithValue: value must be a finite number');
      return;
    }
    window.cordova.exec(noop, noop, 'OneSignalPush', 'addOutcomeWithValue', [name, value]);
  }
}
