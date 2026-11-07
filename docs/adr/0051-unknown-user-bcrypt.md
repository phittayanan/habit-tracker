# 0051. Unknown-user bcrypt comparison

Status: authorized for implementation; teammate re-review pending

## Decision

For a validated login whose username does not exist, compare the supplied password against a precomputed bcrypt hash at cost 10, the same cost as seeded accounts. Return the existing `401 INVALID_CREDENTIALS` response and create no session even if that comparison succeeds. Do not claim exactly equal response times.

## Source

projectnewy requested this in the current [implementation review](https://github.com/phittayanan/habit-tracker/pull/34#pullrequestreview-5810651960). The owner authorized implementing it in the 2026-11-07 review-fix brief for Issue #32. The corrected discussion on https://github.com/phittayanan/habit-tracker/pull/31 proposed it as a non-blocking open point; the later empty approval does not explicitly establish approval of OP-01.12. Current authorization is the basis for this decision. Failed-login limiting (OP-01.11) and the unrelated privacy test question (OP-10.1) are unchanged.
