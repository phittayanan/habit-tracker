<!-- Lab 5 evidence index (Issues #68 and #97). Names and student IDs are placeholders: they are filled from a local file outside Git at build time (see build.mjs). -->

# Answer Part 0: Team and Evidence Index

**CPE 334 Lab 5, Section 31, group EN-010_P8.** Project topic: Theme 8, Habit and Activity Tracking System (a habit programme with Program Managers and Participants; the same project as Deliverable 1).

| Student | Student ID | GitHub |
|---|---|---|
| {{STUDENT_1_NAME}} | {{STUDENT_1_ID}} | [phittayanan](https://github.com/phittayanan) |
| {{STUDENT_2_NAME}} | {{STUDENT_2_ID}} | [projectnewy](https://github.com/projectnewy) |

| Item | Value |
|---|---|
| Public repository | <https://github.com/phittayanan/habit-tracker> (public, R-12) |
| Submitted release | Tag [`v1.3`](https://github.com/phittayanan/habit-tracker/releases/tag/v1.3) on commit `50f5605d266d881b4afba3f8ac96d40882f26fd2`, the merge of release PR [#96](https://github.com/phittayanan/habit-tracker/pull/96) into `main` |
| Public URL | <https://habit-tracker-rfi4eg2u4q-as.a.run.app> |
| Commit the URL is serving | `50f5605` (the page shows `build 50f5605` on the login page and in the top bar; Cloud Run revision `habit-tracker-00006-nj6`; [deploy run 43481215940](https://github.com/phittayanan/habit-tracker/actions/runs/43481215940)) |
| Where the documentation is | [`docs/labs/lab-05/deployment.md`](https://github.com/phittayanan/habit-tracker/blob/v1.3/docs/labs/lab-05/deployment.md) at the tag above: environment variables (section 2), GCP resources (5), login and required check (5.1), release procedure (6), Docker (7), CI (8), first deployment (9) |

## Contribution table

Both students took part in every area (R-11). Owner and checker are the two students; the checker reviewed the PR with a specific check and merged it.

| Step | Issue | Owner | Pull requests (author, then checker) | What it delivered |
|---|---|---|---|---|
| 1 GCP, access, budget | [#47](https://github.com/phittayanan/habit-tracker/issues/47) | phittayanan | none (account and project settings) | Project, teammate access, budget alert |
| 2 Cloud readiness | [#48](https://github.com/phittayanan/habit-tracker/issues/48) | projectnewy | [#69](https://github.com/phittayanan/habit-tracker/pull/69) | Readiness check, `deployment.md` v1 |
| 3 Docker | [#49](https://github.com/phittayanan/habit-tracker/issues/49) | phittayanan | [#70](https://github.com/phittayanan/habit-tracker/pull/70), checked by projectnewy on Windows | Image, compose, fresh-clone run |
| 4 CI | [#50](https://github.com/phittayanan/habit-tracker/issues/50) | projectnewy | [#71](https://github.com/phittayanan/habit-tracker/pull/71), checked by phittayanan | `test-and-docker` on PRs |
| 5 First deployment | [#64](https://github.com/phittayanan/habit-tracker/issues/64) | phittayanan | [#73](https://github.com/phittayanan/habit-tracker/pull/73), checked by projectnewy | Cloud SQL, Cloud Run, secrets |
| 6 GitHub to GCP, required check | [#65](https://github.com/phittayanan/habit-tracker/issues/65) | projectnewy | [#76](https://github.com/phittayanan/habit-tracker/pull/76) (C-02 proof, closed), [#91](https://github.com/phittayanan/habit-tracker/pull/91) | Ruleset, keyless login, C-02 |
| 7 Deploy workflow, release | [#66](https://github.com/phittayanan/habit-tracker/issues/66), [#80](https://github.com/phittayanan/habit-tracker/issues/80) | phittayanan | [#81](https://github.com/phittayanan/habit-tracker/pull/81), release PR [#84](https://github.com/phittayanan/habit-tracker/pull/84), checked by projectnewy | `deploy.yml`, build label, first release |
| 8 Data after restart and rollback | [#67](https://github.com/phittayanan/habit-tracker/issues/67) | projectnewy | [#89](https://github.com/phittayanan/habit-tracker/pull/89), [#90](https://github.com/phittayanan/habit-tracker/pull/90), checked by phittayanan | Second release, rollback, roll-forward |
| Fixes found on the way | [#79](https://github.com/phittayanan/habit-tracker/issues/79), [#74](https://github.com/phittayanan/habit-tracker/issues/74) | projectnewy | [#92](https://github.com/phittayanan/habit-tracker/pull/92), [#95](https://github.com/phittayanan/habit-tracker/pull/95), release PR [#96](https://github.com/phittayanan/habit-tracker/pull/96), checked by phittayanan | Seed keeps edited templates; goal target above the minimum |
| 9 This PDF | [#68](https://github.com/phittayanan/habit-tracker/issues/68), [#97](https://github.com/phittayanan/habit-tracker/issues/97) | shared | TO FILL (PR of this source) | Evidence index |

## Evidence index

| Rubric part | Artifact and direct link | IDs and version | Verification result |
|---|---|---|---|
| 1. CI and quality gate | PR [#71](https://github.com/phittayanan/habit-tracker/pull/71) and [run 43182003625](https://github.com/phittayanan/habit-tracker/actions/runs/43182003625); release PR [#84](https://github.com/phittayanan/habit-tracker/pull/84) and [run 43437568832](https://github.com/phittayanan/habit-tracker/actions/runs/43437568832) | C-01, commits `daaafc2` and `f57d634` | All steps green, server suite and browser tests pass |
| 1. CI and quality gate | PR [#76](https://github.com/phittayanan/habit-tracker/pull/76) and [run 43396969194](https://github.com/phittayanan/habit-tracker/actions/runs/43396969194); ruleset screenshots | C-02, commit `511c1ca` | Required check failed; merge blocked |
| 2. Docker and configuration | [`Dockerfile`](https://github.com/phittayanan/habit-tracker/blob/v1.3/Dockerfile), [`docker-compose.yml`](https://github.com/phittayanan/habit-tracker/blob/v1.3/docker-compose.yml), [`server/.env.example`](https://github.com/phittayanan/habit-tracker/blob/v1.3/server/.env.example), PR [#70](https://github.com/phittayanan/habit-tracker/pull/70) | C-03, commit `daf6382` | Fresh clone builds and runs from an empty volume |
| 3. GCP and persistence | Public URL; Figures in Part 3; Issue [#67](https://github.com/phittayanan/habit-tracker/issues/67) | C-04, C-05, release `50f5605` | Record present after rollback, roll-forward and a later release |
| 4. Release pipeline | Issue [#80](https://github.com/phittayanan/habit-tracker/issues/80), PR [#81](https://github.com/phittayanan/habit-tracker/pull/81), release PR [#84](https://github.com/phittayanan/habit-tracker/pull/84), [deploy run 43439782760](https://github.com/phittayanan/habit-tracker/actions/runs/43439782760) | C-06, tag `v1.1` | Reviewed PRs, automatic deploy, running revision shows the release commit |
