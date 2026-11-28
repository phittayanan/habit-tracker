# Part E. Integrated release candidate {#part-e}

<!-- source: docs/deliverable-2/v2.0-release.md, v2.1-release.md and readiness-and-plan.md (PR #200, merged as e087c29) -->

## E.1 Release candidate on `main` and its deployment {#e-1}

| Item | `v2.1` | Source |
|---|---|---|
| Tag and commit | annotated `v2.1` on `9b09bfe`, the merge of release PR #198 (author projectnewy, merged by phittayanan) | v2.1 record section 1 |
| CI and deploy run | [46124923270](https://github.com/phittayanan/habit-tracker/actions/runs/46124923270): server 161 of 161; browser 126 passed, 6 skipped; smoke test passed | v2.1 record section 3 |
| Deployed revision | `habit-tracker-00010-qsv`, 100% of traffic, page label `build 9b09bfe` | v2.1 record P-06, P-07 |
| Image | image manifest `sha256:ef347eb7…` in Cloud Run and in the deploy log | v2.1 record P-05, P-06 |
| Migration and backup | `20261127000400_goal_reminder` applied after the backup `before-v2.1-release` | v2.1 record sections 2, 3 |

TO FILL: the same table for `v2.0` (v2.0 record section 1) and a short explanation of how tag, commit, CI run and revision match.

## E.2 Build, regression and CI output {#e-2}

TO FILL: commands, tested commit and output with pass, fail and skip counts (server 161 of 161; browser 126 passed, 6 skipped, run 46124923270); two real test excerpts, one domain or cross-feature rule and one access restriction.

## E.3 Post-deployment checks {#e-3}

TO FILL: `v2.0` record section 5 (45 of 45) and the `v2.1` record section 5 (R-01 to R-11, 11 of 11; Sprint 1 journey J-1 to J-7, 7 of 7): a critical journey, persistence, and backend evidence of a forbidden role or ownership operation (J-6, R-10). Data kept across each migration: section 4 of each record.

## E.4 Setup summary {#e-4}

TO FILL from `README.md` at `v2.1`: dependencies, environment-variable names with fake examples, Docker, build, run and test commands, migrations and seed, the deployment procedure. No real secret.

## E.5 Readiness review and plan to 13 December {#e-5}

TO FILL: `readiness-and-plan.md` sections 1 to 3 (decision: ready for the D2 scope, not ready for real users yet).
