# SESSION.md — AI Session Bookmark

> **Purpose:** Re-entry point for AI assistants after context loss.
> Read this file first. Then read FOUNDATION.md for full architecture.
> Then read AI_POLICY.md for behavioral rules and protocols.

---

## Current Position

- **Phase:** Section 9.2 — High Impact, Low Effort
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

---

## Immediate Next Steps

### 1. Phase 4 — Safe AI Usage Setup
- VS Code AI extension setup (Copilot or Codeium)
- Prompt discipline and templates
- AI workflow integration into Git + CI

### 2. Documentation Sync
- Keep `SESSION.md` aligned with `FOUNDATION.md`
- Keep `README.md` aligned with current runtime and stack decisions

### 3. Verify Current State
- Confirm all documentation reflects the latest committed architecture decisions before starting any new topic

---

## Pinned GitHub Action SHAs (for reference)

| Action | SHA |
|---|---|
| `actions/checkout@v6` | `de0fac2e4500dabe0009e67214ff5f5447ce83dd` |
| `actions/setup-node@v6` | `48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e` |
| `actions/upload-pages-artifact@v5` | `fc324d3547104276b827a68afc52ff2a11cc49c9` |
| `actions/deploy-pages@v5` | `cd2ce8fcbc39b97be8ca5fce6e763baed58fa128` |
| `github/codeql-action/*@v4` | `e46ed2cbd01164d986452f91f178727624ae40d7` |

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
- Middleware order: `helmet()` → `pinoHttp()` → `cors()` → `limiter` → `requireApiKey` → routes
- Never touch `.env.secrets`
- Never set `NODE_ENV` in the Render dashboard — managed by dotenvx at runtime only
- All workflow `uses:` references must be pinned to commit SHA — never a tag
- Always sync `FOUNDATION.md` after every architectural change
- Always sync this file at the start and end of every session
- New Topic Protocol mandatory — see `AI_POLICY.md`