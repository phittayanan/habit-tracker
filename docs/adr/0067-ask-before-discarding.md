# 0067. Ask before discarding an unsaved amount

Status: chosen by phittayanan on 2026-11-27 in [Issue #151](https://github.com/phittayanan/habit-tracker/issues/151) (Q4). To be agreed by projectnewy in the review of the #151 PR.

## Decision

When an amount has been chosen in the day box but not saved (no Done, Check in or Save), closing the box asks "Discard +3 glasses?" with "Keep editing" and "Discard". With nothing unsaved, the box closes at once.

## Options considered

- **B. Ask first (chosen).**
- A. Close and lose the amount silently. Rejected: the user may think it was saved.
- C. Save on close. Rejected: it could store an amount the user did not mean.
