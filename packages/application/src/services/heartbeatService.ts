import type { Result } from '@domain';

export type HeartbeatStatus = 'healthy' | 'unhealthy' | 'dead';
export type HeartbeatError = 'TIMEOUT' | 'UNKNOWN';

export interface HeartbeatService {
  getStatus(projectKey: string): Promise<Result<HeartbeatStatus, HeartbeatError>>;
}

export function createHeartbeatService(): HeartbeatService {
  const notImpl = () => {
    throw new Error('Not implemented – Phase 2');
  };

  return {
    getStatus: notImpl,
  };
}