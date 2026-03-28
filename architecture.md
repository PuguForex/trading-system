# Architecture Overview

## 1. Architecture Style

This project follows a **Layered Architecture**.

Purpose:

* Separation of concerns
* Maintainability
* Scalability

---

## 2. Project Structure

src/

* index.ts → Entry point (orchestration)
* models/ → Data contracts (Trade, Summary)
* services/ → Business logic & data access

  * TradeService → Load data (file/API)
  * TradeProcessor → Process and transform data
* utils/ → Output / helper logic

  * ReportPrinter → Console output

---

## 3. Responsibility Separation

Each layer has a single responsibility:

* Models → Define data shape
* Services → Handle logic and operations
* Utils → Formatting and helpers
* Entry → Coordinate flow

Principle:
"One file = one responsibility"

---

## 4. Dependency Direction

Correct flow:

index → services → models

Rules:

* Higher-level modules depend on lower-level modules
* Models should not depend on services

---

## 5. Loose Coupling

Components are replaceable.

Example:

* Current: Load data from JSON file
* Future: Load data from API

Only TradeService changes — rest of system remains unaffected

---

## 6. Testability

Business logic is isolated:

* processTrades()
* calculateSummary()

These can be tested independently without external dependencies.

---

## 7. Key Principles Applied

* Separation of Concerns
* Single Responsibility Principle (SRP)
* Loose Coupling
* Modular Design

---

## 8. Design Goal

Build small, independent, and replaceable components.

Outcome:

* Easy to extend
* Easy to maintain
* Easy to scale

---

## 9. Future Evolution

This architecture can evolve into:

* API-based services
* Multi-project systems
* Shared libraries
* Monorepo structure

Without changing core design principles
