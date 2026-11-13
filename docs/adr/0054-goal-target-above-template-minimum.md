# 0054. A goal's daily target must be above the template's minimum

Status: accepted. Decided by projectnewy on 2026-11-14 for Issue #74; phittayanan agreed in his review of PR #95 on 2026-11-14 (Issue #74 asks for both students)

## Decision

1. A goal's daily target must be greater than the template's minimum (`min_value`) and not above its maximum (`max_value`). A target equal to the minimum is rejected. SRS A-4 is revised to say so.
2. The rule is enforced by the API only. There is no database check and no migration. Goals that already exist are not changed.
3. A target that is not above the minimum gets `400 TARGET_NOT_ABOVE_TEMPLATE_MIN` with the message "Daily target must be above the template minimum." It is checked after the maximum rule and before the active-goal rule (F-07 section 4).

## Reasons

- Every entry is at least the minimum (F-06). A target equal to or below it is met by any entry, so "day met" (BR-07) means nothing. A target strictly above it can be missed, which is what the Issue asks for.
- An API-only rule keeps a rollback safe: no migration, so an older image reads the same schema (deployment.md section 6.4), and rows that exist stay readable.
- A template that has been used cannot be edited (F-04 AC-04.2), so an edit can never leave an existing goal at or below a new minimum.

## Consequences

- On a template with minimum 0 the rule changes nothing, because a target must already be above 0.
- A template whose minimum equals its maximum can take no goal, since no value is above the minimum and not above the maximum.
- The v1.0 test data that stored a target of 0.01 on a template with minimum 10 (TC-55) is changed to a valid target.

## Source

Issue #74, marked as unintended by phittayanan on 2026-11-13 while reviewing the Deliverable 1 report (Issue #11). The two questions it left open (the exact limit, and the database check) were answered by projectnewy on 2026-11-14 in the session for Issue #74. phittayanan agreed to both answers in his review of PR #95 the same day.
