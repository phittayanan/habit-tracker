# 0102. "+ New goal" also sits above the calendar

Status: chosen by projectnewy on 2026-11-27 in the session for [Issue #156](https://github.com/phittayanan/habit-tracker/issues/156), before any F-15 screen code. Agreed by phittayanan in the [review of 8cf2ee2](https://github.com/phittayanan/habit-tracker/pull/185#pullrequestreview-6091551110) of PR #185.

## Context

The F-15 contract (section 2 step 1) puts the "Calendar" and "List" buttons above the calendar, next to "+ New goal" (ADR 0049). The calendar page built in #155 has no "+ New goal"; only the goals page has it.

## Decision

The calendar page shows a "+ New goal" link beside the switch. It opens the existing form at `/goals/new`, which behaves as before (after Save it goes to the goals page). The goals page does not change.

## Options considered

- **A. Add "+ New goal" beside the switch (chosen).**
- B. Add only the switch and change the F-15 text.
