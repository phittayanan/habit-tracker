# 0097. F-11 leaves the day state, colour and sign to F-12

Status: chosen by phittayanan on 2026-11-27 in the session for [Issue #155](https://github.com/phittayanan/habit-tracker/issues/155), before any F-11 code. To be agreed by projectnewy in the review of the #155 PR.

## Context

The F-11 contract (Issue #151) puts the F-12 day state in `GET /api/calendar` (`state`), the day's sign in the day box and panel (section 2 step 6), TC-117 (the colour changes after a save) and a List step in TC-110. The state rule, the colours, the signs and the List are F-12 and F-15, built in Issue #156, which projectnewy owns.

## Decision

1. Issue #155 builds `GET /api/calendar` with `state: null` on every day. It writes no state rule, colour, sign, legend or chip.
2. Issue #156 fills `state` by the F-12 rule, paints the days, adds the signs, the legend and the chip, and adds the List.
3. Until #156 is merged, TC-117 and the List step of TC-110 are "not run, waits for #156". AC-11.10 is tested in #155 for the card's total and entries; the sign and colour part is tested in #156 (TC-117).
4. A day button's accessible name in #155 is the date alone ("24 November"), or "24 November, future" for a future day; #156 adds the state words (F-12 section 6).

## Options considered

- **A. Leave the state to #156 (chosen).**
- B. Build the state rule, colours and signs in #155. Rejected: it takes part of projectnewy's Issue #156, which would need their agreement and an assignee change.

## Why

Each student keeps their own Issue (CLAUDE.md: never take the teammate's Issue unless they agree). The API shape stays as the contract says, so #156 changes only the value of `state` and adds the screen parts.
