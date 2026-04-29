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
| Frontend hosting | GitHub Pages (auto-deploy via GitHub Actions) |
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
├── .github/
│   ├── workflows/        → CI/CD pipelines
│   └── dependabot.yml    → Automated dependency update PRs
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
This project uses **exact versions** (no `^` or `~`) for all dependencies.
This ensures reproducible builds and conscious, controlled upgrades.
Dependabot is configured (`.github/dependabot.yml`) to surface updates as reviewed
PRs — preventing silent drift without blocking security patches. See Section 7.6.


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
- Validates API response at runtime using Zod (`TradesArraySchema.parse`)


**`packages/config`**
- Loads `.env.{NODE_ENV}` → fallback `.env` → validates with Zod schema
- Exports validated `env` object: `PORT`, `API_URL`, `ALLOWED_ORIGINS`, optional `API_KEY`
- `loadSecrets(context)` — context-gated secrets loader (see Section 5.3)
- `typescript` and `@types/node` present in `devDependencies`


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
   - Uses official actions/upload-pages-artifact@v3 + actions/deploy-pages@v4
   - GitHub Pages source set to "GitHub Actions" (not branch)
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
1. Checkout repository       (actions/checkout@v6)
2. Setup Node.js 20          (actions/setup-node@v6)
3. npm ci
4. Copy .env.ci → .env
5. npm run lint              (ESLint across all .ts files)
6. npm audit                 (all dependencies, not --production only)
7. npm run build             (all packages and apps in dependency order)
8. npm run test              (Vitest)
```


> **CONSTRAINT:** Never use `npm audit --production`. Dev dependency vulnerabilities are real risks.
> **CONSTRAINT:** Always use `actions/checkout@v6` and `actions/setup-node@v6`. Earlier versions
> emit Node.js deprecation warnings in CI. These are GitHub-official actions maintained for
> Node.js 24 compatibility.


### 7.2 Frontend Deployment (`deploy-frontend.yml`)


Triggers: push to `main` **only when** these paths change:
- `apps/web-client/**`
- `packages/shared-types/**`
- `package.json` / `package-lock.json`
- `.github/workflows/deploy-frontend.yml`


```
Jobs: build → deploy (sequential, deploy depends on build)

build job:
  1. Checkout, Node 20, npm ci
  2. npm run build -w packages/shared-types
  3. npm run build:web  (VITE_API_URL injected from GitHub vars)
  4. actions/upload-pages-artifact@v3  (uploads dist/ to GitHub Pages API)

deploy job:
  permissions: pages: write, id-token: write
  environment: github-pages
  5. actions/deploy-pages@v4
```


**GitHub Pages source setting:** Must be set to `"GitHub Actions"` (not "Deploy from branch").
Location: GitHub → repo → Settings → Pages → Source.


> **CONSTRAINT:** `shared-types` must be built before `build:web`. Any workflow
> consuming `shared-types` must explicitly run `npm run build -w packages/shared-types`
> first — the TypeScript compiler reads from `dist/`, not `src/`.
>
> **CONSTRAINT:** The `gh-pages` branch has been permanently deleted. Do not recreate it.
> All frontend deployments go through the GitHub Actions API, not a branch.


### 7.3 Backend Deployment (`deploy-backend.yml`)


Triggers: push to `main` **only when** these paths change:
- `apps/api-service/**`
- `packages/config/**`
- `packages/shared-types/**`
- `package.json` / `package-lock.json`
- `.github/workflows/deploy-backend.yml`


```
Steps:
  Trigger Render deploy via webhook
  curl --fail --silent --show-error -X POST $RENDER_DEPLOY_HOOK_URL
```


**Design decisions:**
- Render auto-deploy is **disabled** — GitHub Actions is the sole trigger
- `--silent` prevents the hook URL from appearing in logs
- `--fail` causes the step to fail on non-2xx response — broken deploys are visible in CI
- No `contents: write` permission needed — least privilege principle


> **CONSTRAINT:** Never re-enable Render auto-deploy. All deploys must be triggered
> from GitHub Actions to maintain path filtering and audit trail.


### 7.4 GitHub Actions IAM


> **CONSTRAINT:** Every workflow must declare explicit `permissions`. No workflow runs with default wide permissions.


```yaml
# ci.yml
permissions:
  contents: read

# deploy-backend.yml
permissions:
  contents: read

# deploy-frontend.yml — build job (no special permissions needed)
# deploy-frontend.yml — deploy job
permissions:
  pages: write       # Can only write to GitHub Pages — not any branch
  id-token: write    # OIDC token scoped to GitHub Pages API only
```


**Why `pages: write` + `id-token: write` is correct for frontend deploy:**
The previous approach used `contents: write` (required for the `gh-pages` branch pattern).
That gave the deploy job write access to **any branch** in the repository.
The current approach uses scoped permissions — the deploy job can only interact
with GitHub Pages. This is the least-privilege principle applied at the workflow level.


### 7.5 Branch Protection Rules


Applied to: `main` branch
Location: GitHub → Settings → Branches → Add rule


| Rule | Setting | Reason |
|---|---|---|
| Require a pull request before merging | ✅ Enabled | No direct pushes to main |
| Require status checks to pass | ✅ Enabled — `build-and-test` | Broken code cannot merge |
| Require branches to be up to date | ✅ Enabled | CI runs on latest code, no hidden conflicts |
| Require approvals | ❌ Disabled | Solo developer — GitHub blocks author from approving own PR |


**Key learnings:**
- `jobs.<job>.name` must be explicitly set in the workflow YAML. GitHub only detects
  **named** jobs for branch protection status checks. Anonymous jobs are invisible to
  the branch protection system.
- `Require branches to be up to date` forces `git pull` or rebase before merge,
  preventing the "it worked on my old base" class of bugs.
- **Bypass rules** ("Merge without waiting for requirements") overrides ALL protection
  including CI. Never use in normal workflow — emergency use only.

```
Enforcement flow:
Developer → Feature Branch → PR → CI (build-and-test must ✅ pass) → Merge to main
```


### 7.6 Dependabot Automated Dependency Updates


File location:
```
.github/dependabot.yml     ← CORRECT — Dependabot config lives here
.github/workflows/         ← WRONG — do not place dependabot.yml here
```


**Configuration:**
- **Schedule:** Weekly
- **Ecosystems covered:** `npm` + `github-actions`
- **Grouped PRs:** Enabled — reduces PR noise by batching related updates
- **Review before merge:** All Dependabot PRs are reviewed; CI must pass before merge


**`@types/node` pinned to `20.x`:**
```json
"@types/node": "20.x"
```
Reason: `@types/node` is a dev-only type definition package. Upgrading to `22.x`
or higher introduces Node.js 22 API types incompatible with our current runtime
(Node.js 20 on Render), causing TypeScript compilation errors on properties that
don't exist at runtime. Pinned to `20.x` until runtime is upgraded.
Dependabot is configured to **ignore** major/minor `@types/node` upgrades —
patch updates within `20.x` are still allowed.


**Why exact versions + Dependabot is the correct combination:**

| Approach | Risk |
|---|---|
| Loose versions (`^`, `~`) alone | Silent malicious updates — the Axios hack (March 2026) pattern |
| Exact versions alone | Security patches never applied; dependencies go stale |
| **Exact versions + Dependabot** ✅ | Controlled, reviewed, CI-gated updates — industry standard |

Exact versions prevent surprise installs. Dependabot surfaces updates as explicit PRs.
CI must pass before merge. This is the correct supply chain defense at every layer.


### 7.7 Git Workflow Rules


> **CONSTRAINT:** Always create your feature branch BEFORE staging or committing. Never stage or commit while on `main`.


**Correct order — always:**
```bash
git checkout main
git pull origin main
git checkout -b feature/your-branch-name   ← FIRST, before any git add
# make changes
git add .
git commit -m "your message"
git push origin feature/your-branch-name
```


**Never do this:**
```bash
# Making changes directly on main, then branching after staging
git add .                    ← staging while on main bypasses all protection
git commit -m "..."          ← commits directly to main
```


**Full cleanup after merge:**
```bash
git push origin --delete feature/your-branch-name   # remote delete
git checkout main
git pull origin main
git branch -d feature/your-branch-name              # local delete
```

Both remote AND local branch cleanup are required after every merge.
Stale branches create confusion and clutter the branch list.


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
| 6 | Render deploys on every push to any file — no path filtering | `.github/workflows/deploy-backend.yml` | ✅ Fixed — `deploy-backend.yml` created with path filters. Render auto-deploy disabled. |


---


## 9. DevSecOps Roadmap


### 9.1 Completed


```
✔ Non-root Dev Container (--cap-drop=ALL, no-new-privileges, pids-limit)
✔ Context-gated secrets (loadSecrets() guard)
✔ Zod runtime validation on all API inputs (api-service, trading-client, web-client)
✔ CORS origin enforcement
✔ ESLint + Husky pre-commit hook
✔ npm audit in CI (all dependencies, not --production only)
✔ AI file access control (.aiignore, .cursorignore)
✔ AI behavioral policy (AI_POLICY.md)
✔ Env separation (dev / production / ci / secrets)
✔ Path-filtered deployments (frontend and backend only redeploy on relevant changes)
✔ Type-safe shared contracts (shared-types package)
✔ Path-filtered backend deployment (deploy-backend.yml, Render webhook, auto-deploy disabled)
✔ PostCSS patched to 8.5.10+ (XSS vulnerability via unescaped </style>)
✔ Branch protection rules (PR required, build-and-test status check, up-to-date branch)
✔ Dependabot configured and running (npm + github-actions ecosystems, weekly, grouped PRs)
✔ Node.js deprecation warnings resolved — upgraded to actions/checkout@v6 and
  actions/setup-node@v6 (Node.js 24 compatible, no deprecation warnings in CI)
✔ All known npm vulnerabilities resolved (npm audit clean)
✔ Frontend deploy pipeline migrated from peaceiris/actions-gh-pages to official
  actions/upload-pages-artifact@v3 + actions/deploy-pages@v4
✔ gh-pages branch eliminated — frontend deploys via GitHub Actions API, not branch
✔ deploy-frontend.yml permissions narrowed from contents:write to pages:write + id-token:write
```


### 9.2 Next — High Impact, Low Effort


```
→ Rate limiting on API endpoints (express-rate-limit)
→ Helmet.js HTTP security headers
→ Auth enforcement on API endpoints
→ Structured logging with pino
→ Pin GitHub Actions to commit SHA (supply chain security)
→ Phase 4: Safe AI Usage Setup (VS Code AI extension + rules + prompt discipline)
```


### 9.3 After Phase 4 — Medium Priority


```
→ SAST in CI (semgrep — static security analysis on code)
→ Secret scanning in CI (TruffleHog — blocks accidental secret commits)
→ Dependency Review action on PRs (GitHub native, zero config)
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


### Why `peaceiris/actions-gh-pages` Was Replaced


**Decision:** Replaced `peaceiris/actions-gh-pages@v4` with official GitHub Actions
(`actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`).
**Reason:**
1. `peaceiris` is a third-party action maintained by a single developer. Third-party
   actions in the deploy path are a supply chain risk.
2. The action emits Node.js 20 deprecation warnings — it is not maintained for Node.js 24.
3. The official approach uses scoped permissions (`pages: write` + `id-token: write`)
   instead of broad `contents: write`. This directly enforces the least-privilege principle.
4. The `gh-pages` branch pattern required the deploy job to have write access to the
   repository's branch tree. The GitHub Actions API approach removes this entirely.
**Constraint:** Do not reintroduce `peaceiris` or any third-party deploy action for GitHub Pages.
The official GitHub-maintained actions are now the industry standard (2023+).


### Why `@types/node` Is Pinned to `20.x`


**Decision:** Pin `@types/node` to `20.x` in `packages/config/devDependencies`.
**Reason:** `@types/node` is a dev-only package providing TypeScript definitions for
Node.js APIs. Upgrading to `22.x` introduces type definitions for APIs that do not
exist in our Node.js 20 runtime on Render. This causes TypeScript compilation errors
on valid code. The pin will be lifted when the runtime is upgraded to Node.js 22+.
**Constraint:** Dependabot is configured to ignore `@types/node` major/minor upgrades.
Patch updates within `20.x` are allowed.


### Why Exact Versions + Dependabot Is the Correct Combination


**Decision:** Use exact versions in `package.json` AND configure Dependabot for
automated update PRs.
**Reason:** The Axios supply chain attack (March 2026) demonstrated that loose version
ranges (`^`, `~`) allow silent malicious version installs the moment a compromised
version is published. Exact versions prevent this. However, exact versions alone mean
security patches are never applied. Dependabot bridges this gap by surfacing every
update as a reviewable PR that must pass CI before merge.
The result: no surprise installs, no stale dependencies, no silent drift.
**Constraint:** Never reintroduce `^` or `~` version prefixes. All version updates
must come through Dependabot PRs with CI validation.


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


*Last updated: April 2026 — post fix/deploy-frontend-node24 branch*
*Maintained by: PuguDev*
