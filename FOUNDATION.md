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
| Runtime | Node.js 22 |
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
| `image` | `mcr.microsoft.com/devcontainers/typescript-node:22` | Official, maintained, Node 22 |
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
2. Setup Node.js 22          (actions/setup-node@v6)
3. npm ci
4. Copy .env.ci → .env
5. npm run lint              (ESLint across all .ts files)
6. npm audit                 (all dependencies, not --production only)
7. npm run build             (all packages and apps in dependency order)
8. npm run test              (Vitest)
```

> **NOTE:** CI pipeline (`ci.yml`) is complemented by CodeQL static analysis
> (`codeql.yml`) which runs in parallel on every PR. See Section 7.9.
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


Build command: `npm ci && npm run build && npm prune --omit=dev`

Rationale: `npm ci` installs all dependencies including devDependencies
(TypeScript, types). `npm run build` compiles TypeScript to JavaScript.
`npm prune --omit=dev` removes devDependencies before the server starts,
keeping the runtime slim and reducing attack surface. `--omit=dev` is the
current npm v7+ standard. `--production` is deprecated.

CONSTRAINT: Never use `npm ci --include=dev` as a build command. It is a
workaround for a self-inflicted problem. The correct fix is to never set
NODE_ENV in the Render dashboard — see Section 10 Decision Log.


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


**`@types/node` pinned to `22.x`:**
```json
"@types/node": "22.19.17"
```
Reason: `@types/node` is a dev-only type definition package. The version major
must match the Node.js runtime major (Node.js 22 on Render). Using a higher
major (e.g. `25.x`) introduces API types that do not exist at runtime, causing
silent correctness issues. Pinned to `22.19.17` (latest `22.x` patch at time
of Node 22 upgrade). Dependabot is configured to **ignore** `23.x` and above —
patch updates within `22.x` are allowed.


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

### When to Use `git commit --amend` + `--force-with-lease`

**Use case:** A fix belongs to the same logical unit as the previous commit
on a feature branch — not a separate concern.

```bash
# Fix belongs to previous commit (e.g. correcting a version pin)
git add <fixed-file>
git commit --amend --no-edit          # rewrites last commit in place
git push origin <branch> --force-with-lease  # safe overwrite

# Never use bare --force
# Never amend commits that have already been merged to main
```

**Why `--force-with-lease` over `--force`:**
`--force-with-lease` only overwrites the remote if no one else has pushed
since your last pull. On a solo branch it behaves identically to `--force`
but the habit is correct for any collaborative environment.


### 7.8 GitHub Security & Analysis Settings

Location: GitHub → repo → Settings → Security & Analysis

#### Current State

| Feature | Status | Notes |
|---|---|---|
| Security advisories | ✅ Enabled (GitHub default) | View/disclose advisories |
| Secret scanning alerts | ✅ Enabled (GitHub default) | GitHub auto-enabled for all public repos (Feb 2024) |
| Push protection | ✅ Enabled (GitHub default) | Blocks pushes containing secrets before they land |
| Dependency graph | ✅ Enabled | Required foundation for Dependabot alerts |
| Dependabot alerts | ✅ Enabled | Alerts on vulnerable dependencies via GitHub Advisory Database |
| Dependabot malware alerts | ✅ Enabled | Alerts if an installed package is later flagged as malware |
| Dependabot version updates | ✅ Handled via `dependabot.yml` | See Section 7.6 |
| Code scanning (CodeQL) | ✅ Enabled | `.github/workflows/codeql.yml` — see Section 7.9 |
| Security policy | ⏸️ Skipped | Optional — relevant for team/public contributor projects |
| Private vulnerability reporting | ⏸️ Skipped | Not needed for solo project |
| Dependabot security updates (UI) | ⏸️ Disabled intentionally | Would create uncoordinated PRs outside `dependabot.yml` control |
| Grouped security updates (UI) | ⏸️ Disabled intentionally | Only relevant if UI security updates were enabled |
| Automatic dependency submission | ⏸️ Skipped | Build-time deps (Maven, Gradle) — not relevant for npm |

#### Key Decisions

**Why "Dependabot security updates" UI toggle is disabled:**
The `dependabot.yml` file already manages all update PRs in a controlled,
reviewed, CI-gated flow. Enabling the UI toggle creates a second, parallel
PR stream outside that configuration. The two would conflict and duplicate.
The `dependabot.yml` approach is more explicit and auditable — it wins.

**Why secret scanning and push protection were already on:**
GitHub enabled these by default for all free public repositories in February 2024.
They required no action. Push protection is the most important of the two — it
blocks a push before the secret ever lands in the repo.

**Why malware alerts matter:**
Dependabot malware alerts fire if a package already installed in your repo is
later identified as malware — this is exactly the Axios supply chain attack
pattern (March 2026). Standard Dependabot alerts cover CVEs; malware alerts
cover the active compromise scenario.


### 7.9 CodeQL Static Analysis (`codeql.yml`)

Triggers: push to `main`, every pull request, weekly schedule (Monday 04:27 UTC)
Jobs (parallel, fail-fast: false):
Analyze (javascript-typescript)
→ Builds semantic database of all TS/JS/HTML source
→ Runs 50+ security queries (injection, XSS, CORS issues, logic errors)
→ Results posted to Security → Code scanning alerts

Analyze (actions)
→ Scans all .github/workflows/*.yml files
→ Detects workflow misconfigurations and secret exposure patterns


**Languages covered:**

| Repo language | CodeQL value | Coverage |
|---|---|---|
| TypeScript 92.8% | `javascript-typescript` | ✅ Full |
| JavaScript 3.3% | `javascript-typescript` | ✅ Full — same extractor |
| HTML 3.9% | `javascript-typescript` | ✅ Inline scripts covered |
| GitHub Actions YAML | `actions` | ✅ Full |

**Permissions:**

```yaml
permissions:
  contents: read         # Read source files for analysis only
  security-events: write # Post results to GitHub Security tab only
