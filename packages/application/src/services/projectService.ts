import type { Result, Project } from '@domain';

export type ProjectError =
  | 'NOT_FOUND'
  | 'ALREADY_EXISTS'
  | 'VALIDATION_FAILED'
  | 'UNKNOWN';

export interface ProjectService {
  list(): Promise<Result<Project[], ProjectError>>;
  add(projectPath: string): Promise<Result<Project, ProjectError>>;
  remove(projectPath: string): Promise<Result<void, ProjectError>>;
  update(projectPath: string, patch: Partial<Project>): Promise<Result<Project, ProjectError>>;
}

export function createProjectService(): ProjectService {
  const notImpl = () => {
    throw new Error('Not implemented – Phase 2');
  };

  return {
    list: notImpl,
    add: notImpl,
    remove: notImpl,
    update: notImpl,
  };
}