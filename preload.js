const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('devRunner', {
  start: (key, cmd, cwd, preferredPort) => ipcRenderer.invoke('start', key, cmd, cwd, preferredPort),
  kill: (key) => ipcRenderer.invoke('kill', key),
  restart: (key, cmd, cwd, preferredPort) => ipcRenderer.invoke('restart', key, cmd, cwd, preferredPort),
  openInBrowser: (port) => ipcRenderer.invoke('openInBrowser', port),
  onPort: (callback) => {
    ipcRenderer.on('port', (_event, key, port) => callback(key, port));
  },
  onExit: (callback) => {
    ipcRenderer.on('exit', (_event, key) => callback(key));
  }
});