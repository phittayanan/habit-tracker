# 0017. Template changes and retirement

Status: accepted
Design ID: D-16 (Issue #3)

## Decision
B and C. B. A manager can edit a template only while no goals use it. Used templates are retired instead. C. A manager can retire a template. Retired templates cannot start new goals, and existing goals continue.

## Options considered
- A. A manager can edit a template's unit and range at any time. Existing entries are not re-checked.
- B. A manager can edit a template only while no goals use it. Used templates are retired instead. **(chosen)**
- C. A manager can retire a template. Retired templates cannot start new goals, and existing goals continue. **(chosen)**
- D. A manager can retire a template. Its existing goals end at once.
- Other: your own answer (options may be combined).

## Why
Saved entries never fall outside a changed range, and running goals are not broken.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
