# 0064. Template kind: Count or Time

Status: chosen by phittayanan on 2026-11-27 in [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151) (Q1, Q9, Q10). The Issue says both students decide this: agreed by projectnewy in the [review of d4c72cb](https://github.com/phittayanan/habit-tracker/pull/167#pullrequestreview-6087108343) of PR #167.

## Decision

1. Each template has a kind, `COUNT` or `TIME`, chosen by the Manager on the template form. The default is `COUNT`.
2. Templates that exist before this change become `COUNT`, so nothing changes for them.
3. A `TIME` template stores whole minutes (ADR 0065).
4. The kind can be changed only while no goal uses the template, like the other template fields (BR-08).
5. A count goal's − / + steps by 1. A time goal's bar runs from 0 to the template's maximum, one segment = 15 minutes. Neither goes past what still fits in the day (BR-04).
6. The code (database column, template API, Manager form) is Issue #168, blocked by #151 and blocking #155.

## Options considered

- **A. A kind on the template (chosen).**
- B. Guess the kind from the unit text (for example "hours" means time). Rejected: units are free text (ADR 0007), so a unit such as "hrs" or "ชั่วโมง" would get the wrong input with no error.
- C. One input for every goal. Rejected: it drops the light-up bar chosen in ADR 0063.

## Why

The day box needs a different input per kind (ADR 0063), and only a stored kind is always right.

## Consequences

- Data model change: a new column on `Template`. The F-03 and F-04 contracts gain the kind rules.
