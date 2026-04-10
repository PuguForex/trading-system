# Architecture Overview

---

# 🎯 Objective

Provide clarity on system structure and runtime behavior.

---

# 🧠 System Components

---

## 🟢 api-service

```text
Node.js backend (Express API)
```

* Serves `/trades`
* Uses shared config + types

---

## 🟢 trading-client

```text
Node.js client (CLI application)
```

* NOT a browser frontend
* Fetches data from API
* Uses same config system

---

## 🟢 shared packages

```text
packages/config
packages/shared-types
```

---

# 🧠 Current Flow

```text
trading-client (Node) → api-service (Render API)
```

---

# ⚠️ Important Clarification

```text
This is NOT a browser-based frontend
```

---

# 🧠 Future Evolution

```text
Browser frontend (Vite/React) → API
```

---

# 🎯 Design Principles

* Centralized config
* Shared types
* Monorepo consistency
* Environment separation

---

# 🎯 Current State

```text
Backend + Node client system ✅
```

---

# 🔐 Security Layer

---

## Dev Environment Security

The development environment runs inside a hardened Dev Container.

Key protections:

* Non-root execution
* Restricted Linux capabilities
* No privilege escalation
* Limited file visibility

---

## AI Safety Model

AI tools (Copilot, Claude, Codex, Cursor) are treated as untrusted agents.

Controls:

* No direct access to sensitive files
* No automatic command execution
* Human verification required

---

## Design Principle

```text
Contain AI → limit impact → prevent system damage
```

---
