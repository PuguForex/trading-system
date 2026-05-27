# FOUNDATION.md

> Source of truth for completed and approved architecture decisions.
> Documentation updates occur after a topic, feature, or phase is completed and validated.
> Audience: engineers (human + AI).
> Companion: `README.md` (setup), `AI_POLICY.md` (AI rules).

---

## 1. Project Identity

### 1.1 What It Is

Polyglot monorepo — Express API + Node.js trading CLI + Vite web frontend + internal Python service.
Deployed/public: Render (api-service), GitHub Pages (frontend).
Deployed/internal: Render private service (python-service).

### 1.2 What It Really Is

Domain = vehicle. Real project = reusable secure engineering foundation demonstrating DevSecOps, AI containment, production CI/CD — applicable to any business domain.

### 1.3 Stack

| Layer                     | Technology                                               |
| ------------------------- | -------------------------------------------------------- |
| Node runtime              | Node.js 24 LTS latest                                    |
| Python runtime            | Python 3.13                                              |
| Languages                 | TypeScript (strict mode), Python                         |
| Backend                   | Express (compatible with Node 24 LTS)                    |
| Frontend build            | Vite (compatible with Node 24 LTS)                       |
| Python service            | FastAPI + Uvicorn                                        |
| Validation                | Zod (Node side)                                          |
| Testing                   | Vitest                                                   |
| Node monorepo             | npm workspaces                                           |
| Task orchestration        | Turborepo                                                |
| Python package management | uv                                                       |
| Linting                   | ESLint + typescript-eslint (compatible with Node 24 LTS) |
| Pre-commit                | Husky + lint-staged (compatible with Node 24 LTS)        |
| CI/CD                     | GitHub Actions                                           |
| Backend hosting           | Render (auto-deploy disabled — Actions-triggered only)   |
| Frontend hosting          | GitHub Pages (Actions-triggered only)                    |
| Dev environment           | WSL2 → Ubuntu → Docker Dev Container                     |

[!] All Node packages must be compatible with Node.js 24 LTS latest.
[!] Python runtime is standardized on 3.13 across devcontainer, CI, and `uv.lock`.

---

## 2. Core Goals

Goal 1 — Learn by doing. Every concept implemented hands-on. WHY > copy-paste.
Goal 2 — Reusable foundation. Monorepo, Dev Container, CI/CD, shared packages, env system = domain-agnostic.
Goal 3 — Security as engineering. DevSecOps baked in at every layer. Every constraint enforced, not just documented.
Goal 4 — AI containment. AI tools = contained actors, not trusted agents. System controls what AI can affect.
Goal 5 — Real CI/CD. Pipeline enforces lint, audit, build, tests on every push. Gate, not badge.
Goal 6 — Document completed architectural decisions and finalized implementation patterns. Documentation reflects stable, validated system behavior rather than work-in-progress exploration. Onboardable by any stranger (human or AI).
Goal 7 — Build in layers. Complexity added only when justified. Deferred items tracked in §11.

---

## 3. Development Environment

### 3.1 Stack

```
Windows 11 (Host)
  └── WSL2
      └── Ubuntu
          └── ~/projects/<project>    ← code lives HERE (not /mnt/c/)
              └── VS Code (WSL Remote)
                  └── Dev Container: <project>-dev
                      └── node user (non-root)
                          └── Applications run here
```

### 3.2 Layer Responsibilities

| Layer                  | Purpose                      | Security Role                            |
| ---------------------- | ---------------------------- | ---------------------------------------- |
| Windows host           | GUI + tooling only           | No code, no execution                    |
| WSL2 → Ubuntu          | Linux kernel, native FS perf | Code at `/home/projects/`, not `/mnt/c/` |
| VS Code WSL Remote     | IDE backend in Linux         | Extensions execute in Linux context      |
| Dev Container          | Blast radius limiter         | AI + code cannot reach host              |
| `node` user (non-root) | Least privilege execution    | Cannot modify system, cannot escalate    |

### 3.3 Non-Negotiable

[!] VS Code must show `[Dev Container: <project>-dev]` before any dev or AI work begins.
Opening directly in WSL or Windows bypasses all container-level security.

### 3.4 Dev Container Config

File: `.devcontainer/devcontainer.json`

| Setting                            | Value                                                    | Why                             |
| ---------------------------------- | -------------------------------------------------------- | ------------------------------- |
| `image`                            | `mcr.microsoft.com/devcontainers/typescript-node:24`     | Official, maintained, Node 24   |
| `remoteUser`                       | `node`                                                   | Non-root execution              |
| `--cap-drop=ALL`                   | All Linux capabilities dropped                           | Least privilege at kernel level |
| `--security-opt=no-new-privileges` | Cannot escalate                                          | Prevents privilege escalation   |
| `--pids-limit=1024`                | Max 1024 processes                                       | Fork bomb protection            |
| `--dns=8.8.8.8`                    | Explicit DNS                                             | Prevents DNS hijacking          |
| `postCreateCommand`                | `python3 -m pip install --user uv==0.7.3 && npm install` | Bootstraps both runtimes safely |

