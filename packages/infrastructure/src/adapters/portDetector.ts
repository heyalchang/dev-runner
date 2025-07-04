import { createServer, AddressInfo } from 'net';
import type { PortDetector } from '@application';

function isPortFree(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const srv = createServer()
      .once('error', () => {
        srv.close();
        resolve(false);
      })
      .once('listening', () => {
        srv.close(() => resolve(true));
      })
      .listen(port);
  });
}

export function createPortDetector(): PortDetector {
  async function findFree(preferred = 0): Promise<number> {
    if (preferred > 0 && (await isPortFree(preferred))) {
      return preferred;
    }
    return new Promise((resolve, reject) => {
      const srv = createServer();
      srv.once('error', reject);
      srv.listen(0, () => {
        const port = (srv.address() as AddressInfo).port;
        srv.close(() => resolve(port));
      });
    });
  }

  return { findFree };
}
