import { describe, it, expect } from 'bun:test';
import { createServer, AddressInfo } from 'net';
import { createPortDetector } from '../src/adapters/portDetector';

const detector = createPortDetector();

describe('portDetector', () => {
  it('finds a free port', async () => {
    const port = await detector.findFree();
    expect(typeof port).toBe('number');
    const server = createServer();
    await new Promise(res => server.listen(port, res));
    server.close();
  });

  it('skips preferred port when occupied', async () => {
    const server = createServer();
    await new Promise(res => server.listen(0, res));
    const occupied = (server.address() as AddressInfo).port;
    const found = await detector.findFree(occupied);
    expect(found).not.toBe(occupied);
    server.close();
  });
});