```

No write access to code, branches, or secrets. Minimum required. [web:53]

**Performance:**
- First run builds full database — slowest run
- Subsequent runs use TRAP caching — only changed files reprocessed
- PR scans use incremental analysis (shipped May 2025) — up to 58% faster
  for TypeScript specifically

**Where to view results:**
GitHub → repo → Security → Code scanning alerts


> **CONSTRAINT:** Never disable CodeQL without a documented reason.
> Results appear in the Security tab, not as PR failures by default —
> check the Security tab after each merge.


### 7.10 Rate Limiting (`apps/api-service`)

Package: `express-rate-limit 7.5.0`
Applied: globally in `apps/api-service/src/index.ts` — before all routes

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  limit: 100,                 // max 100 requests per window per IP
  standardHeaders: "draft-8", // RFC-compliant RateLimit headers
  legacyHeaders: false,       // X-RateLimit-* headers disabled
  message: { error: "Too many requests, please try again later." },
});

app.use(limiter);             // global — protects all endpoints
```

**Why global placement (before routes):**
Every current and future endpoint is automatically protected.
No route can be accidentally left unguarded.

**Why `standardHeaders: "draft-8"`:**
Sends RFC-compliant `RateLimit` headers so clients know exactly
when their window resets. Industry standard — non-standard
`X-RateLimit-*` headers disabled.

**Why 100 requests / 15 minutes:**
Generous enough for legitimate use. Blocks hammering and
enumeration attacks. Revisit when real traffic patterns are known.


### 7.11 Helmet.js HTTP Security Headers (`apps/api-service`)

Package: `helmet 8.1.0`
Applied: globally in `apps/api-service/src/index.ts` — before `cors()` and `limiter`

```typescript
app.use(helmet());   // must be first — sets headers on every response
app.use(cors(...));
app.use(limiter);
```

**Middleware order (non-negotiable):**
helmet() → sets security headers on every response including error responses
cors() → applies origin policy
limiter → applies rate limiting
routes → business logic


**Headers set by `helmet()` defaults:**

| Header | Protection |
|---|---|
| `X-Powered-By` removed | Prevents stack fingerprinting |
| `Content-Security-Policy` | XSS — restricts executable scripts |
| `X-Frame-Options: SAMEORIGIN` | Clickjacking — blocks iframe embedding |
| `X-Content-Type-Options: nosniff` | MIME sniffing attacks |
| `Strict-Transport-Security` | SSL stripping — forces HTTPS |
| `Referrer-Policy` | Leaks URL info to third parties |

