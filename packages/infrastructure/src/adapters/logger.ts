import type { Logger } from '@application';

export function createLogger(): Logger {
  return {
    info: (msg: string) => console.log(msg),
    warn: (msg: string) => console.warn(msg),
    error: (msg: string, err?: unknown) => {
      if (err) console.error(msg, err);
      else console.error(msg);
    },
  };
}
