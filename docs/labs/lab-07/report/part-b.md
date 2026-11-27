# Part B: Implementation and regression-safe delivery

The tests and code were written by phittayanan (Issue #140) and reviewed by projectnewy in PR #146: changes requested on `a3ea23a` (TC-89 failed on Windows), fixed in `f8736c9`, approved on `d30cf8c` (records R-146 and C-146-1 in the Appendix). The release, deployment and post-deployment checks were done by projectnewy (Issues #141, #148) and reviewed by phittayanan (records R-149, R-147, R-162).

## B.1 Tests first, then code: commits, RED, GREEN and regression

As merged (`docs/labs/lab-07/implementation.md`). The full output files it names are printed in B.2. The test changes themselves (setup and assertions) are in the Appendix, X.3.

{{include:../implementation.md}}

## B.2 Actual test output

Excerpts of the saved output (`docs/labs/lab-07/evidence/`): the header with command and tested commit, the failing or the Lab 7 test lines, and the counts. The full output files are in the repository: [red-server.txt](https://github.com/phittayanan/habit-tracker/blob/a7dbbfb/docs/labs/lab-07/evidence/red-server.txt), [red-client.txt](https://github.com/phittayanan/habit-tracker/blob/a7dbbfb/docs/labs/lab-07/evidence/red-client.txt), [green-server.txt](https://github.com/phittayanan/habit-tracker/blob/a7dbbfb/docs/labs/lab-07/evidence/green-server.txt), [green-client.txt](https://github.com/phittayanan/habit-tracker/blob/a7dbbfb/docs/labs/lab-07/evidence/green-client.txt).

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

Manual checks in Chrome by projectnewy on the deployed revision `habit-tracker-00008-jgf` (`build b8d5acb`), 2026-11-27. Times are when Claude Code received each screenshot, by projectnewy's computer clock, which runs about 10 minutes ahead of GitHub (B.4, section 4). The browser's extension and profile area is masked. Each caption gives the evidence ID, time and result; the action, expected and actual results are in the tables of B.4, section 4.

![E-pre-release, 15:27: Cloud SQL backup `before-lab7-release`, successful, before the merge at 15:57 (B.4, section 3).](../evidence/img/E-pre-release-backup-2026-11-27.png)

![E-PD-00 (1 of 2), 16:42: Water before any save. Recorded (B.4, table A).](../evidence/img/E-PD-00-before-water.png)

![E-PD-00 (2 of 2), 16:43: Water range 1 to 12; `build b8d5acb`.](../evidence/img/E-PD-00-templates-range.png)

![E-PD-01, 16:44: save 5. Pass (B.4, table A).](../evidence/img/E-PD-01-first-entry-5.png)

![E-PD-02, 16:44: second entry 3; total 8; 3 of 5. Pass.](../evidence/img/E-PD-02-second-entry-3-day-met.png)

![E-PD-03, 16:45: 5 more (total 13) refused. Pass.](../evidence/img/E-PD-03-over-maximum-refused.png)

![E-PD-04, 16:45: 4 more (total exactly 12) saved. Pass.](../evidence/img/E-PD-04-exact-maximum-accepted.png)

![E-PD-05, 16:45: 1 more on the full day refused. Pass.](../evidence/img/E-PD-05-day-full-refused.png)

![E-PD-06 (1 of 2), 16:46: after a reload; address bar and `build b8d5acb`.](../evidence/img/E-PD-06-after-reload-header.png)

![E-PD-06 (2 of 2), 16:46: entries 4, 3, 5; total 12; 3 of 5. Pass.](../evidence/img/E-PD-06-after-reload-water.png)

![E-PD-07 (1 of 2), 16:47: owner's `/api/goals`, goal 2, 3 of 5. Pass.](../evidence/img/E-PD-07-goal-id.png)

![E-PD-07 (2 of 2), 16:50: owner's `/api/goals/2/entries`. Pass.](../evidence/img/E-PD-07-owner-reads-entries.png)

![E-PD-08 (1 of 3), 16:50: Participant Two sees own goals only (B.4, table B).](../evidence/img/E-PD-08-participant2-goals-top.png)

![E-PD-08 (2 of 3): no 4, 3, 5 entries. Pass.](../evidence/img/E-PD-08-participant2-goals-middle.png)

![E-PD-08 (3 of 3): last goal.](../evidence/img/E-PD-08-participant2-goals-bottom.png)

![E-PD-09, 16:53: Participant Two, `/api/goals/2/entries`: `GOAL_NOT_FOUND`. Pass.](../evidence/img/E-PD-09-participant2-goal-not-found.png)

![E-PD-10, 16:53: Manager sees Templates only. Pass.](../evidence/img/E-PD-10-manager-home.png)

![E-PD-11, 16:53: Manager, `/api/goals`: `FORBIDDEN`. Pass.](../evidence/img/E-PD-11-manager-goals-forbidden.png)

![E-PD-12, 16:53: Manager, `/api/goals/2/entries`: `FORBIDDEN`. Pass.](../evidence/img/E-PD-12-manager-entries-forbidden.png)
