import { describe, it, expect } from 'bun:test';
import { parseWorkspace } from '../src/validators/workspaceValidator';

describe('Workspace validator', () => {
  it('accepts a valid workspace', () => {
    const ws = {
      version: 1,
      entries: ['file:///Users/alchang/dev/project']
    };
    const res = parseWorkspace(ws);
    expect(res.ok).toBe(true);
  });

  it('rejects when `entries` is missing', () => {
    const res = parseWorkspace({ version: 1 });
    expect(res.ok).toBe(false);
  });
});