# Deployment Workflow (Render)

---

# 🎯 Objective

Deploy backend service (`api-service`) to a live environment using Render.

---

# 🧠 Architecture Context

```text
Monorepo (root)
├── apps/api-service
├── apps/trading-client
├── packages/config
├── packages/shared-types
```

---

# 🚀 Deployment Platform

Using: Render

---

# 🧱 Key Configuration (CRITICAL)

---

## ❌ Incorrect (Common Mistake)

```text
Root Directory = apps/api-service
```

👉 Breaks:

* workspace resolution
* shared packages

---

## ✅ Correct

```text
Root Directory = (empty)
```

---

# 🧱 Build & Start Commands

---

## Build

```text
npm install && npm run rebuild
```

---

## Start

```text
node apps/api-service/dist/index.js
```

---

# 🧱 Environment Variables

Example:

```text
PORT=3000
```

---

# 🧠 Important Behavior

* Render injects `PORT`
* App must use validated env (`config` package)

---

# 🧪 Testing

```text
https://<your-app>.onrender.com/trades
```

---

# 🧠 Auto Deployment

* Triggered on push to `main`
* Integrated with CI pipeline

---

# ⚠️ Common Pitfalls

---

## ❌ Running from subdirectory

Breaks monorepo builds

---

## ❌ Hardcoding URLs

Always use env/config system

---

## ❌ Missing env variables

Causes runtime crash

---

# 🎯 Final Result

```text
Live API (production ready) ✅
```

---

# 🚀 Next

* Connect frontend
* Add advanced security

---
