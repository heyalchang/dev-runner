# Dev Runner 2.0 – Phase 2 Parallel Work

This document is **the single source of truth** for everyone coding in Phase 2.
Keep it up-to-date when responsibilities or contracts change.

---

## 0  Quick-start for New Workers
1. Read this file end-to-end.
2. Follow the lightweight container bootstrap in `CONTAINER_SETUP.md`.
3. Check out your assigned branch (e.g. `feat/application`).
4. Run `bun install` once, then `bun test -r` – you should see all green stubs.
5. Start coding according to your role section below.

---

## 1  Shared Ground Rules

• Architecture direction: `domain ← application ← infrastructure ← (ui-react | cli)`
• Imports must never violate the arrow – `eslint-plugin-boundaries` will fail CI.
• Testing uses Bun’s built-in runner (`bun test`). **We do not use Vitest.**
• CI gate: `bun run build -r && bun run lint -r && bun run test -r`
  – coverage threshold ≥ 80 % for any new non-stub code.
• Formatting: Prettier + ESLint autofix before every commit.
• **Diff protocol**: All file mutations *must* be wrapped in XML diff blocks.
• **Referencing legacy code**: You may **read** any file in the old `src/` tree for behaviour ideas, but never import or copy code that crosses layer boundaries.

---

## 2  Role Matrix & Deliverables

### 2.1  LLM-A – Application Orchestrator
*Owns*: `packages/application/**`
*Depends on*: `@domain`, injected `InfrastructureDeps`

Tasks
1. Replace throwing stubs in `ProjectService`, `RunnerService`, `WorkspaceService`, `LogService`, `HeartbeatService`.
2. Publish typed domain events through `src/eventBus.ts`.
3. Reach ≥ 80 % coverage with fake InfrastructureDeps.

Deliverables
• `src/services/*.ts` & `src/eventBus.ts`
• tests in `__tests__/`

Guardrails
• No imports from `packages/infrastructure`, `packages/ui-react`, or Node built-ins (runtime) – types only.

Legacy-code reference tip
• Review `src/usehooks/useDevRunner.ts` for state shape, but re-implement cleanly.

---

### 2.2  LLM-I – Infrastructure Adapter
*Owns*: `packages/infrastructure/**`
*Depends on*: `@domain`, `@application`

Tasks
1. Implement adapters fulfilling `InfrastructureDeps`: `ProcessSpawner`, `PortDetector`, `JsonStore`, `HeartbeatProbe`, `Logger`.
2. Provide `createInfrastructureDeps()` that bundles them.
3. Expose Electron IPC bridge (`ipcBridge.ts`).
4. ≥ 80 % unit-test coverage (tmp dir, free ports).

Deliverables
• `src/adapters/*.ts` & `src/index.ts` exporting `deps`
• tests in `__tests__/`

Legacy-code reference tip
• Study `server.ts` and `window.devRunner` mock to understand behaviour; do **not** copy code.

---

### 2.3  LLM-U – UI React / CLI
*Owns*: `packages/ui-react/**`, `packages/cli/**`
*Depends on*: `@application`

UI Tasks
1. Build `useRunner()` hook around Application services.
2. Refactor `ProjectCard` to include log drawer & heartbeat dot.
3. Add directory picker & Add-Project wizard.

CLI Tasks
1. Implement `dev-runner start|stop|restart|list` with yargs, importing only Application.

Deliverables
• `src/hooks/useRunner.ts`, `src/components/*.tsx`, `src/index.ts` (CLI)
• tests

Guardrails
• Renderer stays presentational – no fs or process imports.
• "Open full log" button is macOS/Linux-only (`x-terminal-emulator`).

---

### 2.4  LLM-D – Domain Custodian
*Owns*: `packages/domain/**`

Tasks
• Only additive, backward-compatible changes.
• Maintain 100 % coverage and keep JSON-Schemas aligned.

---

## 3  Testing Strategy

All unit tests run with `bun test`.
Mock external resources (fs, network) using Bun’s facilities or manual stubs.
UI may use React Testing Library; a cross-layer smoke test with Playwright runs after integration.

Coverage thresholds are enforced per package via `package.json`.

---

## 4  Escalation Protocol

Unresolvable ambiguity or external blocker:

1. Insert a source comment:
   `// LLM_BLOCKER: <description>`
2. Add entry to root `BLOCKERS.md`:
   ```
   ## YYYY-MM-DD – <title>
   *Who:* LLM-<letter>
   *Problem:* …
   *Proposed options:* a)… b)…
   ```
3. Commit & push – the blocker CI job alerts the integrator.

---

## 5  Synchronisation & Convergence

Workers merge into the shared `integration` branch as soon as CI is green.
A scheduled **Convergence Pass** at the end of Phase 2 reconciles minor API
drift and runs full smoke tests.

---

*End of document – keep it authoritative and update responsibly.*