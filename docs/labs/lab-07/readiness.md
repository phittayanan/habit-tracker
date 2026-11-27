# Lab 7 metrics, release readiness and retrospective

Lab 7 Parts C and D, [Issue #142](https://github.com/phittayanan/habit-tracker/issues/142). Owner: phittayanan. Reviewer and merger: projectnewy. Times are Asia/Bangkok (+07:00). Values were read from GitHub and the repository on 2026-11-27 at about 17:15.

The change measured here is the Lab 7 change: several entries per day with a day-total maximum ([change-request.md](change-request.md)). Its pull requests are #143 (contract), #146 (tests and code), #149 (sync), #147 (release) and #162 (release evidence). PR #145 (team status rule) and PR #137 (Lab 6 evidence) were merged on the same day but are not part of this change, so they are left out.

## 1. Metrics (Part C)

| ID | Metric | Definition | Scope | Window | Value | Evidence |
|---|---|---|---|---|---|---|
| M1 | Lead time for the change | From the contract PR being opened to the new revision serving all traffic | Lab 7 change | 2026-11-27 02:12 to 16:02 | **13 h 50 min** | S1 |
| M2 | Test results, RED then GREEN | Tests that fail on the old code with the new tests, then pass on the new code | Server and browser suites | `761d87e` (RED), `f8736c9` and `b8d5acb` (GREEN) | **21 failed → 149 passed**, 0 skipped | S2 |
| M3 | Review rework rate | Share of the change's PRs that got a "changes requested" review before merge | 5 Lab 7 PRs | 2026-11-27 | **1 of 5 (20%)** | S3 |
| M4 | CI pass rate | Share of "CI & Docker Build" runs on the change's branches that ended in success | 9 runs | 2026-11-27 02:12 to 16:47 | **8 of 9**; 0 failed, 1 cancelled | S4 |
| M5 | Change failure rate | Share of production deploys that needed a rollback or a hotfix | Deploys of the Lab 7 change | 2026-11-27 16:02 to 17:15 | **0 of 1** | S5 |

### Source data

**S1. Lead time.** Start: [PR #143](https://github.com/phittayanan/habit-tracker/pull/143) `createdAt` 2026-11-26T19:12:22Z (02:12:22 +07:00). End: deploy run [45969767744](https://github.com/phittayanan/habit-tracker/actions/runs/45969767744), log line at 09:02:01Z (16:02:01 +07:00): `Service [habit-tracker] revision [habit-tracker-00008-jgf] has been deployed and is serving 100 percent of traffic.` Difference: 13 h 49 min 39 s.

**S2. Test results.** From [implementation.md](implementation.md) and the saved output in [`evidence/`](evidence/):

| Run | Commit | Server (`npm test`) | Browser (`npx playwright test`) | Source |
|---|---|---|---|---|
| RED: new tests, old code | `761d87e` | 99 tests, 84 passed, **15 failed**, 0 skipped | 50 tests, 44 passed, **6 failed** | `red-server.txt`, `red-client.txt` |
| GREEN | `f8736c9` | 99 tests, **99 passed**, 0 failed, 0 skipped | 50 tests, **50 passed** | `green-server.txt`, `green-client.txt` |
| Release CI | `b8d5acb` | `tests 99`, `pass 99`, `fail 0`, `skipped 0` | `50 passed` | deploy run 45969767744, job `test / test-and-docker` |

**S3. Review rework.** GitHub review states, in order:

| PR | Reviews | Changes requested |
|---|---|---|
| #143 contract | APPROVED, APPROVED | no |
| #146 tests and code | CHANGES_REQUESTED, APPROVED | **yes**: TC-89 failed on Windows |
| #149 sync | APPROVED | no |
| #147 release | APPROVED | no |
| #162 release evidence | APPROVED | no |

**S4. CI runs.** `gh run list`, workflow "CI & Docker Build", on the change's branches:

| Created (+07:00) | Run ID | Branch | Commit | Result |
|---|---|---|---|---|
| 02:12 | 45881885203 | `docs/139-lab7-multiple-entries-contract` | `ff6867b` | cancelled (a new push followed 1 minute later) |
| 02:13 | 45882026268 | `docs/139-lab7-multiple-entries-contract` | `6f27fac` | success |
| 12:06 | 45943837419 | `docs/139-lab7-multiple-entries-contract` | `eda4c6b` | success |
| 13:08 | 45949904654 | `feat/140-multiple-entries-per-day` | `a3ea23a` | success |
| 13:35 | 45952829418 | `feat/140-multiple-entries-per-day` | `d30cf8c` | success |
| 13:54 | 45954873028 | `staging` (PR #147) | `83ab8a2` | success |
| 13:56 | 45955070917 | `chore/148-sync-main` | `4f3a1c4` | success |
| 14:02 | 45955696058 | `staging` (PR #147) | `c482474` | success |
| 16:47 | 45976631016 | `docs/141-lab7-release-evidence` | `dd163ad` | success |

**S5. Change failure.** One production deploy of the change: run 45969767744 on `b8d5acb`, `ROLLBACK: false`, revision `habit-tracker-00008-jgf`. No later deploy, rollback or `fix/*` branch up to the read time. The post-deployment checks in [release.md](release.md) section 4 passed (13 checks passed; E-PD-00 is the reading taken before the change).

### Interpretation

The change went from contract to production in under 14 hours (M1), the tests failed first and then passed (M2), and no deploy failed (M5). The problem the metrics show: CI passed every completed run (M4), yet the one review that requested changes (M3) found a test that failed only on Windows. CI runs on Linux only, so a team member's platform is not tested before merge (debt item 1). **Action:** phittayanan adds a Windows job that runs the server tests to the CI workflow, before the Sprint 2 release (`v2.0`, Issue #160).

## 2. Release readiness (Part D)

| Item | State | Evidence |
|---|---|---|
| Deployed version | `v1.5`, `b8d5acb`, revision `habit-tracker-00008-jgf`; the page shows `build b8d5acb` | [release.md](release.md) sections 1 and 3 |
| Defects | Critical 0, major 0, minor 2. Both minor ones (#126, #127, Lab 6) are fixed in `v1.4`, retested PASS by the partner team, and closed. None is open. | [Lab 6 resolution](../lab-06/resolution.md) section 2 |
| Automated tests | Server 99 passed, 0 failed, 0 skipped; browser 50 passed, 0 failed, 0 skipped (release CI on `b8d5acb`) | S2 |
| User tests | Lab 6 UAT-01 to UAT-04 and EXP-1 PASS on `v1.3`, retests 4 of 4 PASS on `v1.4`. They were not run again on `v1.5`. On `v1.5`, UAT-02 step C9 (8 then 9 glasses, maximum 12) is still refused, but with "Only 4 glasses left for today." instead of the expected "An entry already exists for this day." (C9 revised to the new message in Issue #165) | [Lab 6 resolution](../lab-06/resolution.md); [change-request.md](change-request.md) section 3 |
| Post-deployment checks | 13 passed, 0 failed (changed behaviour, privacy and roles) | [release.md](release.md) section 4 |
| Configuration and secrets | No environment variable changed. Secrets stay in Secret Manager; none are in Git. | [change-request.md](change-request.md) section 3; [Lab 5 deployment](../lab-05/deployment.md) |
| Documentation | Contract, ADR 0061, implementation, release and this file are on `staging`. `README.md` describes several entries per day with the day total, and points to the Lab 5 deployment and the Lab 7 records (updated in PR #163). | PR #143, #146, #162, #163 |
| Deployment and smoke test | Deploy run success; migration job completed; smoke test passed (`/api/health`, `/api/ready`, build label) | [release.md](release.md) section 3 |

**Decision: READY** for the maintained Sprint 1 scope (decided by phittayanan, 2026-11-27).

Reasons: no open defect; every automated test passes with none skipped; the changed behaviour and the preserved privacy and role rules passed on the deployed release.

Open items:

| Item | Risk | Owner | Action |
|---|---|---|---|
| Rollback to `v1.4` is not safe after the migration | `v1.4` code would accept same-day entries without the day-total check | projectnewy | Fix forward with a new release; do not roll back the app alone |
| UAT-02 step C9 expects the old message "An entry already exists for this day." | A re-run on `v1.5` fails on the message, although the entry is still refused | phittayanan | Done in Issue #165 (2026-11-27): C9 now expects "Only 4 glasses left for today.", with a revision note; run on the deployed `v1.5` (`build b8d5acb`) showed that message |

## 3. Technical debt

| Item | Impact | Priority | Action |
|---|---|---|---|
| CI runs on Linux only | A test that fails on Windows passes CI; TC-89 was found by hand in the PR #146 review | Medium | Add a Windows job that runs the server tests to the CI workflow |
| The Lab 7 migration cannot be rolled back | Any problem in `v1.5` must be fixed forward; an app rollback breaks the day-total rule | High | Write a fix-forward runbook, and take a database backup before every release that has a migration (as done for Lab 7) |
| Post-deployment checks of business rules are manual | The automatic smoke test checks health, ready and the build label only; the changed rule was checked by hand with screenshots | Low | Add one API check of the day-total rule to the smoke test, using a test account |

## 4. Retrospective

Each student answered in their own words: phittayanan in Thai, translated by Claude Code and checked by phittayanan; projectnewy in English on [Issue #142](https://github.com/phittayanan/habit-tracker/issues/142#issuecomment-7215873068), drafted with Claude Code and reviewed by projectnewy (their note). projectnewy's answers are copied as written. phittayanan revised their "What helped?" and "What will change?" answers on 2026-11-27 after PR #163 was merged (commit `fb23e1d`, reviewed in PR #169).

| Question | phittayanan | projectnewy |
|---|---|---|
| What helped? | Writing the failing tests before the code: the 21 failures on the old code showed each new rule was really tested, and CI ran both test suites on every PR before merge. | Reviewing the contract and the code before merging caught real problems: a decimal example in the contract that could not fail, and TC-89 passing CI but failing on Windows. |
| What hurt? | Our working hours did not match, so sometimes a PR was opened and it was not clear whether a review was needed. | Work waited in a chain of reviews, and extra rounds came from docs/ai-use.md merge conflicts and from the sync PR that the release needed before it could be merged. |
| What will change? | Four of my PRs on 2026-11-27 needed changes for claims that did not match their sources or for missed sheet items. Before I ask for a review, a second AI agent that has not seen the work will check each factual claim against its file or log and the PR against the sheet or Issue checklist. | Before asking for review, I will check the new tests on Windows as well as CI and confirm that each boundary example would fail on the bug it targets; before each release I will check that staging contains main and open the sync PR first. |

## 5. Contribution

| Part | Issue / PR | Done by | Reviewed and merged by |
|---|---|---|---|
| A. Change request and contract | #139 / PR #143 | projectnewy | phittayanan |
| B. Tests and implementation | #140 / PR #146 | phittayanan | projectnewy (changes requested, then approved) |
| B. Release, deploy and post-deployment checks | #141, #148 / PR #149, #147, #162 | projectnewy | phittayanan |
| C and D. Metrics, readiness, retrospective | #142 / PR #163 | phittayanan | projectnewy |

## 6. AI use

Claude Code read the GitHub data and the repository, computed the metric values, drafted this file and explained each choice in Thai. phittayanan chose the five metrics, the READY decision, the debt items with their priority and action, the interpretation action and its owner, the owners of the open items, and the fixes after projectnewy's review. The full record is in [`docs/ai-use.md`](../../ai-use.md).

## 7. Known limitations

- The window is one day; the values describe one change, not a trend.
- M1 starts when the contract PR was opened. Work done before that (the decision to make this change) is not counted.
- M3 counts only "changes requested" review states. PR #143 and PR #147 were approved, but their reviews also had findings that led to changes.
- M4 counts workflow runs, not tests. A cancelled run is counted as not a success.
- M5 was read about 1 hour after the deploy.
- UAT was not run again on `v1.5`.
