# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Dev Runner is an Electron desktop application that serves as a centralized control panel for managing multiple Node.js development servers. It provides a GUI where developers can start, stop, and restart different projects from one interface, automatically detects and displays the port numbers each server is running on, and monitors server output to know when they're ready.

## Development Commands

```bash
# Install dependencies
npm install

# Run in development mode (starts Vite dev server on port 3050 + Electron)
npm run dev

# Build the application
npm run build

# Preview Vite build
npm run preview
```

## Architecture

### Technology Stack
- **Frontend**: React 18.2.0 + TypeScript 5.3.3 + Tailwind CSS 3.4.1
- **Desktop**: Electron 29.0.0
- **Build Tool**: Vite 5.0.12
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **UI Components**: Radix UI, Lucide React icons
- **Utilities**: class-variance-authority, clsx, tailwind-merge

### Project Structure

```
dev-runner/
├── main.js                    # Electron main process
├── preload.js                 # Electron preload script
├── index.html                 # HTML entry point
├── projects.json              # Project configurations
├── dev-runner-port-writer.js  # Port detection utility
├── src/
│   ├── App.tsx               # Main React component
│   ├── main.tsx              # React entry point
│   ├── index.css             # Tailwind imports
│   ├── components/
│   │   └── ProjectCard.tsx   # Project card component
│   └── usehooks/
│       └── useDevRunner.ts   # Custom hook for state management
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
├── tsconfig.json             # TypeScript config for frontend
├── tsconfig.node.json        # TypeScript config for Node.js
└── PORT_DETECTION.md         # Port detection documentation
```

### Key Components

1. **Main Process** (`main.js`):
   - Manages Electron window lifecycle
   - Spawns child processes for each dev server
   - Monitors stdout/stderr to detect server readiness and extract port numbers
   - Handles port conflict resolution and automatic port finding
   - Performs health checks every 60 seconds for dead processes
   - Handles IPC communication with renderer process

2. **Preload Script** (`preload.js`):
   - Exposes safe API methods to the renderer process via `window.devRunner`
   - Bridges communication between main and renderer processes
   - Maintains security through context isolation

3. **React Frontend** (`src/App.tsx`):
   - Displays project cards with start/stop/restart controls
   - Shows detected port numbers in large text when servers are running
   - Manages server state through IPC communication
   - Provides "Open in Browser" functionality

4. **State Management** (`src/usehooks/useDevRunner.ts`):
   - Custom hook that encapsulates all state logic
   - Provides clean API for components
   - Handles all IPC communication

5. **Port Detection Utility** (`dev-runner-port-writer.js`):
   - Standalone utility for various dev server setups
   - Supports Vite, Create React App, Next.js, and custom servers
   - Writes port information to temporary files

### Communication Flow

```
React App → window.devRunner API → IPC → Main Process → Child Process (dev server)
                                     ↑                           ↓
                                     ←── Port detection ─────────
```

### Port Detection

The app uses a dual approach for port detection:

1. **Regex Pattern Matching** on stdout/stderr for patterns like:
   - `localhost:PORT`
   - `127.0.0.1:PORT`
   - `Local: http://...:PORT`
   - `ready on port PORT`
   - `listening on...:PORT`
   - `running at http://...:PORT`
   - `Server running on http://...:PORT`

2. **File-Based Detection** via temporary files in `/tmp/dev-runner-ports/`

### Features

- **Port Conflict Handling**: Automatically finds available ports when preferred ports are in use
- **Browser Launch**: Can open running servers in the default browser
- **Real-time Status Updates**: Shows server status and port numbers
- **Health Monitoring**: Regular checks for dead processes
- **Error Handling**: Displays error messages when servers fail to start

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

- The app runs on port 3050 in development mode (configured in `package.json`)
- No linting or testing framework is currently configured
- TypeScript is configured separately for frontend (`tsconfig.json`) and Node.js code (`tsconfig.node.json`)
- Build output goes to `dist/` directory
- The app uses Electron's context isolation for security
- Node integration is disabled in the renderer process for security

## Build Process

- **Development**: Uses `concurrently` to run Vite dev server and Electron with hot reload
- **Production**: Uses `electron-builder` to package the application
- **Cross-platform**: Uses `cross-env` for environment variables

## Potential Improvements

- Add testing framework (Jest, Vitest, or Testing Library)
- Add ESLint configuration for code quality
- Add Prettier for code formatting
- Implement git hooks for commit linting
- Add more comprehensive error handling and logging