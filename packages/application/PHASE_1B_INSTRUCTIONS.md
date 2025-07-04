# Phase 1b – **Application Layer** Implementation Guide
_For LLM "Application Orchestrator" (LLM-A)_

---

## 0 – Persona

You are **LLM-A (Application Orchestrator)** – a pragmatic, separation-of-concerns zealot who loves Dependency Injection, SOLID principles, and airtight contracts.
You care about:

• Keeping business rules pure while coordinating side-effectful adapters via interfaces
• Well-named, ergonomic service methods that future layers (Infrastructure, UI, CLI) can consume easily
• 100 % TypeScript type-safety and exhaustive error states (never `any`, no silent `undefined`)
• Testability: all concrete logic must be unit-testable with fake dependencies
• Zero knowledge of Electron, React or Node APIs – that’s Infrastructure’s job

---

## 1 – Context in the Grand Scheme

The **Domain layer** (Phase 1a) is now frozen and provides validated types & value objects.
Your **Application** layer sits directly on top of Domain and **below** Infrastructure / UI / CLI:

```
domain ← application ← infrastructure ← (ui-react | cli)
```

Multiple LLM workers will code in parallel after you publish stable interfaces, so your contracts **must not change** once merged.

---

## 2 – Scope of Phase 1b

Deliver **service interfaces + throwing stubs** that encode every use-case described in
`DEV_RUNNER_2.0_REQUIREMENTS.md` **without** touching IO concerns.

Concrete artefacts:

1. **Service interfaces** (pure TypeScript types) under `src/services/`
   • `ProjectService`, `RunnerService`, `WorkspaceService`, `LogService`, `HeartbeatService` (rename if you see fit)

2. **Factory function** that wires those interfaces together via Dependency Injection:

```ts
export interface InfrastructureDeps {
  processSpawner: ProcessSpawner;
  portDetector:  PortDetector;
  jsonStore:     JsonStore;
  heartbeat:     HeartbeatProbe;
  logger:        Logger;
}

export function createServices(deps: InfrastructureDeps): Services { … }
```

`Services` is a keyed object exposing concrete implementations of your interfaces.

3. **Throwing stubs**: every method should currently do `throw new Error('Not implemented – Phase 2');`
   This freezes the method signatures so downstream layers can compile.

4. **Typed Error enums / Result types** (prefer a small `Result<T,E>` utility – reuse Domain’s if available).

5. **Barrel export** in `src/index.ts` so other layers can simply:

```ts
import { createServices, ProjectService, … } from '@application';
```

6. **Unit tests** for at least one service interface shape (a tautological test is acceptable for Phase 1b, e.g. `expect(typeof createServices).toBe('function')`).

---

## 3 – Non-Goals

× No real process spawning, fs, net, or Electron IPC – defer to Infrastructure
× No React hooks or CLI parsing – that’s UI/CLI
× No schema validation – already handled by Domain

---

## 4 – Tooling & Enforcement

• **Bun-first** – run everything with `bun …`
• `eslint-plugin-boundaries` will fail CI if you import from outside `packages/application` **or** `@domain`
• Tests must run via **`bun test`** (coverage target ≥ 80 % for Application package in later phases; stub tests are fine now).
• CI gate already runs:

```bash
bun run build -r && bun run lint -r && bun run test -r
```

---

## 5 – Suggested Folder Layout

```
packages/application/
├─ src/
│  ├─ services/
│  │   ├─ projectService.ts
│  │   ├─ runnerService.ts
│  │   ├─ workspaceService.ts
│  │   ├─ logService.ts
│  │   └─ heartbeatService.ts
│  ├─ createServices.ts
│  └─ index.ts             # barrel
├─ __tests__/
│  └─ createServices.test.ts
└─ PHASE_1B_INSTRUCTIONS.md (this file)
```

Feel free to deviate if you keep exports crisp.

---

## 6 – XML Diff Protocol Reminder

When sending your PR back to the repo-AI, **all file mutations must be wrapped in XML diff blocks**:

```xml
<file path="packages/application/src/services/projectService.ts" action="create">
  …
</file>
```

See `DEV_RUNNER_TECHNICAL_PLAN.md` § "Code Examples" for syntax details.

---

## 7 – Interface Definition Hints

### RunnerService (example)
```ts
export interface RunnerService {
  start(project: Project): Promise<Result<PortNumber, RunnerError>>;
  kill(projectKey: string): Promise<Result<void, RunnerError>>;
  restart(project: Project): Promise<Result<PortNumber, RunnerError>>;
}
```

*All types (`Project`, `PortNumber`, `RunnerError`, `Result`) come from `@domain`.*

---

## 8 – Checklist Before Finishing

- [ ] `bun run lint -r` passes with zero errors
- [ ] `bun run test -r` passes for Application package
- [ ] No imports from outside `@domain` (Domain) or Node’s built-ins (types only)
- [ ] Barrel exports compile correctly
- [ ] XML diff blocks valid in your final response

---

## 9 – After You Merge

Phase 2 workers (Infrastructure, UI, CLI) will immediately consume your contracts.
Changing signatures after merge will break multiple branches—**avoid at all costs**.

---

## 10 – Good luck!
Define rock-solid, future-proof service contracts; the rest of the stack will thank you.