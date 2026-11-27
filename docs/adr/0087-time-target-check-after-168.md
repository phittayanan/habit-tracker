# 0087. The whole-minutes check of a target change waits for the template kind

Status: chosen by phittayanan on 2026-11-27 in the Claude Code session for [Issue #153](https://github.com/phittayanan/habit-tracker/issues/153), from two options Claude Code proposed. projectnewy, the F-14 contract author and owner of #168, sees it in the #153 PR review.

## Decision

The F-14 contract asks for whole minutes on a `TIME` goal's new target (section 4 order 4, TC-154 (d)) and the "= 7 h" hint (section 6). `Template.kind` arrives with [Issue #168](https://github.com/phittayanan/habit-tracker/issues/168). The #153 PR opens for review without these two parts and does not merge until #168 is merged into `staging`; then the check, the hint and TC-154 (d) are added to the same PR.

## Options considered

- **A. Same PR, merged after #168 (chosen).**
- B. Merge #153 without them and leave them to #168 or a later Issue.

## Why

One PR covers the whole contract, and no `TIME` goal can take a fractional target at any time.
