# GitHub Actions CI/CD Workflow (Final Setup)

## 🎯 Objective

Establish a **secure, reliable, and professional CI/CD workflow** that:

* Automatically builds and tests code
* Prevents broken code from reaching `main`
* Enforces a clean PR-based workflow

---

# 🧠 Final Architecture

```text
Developer → Feature Branch → PR → CI (build + test) → Merge → main
```

---

# 🧱 1. CI Workflow Configuration

## 📄 File

```
.github/workflows/ci.yml
```

## ✅ Final Version

```yaml
name: CI Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:

jobs:
  build:
    name: build-and-test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run rebuild

      - name: Run tests
        run: npm run test
```

---

## 🧠 Key Learnings

* `jobs.build.name` is **required** for branch protection detection
* `cache: 'npm'` improves CI speed
* CI must run on **pull_request** for enforcement

---

# 🧱 2. Branch Protection Rules

## 📍 Location

```
GitHub → Settings → Branches → Add rule
```

## 🎯 Apply to:

```
main
```

---

## ✅ Required Settings

### ✔️ Require a pull request before merging

Prevents direct pushes to main

---

### ✔️ Require status checks to pass before merging

Select:

```
build-and-test
```

---

### ✔️ Require branches to be up to date before merging

Ensures CI runs on latest code

---

## ❌ Disabled (for solo dev)

### Require approvals

Reason:

* Cannot approve your own PR
* Causes workflow deadlock

---

## ⚠️ Bypass Rules

```
Merge without waiting for requirements
```

* ❌ Do NOT use in normal workflow
* ✅ Only for emergencies

---

# 🧱 3. Correct Development Workflow

---

## Step 1 — Sync main

```bash
git checkout main
git pull origin main
```

---

## Step 2 — Create feature branch

```bash
git checkout -b feature/<name>
```

---

## Step 3 — Develop

* Write code
* Test locally

---

## Step 4 — Commit

```bash
git add .
git commit -m "Meaningful message"
```

---

## Step 5 — Push

```bash
git push -u origin feature/<name>
```

---

## Step 6 — Create Pull Request

```
feature/<name> → main
```

---

## Step 7 — CI Runs Automatically

* ✅ Pass → proceed
* ❌ Fail → fix → push again

---

## Step 8 — Handle "Out-of-date" Branch

If shown:

### Option A (UI)

```
Update branch
```

### Option B (CLI)

```bash
git pull origin main
git push
```

---

## Step 9 — Merge PR

```text
Merge pull request
```

---

## Step 10 — Cleanup

```bash
git checkout main
git pull origin main
git branch -d feature/<name>
git push origin --delete feature/<name>
```

---

# 🧱 4. CI Behavior (Understanding)

---

## ✅ When CI Runs

* On push to `main`
* On every PR update

---

## ❌ Failure Case

* Build/test fails
* Merge is blocked

---

## ✅ Success Case

* All checks pass
* Merge allowed

---

## ⚠️ Out-of-date Case

* Branch must be updated
* CI re-runs

---

# 🧱 5. Debugging CI

## 📍 Location

```
GitHub → Actions → Workflow → Job → Steps
```

---

## 🧠 Debug Rule

> Always check the FIRST failed step

---

# 🧱 6. Common Mistakes (and Fixes)

---

## ❌ CI not appearing in branch rules

✔️ Fix:

* Add `jobs.build.name`
* Push changes to PR branch

---

## ❌ Commit not visible on GitHub

✔️ Fix:

* Ensure correct branch
* Run `git push`

---

## ❌ Cannot delete branch

✔️ Fix:

```bash
git checkout main
git branch -d <branch>
```

---

## ❌ No upstream branch

✔️ Fix:

```bash
git push -u origin <branch>
```

---

# 🧱 7. Key Principles

---

## 🔐 Safety

* Never push directly to `main`
* Always use PR

---

## 🧪 Reliability

* CI must pass before merge

---

## 🔄 Consistency

* Always update branch before merge

---

## ⚡ Efficiency

* Use caching in CI

---

# 🧠 Final Insight

> CI/CD is not just automation — it is a **quality enforcement system**

---

# 🚀 Result

You now have:

* Automated validation ✅
* Safe merge workflow ✅
* Protected main branch ✅
* Scalable development process ✅

---
