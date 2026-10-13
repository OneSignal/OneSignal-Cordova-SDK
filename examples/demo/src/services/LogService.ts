import { useSyncExternalStore } from 'react';

export type LogEntry = { id: number; time: string; message: string };

const MAX_ENTRIES = 100;

let entries: LogEntry[] = [];
let nextId = 0;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

/** Write to the on-screen log view and the console. Kept in memory only, so each launch starts empty. */
export function log(message: string): void {
  console.log(`[OneSignal] ${message}`);
  const time = new Date().toLocaleTimeString([], { hour12: false });
  entries = [...entries, { id: nextId++, time, message }].slice(-MAX_ENTRIES);
  emit();
}

export function clearLogs(): void {
  entries = [];
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLogs(): LogEntry[] {
  return useSyncExternalStore(subscribe, () => entries);
}
