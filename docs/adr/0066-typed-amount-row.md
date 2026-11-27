# 0066. Each goal in the day box keeps a typed amount row

Status: chosen by phittayanan on 2026-11-27 in [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151) (Q3). To be agreed by projectnewy in the review of the #151 PR.

## Decision

Under the − / + counter or the bar, each goal keeps a typed row: "Other amount" (a number box) for a count goal, "Exact" with hour and minute boxes for a time goal, each with Save. ADR 0039 (type a number) stays in force.

## Options considered

- **A. Keep a typed row (chosen).**
- B. Only the counter (whole numbers) and the bar (15-minute steps). Rejected: 2.5 km or 7 h 10 min could not be entered, and ADR 0039 would need replacing.

## Why

It allows decimals and exact minutes and gives keyboard users a plain path (NFR-06).
