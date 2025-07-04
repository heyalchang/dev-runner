import { describe, it, expect } from 'bun:test';
import { createLogger } from '../src/adapters/logger';

describe('logger', () => {
  it('calls console functions', () => {
    const messages: string[] = [];
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    console.log = msg => { messages.push(`log:${msg}`); };
    console.warn = msg => { messages.push(`warn:${msg}`); };
    console.error = msg => { messages.push(`error:${msg}`); };
    const logger = createLogger();
    logger.info('a');
    logger.warn('b');
    logger.error('c');
    console.log = origLog;
    console.warn = origWarn;
    console.error = origError;
    expect(messages).toEqual(['log:a', 'warn:b', 'error:c']);
  });
});
