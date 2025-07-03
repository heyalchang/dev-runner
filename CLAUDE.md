# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Dev Runner is an Electron desktop application that manages multiple development servers from a single interface. It allows developers to start, stop, and restart Node.js development servers configured in `projects.json`.

## Development Commands

```bash
# Install dependencies
npm install

# Run in development mode (starts Vite dev server + Electron)
npm run dev

# Build the application
npm run build

# Preview Vite build
npm run preview
```

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop**: Electron 29
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with PostCSS

### Key Components

1. **Main Process** (`main.js`):
   - Manages Electron window lifecycle
   - Spawns child processes for each dev server
   - Monitors stdout to detect server readiness and extract port numbers
   - Handles IPC communication with renderer process

2. **Preload Script** (`preload.js`):
   - Exposes safe API methods to the renderer process via `window.devRunner`
   - Bridges communication between main and renderer processes

3. **React Frontend** (`src/App.tsx`):
   - Displays project cards with start/stop/restart controls
   - Shows detected port numbers in large text when servers are running
   - Manages server state through IPC communication

### Communication Flow

```
React App → window.devRunner API → IPC → Main Process → Child Process (dev server)
                                     ↑                           ↓
                                     ←── Port detection ─────────
```

### Port Detection

The main process monitors stdout from child processes using regex patterns to detect when servers are ready and extract port numbers. Supported patterns include:
- `localhost:PORT`
- `127.0.0.1:PORT`
- `Local: http://...:PORT`
- `ready on port PORT`
- `listening on...:PORT`

## Configuration

### Adding New Projects

Edit `projects.json` to add new projects:

```json
{
  "name": "Project Name",
  "path": "/absolute/path/to/project",
  "cmd": "npm run dev"
}
```

### Current Projects
- LogPanel: `/Users/alchang/dev/logpanel`
- Blood Test Tracker: `/Users/alchang/dev/bloodtestproj`
- LibreChat Backend: `/Users/alchang/dev/LibreChat`

## Development Notes

- The app runs on port 5173 in development mode (Vite default)
- No linting or testing framework is currently configured
- TypeScript is configured separately for frontend (`tsconfig.json`) and Node.js code (`tsconfig.node.json`)
- Build output goes to `dist/` directory
- The app uses Electron's context isolation for security