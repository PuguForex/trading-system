# Monorepo Setup – Trading System

## 1. Overview

This project was initially built as a single TypeScript application (`ts-trading-processor`) and later refactored into a monorepo structure to support multiple applications and shared code.

---

## 2. Goals

* Support multiple applications (client + API)
* Share common types across projects
* Improve developer experience
* Maintain clean architecture and separation of concerns

---

## 3. Final Structure

```
trading-system/
├── apps/
│   ├── trading-client
│   └── api-service
│
├── packages/
│   └── shared-types
│
├── package.json
├── node_modules/
└── monorepo.md
```

---

## 4. Key Concepts

### 4.1 Monorepo

A single repository containing multiple applications and shared packages.

### 4.2 Shared Types

The `shared-types` package provides a single source of truth for core data contracts (e.g., Trade).

### 4.3 Separation of Concerns

* API handles data exposure
* Client handles processing
* Shared package defines contracts

---

## 5. Migration Steps (Summary)

1. Started with single project
2. Introduced `apps/` and `packages/`
3. Moved app into `apps/trading-client`
4. Extracted `shared-types`
5. Added `api-service`
6. Connected client to API
7. Introduced npm workspaces
8. Centralized dependency management
9. Added root-level scripts

---

## 6. Dependency Management

Using npm workspaces:

```json
"workspaces": [
  "apps/*",
  "packages/*"
]
```

Benefits:

* Single `node_modules`
* Automatic linking of internal packages
* Consistent dependency versions

---

## 7. Development Workflow

### Install dependencies

```
npm install
```

---

### Build all projects

```
npm run build
```

---

### Run API

```
npm run start:api
```

---

### Run Client

```
npm run start:client
```

---

### Run Tests

```
npm run test
```

---

## 8. Best Practices

* Keep each app self-contained
* Share only contracts (not business logic)
* Use packages for reusable code
* Run Git commands from root
* Use root scripts for consistency

---

## 9. Future Improvements

* Introduce shared base tsconfig
* Add linting (ESLint)
* Add formatting (Prettier)
* Evaluate monorepo tools (Nx, Turborepo)

---

## 10. Key Learnings

* Monorepo is about structure + workflow
* Workspaces simplify dependency management
* Separation of concerns enables flexibility
* Small, incremental changes are safer than big refactors
