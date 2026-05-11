# SESSION.md

## Purpose
Preserves short-term working continuity.
Not a governance document.
Exists so work can resume safely after interruption.

---

## Current Focus
TruffleHog + Dependency Review action (FOUNDATION.md §9.3)

## Completed This Session
✔ Phase 4: Safe AI Usage Setup
  - devcontainer.json → Copilot settings (plaintext/markdown disabled)
  - .github/copilot-instructions.md → created
  - AI_POLICY.md → ## COPILOT section added
✔ Semgrep priority assessed — deferred, CodeQL overlap documented in FOUNDATION.md §9.3

---

## In Progress
- None

---

## Blockers
- None

---

## Decisions Made
- Node 24 LTS latest takes precedence over all prior version constraints — `FOUNDATION.md §1.3`
- All packages must be compatible with Node 24 LTS — Dependabot ignore list will need updating (`23.x`+ → `25.x`+)
- `AI_POLICY.md` + `FOUNDATION.md` are now domain-agnostic templates → reflected in `FOUNDATION.md §12`

---

## Files Touched
- `AI_POLICY.md` — full rewrite (output this session)
- `FOUNDATION.md` — full rewrite (output this session)
- `SESSION.md` — this file

---

## Project File Tree (Categorised Snapshot)

### Governance
```
FOUNDATION.md
AI_POLICY.md
SESSION.md
README.md
```

### Dev Container
```
.devcontainer/devcontainer.json
```

### CI/CD Workflows
```
.github/workflows/ci.yml
.github/workflows/codeql.yml
.github/workflows/deploy-backend.yml
.github/workflows/deploy-frontend.yml
.github/dependabot.yml
```

### Monorepo Root Config
```
package.json
package-lock.json
.npmrc
eslint.config.mjs
.gitignore
.gitattributes
.husky/pre-commit
.vscode/settings.json
```

### Env Files
```
.env.development
.env.production
.env.ci
.env.example
```

### AI Access Control
```
.aiignore
.cursorignore
```

### apps/api-service
```
apps/api-service/package.json
apps/api-service/tsconfig.json
apps/api-service/src/index.ts
apps/api-service/src/middleware/auth.ts
```

### apps/trading-client
```
apps/trading-client/package.json
apps/trading-client/tsconfig.json
apps/trading-client/src/index.ts
apps/trading-client/src/models/Summary.ts
apps/trading-client/src/models/TradeResult.ts
apps/trading-client/src/services/TradeProcessor.ts
apps/trading-client/src/services/TradeProcessor.test.ts
apps/trading-client/src/services/TradeService.ts
apps/trading-client/src/utils/ReportPrinter.ts
```

### apps/web-client
```
apps/web-client/package.json
apps/web-client/tsconfig.json
apps/web-client/vite.config.ts
apps/web-client/index.html
apps/web-client/src/main.ts
apps/web-client/.env.development
apps/web-client/.gitignore
```

### packages/config
```
packages/config/package.json
packages/config/tsconfig.json
packages/config/src/env.ts
```

### packages/shared-types
```
packages/shared-types/package.json
packages/shared-types/tsconfig.json
packages/shared-types/src/index.ts
```

### Tooling Scripts
```
context-dump.sh
context.txt
```

---

## Next Actions
1. **Node 24 LTS upgrade** — single branch `chore/node24-upgrade`, touch all layers:
   - `.devcontainer/devcontainer.json` → image `typescript-node:24`
   - `.github/workflows/ci.yml` → `node-version: '24'`
   - `.github/workflows/deploy-frontend.yml` → `node-version: '24'`
   - `packages/config/package.json` → `@types/node` pin → `24.x` latest stable patch
   - `apps/trading-client/package.json` → `@types/node` pin if present → same
   - `.github/dependabot.yml` → update `@types/node` ignore list (`23.x`+ → `25.x`+)
   - `README.md` → any Node version references
   - `apps/api-service/package.json`, `apps/trading-client/package.json`, `apps/web-client/package.json` → `engines.node` if present
   - Run: `npm ci && npm run build && npm run test` → verify clean
   - PR → CI pass → merge
2. After Node 24 upgrade merged → Phase 4: Safe AI Usage Setup (`FOUNDATION.md §9.2`)
3. After Phase 4 → Semgrep SAST in CI (`FOUNDATION.md §9.3`)

---

## Resume Notes
- `FOUNDATION.md` is source of truth — Node 24 LTS declared but codebase not yet updated
- All `@types/node` pins must match Node major (`24.x`) — never use `24.0.0`, use latest stable patch
- Dependabot ignore list currently set to ignore `23.x`+ — must update to `25.x`+ after upgrade
- [!] Update ALL layers in same branch — Dev Container + CI + `@types/node` drift is the failure pattern
- [!] Never set `NODE_ENV` in Render dashboard — `FOUNDATION.md §10`
- Render build command: `npm ci && npm run build && npm prune --omit=dev`
