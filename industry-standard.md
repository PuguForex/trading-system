# 🔐 Trading System — Secure Development Environment

## 📌 Overview

This project is built as a **secure, containerized development environment** designed for **AI-assisted development (Cursor, Copilot, Claude, etc.)** with strong security guardrails.

The goal is to **contain risk**, not eliminate functionality — enabling safe experimentation without exposing secrets or system integrity.

---

## 🧱 Architecture

### 🔹 Stack

```
Windows (Host)
→ WSL (Linux layer)
→ Docker (Container runtime)
→ Dev Container (VS Code / Cursor)
→ Node (non-root user)
→ Applications (API + Web Client)
```

---

### 🧠 Conceptual Model

* **Host (Windows)** → Base system
* **WSL** → Linux compatibility layer
* **Docker** → Runtime enforcement (security controls)
* **Dev Container** → Isolated workspace
* **Node user** → Least-privilege execution
* **App layer** → Business logic (API + frontend)

---

## 🔐 Security Layers

---

### 1️⃣ Runtime Isolation (Docker)

Configured via:

* `--cap-drop=ALL`
* `--security-opt=no-new-privileges`
* `--pids-limit=256`
* `--dns=8.8.8.8`

#### ✅ Provides

* Prevents privilege escalation
* Limits process explosion (fork bomb protection)
* Ensures controlled DNS resolution

---

### 2️⃣ User-Level Isolation

```json
"remoteUser": "node"
```

#### ✅ Provides

* No root access inside container
* Prevents modification of system binaries
* Enforces least-privilege principle

---

### 3️⃣ File System Protection

```bash
chmod 600 .env
```

#### ✅ Protects

* API keys
* Secrets
* Sensitive configuration

---

### 4️⃣ Command Visibility

```bash
export PROMPT_COMMAND="history -a"
```

#### ✅ Provides

* Real-time command logging
* Audit trail for AI / user actions
* Debugging and traceability

---

### 5️⃣ Command Guard (Soft Control)

```bash
alias rm='rm -i'
alias curl='echo "blocked"; false'
alias wget='echo "blocked"; false'
```

*

```bash
~/safe-bin (PATH override)
```

#### ✅ Provides

* Prevents accidental destructive commands
* Blocks common unsafe patterns (`curl | bash`)
* Reduces AI-generated command risks

#### ⚠️ Note

This is **not a hard security boundary**, only a guardrail.

---

### 6️⃣ Configuration Security (Zod + Env System)

Centralized config:

```
packages/config/src/env.ts
```

#### Features

* Environment-based loading (`.env.development`, `.env.production`)
* Schema validation using Zod
* Type-safe access to variables

#### Example

```ts
const schema = z.object({
  PORT: z.string().min(1),
  API_URL: z.url(),
  ALLOWED_ORIGINS: z.string().min(1)
});
```

---

### 7️⃣ API Access Control (CORS)

```ts
const allowedOrigins = env.ALLOWED_ORIGINS.split(",");
```

#### ✅ Provides

* Restricts which frontends can access API
* Prevents unauthorized browser-based requests

---

## 🚫 Intentionally NOT Implemented

The following were evaluated but **intentionally avoided**:

---

### ❌ Docker Network Override

```
--network=custom-network
```

**Reason:**
Not compatible with Dev Containers (managed networking)

---

### ❌ OS-level Firewall

**Reason:**
Too complex for local dev; reduces productivity

---

### ❌ Outbound Request Control

**Reason:**
No external API calls currently exist

---

## ⚠️ Mistakes & Lessons Learned

---

### ❌ Global Permission Changes

```bash
chmod -R 755
```

**Issue:**
Affected system-managed files (`node_modules`)

**Lesson:**
Always scope file operations

---

### ❌ Schema Mismatch

Updating `.env` without updating schema caused:

```
Property does not exist on type...
```

**Fix:**

1. Update Zod schema
2. Restart backend
3. Restart TypeScript server

---

### ❌ Wrong Layer Enforcement

Attempted:

* Docker network isolation
* `ulimit` verification

**Lesson:**

> Security must be applied at the correct abstraction layer

---

## 🧠 Security Principles Applied

---

### 1. Least Privilege

* Non-root execution
* No privilege escalation

---

### 2. Defense in Depth

Multiple layers:

* Runtime
* User
* File system
* Application

---

### 3. Scope Control

* No global destructive operations
* Targeted protections only

---

### 4. Schema-Driven Configuration

* Env variables must be defined in schema
* Prevents runtime surprises

---

### 5. Visibility Before Restriction

* Logging first
* Enforcement later

---

## 🎯 Current Capabilities

---

### ✅ What is Protected

* Secrets (`.env`)
* System binaries
* Privilege escalation
* Process abuse
* Unauthorized frontend access

---

### ⚠️ What is NOT Fully Controlled

* Outbound network traffic (not needed yet)
* Runtime API calls (future feature)
* Advanced kernel-level restrictions

---

## 🚀 Future Enhancements (Phase 3)

* Secrets management (Vault / encrypted store)
* CI/CD security alignment
* AI tool sandbox policies
* Network-level enforcement
* Audit logging system

---

## 🧠 Summary

This project implements a:

> **Containerized, security-hardened development environment with AI-safe guardrails**

It ensures:

* Controlled execution
* Protected secrets
* Safe experimentation
* Minimal attack surface

---

## 🏁 Final Note

Security in this project is:

```
Layered
Intentional
Reversible
Aligned with development workflow
```

Not:

```
Over-engineered
Blocking productivity
```

---
