export type LogLevel = 'D' | 'I' | 'W' | 'E';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
}

type LogListener = (entries: LogEntry[]) => void;

export default class LogManager {
  private static instance: LogManager | null = null;

  private entries: LogEntry[] = [];
  private listeners = new Set<LogListener>();

  static getInstance(): LogManager {
    if (!LogManager.instance) {
      LogManager.instance = new LogManager();
    }
    return LogManager.instance;
  }

  subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    listener(this.entries);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clear(): void {
    this.entries = [];
    this.emit();
  }

  d(tag: string, message: string): void {
    this.append('D', `[${tag}] ${message}`);
    console.log(`[D][${tag}] ${message}`);
  }

  i(tag: string, message: string): void {
    this.append('I', `[${tag}] ${message}`);
    console.log(`[I][${tag}] ${message}`);
  }

  w(tag: string, message: string): void {
    this.append('W', `[${tag}] ${message}`);
    console.warn(`[W][${tag}] ${message}`);
  }

  e(tag: string, message: string): void {
    this.append('E', `[${tag}] ${message}`);
    console.error(`[E][${tag}] ${message}`);
  }

  private append(level: LogLevel, message: string): void {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    this.entries = [{ timestamp, level, message }, ...this.entries].slice(0, 100);
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener(this.entries));
  }
}
