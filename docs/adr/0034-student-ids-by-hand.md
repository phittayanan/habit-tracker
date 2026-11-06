# 0034. Student IDs in the PDF

Status: accepted
Design ID: D-33 (Issue #3)

## Decision
B. IDs are typed into the final PDF by hand after export from the repository documents.

## Options considered
- A. A private cover page file, kept out of Git, is merged into the PDF when it is built.
- B. IDs are typed into the final PDF by hand after export from the repository documents. **(chosen)**
- C. IDs are given only in the LEB2 submission, if the TA agrees that this replaces the PDF requirement (see T-9).
- Other: your own answer.

## Why
IDs never enter the public repo, and no extra build step is needed.

## Source
Agent default, accepted by phittayanan.
Agreed by both students (projectnewy agreed with phittayanan's answers).
