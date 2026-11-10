# 0022. Non-functional requirements (pick any)

Status: accepted
Design ID: D-21 (Issue #3)

## Decision
A, C, D. A. Security and privacy (for example password hashing, no cross-user data access, tested). C. Usability and accessibility (for example works at phone width, keyboard use). D. Maintainability (for example a test coverage level, setup from a clean clone in a stated time).

## Options considered
- A. Security and privacy (for example password hashing, no cross-user data access, tested). **(chosen)**
- B. Performance (for example a page or API response time under a stated load).
- C. Usability and accessibility (for example works at phone width, keyboard use). **(chosen)**
- D. Maintainability (for example a test coverage level, setup from a clean clone in a stated time). **(chosen)**
- Other: your own answer.

## Why
Each one is checked by work we do anyway (access tests, a Playwright run at phone width, the Lab 5 clean-clone build); performance needs extra measurement, so it is left out.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
