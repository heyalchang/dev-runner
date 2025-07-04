import type { Result, Project } from '@domain';
import { parseProjectConfig, ok, err } from '@domain';
import type { InfrastructureDeps } from '../createServices';
import { publish } from '../eventBus';

export type ProjectError = 'NOT_FOUND' | 'ALREADY_EXISTS' | 'VALIDATION_FAILED' | 'UNKNOWN';

export interface ProjectService {
  list(): Promise<Result<Project[], ProjectError>>;
  add(projectPath: string): Promise<Result<Project, ProjectError>>;
  remove(projectPath: string): Promise<Result<void, ProjectError>>;
  update(projectPath: string, patch: Partial<Project>): Promise<Result<Project, ProjectError>>;
}

export function createProjectService(
  deps: Pick<InfrastructureDeps, 'jsonStore' | 'logger'>
): ProjectService {
  const projects = new Map<string, Project>();

  const list = async (): Promise<Result<Project[], ProjectError>> => {
    return ok([...projects.values()]);
  };

  const add = async (projectPath: string): Promise<Result<Project, ProjectError>> => {
    if (projects.has(projectPath)) return err('ALREADY_EXISTS');
    try {
      const raw = await deps.jsonStore.read<unknown>(projectPath);
      if (raw === null) return err('NOT_FOUND');
      const parsed = parseProjectConfig(raw);
      if (!parsed.ok) return err('VALIDATION_FAILED');
      projects.set(projectPath, parsed.value);
      publish({ type: 'project.added', path: projectPath });
      return ok(parsed.value);
    } catch (e) {
      deps.logger.error('project add failed', e);
      return err('UNKNOWN');
    }
  };

  const remove = async (projectPath: string): Promise<Result<void, ProjectError>> => {
    if (!projects.has(projectPath)) return err('NOT_FOUND');
    projects.delete(projectPath);
    publish({ type: 'project.removed', path: projectPath });
    return ok(undefined);
  };

  const update = async (
    projectPath: string,
    patch: Partial<Project>
  ): Promise<Result<Project, ProjectError>> => {
    const current = projects.get(projectPath);
    if (!current) return err('NOT_FOUND');
    const updated = { ...current, ...patch };
    projects.set(projectPath, updated);
    return ok(updated);
  };

  return { list, add, remove, update };
}
