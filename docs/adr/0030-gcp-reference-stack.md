# 0030. GCP components

Status: accepted
Design ID: D-29 (Issue #3)

## Decision
A. The reference stack, with the kit defaults.

## Options considered
- A. The reference stack, with the kit defaults. **(chosen)**
- B. The reference stack with a different region or sizes (say which in "Other").
- C. Cloud Run with a different managed database. It needs the lecturer's agreement if Cloud SQL does not offer it.
- D. A Compute Engine VM running Docker Compose. More to set up by hand, and the kit's deploy scripts do not apply.
- Other: your own answer.

## Why
The kit's deploy scripts work as they are; the defaults (db-f1-micro, Cloud Run 0 to 3 instances) are the lowest cost.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
