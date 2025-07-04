const { app, BrowserWindow, Tray, ipcMain, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const net = require('net');
const fs = require('fs').promises;
const os = require('os');

const procs = {};

// Check if a port is available
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Find an available port starting from the preferred port
async function findAvailablePort(preferredPort = 3000, maxAttempts = 100) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = preferredPort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found between ${preferredPort} and ${preferredPort + maxAttempts}`);
}

// Get the port file path for a project
function getPortFilePath(projectName) {
  return path.join(os.tmpdir(), `dev-runner-${projectName.replace(/[^a-zA-Z0-9]/g, '-')}-port.txt`);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 420,
    height: 600,
    webPreferences: { 
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3050');
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  // TODO: Add tray icon
  // new Tray(path.join(__dirname, 'icon.png'));
  
  // Start health check interval (every 60 seconds)
  setInterval(() => {
    Object.entries(procs).forEach(([key, proc]) => {
      if (proc.proc && proc.proc.killed) {
        delete procs[key];
        BrowserWindow.getAllWindows()[0]?.webContents.send('exit', key);
      }
    });
  }, 60000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('start', async (_evt, key, cmd, cwd, preferredPort = 3000) => {
  console.log(`[START] Received request to start project:`);
  console.log(`  - Key: ${key}`);
  console.log(`  - Command: ${cmd}`);
  console.log(`  - Directory: ${cwd}`);
  console.log(`  - Preferred Port: ${preferredPort}`);
  
  if (procs[key]) {
    console.log(`[START] Project ${key} is already running on port ${procs[key].port}`);
    return procs[key].port;
  }
  
  // Clean up any existing port file
  const portFilePath = getPortFilePath(key);
  try {
    await fs.unlink(portFilePath);
  } catch (e) {
    // File doesn't exist, that's fine
  }
  
  // Find an available port
  let suggestedPort;
  try {
    suggestedPort = await findAvailablePort(preferredPort);
    console.log(`[${key}] Suggested port: ${suggestedPort}`);
  } catch (error) {
    console.error(`[${key}] Port check failed: ${error.message}`);
    suggestedPort = preferredPort;
  }
  
  // Spawn with PORT environment variable
  const env = { ...process.env, PORT: suggestedPort };
  console.log(`[${key}] Spawning process with command: ${cmd} in directory: ${cwd}`);
  
  // Verify the directory exists before spawning
  try {
    const stats = await fs.stat(cwd);
    if (!stats.isDirectory()) {
      console.error(`[${key}] Error: ${cwd} is not a directory`);
      return null;
    }
  } catch (e) {
    console.error(`[${key}] Error: Directory ${cwd} does not exist`);
    return null;
  }
  
  const child = spawn(cmd, { shell: true, cwd, env });
  procs[key] = { proc: child, port: null, portFilePath, pollInterval: null };
  
  console.log(`[${key}] Started process with PID: ${child.pid}`);
  console.log(`[${key}] Current procs:`, Object.keys(procs));

  // Start polling for the port file
  procs[key].pollInterval = setInterval(async () => {
    try {
      const portContent = await fs.readFile(portFilePath, 'utf8');
      const port = parseInt(portContent.trim(), 10);
      
      if (!isNaN(port) && port > 0) {
        clearInterval(procs[key].pollInterval);
        procs[key].port = port;
        console.log(`[${key}] Port file detected: ${port}`);
        
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
          win.webContents.send('port', key, port);
          console.log(`[${key}] Port sent to renderer: ${port}`);
        }
      }
    } catch (e) {
      // File doesn't exist yet, keep polling
    }
  }, 500); // Poll every 500ms
  
  // Stop polling after 30 seconds
  setTimeout(() => {
    if (procs[key] && procs[key].pollInterval) {
      clearInterval(procs[key].pollInterval);
    }
    if (!procs[key].port) {
      console.log(`[${key}] Timeout waiting for port file`);
    }
  }, 30000);

  child.stdout.on('data', (d) => {
    const out = d.toString();
    console.log(`[${key}] ${out}`);
    
    // Match various port patterns
    const patterns = [
      /localhost:(\d{2,5})/i,
      /127\.0\.0\.1:(\d{2,5})/i,
      /0\.0\.0\.0:(\d{2,5})/i,
      /Local:\s+https?:\/\/[^:]+:(\d{2,5})/i,
      /ready on port (\d{2,5})/i,
      /listening on.*:(\d{2,5})/i,
      /port\s+(\d{2,5})/i,
      /:(\d{2,5})\s*$/m
    ];
    
    console.log(`[${key}] Checking for port patterns...`);
    for (const pattern of patterns) {
      const match = out.match(pattern);
      if (match) {
        procs[key].port = Number(match[1]);
        console.log(`[${key}] Port detected: ${procs[key].port}`);
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
          win.webContents.send('port', key, procs[key].port);
          console.log(`[${key}] Port sent to renderer: ${procs[key].port}`);
        }
        break;
      }
    }
    if (!procs[key].port) {
      console.log(`[${key}] No port pattern matched in output`);
    }
  });
  
  child.stderr.on('data', (d) => {
    const err = d.toString();
    console.error(`[${key}] ${err}`);
    
    // Also check stderr for port patterns (some servers output to stderr)
    const patterns = [
      /localhost:(\d{2,5})/i,
      /127\.0\.0\.1:(\d{2,5})/i,
      /0\.0\.0\.0:(\d{2,5})/i,
      /Local:\s+https?:\/\/[^:]+:(\d{2,5})/i,
      /ready on port (\d{2,5})/i,
      /listening on.*:(\d{2,5})/i,
      /port\s+(\d{2,5})/i,
      /:(\d{2,5})\s*$/m
    ];
    
    if (!procs[key].port) {
      for (const pattern of patterns) {
        const match = err.match(pattern);
        if (match) {
          procs[key].port = Number(match[1]);
          console.log(`[${key}] Port detected in stderr: ${procs[key].port}`);
          const win = BrowserWindow.getAllWindows()[0];
          if (win) {
            win.webContents.send('port', key, procs[key].port);
            console.log(`[${key}] Port sent to renderer: ${procs[key].port}`);
          }
          break;
        }
      }
    }
  });
  
  child.on('exit', async () => {
    // Clean up port file
    if (procs[key]) {
      if (procs[key].pollInterval) {
        clearInterval(procs[key].pollInterval);
      }
      try {
        await fs.unlink(procs[key].portFilePath);
      } catch (e) {
        // File doesn't exist, that's fine
      }
    }
    delete procs[key];
    BrowserWindow.getAllWindows()[0]?.webContents.send('exit', key);
  });
  
  return null;
});

ipcMain.handle('kill', async (_e, key) => {
  if (procs[key]) {
    if (procs[key].pollInterval) {
      clearInterval(procs[key].pollInterval);
    }
    procs[key].proc.kill();
    try {
      await fs.unlink(procs[key].portFilePath);
    } catch (e) {
      // File doesn't exist, that's fine
    }
    delete procs[key];
  }
});

ipcMain.handle('restart', async (_e, key, cmd, cwd, preferredPort = 3000) => {
  // Kill existing process
  if (procs[key]) {
    if (procs[key].pollInterval) {
      clearInterval(procs[key].pollInterval);
    }
    procs[key].proc.kill();
    try {
      await fs.unlink(procs[key].portFilePath);
    } catch (e) {
      // File doesn't exist, that's fine
    }
    delete procs[key];
    // Wait a bit for the process to fully terminate
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Call the start handler with the same parameters
  return ipcMain._events.start(null, _e, key, cmd, cwd, preferredPort);
});

ipcMain.handle('openInBrowser', async (_e, port) => {
  await shell.openExternal(`http://localhost:${port}`);
});