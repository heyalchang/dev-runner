import { useEffect, useState } from 'react';

export type DevStateEntry = {
  running: boolean;
  port?: number;
  preferredPort?: number;
  loading?: boolean;
};

export type DevState = Record<string, DevStateEntry>;

export interface Project {
  name: string;
  cmd: string;
  path: string;
  preferredPort?: number;
}

// Re-declare the global devRunner interface so TypeScript is aware when used inside the hook
declare global {
  interface Window {
    devRunner: {
      start: (
        key: string,
        cmd: string,
        cwd: string,
        preferredPort?: number
      ) => Promise<number | null>;
      kill: (key: string) => Promise<void>;
      restart: (
        key: string,
        cmd: string,
        cwd: string,
        preferredPort?: number
      ) => Promise<void>;
      openInBrowser: (port: number) => Promise<void>;
      onPort: (callback: (key: string, port: number) => void) => void;
      onExit: (callback: (key: string) => void) => void;
    };
  }
}

/**
 * useDevRunner
 * Encapsulates all state management and side-effects related to starting,
 * stopping, and restarting developer servers.  Consumers get a thin API so
 * the UI layer remains declarative and focused solely on rendering.
 */
export default function useDevRunner() {
  const [state, setState] = useState<DevState>({});

  // Subscribe once to devRunner events
  useEffect(() => {
    const handlePort = (key: string, port: number) => {
      setState((s) => ({
        ...s,
        [key]: { ...s[key], running: true, port, loading: false },
      }));
    };

    const handleExit = (key: string) => {
      setState((s) => ({
        ...s,
        [key]: { running: false, port: undefined, loading: false },
      }));
    };

    window.devRunner.onPort(handlePort);
    window.devRunner.onExit(handleExit);
    // NOTE: The underlying API doesn't expose an unsubscribe mechanism yet.
    // If it ever does, return a cleanup function here.
  }, []);

  const run = async (p: Project) => {
    console.log('[useDevRunner] run() called with project:', p);
    setState((s) => ({
      ...s,
      [p.name]: {
        running: true,
        loading: true,
        preferredPort: p.preferredPort,
      },
    }));

    console.log('[useDevRunner] Calling window.devRunner.start with:', {
      name: p.name,
      cmd: p.cmd,
      path: p.path,
      preferredPort: p.preferredPort
    });
    
    const port = await window.devRunner.start(
      p.name,
      p.cmd,
      p.path,
      p.preferredPort
    );
    if (port) {
      setState((s) => ({
        ...s,
        [p.name]: { running: true, port, loading: false },
      }));
    }
  };

  const kill = async (p: Project) => {
    await window.devRunner.kill(p.name);
    setState((s) => ({
      ...s,
      [p.name]: { running: false, port: undefined, loading: false },
    }));
  };

  const restart = async (p: Project) => {
    setState((s) => ({
      ...s,
      [p.name]: { ...s[p.name], loading: true },
    }));
    await window.devRunner.restart(
      p.name,
      p.cmd,
      p.path,
      p.preferredPort
    );
  };

  const openInBrowser = (port: number) => window.devRunner.openInBrowser(port);

  return { state, run, kill, restart, openInBrowser } as const;
} 