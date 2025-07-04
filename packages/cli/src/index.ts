#!/usr/bin/env bun
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createServices } from '@application';
import type { Services, InfrastructureDeps } from '@application';
import type { Project } from '@domain';

const stubDeps: InfrastructureDeps = {
  processSpawner: {
    async spawn() {
      return { pid: 0 };
    },
    async kill() {},
  },
  portDetector: {
    async findFree() {
      return 0;
    },
  },
  jsonStore: {
    async read() {
      return null;
    },
    async write() {},
  },
  heartbeat: {
    async tcp() {
      return true;
    },
    async http() {
      return true;
    },
  },
  logger: console,
};

export const VERSION = '2.0.0';

export async function runCli(argv: string[], services: Services) {
  return yargs(argv)
    .command(
      'start <key>',
      'Start project',
      (y) => y.positional('key', { type: 'string' }),
      async (_args) => {
        await services.runner.start({} as Project);
      }
    )
    .command(
      'stop <key>',
      'Stop project',
      (y) => y.positional('key', { type: 'string' }),
      async (args) => {
        await services.runner.kill(args.key as string);
      }
    )
    .command(
      'restart <key>',
      'Restart project',
      (y) => y.positional('key', { type: 'string' }),
      async (_args) => {
        await services.runner.restart({} as Project);
      }
    )
    .command('list', 'List projects', async () => {
      await services.project.list();
    })
    .demandCommand(1)
    .help()
    .parse();
}

if (import.meta.main) {
  const services = createServices(stubDeps);
  void runCli(hideBin(process.argv), services);
}
