# SESSION.md — AI Session Bookmark

> **Purpose:** Re-entry point for AI assistants after context loss.
> Read this file first. Then read FOUNDATION.md for full architecture.

---

## Current Position

- **Phase:** Section 9.2 — High Impact, Low Effort Security
- **Last completed:** `feature/pino-logging` — structured logging merged to main ✅
- **Currently working on:** `fix/deploy-and-docs` — deploy pipeline hardening + FOUNDATION.md update

---

## Active Branch

- `main` is clean — pino logging merged and live
- Next branch to create: `fix/deploy-and-docs`

---

## Immediate Next Steps (in order)

1. `fix/deploy-and-docs` → three changes in one PR:
   - `.github/workflows/deploy-backend.yml` — add `workflow_dispatch`, update build command to `npm ci && npm run build && npm prune --omit=dev`
   - `FOUNDATION.md` Section 7.3 — document updated build command
   - `FOUNDATION.md` Section 9.1 — mark pino logging as completed
   - `FOUNDATION.md` Section 10 — add NODE_ENV Decision Log entry
2. `feature/helmet` → Helmet.js HTTP security headers
3. `feature/auth-enforcement` → auth on API endpoints
4. `feature/pin-actions-sha` → pin all GitHub Actions to commit SHA

---

## Re-Entry Protocol for AI Assistants

1. Read this file — get current position
2. Read `FOUNDATION.md` — get full architecture and constraints
3. Read `AIPOLICY.md` — get behavioral rules
4. Never infer project state from training data
5. If context is unclear, say so explicitly and request these files

---

## Key Constraints (Quick Reference)

- Exact dependency versions only — no `^` or `~`
- Middleware order: `helmet()` → `cors()` → `limiter` → routes
- Never touch `.env.secrets`
- Never set `NODE_ENV` in the Render dashboard — managed by dotenvx at runtime only
- Always sync `FOUNDATION.md` after every architectural change
- Always sync this file at the start and end of every session