#!/usr/bin/env node

/**
 * Dev Runner Port Writer
 * 
 * This script writes the actual port number to a temporary file so that
 * the Dev Runner Electron app can detect which port the dev server is using.
 * 
 * Usage in your project:
 * 1. For Vite projects, add this as a plugin in vite.config.js
 * 2. For other dev servers, call this script with the port number
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get project name from current directory or argument
const projectName = process.argv[2] || path.basename(process.cwd());

// Function to write port to file
function writePortToFile(port) {
  const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, '-');
  const portFilePath = path.join(os.tmpdir(), `dev-runner-${sanitizedName}-port.txt`);
  
  try {
    fs.writeFileSync(portFilePath, String(port));
    console.log(`[Dev Runner] Port ${port} written to ${portFilePath}`);
  } catch (error) {
    console.error('[Dev Runner] Failed to write port file:', error);
  }
}

// Vite plugin export
function devRunnerPlugin() {
  return {
    name: 'dev-runner-port-writer',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const address = server.httpServer.address();
        if (address && typeof address === 'object') {
          writePortToFile(address.port);
        }
      });
    }
  };
}

// If called directly with a port number
if (require.main === module) {
  const port = process.argv[3] || process.env.PORT;
  if (port) {
    writePortToFile(port);
  } else {
    console.error('[Dev Runner] No port specified. Usage: dev-runner-port-writer <project-name> <port>');
    process.exit(1);
  }
}

module.exports = { devRunnerPlugin, writePortToFile };