Python support is added through the Dev Container Python feature:

- `ghcr.io/devcontainers/features/python:1`
- version: `3.13`

[!] `uv` is pinned in devcontainer bootstrap. Never switch to unpinned installer scripts.

---

## 4. Architecture

### 4.1 Monorepo Structure

```text
<project>/
├── apps/
│   ├── api-service        → Express REST API (deployed: Render)
│   ├── trading-client     → Node.js CLI (local execution)
│   ├── web-client         → Vite browser frontend (deployed: GitHub Pages)
│   └── python-service     → Internal FastAPI service (deployed: Render internal)
├── packages/
│   ├── config             → Shared env loading, Zod validation, secrets gate
│   └── shared-types       → Shared domain type + Zod schema
├── .devcontainer/         → Dev Container definition
├── .github/
│   ├── workflows/         → CI/CD pipelines
│   └── dependabot.yml     → Automated dependency update PRs
├── turbo.json             → Root task graph
├── FOUNDATION.md          ← This file
├── README.md              → Setup and usage
└── AI_POLICY.md           → AI tool access rules
```

[!] After any schema/type Δ in `packages/shared-types` → run `npm run build` inside that package before consuming in apps. TypeScript compiler reads from `dist/`, not `src/`.

### 4.2 Dependency Graph

```text
apps/api-service        → packages/config        → (dotenv, zod)
apps/api-service        → packages/shared-types  → (zod)
apps/trading-client     → packages/shared-types
apps/web-client         → packages/shared-types
apps/python-service     → (fastapi, uvicorn)    ← app-local uv project
root package.json       → turbo                  ← task orchestration only
```

[!] Packages never depend on apps. Apps depend on packages. Direction must never be reversed.
[!] Python service currently does not consume shared cross-language config or schemas. That integration is intentionally deferred.

### 4.3 Dependency Version Policy

Exact versions only — no `^` or `~`. `.npmrc` enforces `save-exact=true`.
Dependabot surfaces updates as reviewed, CI-gated PRs. See §7.6.

### 4.4 Application Responsibilities

**`apps/api-service`**

- `GET /trades` endpoint
- CORS restricted to `ALLOWED_ORIGINS` — all other origins rejected
- `loadSecrets("server-init")` → first call before any other logic
- Zod env validation at startup — crashes fast on bad config
- Middleware order: helmet → pino-http logging (with header redaction) → CORS (allowedOrigins list validation) → rate limiter (100 req/15 min/IP, RFC headers) → requireApiKey → routes

**`apps/trading-client`**

- Optional `symbol` arg via `process.argv[2]`
- Fetch with retry (2) + timeout (3000ms)
- Zod validation on API response
- Calculates + prints P&L, win rate, net result

**`apps/web-client`**

- Vite SPA — fetches `GET /trades` from `VITE_API_URL`
- Zod validation on API response
- Renders data to DOM

**`apps/python-service`**

- App-local Python service managed through `uv`
- FastAPI app with `GET /health`
- Binds to `PORT` (default `8000`)
- Internal/private deployment target on Render
- No shared Python workspace at root
- No DB, no outbound networking, no public ingress in current phase

**`packages/config`**

- Loads `.env.{NODE_ENV}` → fallback `.env` → Zod validation
- Exports validated `env`: `PORT`, `API_URL`, `ALLOWED_ORIGINS`, optional `API_KEY`
- `loadSecrets(context)` — context-gated secrets loader (see §5.3)
- `typescript` + `@types/node` in `devDependencies`

**`packages/shared-types`**

- Single source of truth for shared domain type
- `TradeSchema` → `Trade` (Zod schema + type inference)
- Used by all apps — never define the type elsewhere

---

## 5. Security Model

### 5.1 Security Layers (Outside → Inside)

```
Layer 1:  Dev Container isolation         (Docker runtime)
Layer 2:  Non-root user                   (node user, no sudo)
Layer 3:  Capability restrictions         (--cap-drop=ALL)
Layer 4:  Privilege escalation block      (no-new-privileges)
Layer 5:  Process limits                  (pids-limit=1024)
Layer 6:  CORS enforcement                (ALLOWED_ORIGINS check)
Layer 7:  Runtime type validation         (Zod on all inputs)
Layer 8:  Context-gated secrets           (loadSecrets() guard)
Layer 9:  AI file access control          (.aiignore, .cursorignore)
Layer 10: AI behavior policy              (AI_POLICY.md)
```

### 5.2 Env File Strategy

| File               | Content                                     | Committed |
| ------------------ | ------------------------------------------- | --------- |
| `.env.development` | Non-sensitive dev config                    | ✅        |
| `.env.production`  | Non-sensitive prod config                   | ✅        |
| `.env.ci`          | CI-safe values, no real secrets             | ✅        |
| `.env.example`     | Onboarding template — all fields documented | ✅        |
| `.env.secrets`     | Sensitive values (API keys, tokens)         | ❌ Never  |
| `.env`             | Local fallback                              | ❌ Never  |

