# 0103. On desktop the day panel stays while the List is shown

Status: chosen by projectnewy on 2026-11-27 in the session for [Issue #156](https://github.com/phittayanan/habit-tracker/issues/156). To be agreed by phittayanan in the review of the #156 PR.

## Context

The F-15 contract says the List replaces the calendar. It does not say what happens to the desktop side panel beside the calendar (ADR 0047).

## Decision

The List replaces only the calendar side (the table and its legend). The panel stays on the right with the chosen day, and checking in there updates the List without a reload. A List day is still not clickable (F-15 OP-15.3).

## Options considered

- **A. Keep the panel (chosen).**
- B. Hide the panel and give the List the full width.
