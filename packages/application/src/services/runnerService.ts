import type { Result, Project, PortNumber } from '@domain';

export type RunnerError =
  | 'PORT_IN_USE'
  | 'SPAWN_FAILED'
  | 'NOT_RUNNING'
  | 'UNKNOWN';

export interface RunnerService {
  start(project: Project): Promise<Result<PortNumber, RunnerError>>;
  kill(projectKey: string): Promise<Result<void, RunnerError>>;
  restart(project: Project): Promise<Result<PortNumber, RunnerError>>;
  status(projectKey: string): Promise<Result<'starting' | 'running' | 'stopped' | 'unhealthy', RunnerError>>;
}

export function createRunnerService(): RunnerService {
  const notImpl = () => {
    throw new Error('Not implemented – Phase 2');
  };

  return {
    start: notImpl,
    kill: notImpl,
    restart: notImpl,
    status: notImpl,
  };
}