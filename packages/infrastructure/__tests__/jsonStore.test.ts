import { describe, it, expect } from 'bun:test';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { createJsonStore } from '../src/adapters/jsonStore';

const store = createJsonStore();

describe('jsonStore', () => {
  it('writes and reads JSON', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'store-'));
    const file = join(dir, 'data.json');
    const data = { a: 1, b: 'c' };
    await store.write(file, data);
    const read = await store.read<typeof data>(file);
    expect(read).toEqual(data);
    await rm(dir, { recursive: true, force: true });
  });

  it('returns null for missing file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'store-'));
    const file = join(dir, 'missing.json');
    const res = await store.read(file);
    expect(res).toBeNull();
    await rm(dir, { recursive: true, force: true });
  });
});
