import { describe, it, expect } from 'bun:test';
import { parseProjectConfig } from '../src/validators/projectValidator';

describe('Project validator', () => {
  it('accepts a minimal valid config', () => {
    const cfg = { cmd: 'bun run dev' };
    const res = parseProjectConfig(cfg);
    expect(res.ok).toBe(true);
  });

  it('rejects invalid preferredPort (>65535)', () => {
    const cfg = { cmd: 'bun run dev', preferredPort: 70000 };
    const res = parseProjectConfig(cfg);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      // At least one error pointing at preferredPort
      const hasPortErr = res.error.some((e) => e.instancePath.endsWith('/preferredPort'));
      expect(hasPortErr).toBe(true);
    }
  });

  it('rejects when cmd is missing', () => {
    const res = parseProjectConfig({ name: 'NoCmd' });
    expect(res.ok).toBe(false);
  });

  it('accepts a custom portFile path', () => {
    const cfg = { cmd: 'npm run dev', portFile: '/tmp/devrunner-port' };
    const res = parseProjectConfig(cfg);
    expect(res.ok).toBe(true);
  });

  it('rejects non-string portFile', () => {
    const cfg = { cmd: 'npm run dev', portFile: 42 } as unknown;
    const res = parseProjectConfig(cfg);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      const hasErr = res.error.some((e) => e.instancePath.endsWith('/portFile'));
      expect(hasErr).toBe(true);
    }
  });
});