**Why Helmet goes before CORS and rate limiter:**
If CORS rejects a request before Helmet runs, that error response is sent
without security headers. Helmet must run first so every response —
including rejections — carries the correct headers.


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
| 7 | `@types/node` pinned to `20.0.0` — incompatible with TypeScript 6 | `packages/config/package.json` | ✅ Fixed — updated to `20.19.39` on branch `feature/rate-limiting`, then upgraded to `22.19.17` on branch `chore/node22-runtime-alignment` |
| 8 | `^` and `~` present in multiple `package.json` files across monorepo | `apps/api-service`, `apps/web-client`, `packages/config` | ✅ Fixed — all versions pinned exactly, `.npmrc` added with `save-exact=true` |
| 9 | `shared-types` compiles to CJS only. Vite (`web-client`) requires ESM. Workaround: `vite.config.ts` resolve alias points to `packages/shared-types/src/index.ts` directly. | `apps/web-client/vite.config.ts` | ⏸️ Deferred — proper fix is dual CJS/ESM packaging with `package.json` `exports` field. Revisit in hardening sprint. |


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
✔ GitHub Security & Analysis configured — see Section 7.8
✔ CodeQL static analysis configured (javascript-typescript + actions) — see Section 7.9
✔ deploy-frontend.yml permissions narrowed from contents:write to pages:write + id-token:write
✔ Explicit permissions added to all workflows — CodeQL alerts #1 #2 #3 resolved (CWE-275)
✔ Rate limiting added to API (express-rate-limit 7.5.0 — 100 req / 15 min global)
✔ Exact dependency versions enforced across full monorepo — .npmrc save-exact=true
✔ @types/node corrected from 20.0.0 → 20.19.39 (compatible with TypeScript 6)
✔ Helmet.js HTTP security headers added to API (helmet 8.1.0)
✔ SESSION.md created — AI session bookmark for context re-entry
✔ AI_POLICY.md updated — Context Loss Protocol added
✔ Structured logging with pino — request/response logging, header redaction,
  4xx=warn, 5xx=error, trust proxy for Render load balancer
✔ `workflow_dispatch` added to deploy-backend.yml — manual deploy escape hatch
✔ GitHub Actions pinned to commit SHA (supply chain attack prevention)
✔ Node.js runtime upgraded from 20 to 22 LTS across all layers — Dev Container,
  CI, deploy-frontend, @types/node pins (packages/config + apps/trading-client),
  Dependabot ignore list updated to allow 22.x patches
✔ API key authentication added to GET /trades — X-Api-Key header required, 401 returned
  on mismatch. Middleware at apps/api-service/src/middleware/auth.ts, mounted after
  rate limiter. API_KEY made required in Zod schema. Key stored in Render dashboard as
  secret env var. Browser key (VITE_API_KEY) is build-time visible in JS bundle —
  accepted for demo scope. See Section 10 and Known Gap 9.
```


### 9.2 Next — High Impact, Low Effort


```
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


### Why the Dependabot Security Updates UI Toggle Is Disabled

**Decision:** Leave "Dependabot security updates" UI toggle disabled in
GitHub Settings → Security & Analysis.
**Reason:** `dependabot.yml` already handles all PRs in a controlled, reviewed,
CI-gated flow. The UI toggle creates automatic PRs outside that flow —
duplicating effort and potentially conflicting with `dependabot.yml` group rules.
Explicit configuration in `dependabot.yml` always wins over UI toggles.
**Constraint:** If `dependabot.yml` is ever removed, re-evaluate this toggle.


### Why CodeQL Scans Both `javascript-typescript` and `actions`

**Decision:** Run two CodeQL matrix jobs — `javascript-typescript` and `actions`.
**Reason:** The `actions` scanner (generally available April 2025) detects
misconfigured GitHub Actions workflows — secret exposure, excessive permissions,
injection via untrusted input. Since our project's security model is heavily
workflow-based (6 workflow files), scanning the workflows themselves is as
important as scanning the application code.
**Constraint:** Both matrix entries must be kept. Removing `actions` would leave
our CI/CD pipeline unanalysed.


### Why All Workflows Have Explicit Top-Level Permissions

