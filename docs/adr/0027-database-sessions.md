# 0027. Session design

Status: accepted
Design ID: D-26 (Issue #3)

## Decision
A. A server-side session row in the database, with an HTTP-only cookie holding the session ID. Logout deletes the row.

## Options considered
- A. A server-side session row in the database, with an HTTP-only cookie holding the session ID. Logout deletes the row. **(chosen)**
- B. A signed token (JWT) in an HTTP-only cookie, with a short expiry. No session table, and logout clears the cookie while a stolen token works until it expires.
- C. A signed token (JWT) sent in an `Authorization` header and kept by the frontend. No session table, and the browser stores the token.
- D. The login feature of the chosen framework or library, with its default session store. The library decides the storage.
- Other: your own answer.

## Why
The guide recommends sessions in the database, a redeploy does not log users out, and logout really ends the session.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
