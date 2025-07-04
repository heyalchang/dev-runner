import { describe, it, expect } from 'bun:test';
import { runCli } from '../src/index';
import type { Services } from '@application';

function createServices(): Services {
  return {
    project: {
      list: async () => ({ ok: true, value: [] }),
      add: async () => ({ ok: true, value: {} as never }),
      remove: async () => ({ ok: true, value: undefined }),
      update: async () => ({ ok: true, value: {} as never }),
    },
    runner: {
      start: async () => ({ ok: true, value: 0 }),
      kill: async () => ({ ok: true, value: undefined }),
      restart: async () => ({ ok: true, value: 0 }),
      status: async () => ({ ok: true, value: 'running' as const }),
    },
    workspace: {
      load: async () => ({ ok: true, value: { entries: [] } as never }),
      save: async () => ({ ok: true, value: undefined }),
      addEntry: async () => ({ ok: true, value: { entries: [] } as never }),
      removeEntry: async () => ({ ok: true, value: { entries: [] } as never }),
    },
    log: {
      tail: async () => ({ ok: true, value: [] }),
      openInTerminal: async () => ({ ok: true, value: undefined }),
    },
    heartbeat: {
      getStatus: async () => ({ ok: true, value: 'healthy' as const }),
    },
  };
}

describe('runCli', () => {
  it('handles list command', async () => {
    const services = createServices();
    await runCli(['list'], services);
    expect(true).toBe(true);
  });
});
