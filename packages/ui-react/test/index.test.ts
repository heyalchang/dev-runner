import { describe, it, expect } from 'bun:test';
import { VERSION, useRunner } from '../src/index';

describe('ui-react package', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBe('2.0.0');
  });

  it('should export useRunner hook', () => {
    expect(typeof useRunner).toBe('function');
  });
});
