import type { Result, Workspace } from '@domain';
import { err, ok } from '@domain';
import type { InfrastructureDeps } from '../createServices';
import { publish } from '../eventBus';

export type WorkspaceError = 'IO_ERROR' | 'SCHEMA_INVALID' | 'UNKNOWN';

export interface WorkspaceService {
  load(): Promise<Result<Workspace, WorkspaceError>>;
  save(workspace: Workspace): Promise<Result<void, WorkspaceError>>;
  addEntry(path: string): Promise<Result<Workspace, WorkspaceError>>;
  removeEntry(path: string): Promise<Result<Workspace, WorkspaceError>>;
}

export function createWorkspaceService(
  deps: Pick<InfrastructureDeps, 'jsonStore' | 'logger'>
): WorkspaceService {
  let cache: Workspace | null = null;

  const load = async (): Promise<Result<Workspace, WorkspaceError>> => {
    try {
      if (cache) return ok(cache);
      const data = await deps.jsonStore.read<Workspace>('workspace.json');
      if (data === null) {
        cache = { version: 1, entries: [] };
        return ok(cache);
      }
      cache = data;
      return ok(cache);
    } catch (e) {
      deps.logger.error('workspace load failed', e);
      return err('IO_ERROR');
    }
  };

  const save = async (ws: Workspace): Promise<Result<void, WorkspaceError>> => {
    try {
      await deps.jsonStore.write('workspace.json', ws);
      cache = ws;
      publish({ type: 'workspace.saved' });
      return ok(undefined);
    } catch (e) {
      deps.logger.error('workspace save failed', e);
      return err('IO_ERROR');
    }
  };

  const addEntry = async (path: string): Promise<Result<Workspace, WorkspaceError>> => {
    const res = await load();
    if (!res.ok) return res;
    const ws = res.value;
    if (!ws.entries.includes(path)) ws.entries.push(path);
    const saveRes = await save(ws);
    return saveRes.ok ? ok(ws) : saveRes;
  };

  const removeEntry = async (path: string): Promise<Result<Workspace, WorkspaceError>> => {
    const res = await load();
    if (!res.ok) return res;
    const ws = res.value;
    ws.entries = ws.entries.filter((e) => e !== path);
    const saveRes = await save(ws);
    return saveRes.ok ? ok(ws) : saveRes;
  };

  return {
    load,
    save,
    addEntry,
    removeEntry,
  };
}
