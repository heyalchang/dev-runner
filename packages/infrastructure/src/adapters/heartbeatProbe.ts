import { connect } from 'net';
import { request } from 'http';
import type { HeartbeatProbe } from '@application';

export function createHeartbeatProbe(): HeartbeatProbe {
  function tcp(port: number): Promise<boolean> {
    return new Promise(resolve => {
      const socket = connect({ port }, () => {
        socket.destroy();
        resolve(true);
      });
      socket.once('error', () => {
        socket.destroy();
        resolve(false);
      });
      socket.setTimeout(1000, () => {
        socket.destroy();
        resolve(false);
      });
    });
  }

  function http(url: string): Promise<boolean> {
    return new Promise(resolve => {
      const req = request(url, res => {
        res.resume();
        resolve(res.statusCode !== undefined && res.statusCode < 500);
      });
      req.once('error', () => resolve(false));
      req.setTimeout(1000, () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  }

  return { tcp, http };
}
