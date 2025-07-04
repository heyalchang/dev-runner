import { ipcMain, contextBridge, BrowserWindow } from 'electron';
import type { Services } from '@application';

type RendererAPI = {
  start: (key: string, cmd: string, cwd: string, preferredPort?: number) => Promise<number | null>;
  kill: (key: string) => Promise<void>;
  restart: (key: string, cmd: string, cwd: string, preferredPort?: number) => Promise<void>;
  openInBrowser: (port: number) => Promise<void>;
  onPort: (cb: (key: string, port: number) => void) => void;
  onExit: (cb: (key: string) => void) => void;
};

export function exposeRendererApi(api: RendererAPI): void {
  contextBridge.exposeInMainWorld('devRunner', api);
}

export function registerMainHandlers(services: Services): void {
  ipcMain.handle('start', (_e, project) => services.runner.start(project));
  ipcMain.handle('kill', (_e, key) => services.runner.kill(key));
  ipcMain.handle('restart', (_e, project) => services.runner.restart(project));
  ipcMain.handle('status', (_e, key) => services.runner.status(key));
  ipcMain.handle('openInBrowser', (_e, port) => services.log.openInTerminal(String(port)));
}

export function sendPort(win: BrowserWindow, key: string, port: number): void {
  win.webContents.send('port', key, port);
}

export function sendExit(win: BrowserWindow, key: string): void {
  win.webContents.send('exit', key);
}
