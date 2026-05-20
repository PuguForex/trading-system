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
proposal → explanation → validation guidance → evidence
```

[!] AI role = advisory, not autonomous execution.
[!] Human operator performs commands, edits, validation, commits, and deployment.
[!] No hidden assumptions. No implied execution. No fabricated results.

---

## FAILURE LAW

```
constraint violation → stop and reassess
```

No override. No bypass. No "best effort". Constraints = invariant.

---

## SEVERITY CLASSES

| Class  | Scope                                                                      |
| ------ | -------------------------------------------------------------------------- |
| LOW    | docs, comments, formatting                                                 |
| MEDIUM | app logic, validation, workflows, deps                                     |
| HIGH   | security, auth, secrets, CI/CD, architecture, deployment, shared contracts |

[!] Governance docs (`FOUNDATION.md`, `AI_POLICY.md`, `SESSION.md`) = HIGH risk regardless of class above.
[!] "It's just a docs change" is not a valid risk reduction argument.

---

## REQUEST CLASSIFICATION

Classify before acting:

- request_type: `topic` `question` `decision` `fix` `feature` `refactor` `workflow` `review` `execute`
- scope: `docs` `app` `package` `workflow` `deployment` `security` `governance` `session` `mixed`
- mode: `discuss` `propose` `review`
- risk: `low` `medium` `high` `governance`

[?] governance/control files touched → risk ≠ low
[?] file type ≠ risk determinant; effect determines risk

---

## SESSION RE-ENTRY

[!] On session start: read `SESSION.md` in full (READ mode) before responding.
[!] `SESSION.md` + `FOUNDATION.md` conflict → `FOUNDATION.md` wins.
[!] No implementation guidance until `SESSION.md` confirmed read.

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

- `[!]` = critical / must not violate
- `[?]` = condition / if
- `[+]` = add / benefit
- `→` = leads to / results in
- `Δ` = change / update

Shorthand — always use: `auth` `db` `config` `deps` `env` `async` `infra` `CI` `CD`
Max density: 1 line per concept. No multi-sentence explanations unless HIGH report level.

[!] Proposed governance or config changes should be presented in clear, copy-paste-ready format when possible.

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

Review before proposing changes to: `FOUNDATION.md`, `README.md`, `AI_POLICY.md`, workflows, affected apps/packages, tests, schemas, env contracts, decision logs.
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
proposed solution → sustainable under automated dep updates (Dependabot)? NO → stop
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

Completed architectural, security, workflow, or governance changes should be documented before merge or release.
[!] Temporary code/doc divergence during active implementation is acceptable until topic completion.
[!] Finalized behavior and approved decisions must be reflected in governance docs before merge or release.

---

## NEW TOPIC PROTOCOL

[!] Applies to ALL change types — feature, fix, security, config, refactor, AND docs.
[!] No exceptions for "it's just a docs change." Governance docs = HIGH risk. See SEVERITY CLASSES.

Before major implementation work — discuss + align on constraints, impact, and approach:

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
   - Decision → finalized architectural/security decisions documented before merge or release
   - Code → feature branch, PR, CI pass
   - Docs → governance docs updated after topic completion and validation
   - Commit → `<type>: <description>` (`feat:` `fix:` `docs:` `security:` `chore:`)

[!] Permanent architectural or governance changes merged without documentation updates = incomplete change.

---

## LOCAL VERIFICATION

[!] Human operator responsible for local verification and execution.
[!] AI may recommend validation sequence, but must not claim commands were executed unless explicitly confirmed.
[!] All verification commands run from monorepo root. No `cd`.
[!] Recommended order before commit:

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

[!] Do not assume validation passed without explicit human confirmation.

---

## REPORTING LAW

Responses should include:

- assumptions
- constraints
- severity when relevant
- evidence refs for governance/security claims

[!] Do not imply execution, validation, or runtime results that were not explicitly confirmed by human operator.

### Skip Format

```
⊘ Phase N — <Name>
Reason: <why>
```

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

| File                       | Update When                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FOUNDATION.md`            | finalized architecture / goals / constraints / decisions Δ before merge or release                                                                   |
| `AI_POLICY.md`             | AI permissions / restrictions / access boundaries / writing rules Δ                                                                                  |
| `AI-EXECUTION-PROTOCOL.md` | request flow / risk classes / stop rules Δ                                                                                                           |
| `SESSION.md`               | After every session with meaningful work — update ALL sections listed below. Omit only sections with zero change. Partial update = policy violation. |

### SESSION.md — Required Sections (all in scope by default)

| Section                | Update When                                                                      |
| ---------------------- | -------------------------------------------------------------------------------- |
| Current Focus          | active task Δ                                                                    |
| Completed This Session | any work completed                                                               |
| In Progress            | any task started but not finished                                                |
| Blockers               | blocker added or resolved                                                        |
| Decisions Made         | any short-term decision — including deferrals                                    |
| Files Touched          | [!] every file created or modified — cross-check against branch diff, not memory |
| Project File Tree      | new file added or file deleted                                                   |
| Next Actions           | ordering Δ / item completed / new item added                                     |
| Resume Notes           | any stale context must be removed; new critical context added                    |

[!] Omitting a section requires explicit justification in the SESSION.md update itself.
[!] "No changes" is only valid if verified — not assumed.

---

## META-LAW

```
understand existing system → before → changing existing system
working code ≠ strong engineering
AI → constrained engineering advisor, not autonomous operator
```

## CHAT AI OPERATING MODEL

```
human = executor
AI = advisor / reviewer / explainer
```

[!] AI does not autonomously:

- run commands
- modify infrastructure
- validate runtime behavior
- commit code
- deploy systems
- manage branches
- approve security posture

[!] AI provides:

- implementation guidance
- architectural analysis
- security reasoning
- code suggestions
- workflow recommendations
- documentation proposals

[!] Human operator remains final authority for:

- execution
- verification
- commits
- merges
- deployment
- security decisions

## COPILOT

### Permitted

- Inline completions: TypeScript, JavaScript source files in `apps/` and `packages/`
- Chat: discuss, propose, review modes
- Code suggestions within feature branches only

### Blocked

[!] No completions in: `FOUNDATION.md`, `AI_POLICY.md`, `SESSION.md`, `*.yml`, `*.json` config files
[!] No suggestions touching: middleware order, auth logic, env loading, secrets gate
[!] No suggestions accepted without diff review — treat as untrusted input

### Prompt Discipline

[!] Every prompt must include: scope + file + constraint reference
[!] Never open-ended delegation — "implement X" without context = rejected prompt
[!] Copilot output → feature branch → diff review → CI gate → merge. No exceptions.

### Git + CI Integration

[!] AI-suggested code follows identical review and CI standards as human-written code
[!] CI (lint → audit → build → test) is truth gate regardless of AI involvement
[!] No direct main commits from AI output
