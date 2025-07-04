import type { Result } from '@domain';

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
  const notImpl = () => {
    throw new Error('Not implemented – Phase 2');
  };

  return {
    tail: notImpl,
    openInTerminal: notImpl,
  };
}