[!] Never move secrets into `.env.{environment}` files.
[!] Never add new env vars without adding to Zod schema in `packages/config/src/env.ts`.

### 5.3 Secrets Gate

```
loadSecrets("server-init")   → ✅ only allowed context
loadSecrets()                → ❌ throws — missing context
loadSecrets("anything-else") → ❌ throws — not in allowedContexts
```

Secrets cannot be loaded silently, accidentally, or by AI-generated code missing the correct context string.

[!] Never add new allowed contexts to `loadSecrets()` unless the change is documented before merge or release.
[!] `loadSecrets()` must always be first call in any server entry point.

### 5.4 AI Access Controls

| File            | Purpose                                                   |
| --------------- | --------------------------------------------------------- |
| `.aiignore`     | Blocks AI tools from reading `.env*`, secrets, dist, logs |
| `.cursorignore` | Same restrictions for Cursor                              |
| `AI_POLICY.md`  | Behavioral rules — what AI can/cannot suggest             |

[!] All three files must be reviewed + kept current when new sensitive file patterns are added.

---

## 6. Professional Build Sequence

### Phase 0 — Define Before Building

```
1. Define what is being built (domain, language, runtime)
2. Define non-functional requirements (security, AI usage, deployment)
3. Sketch architecture (apps, packages, communication)
4. Create an initial lightweight project outline before implementation
5. Update FOUNDATION.md after architecture or implementation topics are completed and validated
```

### Phase 1 — Secure Dev Environment

```
1. WSL → Ubuntu
2. Dev Container (.devcontainer/devcontainer.json)
   - non-root, --cap-drop=ALL, --security-opt=no-new-privileges, --pids-limit
   - Node base image + explicit Python feature
   - pinned `uv` bootstrap in `postCreateCommand`
3. Verify VS Code opens inside container
4. .gitignore, .aiignore, .cursorignore, AI_POLICY.md
```

### Phase 2 — Skeleton + Quality Gates

```
1. npm workspaces (/apps, /packages)
2. TypeScript strict mode across all packages
3. ESLint config
4. Husky + lint-staged
5. .env.example with ALL fields documented
```

### Phase 3 — Shared Packages First

```
1. packages/shared-types  → domain type + Zod schema
2. packages/config        → env loader + Zod + loadSecrets()
```

### Phase 4 — Apps Against Contracts

```text
1. apps/api-service      → Express + security middleware + endpoint
2. apps/trading-client   → CLI + data processor + Zod validation on response
3. apps/web-client       → Vite + fetch + Zod validation on response
4. apps/python-service   → FastAPI health service, isolated from Node shared packages for now
```

### Phase 5 — Tests Alongside Logic

```
1. Unit tests written as each logic unit is created
2. CI runs tests from first pipeline run
```

### Phase 6 — CI Pipeline Before Deployment

```text
1. ci.yml — setup Node + Python + uv → lint → audit → build → test
2. GitHub Actions permissions block — scoped per workflow
3. Actions pinned to commit SHA
4. .env.ci for CI-safe values
5. app-local Python dependency sync via `uv sync`
```

### Phase 7 — Deployment

```text
1. Backend → Render (path-filtered, Actions-triggered only)
2. Frontend → GitHub Pages (path-filtered, official Actions)
3. Python service → Render internal/private service (path-filtered, deploy-hook only)
4. VITE_API_URL injected from GitHub repository variables
5. End-to-end verification: browser → GitHub Pages → Render API
6. Internal verification: Render service → internal Python service health
```

### Phase 8 — Documentation

```
Documentation is updated after a feature, topic, or implementation phase is completed and verified:
- FOUNDATION.md  → finalized architecture and engineering decisions
- README.md      → finalized setup and operational workflows
- AI_POLICY.md   → finalized AI governance rules
```

### Documentation Timing Policy

```
Documentation should reflect completed and validated system behavior.

Do not continuously update documentation during exploratory implementation work.

Update documentation only when:
- a feature is complete
- architecture is finalized
- security decisions are confirmed
- CI/CD behavior is stable
- implementation is merged or approved
```

### Phase 9 — AI-Augmented Dev

```
1. VS Code AI extension setup
2. Safe usage rules aligned with AI_POLICY.md
3. Prompt discipline
4. AI workflow integrated into Git + CI
```

---

## 7. CI/CD Pipeline

### 7.1 CI (`ci.yml`)

Triggers: every push to `main`, every PR.

```text
1. Checkout (actions/checkout — SHA pinned)
2. Setup Node.js 24 (actions/setup-node — SHA pinned)
3. Setup Python 3.13 (actions/setup-python — SHA pinned)
4. Setup uv (astral-sh/setup-uv — SHA pinned)
5. npm ci
6. apps/python-service → uv sync
7. Copy .env.ci → .env
8. npm run lint
9. npm audit                  ← all deps, not --production
10. npm run build
11. npm run test
```

[!] Never use `npm audit --production`. Dev dep vulnerabilities are real risks.
[!] Always use SHA-pinned versions of setup actions.
[!] Python dependency resolution is app-local. No root Python workspace exists in current phase.

