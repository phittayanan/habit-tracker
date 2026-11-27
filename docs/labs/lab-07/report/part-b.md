# Part B: Implementation and regression-safe delivery

The tests and code were written by phittayanan (Issue #140) and reviewed by projectnewy in PR #146: changes requested on `a3ea23a` (TC-89 failed on Windows), fixed in `f8736c9`, approved on `d30cf8c` (records R-146 and C-146-1 in the Appendix). The release, deployment and post-deployment checks were done by projectnewy (Issues #141, #148) and reviewed by phittayanan (records R-149, R-147, R-162).

## B.1 Tests first, then code: commits, RED, GREEN and regression

As merged (`docs/labs/lab-07/implementation.md`). The full output files it names are printed in B.2. The test changes themselves (setup and assertions) are in the Appendix, X.3.

{{include:../implementation.md}}

## B.2 Actual test output

Excerpts of the saved output (`docs/labs/lab-07/evidence/`): the header with command and tested commit, the failing or the Lab 7 test lines, and the counts. The full output files are printed in the Appendix, X.4.

RED, server suite on `761d87e` (new tests, old code), `cd server && npm test`. Every failure is the old one-entry rule (`ENTRY_ALREADY_EXISTS` or the unique index), not a compile error or a broken fixture:

{{text:red-server-excerpt.txt}}

RED, browser suite on `761d87e`, `cd client && npx playwright test`:

{{text:red-client-excerpt.txt}}

GREEN, server suite on `f8736c9` (the Lab 7 tests, then the counts for all 99):

{{text:green-server-excerpt.txt}}

GREEN, browser suite on `f8736c9`:

{{text:green-client-excerpt.txt}}

## B.3 Code diff

`git diff c4ba749 bbf12a2 -- server/src server/prisma client/src`: the migration, the day-total rule under a goal-row lock, progress by the day total, and the goals page. The test files are in the Appendix, X.3. `f8736c9` changed only how TC-89 starts the Prisma CLI.

{{text:code-diff.txt}}

## B.4 Review, integration, release, deployment and post-deployment checks

As merged (`docs/labs/lab-07/release.md`). The screenshots it lists follow in B.5.

{{include:../release.md}}

## B.5 Screenshots

Manual checks in Chrome by projectnewy on the deployed revision `habit-tracker-00008-jgf` (`build b8d5acb`), 2026-11-27. Times are when Claude Code received each screenshot, by projectnewy's computer clock, which runs about 10 minutes ahead of GitHub (B.4, section 4). The browser's extension and profile area is masked.

![E-pre-release: Cloud SQL backup `before-lab7-release` before the merge. Expected: an on-demand backup. Actual: created 15:27:57, successful (Console). Before `b8d5acb` was merged (15:57).](../evidence/img/E-pre-release-backup-2026-11-27.png)

![E-PD-00 (1 of 2): Participant One's Water goal before any save, 16:42. Expected: old entries, none for 2026-11-27. Actual: 2 of 5 days met; one entry each on 11-23, 24, 25 with a day total. Revision `habit-tracker-00008-jgf`.](../evidence/img/E-PD-00-before-water.png)

![E-PD-00 (2 of 2): the Water template, 16:43. Range 1 to 12; page label `build b8d5acb`.](../evidence/img/E-PD-00-templates-range.png)

![E-PD-01: save 5 for 2026-11-27, 16:44. Expected: saved; total 5; still 2 of 5. Actual: as expected. Pass.](../evidence/img/E-PD-01-first-entry-5.png)

![E-PD-02: save 3 for the same day, 16:44. Expected: saved; order 3, 5; total 8; 3 of 5. Actual: as expected. Pass.](../evidence/img/E-PD-02-second-entry-3-day-met.png)

![E-PD-03: save 5 (total would be 13), 16:45. Expected: "Only 4 glasses left for today."; value kept; nothing added. Actual: as expected. Pass.](../evidence/img/E-PD-03-over-maximum-refused.png)

![E-PD-04: save 4 (total exactly 12, the boundary), 16:45. Expected: saved; order 4, 3, 5; total 12; still 3 of 5. Actual: as expected. Pass.](../evidence/img/E-PD-04-exact-maximum-accepted.png)

![E-PD-05: save 1 on the full day, 16:45. Expected: "Today is full (12 glasses)."; value kept; nothing added. Actual: as expected. Pass.](../evidence/img/E-PD-05-day-full-refused.png)

![E-PD-06 (1 of 2): after a reload, 16:46. Address bar and `build b8d5acb` visible.](../evidence/img/E-PD-06-after-reload-header.png)

![E-PD-06 (2 of 2): after a reload, 16:46. Expected: entries 4, 3, 5 only; total 12; 3 of 5. Actual: as expected. Pass.](../evidence/img/E-PD-06-after-reload-water.png)

![E-PD-07 (1 of 2): the owner reads `/api/goals`, 16:47. Expected: goal id 2, progress 3 of 5. Actual: `daysMet` 3, `daysSoFar` 5. Pass.](../evidence/img/E-PD-07-goal-id.png)

![E-PD-07 (2 of 2): the owner reads `/api/goals/2/entries`, 16:50. Expected: the six entries, newest first. Actual: as expected (no address bar in this screenshot). Pass.](../evidence/img/E-PD-07-owner-reads-entries.png)

![E-PD-08 (1 of 3): Participant Two's goals page, 16:50. Expected: none of Participant One's goals or entries. Actual: own goals only. `build b8d5acb`.](../evidence/img/E-PD-08-participant2-goals-top.png)

![E-PD-08 (2 of 3): Participant Two's Water goal has other dates and entries; no 4, 3, 5. Pass.](../evidence/img/E-PD-08-participant2-goals-middle.png)

![E-PD-08 (3 of 3): Participant Two's last goal, UAT-02 Squats.](../evidence/img/E-PD-08-participant2-goals-bottom.png)

![E-PD-09: Participant Two opens `/api/goals/2/entries`, 16:53. Expected: `GOAL_NOT_FOUND`. Actual: as expected. Pass.](../evidence/img/E-PD-09-participant2-goal-not-found.png)

![E-PD-10: the Manager signs in, 16:53. Expected: Templates only, no Goals menu. Actual: as expected. Pass.](../evidence/img/E-PD-10-manager-home.png)

![E-PD-11: the Manager opens `/api/goals`, 16:53. Expected: `FORBIDDEN`. Actual: as expected. Pass.](../evidence/img/E-PD-11-manager-goals-forbidden.png)

![E-PD-12: the Manager opens `/api/goals/2/entries`, 16:53. Expected: `FORBIDDEN`. Actual: as expected. Pass.](../evidence/img/E-PD-12-manager-entries-forbidden.png)
