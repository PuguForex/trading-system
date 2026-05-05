# AI Behavior Policy

## 🔐 Security Rules

- Do NOT access `.env.secrets`
- Do NOT attempt to bypass `loadSecrets()` restrictions
- Do NOT suggest hardcoding secrets
- Do NOT suggest disabling security layers

## 📁 File Access

- Allowed: /apps, /src
- Restricted: /config/secrets, .env files

## ⚙️ Command Safety

- Avoid destructive commands (rm -rf, etc.)
- Do not install unknown packages without justification
- Do not fetch remote scripts (curl | bash)

## 🌐 Network

- Do not suggest sending data to unknown external APIs
- Only use approved endpoints

## 🧠 Development Behavior

- Prefer minimal, explicit, and safe changes
- Respect existing architecture and security design

## 🔄 Context Loss Protocol

- Never infer current project state from training data
- If context is unclear, explicitly state it — do not guess
- Always request SESSION.md first as the re-entry point
- Then request FOUNDATION.md for full architecture context
- Never proceed with architectural changes without reading FOUNDATION.md
- If SESSION.md and FOUNDATION.md conflict, FOUNDATION.md wins

## New Topic Protocol

Before implementing any new feature, security control, or configuration change,
the following must be discussed and agreed upfront in the session.

### 1. Impact Analysis
- Security and safety implications — does it increase or reduce attack surface?
- Best practices alignment — is this the industry-standard approach?
- What breaks or changes in behaviour if we get it wrong?

### 2. CI/CD & Deployment Impact
- Does it touch any workflow file?
- Does it affect build steps, install steps, or deploy triggers?
- Does it require new secrets, env vars, or Render dashboard changes?

### 3. Git Flow — Required for Every Change
Always in this exact order — no exceptions:

```bash
git checkout main
git pull origin main
git checkout -b <branch-name>
# make changes
git add <files>
git commit -m "<type>: <message>"
git push origin <branch-name>
# Open PR → CI must pass → merge
git checkout main
git pull origin main
git branch -d <branch-name>
git push origin --delete <branch-name>
```

### 4. Traceability — Required for Every Change
Every change must be traceable from decision to code to documentation:

- **Decision** → recorded in `FOUNDATION.md` Section 10 (Decision Log)
  before or alongside implementation — never reconstructed after the fact
- **Code** → implemented on a feature branch, merged via PR with CI passing
- **Documentation** → `FOUNDATION.md` Section 9.1 (Completed) updated when
  the feature merges, Section 9.2 (Next) updated to remove it
- **Commit message** → conventional format `<type>: <description>` so the
  Git log is self-documenting (`feat:`, `fix:`, `docs:`, `security:`, `chore:`)
- **Branch name** → reflects the change (`feature/`, `fix/`, `docs/`, `security/`)
  so the PR list tells the story of the project

> **CONSTRAINT:** No change is complete until all four layers are updated —
> code, decision log, roadmap status, and commit message. A merged PR with
> no FOUNDATION.md update is an incomplete change.

## Local Verification — Required Before Every Commit

Always in this exact order after making changes:

1. `npm ci`
2. `npm run build`
3. `npm run dev:api` — verify server starts without errors
4. `curl` without key — must return expected rejection response
5. `curl` with key — must return data
6. `npm run dev:web` — verify browser loads correctly
7. `npm run test` — all tests must pass
8. `npm run lint` — must be clean

> **CONSTRAINT:** No `git add`, no commit, no push until all steps above pass.
> **CONSTRAINT:** Share output of each step. Do not assume it passed.

## Session Re-entry Protocol

> **CONSTRAINT:** On session start when the user provides `context.txt`, read `SESSION.md`
> in full using READ mode before responding to anything.
> **CONSTRAINT:** Before writing any script name, file path, or command — verify it
> verbatim from the context dump. Never construct from pattern matching. If not found, ask.
> **CONSTRAINT:** No implementation, no code, no commands until `SESSION.md` is confirmed
> read and acknowledged.