> CI pipeline (`ci.yml`) runs alongside CodeQL static analysis (`codeql.yml`) in parallel on every PR. See §7.9.

### 7.2 Frontend Deployment (`deploy-frontend.yml`)

Triggers: push to `main` when paths change:

- `apps/web-client/**`
- `packages/shared-types/**`
- `package.json` / `package-lock.json`
- `.github/workflows/deploy-frontend.yml`

```
Jobs: build → deploy (sequential)

build:
  1. Checkout, Node 24, npm ci
  2. npm run build -w packages/shared-types
  3. npm run build:web  (VITE_API_URL injected from GitHub vars)
  4. actions/upload-pages-artifact (uploads dist/ to GitHub Pages API)

deploy:
  permissions: pages:write, id-token:write
  environment: github-pages
  5. actions/deploy-pages
```

[!] `shared-types` must be built before `build:web`. Any workflow consuming `shared-types` must run `npm run build -w packages/shared-types` first.
[!] `gh-pages` branch permanently deleted. Do not recreate. All frontend deploys via GitHub Actions API.
GitHub Pages source: must be set to `"GitHub Actions"` (not "Deploy from branch").

### 7.3 Backend Deployment (`deploy-backend.yml`)

Triggers: push to `main` when paths change:

- `apps/api-service/**`
- `packages/config/**`
- `packages/shared-types/**`
- `package.json` / `package-lock.json`
- `.github/workflows/deploy-backend.yml`

```
Step: curl --fail --silent --show-error -X POST $RENDER_DEPLOY_HOOK_URL
```

- Render auto-deploy = disabled. GitHub Actions = sole trigger.
- `--fail` → non-2xx = visible CI failure
- `--silent` → hook URL never appears in logs
- `workflow_dispatch` enabled → manual deploy escape hatch

Build command (Render): `npm ci && npm run build && npm prune --omit=dev`
[!] Never use `--include=dev` as permanent fix. Never set `NODE_ENV` in Render dashboard — see §10.
[!] Never re-enable Render auto-deploy. All deploys must be triggered from GitHub Actions.
[!] Never set `NODE_VERSION` in Render dashboard — `.nvmrc` + `engines` control version via git.

### 7.4 GitHub Actions IAM

[!] Every workflow must declare explicit `permissions`. No workflow runs with default wide permissions.

```yaml
# ci.yml, deploy-backend.yml
permissions:
  contents: read

# deploy-frontend.yml — deploy job only
permissions:
  pages: write
  id-token: write
```

### 7.5 Branch Protection Rules

Applied to: `main`

| Rule                                     | Setting | Reason                   |
| ---------------------------------------- | ------- | ------------------------ |
| Require PR before merging                | ✅      | No direct pushes to main |
| Require status checks (`build-and-test`) | ✅      | Broken code cannot merge |
| Require branches up to date              | ✅      | CI runs on latest code   |
| Require approvals                        | ❌      | Solo developer           |

[!] `jobs.<job>.name` must be explicitly set in YAML. GitHub only detects named jobs for branch protection.
[!] Bypass rules override ALL protection including CI — emergency use only.

Enforcement flow:

```
feature branch → PR → CI (build-and-test ✅) → merge to main
```

### 7.6 Dependabot

File: `.github/dependabot.yml` (not in `workflows/`)

- Schedule: weekly
- Ecosystems: `npm` + `github-actions` + `uv`
- Grouped PRs: enabled
- All PRs: reviewed + CI must pass before merge
- `@types/node` pinned to `24.x` — Dependabot ignores `25.x`+
- Python updates scoped to `apps/python-service`

[!] Dependabot security updates UI toggle = disabled. `dependabot.yml` handles all PRs. UI toggle creates duplicate, uncontrolled PR stream.

### 7.7 Git Workflow Rules

[!] Create feature branch BEFORE staging or committing. Never stage/commit on `main`.

Correct order:

```bash
git checkout main && git pull origin main
git checkout -b <prefix>/<branch-name>   ← FIRST
# make changes
git add <files>
git commit -m "<type>: <message>"
git push origin <prefix>/<branch-name>
# PR → CI pass → merge
git checkout main && git pull origin main
git branch -d <prefix>/<branch-name>
git push origin --delete <prefix>/<branch-name>
```

Branch prefixes: `feature/` `fix/` `docs/` `security/` `chore/`
Commit types: `feat:` `fix:` `docs:` `security:` `chore:`

`git commit --amend` + `--force-with-lease`:

- Use when fix belongs to same logical unit as previous commit on feature branch
- Never amend commits already merged to `main`
- Never use bare `--force`

### 7.8 GitHub Security & Analysis Settings

