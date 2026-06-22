import { IonToast } from '@ionic/react';
import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

const TOAST_DURATION_MS = 3000;

type ToastState = { id: number; message: string } | null;
type ShowSnackbar = (message: string) => void;

const ToastContext = createContext<ShowSnackbar | null>(null);

let nextId = 0;

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>(null);

  const showSnackbar = useCallback<ShowSnackbar>((message) => {
    // Clear current toast and queue the new one so IonToast remounts cleanly
    // and the 3s timer restarts on the replacement.
    setToast(null);
    queueMicrotask(() => {
      nextId += 1;
      setToast({ id: nextId, message });
    });
  }, []);

  return (
    <ToastContext.Provider value={showSnackbar}>
      {children}
      {toast && (
        <IonToast
          key={toast.id}
          isOpen
          message={toast.message}
          duration={TOAST_DURATION_MS}
          onDidDismiss={() => setToast((curr) => (curr?.id === toast.id ? null : curr))}
          data-testid="snackbar_toast"
        />
      )}
    </ToastContext.Provider>
  );
};

export function useSnackbar(): ShowSnackbar {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useSnackbar must be used within ToastProvider');
  }
  return ctx;
}
