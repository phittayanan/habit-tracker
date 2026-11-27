# Appendix: contract criteria and records

## X.1 Sprint 1 criteria behind the two accepted defects

As they read in `v1.4`. The NUL clause in each was added by the fix, before its failing test. Files: `docs/sprints/sprint-1/F-01-login.md`, `F-03-template-create.md`, `F-04-template-edit.md`.

| ID | Criterion |
|---|---|
| AC-01.2 | An unknown username and a wrong password each get `401 INVALID_CREDENTIALS` with the same message, no `Set-Cookie`, and no new session. This holds for any username text, including one with a NUL character (no account can have such a username, so it is an unknown username) |
| AC-03.3 | A missing, empty or non-string `name` or `unit`, a name or unit over the length limit, a name or unit that contains a NUL character (PostgreSQL text cannot hold it), and a missing or non-numeric `minValue` or `maxValue`, or one with more than 2 decimal places, get `400 VALIDATION_ERROR` and nothing is stored |
| AC-04.4 | An empty body, a field with a wrong type or more than 2 decimal places, a `name` or `unit` that contains a NUL character (PostgreSQL text cannot hold it), and a non-integer id get `400 VALIDATION_ERROR`; an unknown id gets `404 TEMPLATE_NOT_FOUND`; an anonymous edit gets `401 UNAUTHENTICATED`; nothing changes |

## X.2 Records as posted on GitHub

Copied from GitHub by `fetch-records.sh`, unchanged. Times in this section are **UTC** (Asia/Bangkok is UTC+7). A review or comment that says it was AI-assisted was approved or decided by the student named.

{{include:records.md}}