| Feature                          | Status                    | Notes                                       |
| -------------------------------- | ------------------------- | ------------------------------------------- |
| Security advisories              | ✅                        | GitHub default                              |
| Secret scanning                  | ✅                        | GitHub default (all public repos, Feb 2024) |
| Push protection                  | ✅                        | Blocks secret-containing pushes             |
| Dependency graph                 | ✅                        | Required for Dependabot alerts              |
| Dependabot alerts                | ✅                        | GitHub Advisory Database                    |
| Dependabot malware alerts        | ✅                        | Active compromise detection                 |
| Dependabot version updates       | ✅                        | Via `dependabot.yml` §7.6                   |
| CodeQL                           | ✅                        | `codeql.yml` — see §7.9                     |
| Dependabot security updates (UI) | ⏸️ Disabled intentionally | Controlled via `dependabot.yml`             |
| Security policy                  | ⏸️ Skipped                | Solo project                                |
| Private vulnerability reporting  | ⏸️ Skipped                | Solo project                                |

### 7.9 CodeQL Static Analysis (`codeql.yml`)

Triggers: push to `main`, every PR, weekly (Monday 04:27 UTC)

Jobs (parallel, fail-fast: false):

- `javascript-typescript` → TS/JS/HTML semantic analysis, 50+ security queries
- `actions` → workflow misconfigs, secret exposure patterns

| Language            | CodeQL value            | Coverage          |
| ------------------- | ----------------------- | ----------------- |
| TypeScript          | `javascript-typescript` | ✅                |
| JavaScript          | `javascript-typescript` | ✅                |
| HTML                | `javascript-typescript` | ✅ inline scripts |
| GitHub Actions YAML | `actions`               | ✅                |

```yaml
permissions:
  contents: read
  security-events: write
```

Results → GitHub → Security → Code scanning alerts (not PR failures by default).
[!] Never disable CodeQL unless the change is documented before merge or release.
[!] Both matrix entries required. Removing `actions` leaves CI/CD pipeline unanalysed.

### 7.10 Rate Limiting (`apps/api-service`)

Package: `express-rate-limit` (compatible with Node 24 LTS)
Applied: globally before all routes.

Config: 100 req / 15 min / IP, `standardHeaders: "draft-8"`, legacy headers disabled.
[?] Applied before routes → every current + future endpoint automatically protected.

### 7.11 HTTP Security Headers (`apps/api-service`)

Package: `helmet` (compatible with Node 24 LTS)
Applied: first middleware — before cors, limiter, routes.

Headers set by `helmet()` defaults:

| Header                            | Protection                      |
| --------------------------------- | ------------------------------- |
| `X-Powered-By` removed            | Stack fingerprinting prevention |
| `Content-Security-Policy`         | XSS                             |
| `X-Frame-Options: SAMEORIGIN`     | Clickjacking                    |
| `X-Content-Type-Options: nosniff` | MIME sniffing                   |
| `Strict-Transport-Security`       | SSL stripping                   |
| `Referrer-Policy`                 | URL leakage                     |

[!] Helmet must run first — every response (including CORS rejections, 404s) carries security headers.
[!] Middleware order non-negotiable: `helmet → pino-http → cors → limiter → requireApiKey → routes`

---

## 8. Known Gaps

| #   | Gap                                                | File                                 | Status                                                                                                                          |
| --- | -------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `.env.example` missing fields                      | `.env.example`                       | ✅ Fixed                                                                                                                        |
| 2   | `typescript` missing from `devDependencies`        | `packages/config/package.json`       | ✅ Fixed                                                                                                                        |
| 3   | `npm audit --production` in CI                     | `.github/workflows/ci.yml`           | ✅ Fixed                                                                                                                        |
| 4   | No Zod validation on API response in web client    | `apps/web-client/src/main.ts`        | ✅ Fixed                                                                                                                        |
| 5   | `ALLOWED_OUTBOUND_HOSTS` declared but not enforced | `packages/config/src/env.ts`         | ⏸️ Deferred — requires infra-level enforcement (egress firewall/proxy). Not enforceable at app layer. Revisit hardening sprint. |
| 6   | Render deploys on every push — no path filtering   | `deploy-backend.yml`                 | ✅ Fixed                                                                                                                        |
| 7   | `@types/node` pinned to incompatible version       | `packages/config/package.json`       | ✅ Fixed — aligned to Node 24 LTS                                                                                               |
| 8   | `^` and `~` in multiple `package.json` files       | monorepo-wide                        | ✅ Fixed — exact versions + `.npmrc` `save-exact=true`                                                                          |
| 9   | `shared-types` ESM resolution for Vite             | `packages/shared-types/package.json` | ✅ Fixed — `exports` field added with `"import": "./src/index.ts"`                                                              |

---

## 9. DevSecOps Roadmap

### 9.1 Completed