**Decision:** Add `permissions: contents: read` at workflow level to all workflows.
**Reason:** Without explicit permissions, GitHub Actions falls back to default wide
permissions which can include `contents: write`. CodeQL (actions scanner) flagged
this as CWE-275 on `ci.yml`, `deploy-backend.yml`, and `deploy-frontend.yml`.
**Rule:** Workflow level sets the safe minimum default. Job level overrides upward
only when a specific job genuinely needs elevated access (`deploy-frontend.yml`
deploy job: `pages: write` + `id-token: write`).
**Constraint:** Every new workflow must declare explicit permissions from the first commit.
This is now enforced by CodeQL — violations will appear as Medium alerts.


### Why `.npmrc` `save-exact=true` Is a Project Constraint

**Decision:** Add `.npmrc` with `save-exact=true` at monorepo root.
**Reason:** `npm install` adds `^` by default. This silently violated the
exact versions policy on every new package install. `.npmrc` makes
exact pinning automatic — no manual removal of `^` required.
**Constraint:** `.npmrc` must never be removed or overridden.
**Lesson learned:** After any dependency version change, always run
`npm ci` locally before committing — not `npm install`. `npm ci` deletes
`node_modules` and installs from `package-lock.json` exactly, replicating
CI conditions. `npm install` uses cached `node_modules` and can mask
incompatibilities that only surface in CI.


### Why `@types/node` Must Never Be Pinned to `x.0.0`

**Decision:** Pin `@types/node` to `20.19.39` (latest stable `20.x` patch).
**Reason:** `@types/node@20.0.0` is the day-one release of that major version.
It predates many TypeScript compatibility fixes. Pinning to it caused
TypeScript 6 compilation errors in `packages/config` — the only package
that declares `@types/node` as a direct dependency.
**Rule:** Always pin `@types/node` to the latest patch of the intended major
(`npm show @types/node@20 version` to check). Dependabot handles future
patch updates within `20.x` automatically.
**Constraint:** Never pin any `@types/*` package to its `.0.0` release.


### Why CodeQL Is Not a Merge Gate

**Decision:** CodeQL runs post-merge, results post to Security tab.
It is not added to branch protection required status checks.
**Reason:** CodeQL findings require human review before action — they are
not binary pass/fail like a build or test. Adding it as a hard gate
adds 8-10 minutes to every PR for informational output.
**Revisit when:** API handles real traffic or sensitive data. Adding CodeQL
to branch protection is a one-minute change in Settings → Branches.


### Why `npm ci` in CI, `npm ci` Locally After Dependency Changes

**Decision:** CI always uses `npm ci`. Locally, use `npm ci` after any
dependency version change before committing.
**Reason:** `npm install` reuses existing `node_modules` — it can mask
incompatibilities that only surface on a clean install. `npm ci` deletes
`node_modules` and installs exactly from `package-lock.json`, replicating
CI conditions precisely.
**Rule:** `npm install` → for adding new packages. `npm ci` → for
verifying the build is clean before committing.


### Why Helmet Middleware Order Is Non-Negotiable

**Decision:** `app.use(helmet())` is always the first middleware registered.
**Reason:** Security headers must be present on every response — including
CORS rejections, rate limit responses, and 404s. Any middleware registered
before Helmet can send a response without security headers.
**Constraint:** Never move Helmet below cors() or any other middleware.
Order: helmet → cors → limiter → routes.

### Why Root `package-lock.json` Triggers Both Deploy Pipelines

**Decision:** Both `deploy-frontend.yml` and `deploy-backend.yml` include
`package-lock.json` and root `package.json` in their path filters.
**Reason:** The root `package-lock.json` is the single source of truth for
all dependency versions across the monorepo. If a shared dependency changes,
both frontend and backend must redeploy against the updated dependency tree.
Filtering it out risks deploying a frontend or backend built against stale deps.
**Trade-off:** Occasional unnecessary deploys (e.g. adding a backend-only
package triggers a frontend redeploy). This is acceptable — GitHub Pages
deploys are free and fast. Safety over efficiency here.
**Revisit when:** Monorepo grows large enough that unnecessary deploys have
a real cost (build time, Render hours, etc.).


### Why NODE_ENV Must Never Be Set in the Render Dashboard

**Decision:** `NODE_ENV` must never be set in the Render dashboard environment variables.

**Reason:** Render's `npm ci` install step respects `NODE_ENV`. If set to `production`,
npm silently skips devDependencies — including `typescript` and `@types/node` — causing
TypeScript compilation to fail with errors like `husky: not found` and `tsc: not found`.
`NODE_ENV` is managed exclusively by dotenvx at runtime via `.env.production`.
The build phase must always have full access to devDependencies.

