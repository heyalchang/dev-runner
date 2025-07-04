import type { Result } from '@domain';
import { ok } from '@domain';
import type { InfrastructureDeps } from '../createServices';

export type HeartbeatStatus = 'healthy' | 'unhealthy' | 'dead';
export type HeartbeatError = 'TIMEOUT' | 'UNKNOWN';

export interface HeartbeatService {
  getStatus(projectKey: string): Promise<Result<HeartbeatStatus, HeartbeatError>>;
}

export function createHeartbeatService(
  deps: Pick<InfrastructureDeps, 'heartbeat'>
): HeartbeatService {
  const getStatus = async (
    _projectKey: string
  ): Promise<Result<HeartbeatStatus, HeartbeatError>> => {
    const okTcp = await deps.heartbeat.tcp(0);
    return ok(okTcp ? 'healthy' : 'dead');
  };

  return { getStatus };
}