```
✔ Non-root Dev Container (--cap-drop=ALL, no-new-privileges, pids-limit)
✔ Context-gated secrets (loadSecrets() guard)
✔ Zod runtime validation (api-service, trading-client, web-client)
✔ CORS origin enforcement
✔ ESLint + Husky pre-commit
✔ npm audit (all deps) in CI
✔ AI file access control (.aiignore, .cursorignore)
✔ AI behavioral policy (AI_POLICY.md)
✔ Env separation (dev/production/ci/secrets)
✔ Path-filtered deployments (frontend + backend)
✔ Type-safe shared contracts (shared-types)
✔ Backend deploy via Render webhook, auto-deploy disabled
✔ Branch protection rules (PR required, CI status check, up-to-date)
✔ Dependabot (npm + github-actions, weekly, grouped PRs)
✔ Exact versions + .npmrc save-exact=true
✔ SHA-pinned GitHub Actions (supply chain)
✔ Frontend deploy migrated to official actions/upload-pages-artifact + actions/deploy-pages
✔ gh-pages branch eliminated
✔ GitHub Security & Analysis configured (§7.8)
✔ CodeQL (javascript-typescript + actions) (§7.9)
✔ Explicit permissions on all workflows — CWE-275 resolved
✔ Rate limiting (express-rate-limit, 100 req/15 min global)
✔ Helmet.js HTTP security headers
✔ SESSION.md created
✔ AI_POLICY.md updated (Context Loss Protocol)
✔ Structured logging with pino (header redaction, log levels, trust proxy)
✔ workflow_dispatch on deploy-backend.yml (manual escape hatch)
✔ Node.js runtime upgraded to 24 LTS across all layers
✔ @types/node pinned to 24.x across all packages
✔ API key auth (X-Api-Key header, 401 on mismatch, middleware at apps/api-service/src/middleware/auth.ts)
✔ Phase 4: Copilot safe usage setup (devcontainer settings, copilot-instructions.md, AI_POLICY.md Copilot section)
✔ TruffleHog secret scanning — trufflehog.yml, PR diff only, --only-verified, SHA + version pinned
✔ Dependency Review action on PRs (`.github/workflows/dependency-review.yml`)
✔ Prettier enforcement implemented without CI
✔ Turborepo adopted as root task orchestrator
✔ Root packageManager field added for Turbo compatibility
✔ Python 3.13 devcontainer support added
✔ uv pinned in devcontainer bootstrap
✔ Internal FastAPI Python service added under `apps/python-service`
✔ uv lockfile committed for app-local Python dependency reproducibility
✔ CI extended with Python 3.13 + uv setup
✔ Dependabot extended for `uv`
✔ Render internal deploy workflow added for python-service
✔ trading-client test command changed to `vitest run` for CI/Turbo compatibility
```

### 9.2 Next — High Impact, Low Effort

```

```

### 9.3 After Phase 4 — Medium Priority

```
→ Semgrep (SAST in CI) — deferred; see §10 Decision Log
→ Integration tests (API + client)
→ Prettier enforcement with CI
```

### 9.4 Future — Lower Priority

```
→ SBOM generation
→ Trivy (container image scanning)
→ OIDC token auth for Render
→ OWASP ZAP (DAST)
→ Distroless production container
→ HashiCorp Vault
→ Expand Turborepo adoption to per-workspace lint/dev/test only when workspace contracts are standardized
→ Root Python workspace only when multiple Python apps/packages justify it
→ Cross-language shared schema/config strategy only when Python service needs real domain integration
→ React or advanced frontend
→ Docker production multi-stage build
→ Artifact attestations / provenance / build signing
```

---

## 10. Decision Log

Documentation timing rule:
Permanent architectural, security, CI/CD, or operational deviations must be documented before merge or release, not during exploratory implementation work.

### npm Workspaces over Nx/Turborepo

Manual workflows must be understood before automating. Revisit when build times exceed 2 min or dep graph becomes unmanageable.

### Render + GitHub Pages

Free tier, auto-deploy from GitHub, zero infra management. Revisit when persistent storage, custom domains, or advanced networking required.

### Dev Container Before Business Logic

Environment = first deliverable. Every line of code written inside secure container. Maintain this order in all derived projects.

### `.env.secrets` Over Direct `.env`

Prevents accidental exposure in logs, AI reads, or commits. Makes secret access intentional + auditable.
[!] Never consolidate secrets into `.env.{environment}`.

### Zod for Types + Validation

Single source of truth. Schema = type. Runtime + compile-time cannot drift.
[!] Never define a type manually when a Zod schema already exists.

### `AI_POLICY.md` as Separate File

AI tools look for specific policy files. Standalone `AI_POLICY.md` is machine-readable. Different purpose from human-oriented documentation.

### Official GitHub Pages Actions over `peaceiris`

`peaceiris` = third-party, single maintainer, supply chain risk, not maintained for Node 24, required `contents:write` (too broad). Official actions use scoped `pages:write` + `id-token:write`. `gh-pages` branch pattern eliminated.
[!] Do not reintroduce `peaceiris` or any third-party deploy action for GitHub Pages.

### Exact Versions + Dependabot

Loose versions (`^`, `~`) → silent malicious installs on compromised publish (Axios attack pattern, March 2026). Exact versions prevent surprise installs. Dependabot bridges gap with CI-gated reviewed PRs.
[!] Never reintroduce `^` or `~`. All version updates via Dependabot PRs with CI validation.

### Dependabot Security Updates UI Disabled

