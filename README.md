# Trading System

A full-stack TypeScript monorepo demonstrating production-grade DevSecOps engineering — secure Dev Container, automated CI/CD, and AI-safe development practices.

> The trading domain is the vehicle. The real project is the engineering foundation.
> See [`FOUNDATION.md`](./FOUNDATION.md) for the full architectural specification.

---

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 6 (strict) |
| Backend | Express 5, Node 20 |
| Frontend | Vite 8 |
| Validation | Zod 4 |
| Testing | Vitest |
| Dev Environment | WSL2 → Ubuntu → Docker Dev Container |
| CI/CD | GitHub Actions |
| Backend hosting | Render |
| Frontend hosting | GitHub Pages |

---

## Prerequisites

- Windows with WSL2 + Ubuntu installed
- Docker Desktop (running, WSL2 backend enabled)
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

> ⚠️ Clone inside WSL (`~/projects/`), not on the Windows filesystem (`/mnt/c/`).
> Performance and security both depend on the code living in Linux.

### 2. Open in VS Code via WSL

```bash
code .
```

### 3. Reopen in Dev Container

VS Code will prompt: **"Reopen in Container"** — click it.

Or manually: `Ctrl+Shift+P` → `Dev Containers: Reopen in Container`

> ✅ Verify the VS Code status bar shows: `[Dev Container: trading-system-dev]`
> If it does not show this, stop. Do not proceed without being inside the container.

### 4. Set Up Environment Files

```bash
# Required for local development
cp .env.example .env.development
```

Edit `.env.development` with your values:

```env
PORT=3000
API_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:5173
ALLOWED_OUTBOUND_HOSTS=localhost
```

For secrets (API keys etc.):

```bash
# Create .env.secrets — never commit this file
touch .env.secrets
```

Add sensitive values to `.env.secrets`:
```env
API_KEY=your-actual-api-key
```

---

## Running the Project

All commands run inside the Dev Container terminal.

```bash
# Run API + web frontend together
npm run dev

# Run API only
npm run dev:api        # http://localhost:3000

# Run web frontend only
npm run dev:web        # http://localhost:5173

# Run trading CLI (all trades)
npm run start:client

# Run trading CLI (filter by symbol)
npm run start:client -- EURUSD
```

---

## Building

```bash
# Build all packages and apps
npm run build

# Build frontend only
npm run build:web

# Clean all dist folders and rebuild
npm run rebuild
```

---

## Testing

```bash
# Run all tests
npm run test

# System health check
npm run health
```

---

## Code Quality

```bash
# Lint all TypeScript files
npm run lint
```

Pre-commit hook runs automatically on `git commit` — ESLint is enforced before every commit.

---

## Project Structure

```
trading-system/
├── apps/
│   ├── api-service       → Express REST API
│   ├── trading-client    → Node.js CLI
│   └── web-client        → Vite browser frontend
├── packages/
│   ├── config            → Shared env + secrets management
│   └── shared-types      → Shared TypeScript types + Zod schemas
├── .devcontainer/        → Dev Container definition
├── .github/workflows/    → CI/CD pipelines
├── FOUNDATION.md         → Engineering specification (source of truth)
├── AI_POLICY.md          → AI tool usage policy
└── README.md             → This file
```

---

## Deployments

| App | Platform | URL | Trigger |
|---|---|---|---|
| `api-service` | Render | https://trading-api-6ovi.onrender.com | Push to `main` |
| `web-client` | GitHub Pages | https://puguforex.github.io/trading-system/ | Push to `main` (path-filtered) |

### Environment Variables for Deployment

**Render (api-service):**
Set in the Render dashboard under Environment:
```
PORT, API_URL, ALLOWED_ORIGINS, ALLOWED_OUTBOUND_HOSTS
```
Secrets (`API_KEY`) set as secret environment variables in Render — never in the repo.

**GitHub Pages (web-client):**
Set in GitHub → Settings → Variables:
```
VITE_API_URL = https://trading-api-6ovi.onrender.com
```

---

## CI/CD Pipeline

Every push to `main` and every pull request runs:

```
lint → security audit → build → test
```

The pipeline must be green before any merge. There are no exceptions.

---

## AI Tool Usage

This project has an explicit AI usage policy. Before using any AI tool (Copilot, Cursor, etc.):

1. Verify you are inside the Dev Container
2. Read [`AI_POLICY.md`](./AI_POLICY.md)
3. Understand that `.env.secrets` and all `.env.*` files are intentionally excluded from AI visibility

---

## Architecture and Engineering Decisions

See [`FOUNDATION.md`](./FOUNDATION.md) for:
- Full security model and layer-by-layer explanation
- Why every major decision was made
- Professional build sequence
- DevSecOps roadmap
- What is intentionally deferred and why

