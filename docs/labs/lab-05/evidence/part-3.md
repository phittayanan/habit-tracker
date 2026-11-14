# Answer Part 3: GCP Deployment and Persistence

**Public URL.** <https://habit-tracker-rfi4eg2u4q-as.a.run.app> (Cloud Run service `habit-tracker`, region `asia-southeast1`, public). It serves the latest release from `main`: tag `v1.3`, commit `50f5605`; the page shows `build 50f5605`, the first seven characters of the commit (ADR 0052). The service stays running until the instructor announces the end of grading.

**GCP service and database.** Cloud Run service `habit-tracker` (minimum 0, maximum 3 instances, port 3000) reads `DATABASE_URL` and the seed passwords from Secret Manager and connects to Cloud SQL `habit-tracker-pg` (PostgreSQL 16, database and user `habit_tracker`) through its runtime service account (the Cloud SQL Client role and access to its three secrets, as recorded in section 5). The migration is a Cloud Run job, `habit-tracker-migrate`, that every release runs before the service is updated. All names, sizes and roles are in section 5 of [`deployment.md`](https://github.com/phittayanan/habit-tracker/blob/v1.3/docs/labs/lab-05/deployment.md); the first deployment and its checks are section 9 (Issue [#64](https://github.com/phittayanan/habit-tracker/issues/64), PR [#73](https://github.com/phittayanan/habit-tracker/pull/73)). No password, key or project number is in Git, in an Issue or in a figure.

TO FILL: Figure 6 (Cloud Run service in the Console) and Figure 7 (Cloud SQL instance in the Console), project number and IP address cropped.

**C-04 (R-03), the domain workflow on the live URL: UI, API and database.** A participant signs in, creates a goal on a template and records an entry; the goal and the entry are listed again afterwards. The sign-in and the pages are the UI; the goal and entry calls are the API; the list that survives a restart is read from Cloud SQL. Figures 3 to 5 show the result on the public URL. Each deployment also runs a smoke test with no sign-in (`deploy/smoke_test.py`): `/api/health`, `/api/ready` (which queries the database) and the page, which must carry the commit that was deployed (ADR 0052). The test passed in [run 43439782760](https://github.com/phittayanan/habit-tracker/actions/runs/43439782760), [run 43460770826](https://github.com/phittayanan/habit-tracker/actions/runs/43460770826) and [run 43481215940](https://github.com/phittayanan/habit-tracker/actions/runs/43481215940).

**C-05 (R-04), data before and after a restart and a redeploy.** Issue [#67](https://github.com/phittayanan/habit-tracker/issues/67), section 6.7 of `deployment.md`. The record is the goal "Reading" (3 pages a day, 2026-11-13 to 2026-11-26) with one entry, `2026-11-13: 2 pages`, created by a demo participant on release 2.

- Before: release 2, commit `ed4527b`, revision `habit-tracker-00003-6rn` (Figure 3).
- Rollback: [run 43463075320](https://github.com/phittayanan/habit-tracker/actions/runs/43463075320), started by hand with the commit of release 1 (`723efb0`) as `image_tag`. Tests, build and migration were skipped (`ROLLBACK: true`); Cloud Run served release 1 (revision `habit-tracker-00004-z88`) and the same record was there (Figure 4).
- Roll-forward: [run 43463355931](https://github.com/phittayanan/habit-tracker/actions/runs/43463355931), through the full pipeline (revision `habit-tracker-00005-sdh`); the record was still there (Figure 5).
- Later release: release 3 ([run 43481215940](https://github.com/phittayanan/habit-tracker/actions/runs/43481215940), revision `habit-tracker-00006-nj6`) ran the migration job again. TO FILL: the same record on the page that shows `build 50f5605` (Figure 8).

The teammate repeated the check on the public URL and wrote what was checked in [PR #90](https://github.com/phittayanan/habit-tracker/pull/90). In step 8 the two runs were dispatched with `gh workflow run` by Claude Code at projectnewy's request and checked from their logs; no Console or `gcloud` change was made by an AI agent in steps 6 to 9. In step 5 (Issue #64) an AI agent ran the first 20 guide steps in Cloud Shell after phittayanan read and approved each command; this is recorded in `docs/ai-use.md`.

![Figure 3. C-05 (R-04): before the rollback. Public URL, label `build ed4527b`, goal "Reading" with the entry 2026-11-13: 2 pages. Release 2, commit `ed4527b`, run 43460770826.](img/c05-1-before-rollback.png){narrow}

![Figure 4. C-05 (R-04): after the rollback. Label `build 723efb0` (release 1 image), the same goal and entry. Run 43463075320, revision `habit-tracker-00004-z88`.](img/c05-2-after-rollback.png){narrow}

![Figure 5. C-05 (R-04): after the roll-forward. Label `build ed4527b`, the same goal and entry. Run 43463355931, revision `habit-tracker-00005-sdh`.](img/c05-3-after-roll-forward.png){narrow}
