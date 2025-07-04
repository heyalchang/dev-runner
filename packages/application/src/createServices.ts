import {
  createProjectService,
  ProjectService,
} from './services/projectService';
import {
  createRunnerService,
  RunnerService,
} from './services/runnerService';
import {
  createWorkspaceService,
  WorkspaceService,
} from './services/workspaceService';
import { createLogService, LogService } from './services/logService';
import {
  createHeartbeatService,
  HeartbeatService,
} from './services/heartbeatService';

/**
 * Contracts the Infrastructure layer must satisfy.
 * These are intentionally minimal and technology-agnostic.
 */
export interface ProcessSpawner {
  spawn(cmd: string, cwd: string, env: Record<string, string>): Promise<{ pid: number }>;
  kill(pid: number): Promise<void>;
}

export interface PortDetector {
  findFree(preferred?: number): Promise<number>;
}

export interface JsonStore {
  read<T>(path: string): Promise<T | null>;
  write<T>(path: string, data: T): Promise<void>;
}

export interface HeartbeatProbe {
  tcp(port: number): Promise<boolean>;
  http(url: string): Promise<boolean>;
}

export interface Logger {
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string, err?: unknown): void;
}

/**
 * Dependencies supplied by Infrastructure when wiring the app.
 */
export interface InfrastructureDeps {
  processSpawner: ProcessSpawner;
  portDetector: PortDetector;
  jsonStore: JsonStore;
  heartbeat: HeartbeatProbe;
  logger: Logger;
}

export interface Services {
  project: ProjectService;
  runner: RunnerService;
  workspace: WorkspaceService;
  log: LogService;
  heartbeat: HeartbeatService;
}

/**
 * Factory returning stub implementations (Phase 1b).
 * In Phase 2 concrete logic will be provided by consuming deps.
 */
export function createServices(_deps: InfrastructureDeps): Services {
  return {
    project: createProjectService(),
    runner: createRunnerService(),
    workspace: createWorkspaceService(),
    log: createLogService(),
    heartbeat: createHeartbeatService(),
  };
}