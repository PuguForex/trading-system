# AI_POLICY.md

---

## CORE LAWS

```
existing project reality > training priors > external search
security > architecture > deployment > runtime > dev convenience
FOUNDATION.md constraints > current implementation
CONSTRAINT > decision log > architecture doc > implementation > comments
```

---

## EXECUTION LAW

```
action → validation → reporting → evidence
```

[!] No silent execution. No hidden reasoning. No partial continuation.

---

## FAILURE LAW

```
phase failure → immediate stop
```

No override. No bypass. No "best effort". Constraints = invariant.

---

## SEVERITY CLASSES

| Class | Scope |
|-------|-------|
| LOW | docs, comments, formatting |
| MEDIUM | app logic, validation, workflows, deps |
| HIGH | security, auth, secrets, CI/CD, architecture, deployment, shared contracts |

---

## REQUEST CLASSIFICATION

Classify before acting:

- request_type: `topic` `question` `decision` `fix` `feature` `refactor` `workflow` `review` `execute`
- scope: `docs` `app` `package` `workflow` `deployment` `security` `governance` `session` `mixed`
- mode: `discuss` `propose` `review` `execute`
- risk: `low` `medium` `high` `governance`

[?] governance/control files touched → risk ≠ low
[?] file type ≠ risk determinant; effect determines risk

---

## SESSION RE-ENTRY

[!] On session start: read `SESSION.md` in full (READ mode) before responding.
[!] `SESSION.md` + `FOUNDATION.md` conflict → `FOUNDATION.md` wins.
[!] No implementation, no code, no commands until `SESSION.md` confirmed read.

```
SESSION.md → re-entry point
FOUNDATION.md → architecture truth
```

Verify all script names, file paths, commands verbatim from context. [?] not found → ask.

---

## SECURITY RULES

[!] No hardcoded secrets
[!] No disabling security layers
[!] No destructive commands (`rm -rf`, etc.)
[!] No unreviewed remote script execution (`curl | bash`)
[!] No data sent to unapproved external endpoints
[!] No deps without official maintainer + exact version pin

---

## FILE ACCESS

- Allowed: `/apps`, `/src`
- Restricted: `/config/secrets`, `.env` files

---

## COMMAND EXECUTION RULES

[!] All commands run from monorepo root only. No `cd` into or out of subdirectories.
[!] Use npm workspace flags for all package-scoped operations:
- `npm run <script> -w <workspace>`
- `npm install <pkg> -w <workspace>`
- `npm run build -w packages/shared-types`
[?] Exception: shell scripts requiring explicit path context — must be flagged + justified before use.

---

## DOCUMENTATION WRITING RULES

[?] Applies to: `FOUNDATION.md`, `AI_POLICY.md`, `SESSION.md`, code comments, commit messages, reports, CI output.
[?] Does not apply to: conversational chat responses in `discuss` / `propose` mode.

[!] No filler, no pleasantries, no preamble.
[!] Technical names stay 100% literal — never paraphrase identifiers, file names, commands.
[!] No articles (a, an, the).

Symbol logic — mandatory in all applicable output:
- `[→]` = leads to / results in
- `[Δ]` = change / update
- `[!]` = critical / must not violate
- `[+]` = add / benefit
- `[?]` = condition / if

Shorthand — always use: `auth` `db` `config` `deps` `env` `async` `infra` `CI` `CD`
Max density: 1 line per concept. No multi-sentence explanations unless HIGH report level.

---

## PROTECTED FILES

```
governance:  FOUNDATION.md | AI-EXECUTION-PROTOCOL.md | AI_POLICY.md
control:     .github/workflows/** | .devcontainer/** | .aiignore | packages/config/**
continuity:  SESSION.md
```

---

## PRE-ACTION PHASES

### Phase 0 — Reality Acquisition
Read before modifying: `FOUNDATION.md`, `README.md`, `AI_POLICY.md`, workflows, affected apps/packages, tests, schemas, env contracts, decision logs.
[?] missing context → stop

### Phase 1 — Change Identification
Classify: feature / infra / security / workflow / deployment / dep graph / runtime / shared contract.
[?] unknown scope → stop

### Phase 2 — Downstream Impact
```
shared-types Δ → all apps affected
config Δ → env → runtime boot → deployments
workflow Δ → security model affected
middleware order Δ → security guarantees affected
```
[?] no impact map → stop

### Phase 3 — Constraint Scan
Search: `CONSTRAINT:`, architecture rules, deployment/runtime/security assumptions.
[!] violation detected → stop

### Phase 4 — Security Reflection
```
change → attack surface [+]?         → stop
change → secret exposure?            → stop
change → weaker least privilege?     → stop
change → validation bypass?          → stop
change → mutable supply-chain trust? → stop
change → hidden runtime behavior?    → stop
change → AI trust increase?          → stop
```

