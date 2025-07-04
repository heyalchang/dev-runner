import { promises as fs } from 'fs';
import { dirname } from 'path';
import { mkdir } from 'fs/promises';
import type { JsonStore } from '@application';

export function createJsonStore(): JsonStore {
  async function read<T>(path: string): Promise<T | null> {
    try {
      const data = await fs.readFile(path, 'utf8');
      return JSON.parse(data) as T;
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException;
      if (e.code === 'ENOENT') return null;
      throw err;
    }
  }

  async function write<T>(path: string, data: T): Promise<void> {
    await mkdir(dirname(path), { recursive: true });
    await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf8');
  }

  return { read, write };
}