`dependabot.yml` already controls all PRs. UI toggle creates duplicate, uncontrolled parallel stream.
[?] If `dependabot.yml` ever removed → re-evaluate toggle.

### CodeQL Scans Both `javascript-typescript` + `actions`

`actions` scanner (GA April 2025) detects workflow misconfigs, secret exposure, injection. Workflow security as important as app security.
[!] Both matrix entries must be kept.

### Explicit Top-Level Permissions on All Workflows

Without explicit permissions → GitHub Actions defaults to wide permissions including `contents:write`. CodeQL flagged as CWE-275 (ci.yml, deploy-backend.yml, deploy-frontend.yml).
Rule: workflow level = safe minimum. Job level overrides upward only when genuinely needed.
[!] Every new workflow must declare explicit permissions from first commit.

### `.npmrc` `save-exact=true`

`npm install` adds `^` by default — silently violates exact versions policy. `.npmrc` makes exact pinning automatic.
[!] `.npmrc` must never be removed or overridden.
Rule: `npm install` → adding new packages. `npm ci` → verifying clean build before commit.

### `@types/node` Must Match Runtime Major

`@types/node` version major must match Node.js runtime major. Higher major introduces API types that don't exist at runtime → silent correctness issues. Pinned to latest patch of intended major.
[!] Never pin `@types/node` to `.0.0` release — use latest stable patch.
[!] When upgrading Node runtime → update ALL `@types/node` pins in same branch + Dependabot ignore list.
Currently: Node 24 LTS → `@types/node` pinned to `24.x` latest stable patch.

### CodeQL Not a Merge Gate

CodeQL findings require human review — not binary pass/fail. Adding as hard gate adds 8-10 min to every PR for informational output. Revisit when API handles real traffic or sensitive data.

### `npm ci` in CI + Locally After Dep Changes

`npm install` reuses `node_modules` — masks incompatibilities only surfacing on clean install. `npm ci` deletes `node_modules`, installs from `package-lock.json` exactly, replicates CI.
Rule: `npm install` → adding packages. `npm ci` → verifying build before committing.

### Helmet Middleware Order Non-Negotiable

Security headers must be present on every response including CORS rejections + rate limit responses. Any middleware before Helmet can send response without security headers.
[!] Never move Helmet below cors() or any other middleware.
[!] Middleware order: `helmet → pino-http → cors → limiter → requireApiKey → routes`

### Root `package-lock.json` Triggers Both Deploy Pipelines

Root `package-lock.json` = single source of truth for all dep versions. Shared dep Δ → both apps must redeploy. Occasional unnecessary deploy acceptable — safety > efficiency.

### NODE_ENV Must Never Be Set in Render Dashboard

`NODE_ENV=production` in Render dashboard → `npm ci` skips devDependencies → TypeScript + `@types/node` missing → build failure. `NODE_ENV` managed exclusively via dotenvx at runtime.
Correct build: `npm ci && npm run build && npm prune --omit=dev`
[!] Never set `NODE_ENV` in Render dashboard. Never use `--include=dev` as permanent fix.

### SHA Pinning for GitHub Actions

Version tags (`@v6`) are mutable. Compromised maintainer → tag silently retargeted to malicious code. Pinned SHA = immutable — reviewed code = executed code. (tj-actions/changed-files attack, March 2025)
Dependabot manages SHA update PRs automatically for `github-actions` ecosystem.
[!] Every new `uses:` reference must be SHA-pinned from first commit. Never merge tag references.

### Node.js Upgraded to 24 LTS

Node 24 LTS latest takes precedence. All layers must declare same Node major — Dev Container, CI, `@types/node` pins. Never let these drift.
[!] When Node major changes → update all references in same branch.

### API Key Auth Uses Static Shared Secret, Not JWT

No human users. JWT = user session auth. Static shared secret = correct pattern for M2M auth between single trusted client and single trusted server.
Browser caveat: `VITE_API_KEY` visible in compiled JS bundle. Accepted for demo scope. Proxy pattern is correct long-term fix — deferred to hardening sprint.
[!] Never use JWT for M2M auth where no user identity exists.
[!] `API_KEY` must be secret env var in Render dashboard. Never commit real key.

### Semgrep Deferred — CodeQL Overlap

CodeQL (`javascript-typescript` + `actions`) already covers core SAST surface for this TypeScript monorepo (§7.9). Semgrep adds tooling overhead without meaningful coverage gap at current project stage.
Revisit when real traffic or sensitive data exists.

### Node Version Pinned via `.nvmrc` + `engines`

Node version belongs in repo — versioned, reviewed, CI-enforced, Render-respected.
`.nvmrc` → consumed by Render, nvm, Dev Container. `engines.node` → enforced by `npm ci` + tooling.
[!] Never set `NODE_VERSION` in Render dashboard — repo is source of truth.
[!] `@types/node` patch = `engines.node` = `.nvmrc` — all three must match exactly.
[!] Node major upgrade → update `.nvmrc` + all `engines` pins + CI `node-version` + `@types/node` in same branch.

### `engines.node` Uses Range, Not Exact Patch

