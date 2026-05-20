# Trading System

A polyglot monorepo demonstrating production-grade DevSecOps engineering — secure Dev Container, automated CI/CD, controlled AI exposure, and phased multi-runtime orchestration.

> The trading domain is the vehicle. The real project is the engineering foundation.
> See [`FOUNDATION.md`](./FOUNDATION.md) for finalized architecture and engineering decisions.

---

## Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Languages        | TypeScript 6, Python 3.13            |
| Monorepo         | npm workspaces + Turborepo           |
| Backend          | Express 5, Node 24                   |
| Frontend         | Vite 8                               |
| Python service   | FastAPI + Uvicorn + uv               |
| Validation       | Zod 4                                |
| Testing          | Vitest                               |
| Dev Environment  | WSL2 → Ubuntu → Docker Dev Container |
| CI/CD            | GitHub Actions                       |
| Backend hosting  | Render                               |
| Frontend hosting | GitHub Pages                         |

---

## Prerequisites

- Windows with WSL2 + Ubuntu installed.
- Docker Desktop (running, WSL2 backend enabled).
- VS Code with extensions:
  - [WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)
  - [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

---

## Setup

### 1. Clone Inside WSL (Not Windows Filesystem)

```bash
# Inside WSL Ubuntu terminal
cd ~/projects   # or wherever you keep projects
git clone https://github.com/PuguForex/trading-system.git
cd trading-system
```

> Clone inside WSL (`~/projects/`), not on the Windows filesystem (`/mnt/c/`). Performance and security both depend on the code living in Linux.

### 2. Open in VS Code via WSL

```bash
code .
```

### 3. Reopen in Dev Container

VS Code will prompt: **"Reopen in Container"** — click it.

Or manually: `Ctrl+Shift+P` → `Dev Containers: Reopen in Container`.

> Verify the VS Code status bar shows: `[Dev Container: trading-system-dev]`.
> If it does not show this, stop and fix the environment before proceeding.

### 4. Set Up Environment Files

```bash
cp .env.example .env.development
```

Edit `.env.development` with your local values:

```env
PORT=3000
API_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:5173
ALLOWED_OUTBOUND_HOSTS=localhost
```

For secrets:

```bash
touch .env.secrets
```

Add sensitive values to `.env.secrets`:

```env
API_KEY=your-actual-api-key
```

> `.env.secrets` must never be committed and is intentionally excluded from AI visibility.

---

## Running the Project

All commands run inside the Dev Container terminal.

```bash
# Root validation commands
npm run build
npm run test
npm run lint

# Run API only
npm run dev:api        # http://localhost:3000

# Run web frontend only
npm run dev:web        # http://localhost:5173

# Run Python internal service only
npm run dev:python     # http://localhost:8000/health

# Turbo-managed web dev entrypoint
npm run dev

# Run trading CLI
npm run start:client
```

> `npm run dev` is currently a partial Turbo dev entrypoint and does **not** yet launch the full monorepo stack.
> Use `dev:api`, `dev:web`, and `dev:python` explicitly when running multiple services together.

---

## Building

```bash
# Build all current Node packages/apps through Turbo
npm run build

# Build frontend only
npm run build:web

# Clean all dist folders and Turbo cache, then rebuild
npm run rebuild
```

Build orchestration is handled by Turborepo at the repo root, while npm remains the Node package manager and `uv` remains the Python package manager.

---

## Testing

```bash
# Run root test contract
npm run test

# System health check
npm run health
```

The root test contract is currently filtered to `trading-client`, because not all workspaces expose valid test scripts yet.

---

## Code Quality

```bash
# Lint all TypeScript files from repo root
npm run lint

# Format repo files
npm run format

# Check formatting without writing changes
npm run format:check
```

Pre-commit hook runs automatically on `git commit`.

---

## Python Service

`apps/python-service` is an app-local Python service managed with `uv`, not part of a root Python workspace.

```bash
cd apps/python-service
uv sync
uv run python main.py
```

Current service scope:

- FastAPI-based internal dummy service.
- Exposes `GET /health`.
- Intended for internal/private Render deployment, not public ingress.

A root Python workspace is intentionally deferred until multiple Python apps or packages justify the extra complexity.

---

## Project Structure

```text
trading-system/
├── apps/
│   ├── api-service        → Express REST API
│   ├── trading-client     → Node.js CLI / trading logic
│   ├── web-client         → Vite browser frontend
│   └── python-service     → Internal FastAPI service managed by uv
├── packages/
│   ├── config             → Shared env + secrets management
│   └── shared-types       → Shared TypeScript types + Zod schemas
├── .devcontainer/         → Dev Container definition
├── .github/workflows/     → CI/CD pipelines
├── turbo.json             → Turborepo task graph
├── FOUNDATION.md          → Finalized architecture and engineering decisions
├── AI_POLICY.md           → AI tool usage policy
├── SESSION.md             → Working continuity for active implementation
└── README.md              → This file
```

---

## Deployments

| App              | Platform          | URL / Exposure                              | Trigger                                                |
| ---------------- | ----------------- | ------------------------------------------- | ------------------------------------------------------ |
| `api-service`    | Render            | https://trading-api-6ovi.onrender.com       | GitHub Actions-triggered deployment on push to `main`  |
| `web-client`     | GitHub Pages      | https://puguforex.github.io/trading-system/ | Push to `main` with path filtering                     |
| `python-service` | Render (internal) | Internal/private service                    | GitHub Actions-triggered deploy hook on push to `main` |

`python-service` is intentionally deployed as an internal/private Render service and is not part of the public ingress surface.

### Environment Variables for Deployment

**Render (`api-service`):** set in the Render dashboard.

```text
PORT, API_URL, ALLOWED_ORIGINS, ALLOWED_OUTBOUND_HOSTS
```

Secrets such as `API_KEY` must be stored as Render secret environment variables, never in the repo.

**GitHub Pages (`web-client`):** set in GitHub repository variables.

```text
VITE_API_URL = https://trading-api-6ovi.onrender.com
```

**Render (`python-service`):** deployment is triggered via dedicated GitHub Actions secret-backed deploy hook.

```text
RENDER_PYTHON_SERVICE_DEPLOY_HOOK_URL
```

---

## CI/CD Pipeline

Every push to `main` and every pull request runs a controlled validation pipeline through GitHub Actions.

```text
setup node + python + uv → lint → dependency audit → build → test
```

Python dependencies are synced in CI from `apps/python-service` using `uv sync`, backed by committed `uv.lock`.

Additional security workflows include:

- TruffleHog secret scanning.
- Dependency Review action.
- CodeQL analysis.
- Path-filtered deployment workflows.

The pipeline must be green before merge.

---

## AI Tool Usage

This project has an explicit AI usage policy.

Before using any AI tool:

1. Verify you are inside the Dev Container.
2. Read [`AI_POLICY.md`](./AI_POLICY.md).
3. Understand that `.env.secrets` and related sensitive files are intentionally excluded from AI visibility.

---

## Architecture and Engineering Decisions

See [`FOUNDATION.md`](./FOUNDATION.md) for:

- security model and layer-by-layer explanation,
- major architectural decisions and rationale,
- phased monorepo evolution strategy,
- DevSecOps roadmap,
- what is intentionally deferred and why.
