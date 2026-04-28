# FOUNDATION.md — Trading System Engineering Foundation Document

> **Document Type:** Engineering Foundation Document (Technical Charter)
> **Status:** Living Document — update when architecture, goals, or constraints change
> **Audience:** Engineers (human and AI) working on this project
> **Companion Files:** `README.md` (operational setup), `AI_POLICY.md` (AI tool rules)

---

## What This Document Is

This is the **source of truth** for the `trading-system` project. It answers:
- What this project is and what its real goals are
- Why every major architectural decision was made
- What constraints must never be violated
- What is done, what is pending, and what is intentionally deferred

This document is written in the **professional build sequence** — the order in which this project should be understood and extended, regardless of how it was originally discovered.

> If this document conflicts with any other `.md` file in the repo, **this document wins**.

---

## 1. Project Identity

### 1.1 What It Is

A full-stack TypeScript monorepo containing three applications — an Express API, a Node.js CLI trading client, and a Vite web frontend — deployed to Render (backend) and GitHub Pages (frontend).

### 1.2 What It Is Really

The trading domain is the **vehicle**, not the destination. The real project is:

> A professional-grade engineering foundation demonstrating DevSecOps principles, secure AI-assisted development, and production-grade CI/CD — designed to be reusable across any business domain.

### 1.3 Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Language | TypeScript 6 (strict mode) |
| Backend framework | Express 5 |
| Frontend build | Vite 8 |
| Validation | Zod 4 |
| Testing | Vitest |
| Monorepo | npm workspaces |
| Linting | ESLint 10 + typescript-eslint |
| Pre-commit | Husky + lint-staged |
| CI/CD | GitHub Actions |
| Backend hosting | Render (auto-deploy) |
| Frontend hosting | GitHub Pages (auto-deploy) |
| Dev environment | WSL2 → Ubuntu → Docker Dev Container |

---

## 2. Core Goals

These are the goals of the project. The trading domain is incidental — these goals apply to any future project built from this foundation.

### Goal 1 — Learn by Doing, Not by Reading
Every concept is implemented hands-on. No theoretical shortcuts. Understanding WHY each layer exists is more important than having it configured correctly by copy-paste.

### Goal 2 — Build a Reusable Foundation for Any Project
The monorepo structure, Dev Container, CI/CD pipeline, shared packages, and env system are domain-agnostic. This foundation can be cloned and redirected to any business domain with minimal changes.

### Goal 3 — Security as Engineering, Not an Afterthought
DevSecOps thinking: security is baked into the system at every layer, not added after the fact. Every security decision has a reason. Every constraint is enforced, not just documented.

### Goal 4 — Use AI Safely and Professionally
The environment must be strong enough that AI tools (Copilot, Cursor) are **contained actors**, not trusted agents. AI accelerates work; the system controls what AI can affect.

### Goal 5 — Real CI/CD, Not Fake Automation
The pipeline enforces lint, security audit, build, and tests on every push. Deployment is automatic but gated. The pipeline is the enforcer — not a status badge.

### Goal 6 — Document Like a Professional Team
Every major architectural decision is recorded. The project is onboardable by a stranger — human or AI — without access to the original conversation.

### Goal 7 — Build in Layers — Right Thing at the Right Time
Never add complexity before it is needed. Advanced tooling solves real problems. The `advanced-concepts-for-future.md` content (now in Section 10 of this document) records what was intentionally deferred and why.

---

## 3. Development Environment

### 3.1 The Full Stack

```
Windows 11 (Host)
    └── WSL2
        └── Ubuntu
            └── ~/projects/trading-system    ← code lives HERE (not on Windows filesystem)
                └── VS Code (WSL Remote extension)
                    └── Dev Container: trading-system-dev
                        └── node user (non-root)
                            └── Applications run here
```

### 3.2 Why Each Layer Exists

| Layer | Purpose | Security Role |
|---|---|---|
| **Windows host** | GUI and tooling only | No code, no execution |
| **WSL2 → Ubuntu** | Linux kernel, native filesystem performance | Code at `/home/projects/`, not `/mnt/c/` |
| **VS Code WSL Remote** | IDE backend runs inside Linux | Extensions execute in Linux context |
| **Dev Container** | Blast radius limiter | AI and code cannot reach the host |
| **`node` user (non-root)** | Least privilege application execution | Cannot modify system, cannot escalate |

### 3.3 Non-Negotiable Rule

