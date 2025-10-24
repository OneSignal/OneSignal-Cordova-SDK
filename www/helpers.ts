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
