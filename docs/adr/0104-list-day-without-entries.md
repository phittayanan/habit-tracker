# 0104. A List day with no entry shows only "No entries"

Status: chosen by projectnewy on 2026-11-27 in the session for [Issue #156](https://github.com/phittayanan/habit-tracker/issues/156). To be agreed by phittayanan in the review of the #156 PR. Makes ADR 0071 precise.

## Context

The F-15 contract has "one row per goal active that day" and also "No entries" for a day with active goals and no entry. It does not say whether such a day also has rows.

## Decision

A day with active goals and no entry at all shows its heading and "No entries", with no goal rows. A day with at least one entry has one row for every active goal; a goal with no entry that day shows its total of 0 and no brackets.

## Options considered

- **A. Only "No entries" (chosen).**
- B. A 0 row for each goal and also "No entries".
