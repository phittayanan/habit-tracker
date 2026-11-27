# 0078. Retiring a template is permanent and asks first

Status: chosen by projectnewy on 2026-11-27 in [Issue #150](https://github.com/phittayanan/habit-tracker/issues/150) (Q4). Agreed by phittayanan in the [review of 507ba1c](https://github.com/phittayanan/habit-tracker/pull/171) of PR #171.

## Decision

There is no way to make a retired template active again. The Manager confirms before it is retired. Its name stays taken.

## Options considered

- **A. Permanent, with a confirmation (chosen).**
- B. Permanent, no confirmation.
- C. Reversible. It is not in the SRS.

## Why

The step cannot be undone, so a mistaken press must not retire a template.
