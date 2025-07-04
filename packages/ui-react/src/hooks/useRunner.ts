import { useCallback, useEffect, useState } from 'react';
import type { Services } from '@application';
import type { Project, Workspace } from '@domain';

export interface RunnerHook {
  workspace: Workspace | null;
  loading: boolean;
  reload(): Promise<void>;
  start(project: Project): Promise<unknown>;
  stop(projectKey: string): Promise<unknown>;
  restart(project: Project): Promise<unknown>;
}

export function useRunner(services: Services): RunnerHook {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await services.workspace.load();
    if (result.ok) {
      setWorkspace(result.value);
    }
    setLoading(false);
  }, [services]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    workspace,
    loading,
    reload: load,
    start: (p) => services.runner.start(p),
    stop: (k) => services.runner.kill(k),
    restart: (p) => services.runner.restart(p),
  };
}
