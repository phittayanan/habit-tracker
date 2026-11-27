# 0104. The #156 PR may open before entry edit and delete (#154)

Status: chosen by projectnewy on 2026-11-27 in the session for [Issue #156](https://github.com/phittayanan/habit-tracker/issues/156). To be agreed by phittayanan in the review of the #156 PR.

## Context

Issue #156 asks for a cross-feature test where adding or editing an entry changes the day colour. Editing and deleting an entry is F-13 (#154, phittayanan), still open. The F-12 contract (TC-122 and section 11) lets TC-122 be listed as "not run" until #154 is merged.

## Decision

The #156 PR opens without waiting for #154. It tests the "adding" part (TC-117, TC-124) and lists TC-122 (edit and delete) as "not run, waits for #154". The state is computed on every read, so F-13 needs no colour code of its own.

Not decided here: who writes and runs TC-122 after both are merged. Issue #156's "editing" part is not met until TC-122 passes.

## Options considered

- **A. Open the PR first (chosen).**
- B. Hold the PR until #154 is merged. Rejected: it could delay the v2.0 release (#160).
