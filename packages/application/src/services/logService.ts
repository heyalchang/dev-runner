import type { Result } from '@domain';
import { ok } from '@domain';

export interface LogEntry {
  timestamp: number;
  level: 'stdout' | 'stderr';
  message: string;
}

export type LogError = 'FILE_ERROR' | 'UNKNOWN';

export interface LogService {
  tail(projectKey: string, lines?: number): Promise<Result<LogEntry[], LogError>>;
  openInTerminal(projectKey: string): Promise<Result<void, LogError>>;
}

export function createLogService(): LogService {
  const logs = new Map<string, LogEntry[]>();

  const tail = async (projectKey: string, lines = 10): Promise<Result<LogEntry[], LogError>> => {
    const arr = logs.get(projectKey) ?? [];
    return ok(arr.slice(-lines));
  };

  const openInTerminal = async (_projectKey: string): Promise<Result<void, LogError>> => {
    return ok(undefined);
  };

  return { tail, openInTerminal };
}
