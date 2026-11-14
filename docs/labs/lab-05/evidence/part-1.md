# Answer Part 1: CI and Quality Gate

**CI workflow.** [`.github/workflows/ci-docker.yml`](https://github.com/phittayanan/habit-tracker/blob/v1.3/.github/workflows/ci-docker.yml) (job `test-and-docker`, Issue [#50](https://github.com/phittayanan/habit-tracker/issues/50)). It runs on every pull request into `staging` or `main`, by hand, and as a reusable workflow that the deploy workflow calls again. Steps: offline checks of the deploy scripts, client build, PostgreSQL service with two databases, migrate and seed, server tests, browser tests (Playwright with Chrome), `docker build` (not pushed). Seed passwords are generated for each run and masked in the log. The tests are the project's own; the unit, API and browser suites are listed in `docs/traceability.md`.

**C-01 (R-05), passing pull requests.**

- Into `staging`: PR [#71](https://github.com/phittayanan/habit-tracker/pull/71), [run 43182003625](https://github.com/phittayanan/habit-tracker/actions/runs/43182003625) on commit `daaafc2`: deploy-script checks, client build, server suite 82 of 82, browser tests 44 passed, Docker build, all green. The earlier runs of the same Issue are kept and show the reds that led to the fixes (section 8.3 of [`deployment.md`](https://github.com/phittayanan/habit-tracker/blob/v1.3/docs/labs/lab-05/deployment.md)).
- Into `main`: release PR [#84](https://github.com/phittayanan/habit-tracker/pull/84), [run 43437568832](https://github.com/phittayanan/habit-tracker/actions/runs/43437568832) on commit `f57d634`, green before the merge.

**Required-check setting.** Ruleset `require-ci` on `main` and `staging`: status check `test-and-docker` (GitHub Actions) is required and "require branches to be up to date before merging" is on, with no bypass. Figure 2 shows the setting; section 5.1 of `deployment.md` records the names. A second ruleset requires one approving review, merge commits only, and no force push or deletion on both branches.

![Figure 1. C-02 (R-06): PR #76 into `main` from the temporary branch `test/prove-gate`, tested commit `511c1ca`. The required check `test-and-docker` is failing and "Merge pull request" is disabled with "Merging is blocked". Run 43396969194; the PR was closed without merging.](img/c02-blocked-merge.jpg)

![Figure 2. R-06: ruleset `require-ci` (Settings, Rules): `main` and `staging` are targeted, `test-and-docker` from GitHub Actions is the required status check, and branches must be up to date before merging. Read on 14 November 2026.](img/ruleset-required-check.png){narrow}

**C-02 (R-06), failing pull request from a temporary branch.** PR [#76](https://github.com/phittayanan/habit-tracker/pull/76) (branch `test/prove-gate`, deleted) added one failing test, `C-02 proof`. [Run 43396969194](https://github.com/phittayanan/habit-tracker/actions/runs/43396969194) failed on that test only; Figure 1 shows the blocked merge. The PR was closed without merging and the failed run is kept (R-10). The teammate read the PR page and the run in [Issue #65](https://github.com/phittayanan/habit-tracker/issues/65).

**Known limit.** The browser suite had a login timeout at 375 px that appeared once in the first run of Issue #50 and once on the first run of PR [#95](https://github.com/phittayanan/habit-tracker/pull/95); both passed on the next run of the same code, and the cause is not known.
