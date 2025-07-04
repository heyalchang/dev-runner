# Dev Runner 2.0 – Technical Plan
_Clean / Hexagonal Architecture (Option A)_
_Last updated: 2025-07-04_

---

## 1 Scope & Goals
* Re-structure the codebase so every future feature can be implemented (or refactored) by an LLM without cross-layer leakage or tangled dependencies.
* Keep the React renderer paper-thin; all business logic resides in typed services.
* Enforce boundaries at the linter / TypeScript level—CI fails on violations.
* Provide a documented playbook so multiple LLM "workers" can safely work in parallel.

---

## 2 Layered Architecture Overview

```
packages/
├─ domain/          (pure types & business rules)
├─ application/     (use-case orchestrators, async services)
├─ infrastructure/  (I/O: fs, child_process, net, Electron IPC)
├─ ui-react/        (React components & hooks – renderer only)
└─ cli/             (Thin yargs wrapper around application)
```

Dependency direction:

```
domain ← application ← infrastructure ← (ui-react | cli)
```

---

## 3 Package Responsibilities

### 3.1 domain
* Entities & value objects (`Project`, `Workspace`, `PortNumber`, …).
* JSON-Schema definitions + validation helpers (Ajv).
* Pure functions, no side-effects.

### 3.2 application
* Orchestrates domain objects.
* Exposes service interfaces:

```ts
interface ProjectService { … }
interface RunnerService  { … }
interface LogService     { … }
interface WorkspaceService { … }
```

* Provides `createServices(deps: InfrastructureDeps)` for DI.

### 3.3 infrastructure
* Adapters that fulfil `InfrastructureDeps`:
  – `ProcessSpawner`, `PortDetector`, `JsonFileStore`, `HeartbeatProbe`, …
* Electron IPC bridge helpers.

### 3.4 ui-react
* React components + typed hooks (`useProjects`, `useRunner`, …).
* Zero business logic.

### 3.5 cli
* Node entry using yargs; delegates 100 % to Application services.

---

## 4 Tooling & Enforcement

| Tool | Purpose |
|------|---------|
| **TypeScript 5** | Project references for compile-time graph integrity |
| **eslint-plugin-boundaries** | Forbid illegal cross-layer imports |
| **Prettier** | Formatting |
| **Bun test** | Unit tests (domain, application, infrastructure) – builtin runner |
| **Playwright** | Minimal smoke tests for renderer |
| **Husky + lint-staged** | Pre-commit guard |
| **GitHub / GitLab CI** | `bun run build -r && bun run lint -r && bun run test -r` |

---

## 5 Implementation Phases

| Phase | Goal | Key Deliverables |
|-------|------|------------------|
| 0 | **Scaffolding** | Workspaces, tsconfig refs, shared ESLint config, empty packages, CI skeleton |
| 1a | **Domain** (blocking) | Entities, JSON-Schemas, validation tests |
| 1b | **Application interfaces** | Service interfaces + throwing stubs |
| 2 | **Full Parallel** | Concrete Application logic, Infrastructure adapters, minimal UI/CLI |
| 3 | **Integration & Hardening** | Wire Electron main ↔ Application, log streaming, health checks |
| 4 | **Feature Parity & Stretch** | Tray menu, restart-on-unhealthy, dark mode, etc. |

---

## 6 Testing Strategy

1. **Unit tests (Bun test)** – Run in every package; 80 % coverage gate.
2. **Schema validation tests** – `.devrunner.json` & `workspace.json` samples in `packages/domain/__tests__/fixtures`.
3. **Integration tests** – Infrastructure mocks spawning echo servers to verify port detection & heartbeat.
4. **Renderer smoke tests (Playwright)** – Start Electron, confirm two dummy projects can be started/stopped.
5. **Log size cap** – Integration test ensures log rotation at 25 MB.
6. **CI matrix** – macOS 12, Ubuntu 22.04, Windows 10.

---

## 7 LLM Worker Collaboration Playbook

### 7.1 Roles

| Tag | Responsibility | Scope |
|-----|----------------|-------|
| **LLM-D** | Domain Author | `packages/domain` |
| **LLM-A** | Application Orchestrator | `packages/application` |
| **LLM-I** | Infrastructure Adapter | `packages/infrastructure` |
| **LLM-U** | UI / CLI Skin | `packages/ui-react`, `packages/cli` |

A human (or meta-LLM) may act as **Integrator/Reviewer**.

### 7.2 Shared Ground Rules
1. Work in separate Git branches: `feat/domain`, `feat/application`, …
2. **Contracts are frozen**: Domain types + Application service interfaces are the single source of truth.
3. No cross-layer imports; eslint-boundaries enforces this.
4. Every PR must pass `build`, `lint`, `test` and include minimally realistic tests.
5. Barrel exports (`index.ts`) must be updated so other layers consume stable paths.

### 7.3 Sequencing & Parallelism

```
Phase 0  ← scaffolded
   │
Phase 1a (Domain) ──┐
                    ├─ Phase 1b (Service interfaces)    ← can start once Domain types exist
                    │
Phase 2  (Full Parallel: Application ⇆ Infrastructure ⇆ UI/CLI)
Phase 3  (Integration & Hardening)
Phase 4  (Stretch & polish)
```

After **Phase 1a + 1b** contracts stabilise, teams can code in parallel with minimal conflicts.

### 7.4 Testing & CI Expectations
* Each layer supplies its own Vitest suite.
* Infrastructure tests may spin tiny HTTP servers on random ports.
* CI refuses merge if coverage < 80 % or eslint boundaries violated.
* Renderer E2E runs only on "integration" branch to save CI minutes.

### 7.5 Issue Escalation & Flagging
* If an LLM hits a **blocking** problem it **cannot** resolve on its own:
  1. Add a `// LLM_BLOCKER:` comment with clear description and commit.
  2. Update `BLOCKERS.md` at repo root summarising the issue & proposed options.
  3. Push branch; CI will fail on a special "blocker" check, highlighting the need for human/Integrator review.
* Minor uncertainties can be left as TODOs (`// TODO(llm): …`) – not blockers.

### 7.6 Synchronisation Strategy
* TypeScript compile and ESLint boundaries are the first line of defence—branches won’t merge if contracts diverge.
* The project is intentionally small; a single **Convergence Pass** after Phase 3 will reconcile remaining discrepancies.
* `git rebase --rebase-merges integration` is preferred over merge-commits to keep history linear and easy for LLMs to parse.

### 7.7 Prompt Cheat-Sheet for Future Work
1. **Context** – high-level goal + package paths allowed.
2. **Contracts** – import path of interfaces/types to consume.
3. **Constraints** – e.g. "do NOT edit other packages".
4. **Deliverables** – file list, tests required, XML diff format.
5. **CI hint** – remind them to run `bun run test -r && bun run lint -r`.

---

## 8 Next Actions
1. Complete Phase 0 scaffolding (workspaces, ESLint config, empty packages).
2. Kick off **LLM-D** on Phase 1a; deliver Domain models, schemas, tests.
3. Immediately spin **LLM-A** to draft service interfaces (Phase 1b).
4. Review & freeze contracts, then unleash full parallelism for Phase 2.

---

This document is the single source of truth. Update it whenever architecture, tooling, or LLM workflow rules evolve.