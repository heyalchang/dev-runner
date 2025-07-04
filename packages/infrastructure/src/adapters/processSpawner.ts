import { spawn, ChildProcess } from 'child_process';
import type { ProcessSpawner } from '@application';

export function createProcessSpawner(): ProcessSpawner {
  const procs = new Map<number, ChildProcess>();

  async function spawnProc(
    cmd: string,
    cwd: string,
    env: Record<string, string>
  ): Promise<{ pid: number }> {
    const child = spawn(cmd, { cwd, env: { ...process.env, ...env }, shell: true });
    if (child.pid === undefined) {
      throw new Error('Failed to spawn process');
    }
    procs.set(child.pid, child);
    return { pid: child.pid };
  }

  async function kill(pid: number): Promise<void> {
    const proc = procs.get(pid);
    if (proc) {
      proc.kill();
      procs.delete(pid);
    } else {
      try {
        process.kill(pid);
      } catch {
        // ignore
      }
    }
  }

  return { spawn: spawnProc, kill };
}