`engines` is a runtime compatibility declaration, not a dep version. Node runtime patch and `@types/node` patch release on independent schedules — exact patch pinning causes permanent `EBADENGINE` drift.
Correct: `">=24.0.0 <25.0.0"` — enforces Node 24, Dependabot manages `@types/node` patch independently.
[!] `§4.3` exact versions policy applies to npm packages only — not runtime declarations.
[!] Node major upgrade → update `engines` range + `.nvmrc` + CI `node-version` + `@types/node` ignore list in same branch.
[!] Never set `NODE_VERSION` in Render dashboard — repo is source of truth.

### TruffleHog: PR diff only, not full history

Full history scans are slow and better suited as a one-time audit.
CI gate scans the diff between base and head on every PR.
--only-verified reduces false positives to confirmed live secrets only.

### TruffleHog: separate workflow, not added to ci.yml

Secret scanning has independent permissions, trigger, and failure behavior.
Isolation keeps ci.yml focused on build/test concerns.

### TruffleHog: two pins required

uses: SHA pins the action code (action.yml shell script).
version: 3.95.3 in with: pins the Docker image pulled at runtime.
SHA pin alone does not pin the Docker image — both are required.

### Artifact Attestations / Provenance / Build Signing

Deferred until release-chain need exists. Keep as future hardening item, not current scope.

### Turborepo Adopted as Orchestrator, Not Package Manager

Turborepo is introduced as the root task orchestrator only. It does not replace npm workspaces and does not own dependency installation.
Reason: preserve explicit native package management boundaries in a mixed-runtime monorepo.
[!] npm remains authoritative for Node dependencies and workspace linking.

### Turborepo Adoption Is Intentionally Partial

Not all workspaces expose uniform `lint`, `dev`, or valid `test` scripts.
Current root orchestration therefore uses:

- Turbo for `build`
- Turbo for filtered `test`
- direct root ESLint for `lint`
- explicit per-app dev commands for API and Python
  Reason: adopt only what is real and validated; avoid fake consistency.

### Python Introduced as App-Local `uv` Project

`apps/python-service` is intentionally managed as an app-local `uv` project with committed `uv.lock`.
Reason: only one Python service exists today; root Python workspace would add complexity without payoff.

### Root Python Workspace Deferred

A root Python workspace is deferred until multiple Python apps or packages exist.
Trigger to revisit: shared internal Python libs, multiple services, or true cross-service Python dependency graph.

### Python Service Is Internal by Design

The initial Python service is a Render internal/private service with no public ingress.
Reason: service is currently dummy/health-only and should not expand public attack surface unnecessarily.

### Python Runtime Standardized on 3.13

Python version is standardized across devcontainer, CI, and `uv.lock` generation at 3.13.
Reason: avoid local/CI/runtime drift during early polyglot adoption.

### `vitest run` Required for Turbo/CI Test Stability

`apps/trading-client` test script changed from `vitest` to `vitest run`.
Reason: interactive watch-mode behavior prevents deterministic root test execution and CI completion.

### Python Version Pinned via `.python-version`

Python version belongs in repo when Python tooling is part of the build or deploy path. `.python-version` makes the interpreter version explicit, reviewable, and consistent across local development, `uv`, and hosted environments that detect repo-pinned Python versions.

[!] Never rely on an unspecified system Python when the service uses `uv` or Python-based deployment.
[!] Python major/minor upgrades must be updated in `.python-version` in the same branch as any related dependency or deploy changes.

---

## 11. Intentionally Deferred

| Feature                             | Why Deferred                                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Advanced production hardening       | Needed after real features built                                                                          |
| Scaling infrastructure              | Premature at current project size                                                                         |
| HTTPS in local dev                  | Adds complexity before solving real problem                                                               |
| Rootless Docker                     | Advanced system config, not needed now                                                                    |
| Private npm registry                | Enterprise-level, not required at current size                                                            |
| HashiCorp Vault                     | Overkill until multi-env production deployments exist                                                     |
| Docker multi-stage production build | `npm ci && npm run build && npm prune --omit=dev` achieves same runtime result. Revisit hardening sprint. |
| SBOM, Trivy, OWASP ZAP              | Needed when real traffic/sensitive data exists                                                            |
| Full Turbo task standardization     | When all workspaces expose consistent `build` / `lint` / `test` / `dev` contracts                         |
| Root Python workspace               | When multiple Python apps/packages justify shared workspace management                                    |
| Cross-language shared contracts     | When Python service needs domain-level integration with Node packages                                     |
| Advanced frontend (React)           | When UI complexity justifies                                                                              |

> Deferred ≠ forgotten. Complexity before necessity → engineering decay.

---

## 12. Next Project

Use this `FOUNDATION.md` as a reference architecture baseline.
Update documentation after implementation topics are completed and validated.
Follow Phase 0 → 9 sequence precisely.
Fix all known gaps by design, not patch.
Include GitHub Actions IAM + SHA pinning from first commit.
Domain-agnostic — reusable template.

---

_Last updated: May 2026_
