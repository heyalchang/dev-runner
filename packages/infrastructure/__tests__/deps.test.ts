import { describe, it, expect } from 'bun:test';
import { createInfrastructureDeps } from '../src';

describe('createInfrastructureDeps', () => {
  it('returns all adapters', () => {
    const deps = createInfrastructureDeps();
    expect(typeof deps.processSpawner.spawn).toBe('function');
    expect(typeof deps.portDetector.findFree).toBe('function');
    expect(typeof deps.jsonStore.read).toBe('function');
    expect(typeof deps.heartbeat.tcp).toBe('function');
    expect(typeof deps.logger.info).toBe('function');
  });
});
