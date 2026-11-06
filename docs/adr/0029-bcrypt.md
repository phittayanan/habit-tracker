# 0029. Password hashing method

Status: accepted
Design ID: D-28 (Issue #3)

## Decision
A. bcrypt.

## Options considered
- A. bcrypt. **(chosen)**
- B. argon2id.
- C. scrypt.
- D. The hashing method the chosen framework uses by default.
- Other: your own answer.

## Why
The most common choice with Node.js; the `bcryptjs` package needs no native build in Docker.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
