import type { Result, Project, PortNumber } from '@domain';
import { ok, err } from '@domain';
import type { InfrastructureDeps } from '../createServices';
import { publish } from '../eventBus';

export type RunnerError = 'PORT_IN_USE' | 'SPAWN_FAILED' | 'NOT_RUNNING' | 'UNKNOWN';

export interface RunnerService {
  start(project: Project): Promise<Result<PortNumber, RunnerError>>;
  kill(projectKey: string): Promise<Result<void, RunnerError>>;
  restart(project: Project): Promise<Result<PortNumber, RunnerError>>;
  status(
    projectKey: string
  ): Promise<Result<'starting' | 'running' | 'stopped' | 'unhealthy', RunnerError>>;
}

export function createRunnerService(
  deps: Pick<InfrastructureDeps, 'processSpawner' | 'portDetector' | 'logger'>
): RunnerService {
  const procs = new Map<string, { pid: number; port: PortNumber }>();

  const start = async (project: Project): Promise<Result<PortNumber, RunnerError>> => {
    try {
      const port = (await deps.portDetector.findFree(project.preferredPort)) as PortNumber;
      const env = { ...(project.env ?? {}), PORT: String(port) };
      const { pid } = await deps.processSpawner.spawn(project.cmd, '.', env);
      const key = project.name ?? String(pid);
      procs.set(key, { pid, port });
      publish({ type: 'runner.started', projectKey: key, port });
      return ok(port);
    } catch (e) {
      deps.logger.error('runner start failed', e);
      return err('SPAWN_FAILED');
    }
  };

  const kill = async (projectKey: string): Promise<Result<void, RunnerError>> => {
    const proc = procs.get(projectKey);
    if (!proc) return err('NOT_RUNNING');
    try {
      await deps.processSpawner.kill(proc.pid);
      procs.delete(projectKey);
      publish({ type: 'runner.stopped', projectKey });
      return ok(undefined);
    } catch (e) {
      deps.logger.error('runner kill failed', e);
      return err('UNKNOWN');
    }
  };

  const restart = async (project: Project): Promise<Result<PortNumber, RunnerError>> => {
    await kill(project.name ?? '');
    return start(project);
  };

  const status = async (
    projectKey: string
  ): Promise<Result<'starting' | 'running' | 'stopped' | 'unhealthy', RunnerError>> => {
    return ok(procs.has(projectKey) ? 'running' : 'stopped');
  };

  return { start, kill, restart, status };
}
