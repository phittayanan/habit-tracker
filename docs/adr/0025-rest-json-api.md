# 0025. API conventions

Status: accepted
Design ID: D-24 (Issue #3)

## Decision
A. REST over JSON: resource paths, standard HTTP status codes, and a JSON error body with a code and message.

## Options considered
- A. REST over JSON: resource paths, standard HTTP status codes, and a JSON error body with a code and message. **(chosen)**
- B. JSON over HTTP with action-style paths (for example `POST /api/entries/record`), and a JSON error body.
- C. A typed RPC layer or GraphQL. Client and server share types, and the kit's JSON smoke test needs extra routes.
- D. Server-rendered form posts with no public JSON API. It fits D-23 option C.
- Other: your own answer.

## Why
Plain JSON paths match the kit's smoke test, and status codes (400, 401, 403, 409) make rule and access tests clear.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
