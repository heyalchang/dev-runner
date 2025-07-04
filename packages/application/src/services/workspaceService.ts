import type { Result, Workspace } from '@domain';

export type WorkspaceError = 'IO_ERROR' | 'SCHEMA_INVALID' | 'UNKNOWN';

export interface WorkspaceService {
  load(): Promise<Result<Workspace, WorkspaceError>>;
  save(workspace: Workspace): Promise<Result<void, WorkspaceError>>;
  addEntry(path: string): Promise<Result<Workspace, WorkspaceError>>;
  removeEntry(path: string): Promise<Result<Workspace, WorkspaceError>>;
}

export function createWorkspaceService(): WorkspaceService {
  const notImpl = () => {
    throw new Error('Not implemented – Phase 2');
  };

  return {
    load: notImpl,
    save: notImpl,
    addEntry: notImpl,
    removeEntry: notImpl,
  };
}