/**
 * Removes a listener from an array of listeners.
 * @param array The array of listeners
 * @param listener The listener to remove
 */
export function removeListener<T>(
  array: ((event: T) => void)[],
  listener: (event: T) => void,
): void {
  const index = array.indexOf(listener);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

/** No-op function for cordova.exec error/success callbacks */
export const noop = () => {};

/**
 * Returns true if the value is a JSON-serializable object.
 */
export function isObjectSerializable(value: unknown): boolean {
  if (!(typeof value === 'object' && value !== null && !Array.isArray(value))) {
    return false;
  }
  try {
    JSON.stringify(value);
    return true;
  } catch {
    return false;
  }
}
