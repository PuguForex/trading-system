# SESSION.md — AI Session Bookmark

> **Purpose:** Re-entry point for AI assistants after context loss.
> Read this file first. Then read FOUNDATION.md for full architecture.
> Then read AI_POLICY.md for behavioral rules and protocols.

---

## Current Position

- **Phase:** Section 9.2 — High Impact, Low Effort Security
- **Last completed:** `security/pin-actions-to-sha` — all GitHub Actions pinned to commit SHA ✅
- **Active branch:** none — `main` is clean

---

## What Was Completed This Session (May 2, 2026)

- ✅ `FOUNDATION.md` updated — NODE_ENV constraint, Render build command, workflow_dispatch
- ✅ `FOUNDATION.md` updated — pino logging marked complete in Section 9.1
- ✅ `AI_POLICY.md` updated — New Topic Protocol + traceability rules added
- ✅ All GitHub Actions workflow files pinned to commit SHA
- ✅ `FOUNDATION.md` updated — SHA pinning decision log + roadmap status
- ✅ GitHub connector disconnected from Perplexity
- ⚠️ Node.js runtime mismatch discovered — Render running 22.22.0, project targets 20.x

---

## Immediate Next Steps (in order)

### 1. Node.js Runtime Alignment — FIRST
- Render production is running **Node.js 22.22.0 (default)**
- Project standard is **Node.js 20** (Dev Container, CI, `@types/node` pin)
- Decision needed: pin Render to Node.js 20 now, OR upgrade full project to Node.js 22
- Likely approach: add `engines: { "node": "20.x" }` to root `package.json` + set `NODE_VERSION=20.22.0` in Render dashboard
- FOUNDATION.md Section 10 decision log entry required

### 2. Auth Enforcement on API Endpoints
- Add API key validation to `apps/api-service`
- Requests without valid key get rejected

### 3. Phase 4 — Safe AI Usage Setup
- VS Code AI extension setup (Copilot or Codeium)
- Prompt discipline and templates
- AI workflow integration into Git + CI

---

## Pinned GitHub Action SHAs (for reference)

| Action | SHA |
|---|---|
| `actions/checkout@v6` | `de0fac2e4500dabe0009e67214ff5f5447ce83dd` |
| `actions/setup-node@v6` | `48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e` |
| `actions/upload-pages-artifact@v3` | `56afc609e74202658d3ffba0e8f6dda462b719fa` |
| `actions/deploy-pages@v4` | `d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e` |
| `github/codeql-action/*@v3` | `53e96ec3b35fce51c141c0d6f0e31028a448722d` |

---

## Re-Entry Protocol for AI Assistants

1. Read this file — get current position
2. Read `FOUNDATION.md` — get full architecture and constraints
3. Read `AI_POLICY.md` — get behavioral rules and New Topic Protocol
4. Never infer project state from training data
5. If context is unclear, say so explicitly and request these files

---

## Key Constraints (Quick Reference)

- Exact dependency versions only — no `^` or `~`
- Middleware order: `helmet()` → `cors()` → `limiter` → routes
- Never touch `.env.secrets`
- Never set `NODE_ENV` in the Render dashboard — managed by dotenvx at runtime only
- All workflow `uses:` references must be pinned to commit SHA — never a tag
- Always sync `FOUNDATION.md` after every architectural change
- Always sync this file at the start and end of every session
- New Topic Protocol mandatory — see `AI_POLICY.md`