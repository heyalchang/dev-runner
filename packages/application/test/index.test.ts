import { describe, it, expect } from 'bun:test';
import { VERSION } from '../src/index';

describe('application package', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBe('2.0.0');
  });

  it('should pass stub test', () => {
    expect(true).toBe(true);
  });
});