> ⚠️ **CONSTRAINT:** Security only applies when VS Code is opened through the Dev Container.
> The VS Code status bar must show `[Dev Container: trading-system-dev]` before any
> development or AI-assisted work begins. Opening the project directly in WSL or Windows
> bypasses all container-level security.

### 3.4 Dev Container Configuration

File: `.devcontainer/devcontainer.json`

| Setting | Value | Why |
|---|---|---|
| `image` | `mcr.microsoft.com/devcontainers/typescript-node:20` | Official, maintained, Node 20 |
| `remoteUser` | `node` | Non-root execution |
| `--cap-drop=ALL` | All Linux capabilities dropped | Least privilege at kernel level |
| `--security-opt=no-new-privileges` | Cannot escalate privileges | Prevents privilege escalation |
| `--pids-limit=1024` | Max 1024 processes | Fork bomb protection |
| `--dns=8.8.8.8` | Explicit DNS | Prevents DNS hijacking |
| `postCreateCommand` | `npm install` | Auto-install on container start |

---

## 4. Architecture

### 4.1 Monorepo Structure

```
trading-system/
├── apps/
│   ├── api-service       → Express 5 REST API (deployed: Render)
│   ├── trading-client    → Node.js CLI (local execution)
│   └── web-client        → Vite browser frontend (deployed: GitHub Pages)
├── packages/
│   ├── config            → Shared env loading, Zod validation, secrets gate
│   └── shared-types      → Shared Trade type + Zod schema
├── .devcontainer/        → Dev Container definition
├── .github/workflows/    → CI/CD pipelines
├── FOUNDATION.md         ← This file
├── README.md             → Setup and usage
└── AI_POLICY.md          → AI tool access rules
```

### Monorepo Workflow Note
After any schema/type change in `packages/shared-types`, always run `npm run build`
inside `packages/shared-types` before consuming it in any app. The TypeScript
compiler reads from `dist/`, not `src/`.

### 4.2 Dependency Graph

```
apps/api-service     →  packages/config  →  (dotenv, zod)
apps/api-service     →  packages/shared-types  →  (zod)
apps/trading-client  →  packages/config
apps/trading-client  →  packages/shared-types
apps/web-client      →  (standalone, Vite, uses VITE_API_URL)
```

### Dependency Version Policy
This project uses exact versions (no `^` or `~`) for all dependencies.
This ensures reproducible builds and conscious, controlled upgrades.
Future addition: Dependabot auto-PR configuration to prevent silent drift.

> **CONSTRAINT:** Packages never depend on apps. Apps depend on packages. This direction must never be reversed.

### 4.3 Application Responsibilities

**`apps/api-service`**
- Serves trade data at `GET /trades`
- CORS restricted to `ALLOWED_ORIGINS` — rejects all other origins
- Loads secrets via `loadSecrets("server-init")` before any other logic
- Validates all env at startup via Zod — crashes fast if config is wrong

**`apps/trading-client`**
- CLI tool — accepts optional `symbol` argument via `process.argv[2]`
- Fetches trades from live API with retry (2 retries) and timeout (3000ms)
- Validates API response at runtime using Zod (`TradesArraySchema.parse`)
- Calculates P&L, win rate, net result — prints formatted report

**`apps/web-client`**
- Vite browser app — fetches `GET /trades` from `VITE_API_URL`
- Renders trade data to DOM
- ⚠️ **KNOWN GAP:** No Zod validation on API response (see Section 8)

**`packages/config`**
- Loads `.env.{NODE_ENV}` → fallback `.env` → validates with Zod schema
- Exports validated `env` object: `PORT`, `API_URL`, `ALLOWED_ORIGINS`, optional `API_KEY`
- `loadSecrets(context)` — context-gated secrets loader (see Section 5.3)
- ⚠️ **KNOWN GAP:** `typescript` missing from `devDependencies` (see Section 8)

**`packages/shared-types`**
- Single source of truth for the `Trade` type
- Uses Zod schema + type inference: `TradeSchema` → `Trade`
- Used by all apps — never define the Trade type elsewhere

---

## 5. Security Model

### 5.1 Security Layers (Outside → Inside)

```
Layer 1: Dev Container isolation         (Docker runtime)
Layer 2: Non-root user                   (node user, no sudo)
Layer 3: Capability restrictions         (--cap-drop=ALL)
Layer 4: Privilege escalation block      (no-new-privileges)
Layer 5: Process limits                  (pids-limit=1024)
Layer 6: CORS enforcement                (ALLOWED_ORIGINS check)
Layer 7: Runtime type validation         (Zod on all inputs)
Layer 8: Context-gated secrets           (loadSecrets() guard)
Layer 9: AI file access control          (.aiignore, .cursorignore)
Layer 10: AI behavior policy             (AI_POLICY.md)
```

