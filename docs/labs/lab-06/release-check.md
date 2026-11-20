# Lab 6 release check: is the deployed app the recorded Sprint 1 release?

Lab 6 Part A, Issue #104. This is the evidence record for the handoff (Issue #103). Each line says who or what read it and when. Nothing here is a password, a token or a connection string.

## Recorded release

| Item | Value | Source |
|---|---|---|
| Release | Sprint 1, tag `v1.3` (annotated) on `main` | `docs/labs/lab-05/deployment.md` section 6.8; `git tag` |
| Commit | `50f5605d266d881b4afba3f8ac96d40882f26fd2` (merge of PR #96) | same; `git rev-parse origin/main` = `50f5605` on 2026-11-19 |
| Deploy run | [43481215940](https://github.com/phittayanan/habit-tracker/actions/runs/43481215940): `test / test-and-docker` and `deploy` succeeded, `ROLLBACK: false` | `gh run view`, read 2026-11-19 |
| Image | tag = the full commit, index digest `sha256:983689e12917a5dee763b200e1fedd6ab8ed0df45687b78b5a6dcec7aaed27bf` | the run log, read 2026-11-19 |
| Revision | `habit-tracker-00006-nj6`, 100% of traffic | `deployment.md` section 6.8 (read there on 14 Nov 2026) |

## Read on the deployed app (read-only, public URL)

Read by Claude Code with plain `GET` requests, 2026-11-19 22:06 (Asia/Bangkok). No login, no write.

| Check | Result |
|---|---|
| Page source build label | `<meta name="build" content="50f5605">`: the label of the recorded commit |
| `GET /api/health` | 200 `{"status":"ok"}` |
| `GET /api/ready` | 200 `{"status":"ready"}` |
| Code differing between `staging` and `main` (server, client, Dockerfile, compose, deploy, workflows) | 0 files, so a release of `staging` today would carry only documents |

## Live checks reported by the Product Team owner

Source: [phittayanan's report on Issue #104](https://github.com/phittayanan/habit-tracker/issues/104#issuecomment-7016652601), posted 20 Nov 2026 (Asia/Bangkok).

| Check | Result reported by the owner |
|---|---|
| Cloud Run and app | Console showed `habit-tracker-00006-nj6` serving 100% of traffic. The page showed build `50f5605`. Health and readiness both returned 200. |
| Cloud SQL backup | On-demand backup at 19 Nov 2026 23:43:22, as reported. The backup name was not recorded in the owner report. |
| Reset | Committed. It removed one goal and one entry from P1. The full before-count line and reset time were not recorded in the owner report. After reset, the owner reported zero goals, zero entries, zero UAT templates, three users and three templates. |
| Seeded account access | The owner logged in successfully as M1, P1 and P2. |

The reset report gives the account and counts. The deleted goal and entry are consistent with the Lab 5 Reading record, which also consisted of one goal and one entry. The report does not identify the goal by name or ID, so that match is unconfirmed. The Reading screenshots are preserved in the Lab 5 PDF evidence (Part 3, C-05) and the record is described in [the Lab 5 deployment log, section 6.7](../lab-05/deployment.md#67-data-after-redeploy-rollback-and-roll-forward-lab-5-step-8-issue-67). Recovering the deleted rows after the commit would require the pre-reset backup.

## Pending for the handoff

- The partner team's login confirmation and the completed handoff are still open under the current Issue #104 criteria. The owner proposed tracking private credential delivery and the partner team's first logins in Part B, pending agreement with projectnewy.
- At handoff, use the confirmed build and revision and verify the starting data required by each UAT case. Tell the UAT Team before any change to the live release during UAT.
