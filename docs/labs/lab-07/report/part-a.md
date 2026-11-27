# Part A: Change impact and updated contract

The change request, impact analysis and revised contract were written by projectnewy (Issue #139), reviewed by phittayanan, and merged in PR #143 as `c4ba749` on 2026-11-27 12:38, before the first test commit (`761d87e`, 12:54) and the implementation commit (`bbf12a2`, 12:59). The Issue as filed is CR-139 in the Appendix; the review texts are R-143 and C-143.

## A.1 Change request, versions, impact and unchanged behaviour

As merged (`docs/labs/lab-07/change-request.md`, updated once after the PR #163 review: see its section 3, "Past evidence").

{{include:../change-request.md}}

## A.2 Decision record

{{include:../../../adr/0061-multiple-entries-per-day.md}}

## A.3 Revised contract sections, old and new

The revised SRS, system SDS, feature list, F-08 and F-09 feature SDS (acceptance criteria and STS rows) and the Sprint 1 README are printed in the Appendix, X.2, as a diff from the accepted Sprint 1 release `v1.4` to the merged contract `c4ba749`: lines starting with `-` are the old text, lines starting with `+` the new.

## A.4 Teammate review before implementation

| Record | Who, when (+07:00) | Result |
|---|---|---|
| R-143-6079956119 | phittayanan, 2026-11-27 03:06, on `6f27fac` | Approved, with nine checks and three findings; with the follow-up comments, seven points (A.1, section 6) |
| C-143-1 to C-143-5 | both students, 2026-11-27 03:28 to 12:28 | Follow-up points and their answers |
| R-143-6083813777 | phittayanan, 2026-11-27 12:20, on `eda4c6b` | Re-check of the fixes, approved |
| Merge | phittayanan, 2026-11-27 12:38 (`c4ba749`) | Before `761d87e` (12:54) and `bbf12a2` (12:59) |

The full texts are in the Appendix, X.1.
