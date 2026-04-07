# ESLint Setup & Workflow (Monorepo)

---

# 🎯 Objective

Establish a **reliable linting system** that:

* Works across a monorepo
* Supports TypeScript
* Integrates with CI
* Avoids common pitfalls

---

# 🧱 Final Setup Overview

```text
Root-level ESLint config (flat config)
↓
Covers all apps + packages
↓
Ignores build output (dist)
↓
Runs via npm script
↓
Integrated into CI
```

---

# 🧠 Key Decisions

---

## ✅ 1. Use ESLint Flat Config (v9+)

* Config file:

```text
eslint.config.mjs
```

* Reason:

  * Modern standard
  * Future-proof
  * Required by ESLint v9+

---

## ✅ 2. Use Root-Level Config

* Single config at project root
* Applies to:

```text
apps/*
packages/*
```

---

## ✅ 3. Ignore Build Output

```text
dist/
node_modules/
```

👉 Lint only **source code**, not compiled JS

---

# 🧱 Installation (Root)

```bash
npm install -D eslint @eslint/js typescript-eslint
```

---

# 🧱 Final Config

**File:**

```text
eslint.config.mjs
```

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/dist/**', 'node_modules'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
  },
];
```

---

# 🧱 Script

**File:**

```text
package.json (root)
```

```json
"scripts": {
  "lint": "eslint . --ext .ts"
}
```

---

# 🧪 Running Lint

```bash
npm run lint
```

---

# 🧠 Common Issues & Fixes (VERY IMPORTANT)

---

## ❌ Issue 1 — ESLint config not found

```text
ESLint couldn't find eslint.config.js
```

### ✅ Fix

Use:

```text
eslint.config.mjs
```

---

## ❌ Issue 2 — "Cannot use import statement outside module"

### Cause:

* Using `.js` instead of `.mjs`

### ✅ Fix:

```bash
mv eslint.config.js eslint.config.mjs
```

---

## ❌ Issue 3 — Missing @eslint/js

```text
Cannot find package '@eslint/js'
```

### ✅ Fix:

```bash
npm install -D @eslint/js
```

---

## ❌ Issue 4 — Missing typescript-eslint

```text
Cannot find package 'typescript-eslint'
```

### ✅ Fix:

```bash
npm install -D typescript-eslint
```

---

## ❌ Issue 5 — Linting dist/ folder

### Symptoms:

* Hundreds of errors from compiled JS

### ✅ Fix:

```js
ignores: ['**/dist/**', 'node_modules']
```

---

## ❌ Issue 6 — False TypeScript Errors (Editor Only)

Example:

```ts
new Error(message, { cause: error })
```

Error:

```text
Expected 0-1 arguments, but got 2
```

---

### 🔥 Root Cause

VS Code using **built-in TypeScript**, not project version

---

### ✅ Fix (CRITICAL)

In VS Code:

```text
Ctrl + Shift + P
→ TypeScript: Select TypeScript Version
→ Use Workspace Version
```

---

### 🧠 Insight

```text
Editor TS ≠ Project TS
```

---

# 🧠 What Linting Now Enforces

---

## ✅ Code Quality

* No unused variables
* Clean imports
* Consistent patterns

---

## ✅ Safer Error Handling

```ts
new Error(message, { cause: error })
```

---

## ✅ Early Bug Detection

* Prevents issues before runtime
* Works as first validation layer

---

# 🧠 Role in System Architecture

```text
Developer → Lint → CI → Merge
```

---

👉 Linting acts as:

* First automated reviewer
* Guardrail for AI-generated code (future)

---

# 🎯 Current Status

```text
ESLint setup ✅
Errors fixed ✅
Editor aligned ✅
```

---

# 🚀 Next Step

👉 Integrate linting into CI pipeline

---

# 🧠 Final Insight

> Linting is not just formatting — it is **automated code review**

---
