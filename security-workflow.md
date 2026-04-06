# Secure Dependency Workflow – Trading System

## 1. Why This Is Required

Modern JavaScript development relies heavily on npm packages. However, this introduces serious risks:

* Supply chain attacks (e.g., compromised packages)
* Malicious install scripts (`postinstall`)
* Silent dependency updates via version ranges (`^`, `~`)
* Deep dependency trees (transitive risk)

The goal is to ensure:

* Predictable installs
* Controlled updates
* Reduced attack surface
* Safe development practices

---

## 2. Core Principles

1. **Never trust automatic updates**
2. **Minimize dependencies**
3. **Control installation behavior**
4. **Always assume risk exists**

---

## 3. Version Control Strategy

### ❌ Default (Unsafe)

```json
"express": "^4.18.2"
```

---

### ✅ Enforced (Safe)

```json
"express": "4.18.2"
```

---

### Global Setting

```id="1f0vhe"
npm config set save-exact true
```

---

### Why?

* Prevents silent upgrades
* Eliminates accidental installation of compromised versions
* Ensures deterministic builds

---

## 4. Lockfile Policy

### Required File

```id="0nqx1h"
package-lock.json
```

---

### Rules

* Must always be committed
* Must never be deleted casually
* Represents exact dependency tree

---

### Future (CI/CD)

```id="1n4zq9"
npm ci
```

* Enforces lockfile integrity
* Prevents unexpected installs

---

## 5. Safe Installation Workflow

### Standard Rule

> Never blindly run `npm install`

---

### Recommended Flow

#### Step 1 (Optional – High Safety)

```id="nslfdy"
npm install --ignore-scripts
```

* Prevents execution of malicious install scripts

---

#### Step 2

* Inspect package:

  * `package.json`
  * dependencies
  * scripts

---

#### Step 3

```id="i9y2bc"
npm install
```

* Run normally after verification

---

### When to Use `--ignore-scripts`

| Scenario              | Use      |
| --------------------- | -------- |
| New / unknown package | ✅ Yes    |
| Trusted package       | Optional |
| CI/CD                 | ❌ No     |

---

## 6. Dependency Minimization

### Rule

> Fewer dependencies = lower risk

---

### Strategy

* Prefer built-in Node.js APIs (e.g., `fetch`)
* Avoid unnecessary libraries
* Avoid small, single-purpose packages

---

### Example

* ❌ axios
* ✅ built-in `fetch`

---

## 7. Adding New Dependencies

Before installing:

1. Is this really needed?
2. Can Node.js already do this?
3. Is the package widely trusted?
4. Is it actively maintained?

---

## 8. Basic Security Checks

Run occasionally:

```id="ck2l1j"
npm audit
```

---

### Note

* Use as guidance, not absolute truth
* Do not blindly apply fixes

---

## 9. Incident Response

If a dependency compromise is suspected:

1. Stop development immediately
2. Remove compromised package
3. Rotate all secrets:

   * API keys
   * tokens
   * environment variables
4. Rebuild environment (container recommended)

---

## 10. Integration with Dev Container

This workflow is combined with:

* Dev Container isolation
* Linux-based execution environment

This ensures:

* Malicious code is contained
* Host system is protected
* Risk is minimized

---

## 11. Key Takeaway

> Security is not a tool — it is a **discipline and workflow**

This setup ensures:

* Controlled dependency usage
* Reduced exposure to supply chain attacks
* Reproducible and secure development environment

---

## 12. Environment Variables & Secret Management

### 12.1 Why Environment Variables Are Critical

Secrets such as:

* API keys
* tokens
* credentials

are the primary targets in most attacks.

Hardcoding these values in source code is unsafe and must be avoided.

---

### 12.2 `.env` Strategy

A `.env` file is used to store environment-specific configuration.

Example:

```env
PORT=3000
API_URL=http://localhost:3000
API_KEY=your-secret-key
```

---

### 12.3 Git Safety

#### Rules:

* `.env` must NEVER be committed
* `.env` must be present in `.gitignore`
* `.env.example` should be committed

Example:

```env
PORT=3000
API_URL=http://localhost:3000
API_KEY=your-api-key-here
```

---

### 12.4 Problem in Monorepo

In a monorepo setup:

* `.env` is located at root
* Applications run from subdirectories

By default, dotenv looks in:

```text
process.cwd()
```

This leads to failure in loading `.env`.

---

### 12.5 Temporary Solution (Not Recommended)

```ts
dotenv.config({ path: "../../.env" });
```

#### Issues:

* Fragile relative paths
* Breaks during refactoring
* Not scalable

---

### 12.6 Recommended Solution: Config Layer

Create a centralized configuration module.

#### File:

```text
apps/api-service/src/config/env.ts
```

---

#### Implementation:

```ts
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../../../.env")
});

export const env = {
  PORT: process.env.PORT
};

if (!env.PORT) {
  throw new Error("PORT is not defined in environment variables");
}
```

---

#### Usage:

```ts
import { env } from "./config/env";

const PORT = env.PORT;
```

---

### 12.7 Benefits

* Centralized configuration
* Strong validation
* No scattered `process.env` usage
* Easier refactoring
* Scalable architecture

---

### 12.8 Dev Container Integration

* `.env` is mounted into container via workspace
* Environment variables are available inside container
* Secrets remain local and are not committed

---

### 12.9 Security Rules

#### ❌ Never

* Commit `.env`
* Log sensitive values
* Hardcode secrets

---

#### ✅ Always

* Use `.env` for secrets
* Validate required variables
* Use centralized config module

---

### 12.10 Key Takeaway

> Environment variables are the most sensitive part of a system
> and must be handled with strict discipline and structure.
