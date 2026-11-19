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

## What this does not show

- The Cloud Run console revision list, read today. The build label and the run above point to `habit-tracker-00006-nj6`, but the live traffic split was last read on 14 Nov 2026. A human (or the owner's browser session, read-only) confirms it on the day UAT starts.
- That the seed and the reset work on the deployed database. The migration job of the run above ran the seed there (`deployment.md` section 6.8 records the job as completed), but its own output line was not read today: the "Seeded three accounts." line in the run log is from the CI test database. The reset (`docs/labs/lab-06/uat-reset.md`) is tested only on a disposable local database: **not run on the deployed database**.
- That the partner team can log in with every label (M1, P1, P2). That needs the passwords, which only the owner holds (ADR 0058).

## Steps left for the owner (human, command by command)

1. Read the Cloud Run revision list and confirm `habit-tracker-00006-nj6` serves 100%; write the time here or in the handoff.
2. Create the Cloud SQL backup, then run the reset as `uat-reset.md` says, and write the two count lines in the handoff.
3. Send the three passwords to the partner team privately, ask for one test login per label, and write "logged in: M1, P1, P2" with the time in the handoff.
4. Tell the UAT Team before any change to the live release during UAT (Issue #104 exclusion).
