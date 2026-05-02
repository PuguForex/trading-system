# SESSION.md — AI Session Bookmark

> **Purpose:** Re-entry point for AI assistants after context loss.
> Read this file first. Then read FOUNDATION.md for full architecture.

---

## Current Position

- **Phase:** Section 9.2 — High Impact, Low Effort Security
- **Last completed:** SESSION.md + AI_POLICY.md Context Loss Protocol ✅
- **Currently working on:** pino structured logging

---

## Active Branch

- `main` is clean and deployed
- Feature branches follow: `feature/<name>` or `fix/<name>`

---

## Immediate Next Steps (in order)

1. `feature/pino-logging` → structured logging in `apps/api-service`
2. `feature/auth-enforcement` → auth on API endpoints
3. `feature/pin-actions-sha` → pin all GitHub Actions to commit SHA

---

## Re-Entry Protocol for AI Assistants

1. Read this file — get current position
2. Read `FOUNDATION.md` — get full architecture and constraints
3. Read `AI_POLICY.md` — get behavioral rules
4. Never infer project state from training data
5. If context is unclear, say so explicitly and request these files

---

## Key Constraints (Quick Reference)

- Exact dependency versions only — no `^` or ~`
- Middleware order: `helmet()` → `cors()` → `limiter` → routes
- Never touch `.env.secrets`
- Always sync `FOUNDATION.md` after every architectural change
- Always sync this file at the start and end of every session
