import { describe, it, expect } from 'bun:test';
import { createProcessSpawner } from '../src/adapters/processSpawner';

const spawner = createProcessSpawner();

describe('processSpawner', () => {
  it('spawns and kills a process', async () => {
    const { pid } = await spawner.spawn('sleep 60', process.cwd(), {});
    expect(typeof pid).toBe('number');
    await spawner.kill(pid);
    await new Promise(r => setTimeout(r, 50));
    let alive = true;
    try {
      process.kill(pid, 0);
    } catch {
      alive = false;
    }
    expect(alive).toBe(false);
  });
});
