# Part A: UAT preparation and handoff for our product

## A.1 Cases and what they cover

Four cases, one for each required category. The table is built from the header of each case file (ADR 0056). The complete cases follow in A.4, as they were handed over; their result records are empty here because the partner team filled in its own copies.

{{CASE_MAP}}

## A.2 What was agreed with the partner team after the handoff was written

The handoff below is printed as written before the partner team was known to us, so a few rows still say **TO FILL (partner)**. What happened:

| Open item in the handoff | Outcome |
|---|---|
| Report channel | Agreed on 2026-11-25 (comments of Issue #107): one GitHub Issue per finding in the product team's own repository |
| Answer time | Agreed the same day: each finding Issue is classified within 24 hours |
| First UAT run of our product | 2026-11-25, about 13:34 to 14:49 Asia/Bangkok (UAT-01 to UAT-04), then an exploratory round (the partner's result index) |
| Findings, correction and retest | Findings filed 2026-11-25; corrected release deployed and announced 2026-11-26 18:03; retest about 21:10 to 21:30; decision 21:45 |

Their result index and result files are in their repository: <https://github.com/asamapornch/habit-activity-tracker/tree/main/docs/labs/lab-06/exchange-2>. The version they tested on 2026-11-25 is `v1.3`.

## A.3 Handoff package

Passwords were not part of any file; the three accounts are identified by label and role only. The partner reports that it used only the three agreed accounts and synthetic data (their comment on Issue #130).

{{include:../handoff.md}}

## A.4 The complete cases

{{include:../uat-cases/UAT-01-normal-journey.md}}

{{include:../uat-cases/UAT-02-business-rules-and-boundaries.md}}

{{include:../uat-cases/UAT-03-forbidden-role-and-ownership.md}}

{{include:../uat-cases/UAT-04-state-and-persistence.md}}
