import { describe, it, expect } from 'bun:test';
import { createServer } from 'net';
import { createServer as createHttp } from 'http';
import { AddressInfo } from 'net';
import { createHeartbeatProbe } from '../src/adapters/heartbeatProbe';

const probe = createHeartbeatProbe();

describe('heartbeatProbe', () => {
  it('detects tcp servers', async () => {
    const server = createServer();
    await new Promise(res => server.listen(0, res));
    const port = (server.address() as AddressInfo).port;
    const ok = await probe.tcp(port);
    expect(ok).toBe(true);
    await new Promise(res => server.close(res));
    await new Promise(res => setTimeout(res, 20));
    const fail = await probe.tcp(port);
    expect(fail).toBe(false);
  });

  it('detects http servers', async () => {
    const server = createHttp((_req, res) => res.end('ok'));
    await new Promise(res => server.listen(0, res));
    const port = (server.address() as AddressInfo).port;
    const url = `http://127.0.0.1:${port}`;
    const ok = await probe.http(url);
    expect(ok).toBe(true);
    await new Promise(res => server.close(res));
    await new Promise(res => setTimeout(res, 20));
    const fail = await probe.http(url);
    expect(fail).toBe(false);
  });
});
