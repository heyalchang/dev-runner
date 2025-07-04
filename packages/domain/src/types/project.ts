import type { PortNumber } from './port';

export type Heartbeat = 'tcp' | 'http';
export type FrameworkType = 'vite' | 'cra' | 'next' | 'bun' | 'cargo' | 'custom';

/**
 * In-memory representation of a single `.devrunner.json`
 * after successful schema validation.
 */
export interface Project {
  /**
   * Human-readable project name. Optional – Dev Runner derives it from
   * the directory name if absent.
   */
  name?: string;
  /**
   * Command that launches the development server (required).
   */
  cmd: string;
  /**
   * Preferred port; Dev Runner probes upwards if the port is occupied.
   */
  preferredPort?: PortNumber;
  /** Extra env vars injected into the child process. */
  env?: Record<string, string>;
  /** Heartbeat probe kind (default "tcp"). */
  heartbeat?: Heartbeat;
  /** HTTP path when `heartbeat === "http"`. */
  healthPath?: string;
  /** Seconds between health probes. */
  interval?: number;
  /** Consecutive failures tolerated before marking unhealthy. */
  grace?: number;
  /** Auto-restart when unhealthy. */
  restartOnUnhealthy?: boolean;
  /** Additional regex for ready detection. */
  readyRegex?: string;
  /** CLI flag used instead of the PORT env var, e.g. "--port". */
  portArg?: string;
  /**
   * Optional filesystem path to a file containing the port number. When
   * provided Dev Runner waits for this file to appear and reads the port
   * from it instead of scanning stdout.
   */
  portFile?: string;
  /** Auto-detected or user-supplied framework classification. */
  type?: FrameworkType;
}
