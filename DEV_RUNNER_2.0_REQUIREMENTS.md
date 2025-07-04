# Dev Runner 2.0 – Functional & Technical Specification
_Last updated: 2025-07-04_

---

## 1. Overview
Dev Runner is an Electron desktop utility that lets developers start, stop, restart and monitor multiple development servers from a single control panel.
Version 2.0 introduces per-project config files, automatic project detection, robust health-checks and first-class Bun support while staying true to **Greybeard Minimalism**: zero fuss, maximum clarity.

---

## 2. Guiding Principles
• Convention over configuration, but every convention is overridable in a plaintext JSON file.
• Fail fast, log verbosely, never swallow stderr.
• GUI is a thin layer—same functionality is scriptable via CLI.
• Security first: Electron context-isolation on, no Node integration in renderer.
• Cross-platform operation (macOS 12+, Windows 10, Ubuntu 22.04 LTS).

---

## 3. Terminology
* **Project** – Any directory containing a `.devrunner.json` or listed in the workspace.
* **Workspace** – User-specific list of absolute project paths stored in `workspace.json`.
* **Heartbeat** – Periodic check (TCP or HTTP) confirming the server is alive.
* **Ready Detection** – Mechanism that decides the server is "up" (regex, port file, TCP connect).

---

## 4. User Stories (Abbreviated)
1. I can add a directory and have Dev Runner guess sensible defaults.
2. I can override guesses in a `.devrunner.json` file committed to the repo.
3. I see live status: starting → running → unhealthy → stopped.
4. I can view recent stdout/stderr for troubleshooting.
5. I’m warned of port conflicts and offered an automatic fix.
6. I can operate Dev Runner entirely from CLI if desired.

---

## 5. Functional Requirements

### 5.1 Per-Project Configuration (`.devrunner.json`)

| Key                 | Type                      | Default / Notes                                                                |
|---------------------|---------------------------|--------------------------------------------------------------------------------|
| `name`              | string                   | Directory name                                                                 |
| `cmd` *required*    | string                   | Command used to start the server                                               |
| `preferredPort`     | number                   | If absent Dev Runner chooses any free port                                     |
| `env`               | object<string,string>    | Merged into process env                                                        |
| `heartbeat`         | `"tcp"` \| `"http"`      | `"tcp"`                                                                        |
| `healthPath`        | string                   | HTTP path when `heartbeat==="http"` (`/`)                                      |
| `interval`          | number                   | Seconds between health probes (default 15)                                     |
| `grace`             | number                   | Consecutive failures allowed (default 3)                                       |
| `restartOnUnhealthy`| boolean                  | Uses global default unless explicitly set here                                 |
| `readyRegex`        | string (RegExp)          | Prepended to built-in regex list                                               |
| `portArg`           | string                   | e.g. `"--port"` – append instead of env var                                    |
| `type`              | enum                     | `"vite" \| "cra" \| "next" \| "bun" \| "cargo" \| "custom"`                    |

### 5.2 Directory Discovery & Auto-Detection
Detection algorithm (run when user selects a directory):

1. Look for signature files in priority order
   `bun.lockb → pnpm-lock.yaml → yarn.lock → package.json → Cargo.toml`.
2. Derive defaults:
   • **bun.lockb** → `cmd: "bun run dev"`
   • **pnpm-lock.yaml** → `cmd: "pnpm run dev"`
   • **yarn.lock** → `cmd: "yarn dev"`
   • **package.json** – `scripts.dev` → `npm run dev` (or Bun/Yarn based on lockfile) else `npm start`
   • **Cargo.toml** → `cmd: "cargo run"`
3. Set `type` accordingly, leave `preferredPort` empty.
4. Present a confirmation dialog; user may tweak before save.
5. Optionally write generated `.devrunner.json` into the project.

### 5.3 Port Negotiation & Injection
* Probe from `preferredPort` upward (max 100 attempts) to find a free port.
* Inject via `PORT=<number>` into the child’s env.
* Also export `DEV_RUNNER_PORT_SUGGESTION` for frameworks that ignore `PORT`.
* If `.devrunner.json.portArg` is supplied, append `"<portArg> <number>"` to the command line.
* When the child exits we release the port for reuse.

### 5.4 Health Monitoring
* After readiness detection succeeds, begin a poll loop every `interval` seconds.
* **tcp mode** – open a socket to `<port>`; **http mode** – `GET http://localhost:<port><healthPath>`.
* On `grace` consecutive failures:
  – mark status = "dead", emit IPC `unhealthy` event.
  – if `restartOnUnhealthy` is true (project-level or global default) automatically restart the process.