**Why not `--include=dev` as a permanent fix:** This flag installs ALL devDependencies
onto Render — including eslint, vitest, husky, and lint-staged. These tools have zero
purpose on a production server and unnecessarily increase the attack surface.
It compensates for a self-inflicted problem rather than fixing the root cause.

**Correct build command:** `npm ci && npm run build && npm prune --omit=dev`

**Render build context:** Docker multi-stage builds are available on the Render free
plan and are the professional long-term solution. Deliberately deferred — the current
`npm prune --omit=dev` pattern achieves the same runtime result without added Dockerfile
complexity. Revisit during the hardening sprint.

**Constraint:** Never set `NODE_ENV` in the Render dashboard. Never use
`--include=dev` as a permanent fix.


### Why GitHub Actions Are Pinned to Commit SHA

**Decision:** All `uses:` references in workflow files use full commit SHAs
instead of mutable version tags.
**Reason:** Version tags like `@v6` are mutable — a compromised maintainer
account or supply chain attack can silently retarget the tag to malicious code.
Your CI runs with `contents: read` access to the entire repo on every push.
A pinned SHA is immutable — the exact code reviewed is the exact code that runs.
This is the tj-actions/changed-files attack (March 2025) defense pattern.
**How pins are maintained:** Dependabot is already configured for the
`github-actions` ecosystem — it automatically opens PRs when a pinned SHA
has a newer version available. No manual SHA tracking required.
**Constraint:** Every new workflow `uses:` reference must be pinned to a
commit SHA on the first commit. Never merge a workflow using a tag reference.


### Why Node.js Was Upgraded from 20 to 22

**Decision:** Upgrade all Node.js version references from 20 to 22 LTS.
**Reason:** Node.js 20 reached end-of-life in March 2026. Render was already
running Node.js 22.22.0 in production. The project was misaligned — declaring
Node 20 while the live runtime was Node 22. Aligning to 22 LTS is correct and
necessary. Node.js 22 LTS security support runs until April 2027.
**Constraint:** All layers must declare the same Node.js major — Dev Container,
CI, and @types/node pins. Never let these drift independently again.
**Revisit when:** Node.js 24 becomes LTS (October 2026).


### Why `@types/node` Must Be Pinned Consistently Across All Monorepo Packages

**Decision:** Every package that declares `@types/node` must use the same exact
version — currently `22.19.17` in both `packages/config` and `apps/trading-client`.
**Reason:** `apps/trading-client` previously drifted to `25.5.0` because the
constraint was only documented for `packages/config`. A mismatched `@types/node`
across packages means different packages compile against different Node.js API
surface — TypeScript will accept calls to APIs that don't exist at runtime.
**Constraint:** When upgrading Node.js runtime, update ALL `@types/node` pins
in the same branch. Dependabot ignore list must also be updated in the same commit.
**How it's enforced:** Dependabot ignore list blocks `23.x`+ globally. Any
`@types/node` upgrade PR from Dependabot will be within `22.x` only.


### Why API Key Auth Uses a Static Shared Secret, Not JWT

**Decision:** `GET /trades` is protected by a static `API_KEY` shared secret via
`X-Api-Key` header. JWT was not used.

**Reason:** No human users exist in this system. JWT is for user session authentication.
A static shared secret is the correct pattern for machine-to-machine auth between a
single trusted client and a single trusted server.

**Browser caveat:** `VITE_API_KEY` is injected at Vite build time and is visible in
the compiled JS bundle. Accepted for demo/portfolio scope. A proxy pattern (server holds
the key, browser calls the proxy) is the correct long-term fix. Deferred to hardening sprint.

**Constraint:** Never use JWT for M2M auth where no user identity exists.
**Constraint:** `API_KEY` must be set as a secret env var in the Render dashboard.
Never commit a real key to any env file.


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
| Docker multi-stage production build | Available on Render free plan but deferred — `npm ci && npm run build && npm prune --omit=dev` achieves the same runtime result without Dockerfile complexity. Revisit during hardening sprint |

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


*Last updated: May 2026 — post pino structured logging + NODE_ENV constraint*
*Maintained by: PuguDev*