### 5.2 Environment File Strategy

| File | Content | Committed |
|---|---|---|
| `.env.development` | Non-sensitive dev config | ✅ Yes |
| `.env.production` | Non-sensitive prod config | ✅ Yes |
| `.env.ci` | CI-safe values, no real secrets | ✅ Yes |
| `.env.example` | Template for onboarding | ✅ Yes |
| `.env.secrets` | Sensitive values (API keys, tokens) | ❌ Never |
| `.env` | Local fallback | ❌ Never |

> **CONSTRAINT:** Never move secrets into `.env.{environment}` files.
> **CONSTRAINT:** Never add new env vars without adding them to the Zod schema in `packages/config/src/env.ts`.

### 5.3 Secrets Gate

The `loadSecrets()` function in `packages/config/src/env.ts` enforces controlled access:

```typescript
loadSecrets("server-init")   // ✅ Only allowed context
loadSecrets()                // ❌ Throws — missing context
loadSecrets("anything-else") // ❌ Throws — not in allowedContexts
```

This means secrets cannot be loaded silently, accidentally, or by AI-generated code that doesn't know the correct context string.

> **CONSTRAINT:** Never add new allowed contexts to `loadSecrets()` without a documented reason.
> **CONSTRAINT:** `loadSecrets()` must always be the first call in any server entry point.

### 5.4 AI Access Controls

| File | Purpose |
|---|---|
| `.aiignore` | Blocks AI tools from reading `.env*`, secrets, dist, logs |
| `.cursorignore` | Same restrictions for Cursor specifically |
| `AI_POLICY.md` | Behavioral rules — what AI can and cannot suggest |

> **CONSTRAINT:** These three files must be reviewed and kept current whenever new sensitive file patterns are added to the project.

---

## 6. Professional Build Sequence

This is the correct sequence for building this project — or any project of this type — from scratch. This sequence represents the mental model for all future projects.

### Phase 0 — Define Before You Build
```
1. Define what is being built (domain, type, language, runtime)
2. Define non-functional requirements (security, AI usage, deployment targets)
3. Sketch architecture (apps, packages, communication)
4. Write FOUNDATION.md FIRST — as a spec, before any code
```
> Nothing is built until the destination is understood.

### Phase 1 — Secure the Development Environment
```
1. Set up WSL → Ubuntu
2. Create Dev Container (.devcontainer/devcontainer.json)
   - Non-root user, --cap-drop=ALL, --security-opt=no-new-privileges, --pids-limit
3. Verify VS Code opens inside container
4. Set up .gitignore, .aiignore, .cursorignore, AI_POLICY.md
```
> Every line of code is written inside the secure environment. The environment is the first deliverable.

### Phase 2 — Project Skeleton and Code Quality Gates
```
1. Initialize monorepo (npm workspaces, /apps, /packages)
2. TypeScript strict mode across all packages
3. ESLint configuration
4. Husky + lint-staged (pre-commit hook)
5. .env.example with ALL fields documented
```
> Quality gates exist before code. Pre-commit hooks enforce standards from commit #1.

### Phase 3 — Shared Packages Before Apps
```
1. packages/shared-types  → Trade type + Zod schema
2. packages/config        → Env loader + Zod validation + loadSecrets()
```
> Apps depend on packages — packages are built first. Never the reverse.

### Phase 4 — Build Apps Against the Contracts
```
1. apps/api-service    → Express + CORS + /trades endpoint
2. apps/trading-client → CLI + TradeProcessor + Zod validation on API response
3. apps/web-client     → Vite + fetch + Zod validation on API response
```
> Apps are built knowing exactly what types and config they have available.

### Phase 5 — Tests Alongside Logic
```
1. Unit tests written as each logic unit is created
2. TradeProcessor.test.ts exists because TradeProcessor.ts exists
3. CI runs tests from the first pipeline run
```
> Tests are part of the feature, not a cleanup task after the fact.

### Phase 6 — CI Pipeline Before First Deployment
```
1. ci.yml — lint → audit (no --production flag) → build → test
2. GitHub Actions permissions block (IAM) — scoped per workflow
3. Actions pinned to commit SHA (supply chain security)
4. .env.ci for CI-safe values
```
> The pipeline is the gatekeeper. It must exist before the gate it guards.