### 5.5 Ready Detection Enhancements
* Built-in regex list plus per-project `readyRegex`.
* Port-file detection supports **plain-text _and_ JSON** (`{ "port": 1234 }`) by default.
* After a port is detected we confirm listener availability with a TCP connect check.

### 5.6 Log Surfacing
* Stdout/stderr from each child is piped to a rolling logfile capped at **25 MB** per project
  (`~/Library/Logs/DevRunner/<slug>.log` on macOS, platform equivalent elsewhere).
* Renderer maintains a 250-line circular buffer streamed over IPC.
* Card UI: chevron reveals tail view; "Open full log in Terminal" launches
  `tail -f <logfile>` on **macOS/Linux only** (feature hidden on Windows).

### 5.7 System Tray & Quick Actions
* Tray icon colour indicates aggregate health:
  grey = none running, green = all healthy, yellow = some unhealthy, red = at least one dead.
* Context menu: Start All / Stop All / Restart Dead / Open \<project>.

### 5.8 Persistence
* `workspace.json` (user-level, NOT committed):

```jsonc
{
  "version": 1,
  "entries": [
    "/abs/path/projectA",
    "/abs/path/projectB"
  ]
}
```

* On first run Dev Runner merges legacy `projects.json`, then prompts to delete/migrate.

### 5.9 CLI Companion
The CLI is bundled **inside** the Electron app and exposed via:

```
npx dev-runner start <path> [--port 4000]
npx dev-runner stop  <path|all>
npx dev-runner list
```

It re-uses the same modules as the Electron main process—no separate npm package required.

---

## 6. Non-Functional Requirements
* Renderer start-up time < 150 ms on an M1 MacBook.
* Health-check false-positive rate < 0.5 %.
* 100 % TypeScript coverage in shared modules.
* No unhandled promise rejections (CI fails otherwise).
* Cross-platform: macOS 12+, Windows 10, Ubuntu 22.04 LTS.

---

## 7. JSON Schemas (abridged)

### `.devrunner.json`
```jsonc
{
  "$schema": "https://example.com/devrunner.schema.json",
  "type": "object",
  "required": ["cmd"],
  "properties": {
    "name":                { "type": "string",  "minLength": 1 },
    "cmd":                 { "type": "string",  "minLength": 1 },
    "preferredPort":       { "type": "integer", "minimum": 1, "maximum": 65535 },
    "env":                 { "type": "object",  "additionalProperties": { "type": "string" } },
    "heartbeat":           { "enum": ["tcp", "http"] },
    "healthPath":          { "type": "string" },
    "interval":            { "type": "integer", "minimum": 5 },
    "grace":               { "type": "integer", "minimum": 1 },
    "restartOnUnhealthy":  { "type": "boolean" },
    "readyRegex":          { "type": "string" },
    "portArg":             { "type": "string" },
    "type": {
      "enum": ["vite", "cra", "next", "bun", "cargo", "custom"]
    }
  },
  "additionalProperties": false
}
```

### `workspace.json`
```jsonc
{
  "$schema": "https://example.com/workspace.schema.json",
  "type": "object",
  "required": ["entries"],
  "properties": {
    "version": { "type": "integer", "const": 1 },
    "entries": {
      "type": "array",
      "items": { "type": "string", "format": "uri" }
    }
  },
  "additionalProperties": false
}
```

---

## 8. Migration Plan
1. On first launch of v2, load both `projects.json` and `workspace.json`.
2. Display merge dialog; user can:
   • "Adopt Workspace file" (default) – write merged paths to workspace, ignore projects.json.
   • "Keep legacy only" – continue reading projects.json (deprecated).
   • "Manual" – open both files in editor.
3. Remove migration code in v3.

---

## 9. Implementation Roadmap
1. `detectProject.ts` util + unit tests.
2. JSON-Schema validation (Ajv) in main process.
3. Replace `projects.json` loader with new `workspaceManager.ts`.
4. UI:
   • Directory picker (Electron `dialog`)
   • Project list refresh + state sync
   • Heartbeat dot tooltip & per-project restart toggle
   • Log drawer & tail view
5. Health-check service & IPC events.
6. Tray integration.
7. Bundled CLI wiring.

---

Everything above is now locked—ready for ticket breakdown and code work.