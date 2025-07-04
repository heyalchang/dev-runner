import { describe, it, expect } from 'bun:test';
import { createServices, type InfrastructureDeps } from '../src/createServices';

const dummyDeps: InfrastructureDeps = {
  processSpawner: {},
  portDetector: {},
  jsonStore: {},
  heartbeat: {},
  logger: { info() {}, warn() {}, error() {} },
} as unknown as InfrastructureDeps;

describe('createServices factory', () => {
  it('should be a function', () => {
    expect(typeof createServices).toBe('function');
  });

  it('returns an object with expected keys', () => {
    const services = createServices(dummyDeps);
    expect(Object.keys(services).sort()).toEqual(
      ['project', 'runner', 'workspace', 'log', 'heartbeat'].sort()
    );
  });
});