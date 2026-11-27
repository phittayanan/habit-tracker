# 0095. Focus after a successful retire

Status: chosen by projectnewy on 2026-11-27 in [Issue #152](https://github.com/phittayanan/habit-tracker/issues/152), after finding 1 of phittayanan's review of 16a615e on [PR #179](https://github.com/phittayanan/habit-tracker/pull/179). phittayanan's agreement is pending.

## Context

ADR 0079 removes the Retire button from a retired row, so after a successful retire focus cannot go back to it. In the first build focus fell to the page body (NFR-06). The review found that the keyboard was not stuck, but that nothing was focused right after the retire.

## Decision

After a successful retire, focus moves to the "Retired" cell of the same row. The cell can take focus from the page but is not a Tab stop, and it shows the same focus outline as the controls. Cancel and Escape still return focus to the row's Retire button.

## Options considered

- **A. The row's "Retired" cell (chosen).**
- B. The "Templates" heading.
- C. No change: the next Tab already reaches a later row's button.

## Why

The keyboard user stays on the row they acted on, and the focused text states the result. Screen reader behaviour was not tested.
