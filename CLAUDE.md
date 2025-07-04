# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and other LLMs when working with code in this repository.

## DEV_RUNNER 2.0 - Phase 2

**IMPORTANT: We are now implementing DEV_RUNNER version 2. The existing codebase is legacy and should be used only as reference.**

### Current Status
- **Version**: DEV_RUNNER 2.0
- **Phase**: Phase 2 - LLM Role Assignment
- **Legacy Code**: The v1 codebase described below is for reference only

### Phase 2 Overview
We are currently in Phase 2 of the DEV_RUNNER 2.0 implementation. In this phase:
- LLMs are being assigned specific roles
- Each LLM will reference this CLAUDE.md file for context
- The architecture is being redesigned from the ground up

## DEV_RUNNER 2.0 Architecture

### Technology Stack (v2)
- **Runtime**: Bun (replacing Node.js)
- **Backend**: To be determined based on requirements
- **Frontend**: To be determined based on requirements
- **Build System**: To be determined based on requirements

### Key Differences from v1
- Complete rewrite using modern architecture
- Bun-based for improved performance
- LLM-assisted development workflow
- Enhanced modularity and extensibility

### Development Approach
- Phase-based implementation
- LLM role assignment for different components
- Test-driven development with Bun's built-in test runner

---

## Legacy v1 Overview (Reference Only)

Dev Runner v1 was an Electron desktop application that served as a centralized control panel for managing multiple Node.js development servers. It provided a GUI where developers could start, stop, and restart different projects from one interface, automatically detected and displayed the port numbers each server was running on, and monitored server output to know when they're ready.

## Legacy v1 Development Commands (Reference)

```bash
# Install dependencies
bun install

# Run in development mode (starts Vite dev server on port 3050 + Electron)
bun run dev

# Build the application
bun run build

# Preview Vite build
bun run preview
```

## Legacy v1 Architecture (Reference)

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

## Legacy v1 Configuration (Reference)

### Adding New Projects

Edit `projects.json` to add new projects:

```json
{
  "name": "Project Name",
  "path": "/absolute/path/to/project",
  "cmd": "bun run dev"
}
```

### Current Projects
- LogPanel: `/Users/alchang/dev/logpanel`
- Blood Test Tracker: `/Users/alchang/dev/bloodtestproj`
- LibreChat Backend: `/Users/alchang/dev/LibreChat`

## Legacy v1 Development Notes (Reference)

- The app runs on port 3050 in development mode (configured in `package.json`)
- No linting or testing framework is currently configured
- TypeScript is configured separately for frontend (`tsconfig.json`) and Node.js code (`tsconfig.node.json`)
- Build output goes to `dist/` directory
- The app uses Electron's context isolation for security
- Node integration is disabled in the renderer process for security

## Legacy v1 Build Process (Reference)

- **Development**: Uses `concurrently` to run Vite dev server and Electron with hot reload
- **Production**: Uses `electron-builder` to package the application
- **Cross-platform**: Uses `cross-env` for environment variables

## Legacy v1 Potential Improvements (Reference)

- Add testing framework (Jest, Vitest, or Testing Library)
- Add ESLint configuration for code quality
- Add Prettier for code formatting
- Implement git hooks for commit linting
- Add more comprehensive error handling and logging