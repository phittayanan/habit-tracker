# 0033. Shape of the CI check

Status: accepted
Design ID: D-32 (Issue #3)

## Decision
A. One job `test-and-docker`, as in the kit, as the single required check.

## Options considered
- A. One job `test-and-docker`, as in the kit, as the single required check. **(chosen)**
- B. Three jobs (backend test, frontend test and build, Docker build), each a required check. Failures are easier to locate, and the ruleset lists three names.
- C. The kit's one job, plus a separate end-to-end job. The end-to-end job is required or not (say which in "Other").
- Other: your own answer.

## Why
The kit says not to rename this job, and one required check is the simplest ruleset.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
