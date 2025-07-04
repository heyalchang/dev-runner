import { describe, it, expect } from 'bun:test';
import { VERSION, runCli } from '../src/index';

describe('cli package', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBe('2.0.0');
  });

  it('should export runCli', () => {
    expect(typeof runCli).toBe('function');
  });
});
