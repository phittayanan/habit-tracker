# 0071. The List groups records by day

Status: chosen by phittayanan on 2026-11-27 in [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151) (Q8). To be agreed by projectnewy in the review of the #151 PR.

## Decision

The List (F-15) shows the days of the month newest first. Each day has its date and sign, then one row per goal active that day: total / target with the unit, ✓ when met, and the day's entries in brackets. A past day with active goals but no entries shows "No entries".

## Options considered

- **A. Grouped by day (chosen).**
- B. One flat row per entry. Rejected: no totals or met signs, and empty days are hidden.