### Phase 7 — Deployment
```
1. Backend → Render (auto-deploy from main, environment vars in Render dashboard)
2. Frontend → GitHub Pages (deploy-frontend.yml, path-filtered to web-client changes)
3. VITE_API_URL injected from GitHub repository variables
4. End-to-end verification: browser → GitHub Pages → Render → API response
```

### Phase 8 — Documentation
```
Written per phase, not at the end:
- FOUNDATION.md     → Phase 0 (spec) → updated throughout
- README.md         → Phase 1
- AI_POLICY.md      → Phase 1
```
> Documentation written when the decision is made, not reconstructed from memory.

### Phase 9 — AI-Augmented Development
```
1. VS Code AI extension setup (Copilot or Codeium)
2. Safe usage rules aligned with AI_POLICY.md
3. Prompt discipline and templates
4. AI workflow integrated into Git + CI
```
> AI is a force multiplier. It is introduced only after the foundation is strong enough to contain it.

---

## 7. CI/CD Pipeline

### 7.1 CI Pipeline (`ci.yml`)

Triggers: every push to `main`, every pull request.

```
Steps:
1. Checkout repository
2. Setup Node.js 20
3. npm ci
4. Copy .env.ci → .env
5. npm run lint          (ESLint across all .ts files)
6. npm audit             (all dependencies, not --production only)
7. npm run build         (all packages and apps in dependency order)
8. npm run test          (Vitest)
```

> **CONSTRAINT:** Never use `npm audit --production`. Dev dependency vulnerabilities are real risks.

### 7.2 Frontend Deployment (`deploy-frontend.yml`)

Triggers: push to `main` **only when** these paths change:
- `apps/web-client/**`
- `packages/shared-types/**`
- `package.json` / `package-lock.json`
- `.github/workflows/deploy-frontend.yml`

```
Steps:
1. Checkout, Node 20, npm ci
2. npm run build:web  (VITE_API_URL injected from GitHub vars)
3. Deploy dist/ to GitHub Pages via peaceiris/actions-gh-pages@v4
```

### 7.3 GitHub Actions IAM

> **CONSTRAINT:** Every workflow must declare explicit `permissions`. No workflow runs with default wide permissions.

```yaml
# ci.yml
permissions:
  contents: read

# deploy-frontend.yml
permissions:
  contents: write   # Required for gh-pages branch
```

---

## 8. Known Gaps

These are real issues identified by code review. They do not break the system but must be resolved.

| # | Gap | File | Status |
|---|---|---|---|
| 1 | `.env.example` missing `ALLOWED_ORIGINS` and other fields | `.env.example` | ✅ Fixed — branch `fix/known-gaps` |
| 2 | `typescript` missing from `devDependencies` | `packages/config/package.json` | ✅ Fixed — branch `fix/known-gaps` |
| 3 | `npm audit --production` flag in CI skips devDependency vulnerabilities | `.github/workflows/ci.yml` | ✅ Fixed — branch `fix/known-gaps` |
| 4 | No Zod validation on API response in web client | `apps/web-client/src/main.ts` | ✅ Fixed — branch `fix/known-gaps` |
| 5 | `ALLOWED_OUTBOUND_HOSTS` declared in schema but never enforced | `packages/config/src/env.ts` | ⏸️ Deferred — requires infrastructure-level enforcement (egress firewall / reverse proxy). Cannot be enforced at application layer alone. Revisit in hardening sprint. |
| 6 | Render deploys on every push to any file — no path filtering | `.github/workflows/` | 📋 Logged — fix after `fix/known-gaps` merges. Replace with `deploy-backend.yml` with path filters. |

---

## 9. DevSecOps Roadmap

### 9.1 Completed

```
✔ Non-root Dev Container (--cap-drop=ALL, no-new-privileges, pids-limit)
✔ Context-gated secrets (loadSecrets() guard)
✔ Zod runtime validation on all API inputs (api-service, trading-client)
✔ CORS origin enforcement
✔ ESLint + Husky pre-commit hook
✔ npm audit in CI
✔ AI file access control (.aiignore, .cursorignore)
✔ AI behavioral policy (AI_POLICY.md)
✔ Env separation (dev / production / ci / secrets)
✔ Path-filtered deployments (frontend only redeploys on relevant changes)
✔ Type-safe shared contracts (shared-types package)
```

### 9.2 Next — High Impact, Low Effort

