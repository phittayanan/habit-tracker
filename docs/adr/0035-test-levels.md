# 0035. Test levels and tools

Status: accepted
Design ID: D-34 (Issue #3)

## Decision
A. The stack's usual test runner for unit and API tests against a real test database, and Playwright for the browser journeys.

## Options considered
- A. The stack's usual test runner for unit and API tests against a real test database, and Playwright for the browser journeys. **(chosen)**
- B. The same unit and API setup as A, and Cypress for the browser journeys.
- C. The same unit and API setup as A, and component-level UI tests (for example Testing Library) in Sprint 1, with a browser journey test added later.
- Other: your own answer.

## Why
Covers all three required levels; the kit's CI already starts a PostgreSQL service for the tests.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
