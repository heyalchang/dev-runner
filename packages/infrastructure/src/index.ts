// Infrastructure layer - I/O adapters
export const VERSION = '2.0.0';

export * from './adapters/processSpawner';
export * from './adapters/portDetector';
export * from './adapters/jsonStore';
export * from './adapters/heartbeatProbe';
export * from './adapters/logger';

import {
  createProcessSpawner,
  } from './adapters/processSpawner';
import { createPortDetector } from './adapters/portDetector';
import { createJsonStore } from './adapters/jsonStore';
import { createHeartbeatProbe } from './adapters/heartbeatProbe';
import { createLogger } from './adapters/logger';
import type { InfrastructureDeps } from '@application';

export function createInfrastructureDeps(): InfrastructureDeps {
  return {
    processSpawner: createProcessSpawner(),
    portDetector: createPortDetector(),
    jsonStore: createJsonStore(),
    heartbeat: createHeartbeatProbe(),
    logger: createLogger(),
  };
}
