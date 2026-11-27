# 0074. The counter and the bar save nothing at +0

Status: chosen by phittayanan on 2026-11-27 (R2), answering projectnewy's finding 2 in the [review of d4c72cb](https://github.com/phittayanan/habit-tracker/pull/167#pullrequestreview-6087108343) of PR #167.

## Decision

At +0 the count goal's Done and the time goal's Check in are disabled, so the counter and the bar save only amounts above 0. The typed row (ADR 0066) can still save an exact 0 when the template allows it.

## Options considered

- **A. Disabled at +0 (chosen).**
- B. Done at +0 stores an entry of 0. Rejected: a tap on Done could turn a grey day red (F-12 OP-12.2).