```
→ Fix 5 known gaps (Section 8)
→ GitHub Actions explicit permissions (IAM) — 5 minutes
→ Pin GitHub Actions to commit SHA (supply chain security) — 10 minutes
→ Phase 4: Safe AI Usage Setup (VS Code AI extension + rules + prompt discipline)
```

### 9.3 After Phase 4 — Medium Priority

```
→ SAST in CI (semgrep — static security analysis on code)
→ Secret scanning in CI (TruffleHog — blocks accidental secret commits)
→ Dependency Review action on PRs (GitHub native, zero config)
→ Zod validation on web-client API response (Gap #4)
→ Structured logging with pino (replaces console.log)
→ Integration tests (API + client together)
→ Prettier enforcement
```

### 9.4 Future — Lower Priority

```
→ SBOM generation (Software Bill of Materials)
→ Container image scanning with Trivy
→ OIDC token authentication for Render (replaces long-lived static tokens)
→ DAST with OWASP ZAP (dynamic attack testing against live API)
→ Distroless production container image
→ Advanced secret management (HashiCorp Vault or cloud secret manager)
→ Nx or Turborepo (when build times justify it)
→ Full browser frontend (React or similar)
→ Docker production multi-stage build
```

---

## 10. Decision Log

Key architectural decisions, why they were made, and what was considered.

### Why npm Workspaces over Nx / Turborepo

**Decision:** Use npm workspaces.
**Reason:** Sufficient for current project size. Manual workflows must be understood before automating them. Nx/Turborepo will be adopted when build times or dependency graph complexity justifies it.
**Revisit when:** Build times exceed 2 minutes or dependency graph becomes unmanageable.

### Why Render + GitHub Pages over other platforms

**Decision:** Render for backend, GitHub Pages for frontend.
**Reason:** Free tier available, auto-deploy from GitHub, zero infrastructure management. Suitable for a learning project.
**Revisit when:** Project requires persistent storage, custom domains, or advanced networking.

### Why Dev Container Before Business Logic

**Decision:** Dev Container defined and verified before any application code is written.
**Reason:** Every line of code should be written inside the secure environment. Environment is the first deliverable, not an afterthought.
**Constraint:** This order must be maintained in all future projects derived from this foundation.

### Why `.env.secrets` Over Direct `.env` Usage

**Decision:** Separate secrets into `.env.secrets`, loaded only via `loadSecrets("server-init")`.
**Reason:** Prevents accidental secret exposure in logs, AI tool reads, or accidental commits. Makes secret access intentional and auditable.
**Constraint:** Never consolidate secrets back into `.env.{environment}` files.

### Why Zod for Both Types and Validation

**Decision:** Use Zod for schema definition AND TypeScript type inference.
**Reason:** Single source of truth. The schema is the type. Runtime validation and compile-time types cannot drift apart.
**Constraint:** Never define a type manually when a Zod schema already exists for it.

### Why `AI_POLICY.md` as a Separate File

**Decision:** Keep `AI_POLICY.md` separate from `FOUNDATION.md`.
**Reason:** AI tools (Cursor, Copilot) are configured to look for specific policy files. A standalone `AI_POLICY.md` is machine-readable. It serves a different purpose than human-oriented documentation.

---

## 11. What Intentionally Does Not Exist Yet

The following are known, valid improvements that were deliberately deferred. They are not missing — they are scheduled.

| Feature | Why Deferred |
|---|---|
| Observability / structured logging | Not needed until real traffic exists |
| Advanced production hardening | Needed after real features are built |
| Scaling infrastructure | Premature at current project size |
| HTTPS in local development | Adds complexity before it solves a real problem |
| Rootless Docker | Advanced system configuration, not needed now |
| Private npm registry | Enterprise-level, not required for this project size |
| Deno / Bun runtime | No advantage over Node.js for current requirements |
| HashiCorp Vault | Overkill until multi-environment production deployments exist |

> A professional system is not built by adding everything at once. It is built by adding the right things at the right time.

---

## 12. The Next Project

This project (`trading-system`) is the **learning project**. A second project should be created when Phase 4 is complete, built using this document as its specification — not discovered organically.

The next project will:
- Use `FOUNDATION.md` as Phase 0 input (written before any code)
- Follow the Phase 0 → 9 sequence precisely
- Fix all 5 known gaps by design, not by patch
- Include GitHub Actions IAM and pinned SHA from the first commit
- Be domain-agnostic — a reusable template for any future project

---

*Last updated: April 2026*
*Maintained by: Navdeep Singh*