### Phase 5 — Architecture Preservation
```
apps → packages; packages ↛ apps
```
[?] coupling / schema duplication / hidden shared state / domain lock-in / premature abstraction → stop

### Phase 6 — Simplicity Filter
```
real problem?                NO  → stop
premature optimization?      YES → stop
existing tooling sufficient? YES → stop
```

### Phase 7 — Build Sequence Validation
```
contracts → validation → apps → tests → CI/CD → deployment
```
[!] sequence violation → stop

### Phase 8 — Dependency Reflection
```
dep necessary?                 NO  → stop
official maintainer?           NO  → stop
trustworthy maintenance state? NO  → stop
existing solution available?   YES → stop
exact version pinned?          NO  → stop
```

### Phase 9 — Runtime Failure Simulation
```
failure → fail closed?                NO  → stop
failure → explicit errors?            NO  → stop
failure → malformed data propagation? YES → stop
failure → CI detection?               NO  → stop
recovery path defined?                NO  → stop
```

### Phase 10 — AI Policy Reflection
```
behavior auditable?              NO  → stop
behavior explicit?               NO  → stop
behavior → hidden magic?         YES → stop
undocumented assumptions?        YES → stop
AI → convenience > correctness?  YES → stop
```

### Phase 11 — Pre-Commit Simulation
```
clean install → build → CI → deploy → runtime boot → env loading → API execution → package resolution
```
[?] unsimulated critical change → stop

### Phase 12 — Documentation Reflection
Architecture Δ → update: `FOUNDATION.md`, `README.md`, `AI_POLICY.md`, workflows, decision logs.
[!] code/doc divergence → stop

---

## NEW TOPIC PROTOCOL

Before implementing any feature, security control, or config Δ — discuss + agree upfront:

1. **Impact** — attack surface Δ? industry-standard? what breaks?
2. **CI/CD** — workflow touched? new secrets/env vars required?
3. **Git Flow** — mandatory order, all commands from root:

```bash
git checkout main && git pull origin main
git checkout -b <branch-name>
# Δ changes
git add <files>
git commit -m "<type>: <message>"
git push origin <branch-name>
# PR → CI pass → merge
git checkout main && git pull origin main
git branch -d <branch-name> && git push origin --delete <branch-name>
```

4. **Traceability** — all 4 layers required:
   - Decision → `FOUNDATION.md` §10 (Decision Log) — before/during implementation
   - Code → feature branch, PR, CI pass
   - Docs → `FOUNDATION.md` §9.1 updated on merge; §9.2 cleaned
   - Commit → `<type>: <description>` (`feat:` `fix:` `docs:` `security:` `chore:`)

[!] Merged PR without `FOUNDATION.md` Δ = incomplete change.

---

## LOCAL VERIFICATION

[!] All verification commands run from monorepo root. No `cd`.
[!] Mandatory order before every commit:

```
1. npm ci
2. npm run build
3. npm run dev:api                → server starts clean
4. curl (no key)                  → rejection response
5. curl (with key)                → data returned
6. npm run dev:web                → browser loads
7. npm run test                   → all pass
8. npm run lint                   → clean
```

[!] No `git add`, no commit, no push until all pass.
[!] Share output of each step. Do not assume passed.

---

## REPORTING LAW

Every action outputs: executed phases | skipped phases | severity | evidence refs.
No hidden reasoning claims.

### Skip Format
```
⊘ Phase N — <Name>
Reason: <why>
```
Hidden skips forbidden.

### Report Levels

**LOW** — phase completion only, minimal decision summary
**MEDIUM** [+] affected systems, findings, severity, warnings
**HIGH** [+] assumptions, rejected approaches, security reflections, runtime simulations, unresolved uncertainty

Session default: `MEDIUM`

---

## EVIDENCE LAW

All reports require refs. Examples:
- `FOUNDATION.md §7.4`
- `AI_POLICY.md`
- `packages/config/src/env.ts`
- `.github/workflows/ci.yml`

[!] No evidence → no compliance claim.

---

## DOC UPDATE TRIGGERS

| File | Update When |
|------|-------------|
| `FOUNDATION.md` | architecture / goals / constraints / decisions Δ |
| `AI_POLICY.md` | AI permissions / restrictions / access boundaries Δ |
| `AI-EXECUTION-PROTOCOL.md` | request flow / risk classes / stop rules Δ |
| `SESSION.md` | focus Δ / new blocker / short-term decision / continuity |

---

## META-LAW

```
understand existing system → before → changing existing system
working code ≠ strong engineering
AI → constrained engineering steward, not unrestricted generator
```
