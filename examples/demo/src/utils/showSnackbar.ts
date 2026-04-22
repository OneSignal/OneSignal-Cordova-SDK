type SnackbarListener = (message: string) => void;

const listeners = new Set<SnackbarListener>();

export function subscribeSnackbar(listener: SnackbarListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function showSnackbar(message: string): void {
  listeners.forEach((listener) => listener(message));
}
