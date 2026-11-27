# 0101. Ask before discarding an unsaved entry edit

Status: proposed by Claude Code in [Issue #154](https://github.com/phittayanan/habit-tracker/issues/154); waiting for phittayanan's answer. To be agreed by projectnewy in the review of the #154 PR. Fills the wording that F-13 section 6 leaves to ADR 0067.

## Decision

In the day box or panel, when an entry is being edited and the typed value differs from the stored one, closing the box or choosing another day asks "Discard the edit to 4 glasses?" (for Time, "Discard the edit to 7 h 10 min?") with "Keep editing" and "Discard", in the same dialog as ADR 0067. When the typed value equals the stored one, or the boxes are empty, it closes at once.

## Options considered

- **A. Ask only when the value changed (chosen).**
- B. Ask whenever an edit is open. Rejected: it asks when nothing would be lost.
- C. Close and lose the edit silently. Rejected: ADR 0067 asks for an unsaved amount, and F-13 section 6 asks the same for an edit.

## Why

The question names what would be lost, as ADR 0067 does for "+3 glasses".
