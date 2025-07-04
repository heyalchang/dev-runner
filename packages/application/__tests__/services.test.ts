import { describe, it, expect } from 'bun:test';
import { createServices, type InfrastructureDeps } from '../src/createServices';
import { subscribe } from '../src/eventBus';

type SpawnArgs = { cmd: string; cwd: string; env: Record<string, string> };

const calls: { spawn?: SpawnArgs; killed?: number } = {};

const deps: InfrastructureDeps = {
  processSpawner: {
    spawn: async (cmd: string, cwd: string, env: Record<string, string>) => {
      calls.spawn = { cmd, cwd, env };
      return { pid: 42 };
    },
    kill: async (pid: number) => {
      calls.killed = pid;
    },
  },
  portDetector: {
    findFree: async () => 3000,
  },
  jsonStore: {
    read: async (path: string) => {
      if (path === '/proj') return { cmd: 'npm run dev' };
      if (path === 'workspace.json') return { version: 1, entries: [] };
      return null;
    },
    write: async () => {},
  },
  heartbeat: {
    tcp: async () => true,
    http: async () => true,
  },
  logger: { info() {}, warn() {}, error() {} },
};

const services = createServices(deps);

describe('Application services', () => {
  it('adds and lists projects', async () => {
    const events: string[] = [];
    subscribe('project.added', (e) => events.push(e.type));
    const res = await services.project.add('/proj');
    expect(res.ok).toBe(true);
    const list = await services.project.list();
    expect(list.ok && list.value.length).toBe(1);
    expect(events).toContain('project.added');
  });

  it('starts and stops runner', async () => {
    const startRes = await services.runner.start({ cmd: 'npm run dev', name: 'p' });
    expect(startRes.ok && startRes.value).toBe(3000);
    expect(calls.spawn?.cmd).toBe('npm run dev');
    const killRes = await services.runner.kill('p');
    expect(killRes.ok).toBe(true);
    expect(calls.killed).toBe(42);
  });

  it('workspace add/remove', async () => {
    const add = await services.workspace.addEntry('/path');
    expect(add.ok && add.value.entries.includes('/path')).toBe(true);
    const rm = await services.workspace.removeEntry('/path');
    expect(rm.ok && rm.value.entries.includes('/path')).toBe(false);
  });

  it('log tail returns entries', async () => {
    const res = await services.log.tail('p');
    expect(res.ok).toBe(true);
  });

  it('heartbeat returns healthy', async () => {
    const hb = await services.heartbeat.getStatus('p');
    expect(hb.ok && hb.value).toBe('healthy');
  });
});
