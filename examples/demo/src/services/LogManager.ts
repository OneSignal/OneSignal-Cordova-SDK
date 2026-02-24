export type LogLevel = 'D' | 'I' | 'W' | 'E';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
}

type LogListener = (entry: LogEntry | null) => void;

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

  getEntries(): LogEntry[] {
    return this.entries;
  }

  subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clear(): void {
    this.entries = [];
    this.emit(null);
  }

  d(tag: string, message: string): void {
    this.append('D', tag, message);
    console.log(`[D][${tag}] ${message}`);
  }

  i(tag: string, message: string): void {
    this.append('I', tag, message);
    console.log(`[I][${tag}] ${message}`);
  }

  w(tag: string, message: string): void {
    this.append('W', tag, message);
    console.warn(`[W][${tag}] ${message}`);
  }

  e(tag: string, message: string): void {
    this.append('E', tag, message);
    console.error(`[E][${tag}] ${message}`);
  }

  private append(level: LogLevel, tag: string, message: string): void {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const entry: LogEntry = { timestamp, level, tag, message };
    this.entries.unshift(entry);
    if (this.entries.length > 100) {
      this.entries.length = 100;
    }
    this.emit(entry);
  }

  private emit(entry: LogEntry | null): void {
    this.listeners.forEach((listener) => listener(entry));
  }
}
