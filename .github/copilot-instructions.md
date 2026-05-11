# Copilot Instructions

## Project
Full-stack TypeScript monorepo. Runtime: Node.js 24 LTS. Stack: Express, Vite, Zod, Vitest.
Governance: `FOUNDATION.md` (source of truth), `AI_POLICY.md` (behavioral rules).

## Structure
apps/api-service     → Express REST API (Render)
apps/trading-client  → Node.js CLI
apps/web-client      → Vite SPA (GitHub Pages)
packages/config      → env loading, Zod validation, secrets gate
packages/shared-types → shared domain types + Zod schemas

## Rules
[!] Read `FOUNDATION.md` + `AI_POLICY.md` before suggesting any change.
[!] Never suggest changes to: FOUNDATION.md, AI_POLICY.md, SESSION.md, .github/workflows/**, .devcontainer/**, packages/config/src/env.ts
[!] Never suggest hardcoded secrets, loose version pins (^ or ~), or curl | bash patterns.
[!] Never suggest disabling security middleware or reordering: helmet → pino-http → cors → limiter → requireApiKey → routes
[!] All commands run from monorepo root using npm workspace flags.
[!] shared-types must be built before any app consuming it.

## Patterns
- Zod schema = type source of truth — never define types manually when schema exists
- Exact version pins only — no ^ or ~
- loadSecrets("server-init") — only allowed context
- npm ci for clean installs, npm install for adding packages only