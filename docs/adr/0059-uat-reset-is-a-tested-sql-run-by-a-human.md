# 0059. The UAT reset is a tested SQL script that a human runs, after a backup

Status: decided by phittayanan in the session of Issue #104 on 2026-11-19 ("ตกลงตามนี้"); confirmed by projectnewy on 2026-11-20 in [PR #119 review round 2](https://github.com/phittayanan/habit-tracker/pull/119#pullrequestreview-5991873085)

## Decision

1. The "reset" named in the UAT cases (Issue #103 handoff) is the SQL script `docs/labs/lab-06/reset/uat-reset.sql`. It deletes the data the UAT cases create and nothing else (scope in `docs/labs/lab-06/uat-reset.md`).
2. The script is tested first against a disposable local PostgreSQL with the project's own migrations and seed, by `docs/labs/lab-06/reset/check-uat-reset.sh`. The command, counts and tested commit are recorded.
3. A human runs the script on the deployed database, command by command (Lab 5 handout section 9), after creating an on-demand Cloud SQL backup. The script runs in one transaction and ends without `COMMIT`: the human reads the counts and types `COMMIT` or `ROLLBACK`.
4. No code of the application, no new Cloud Run job and no release is added for the reset, so the tested release does not change during UAT (Issue #104 exclusion).

## Rejected

| Option | Why not |
|---|---|
| A reset job in the repository | It needs a new release so the image holds the script, which changes the version under test |
| Restoring a backup to reset | It overwrites the whole database, including what the partner team is doing, and stops the service |
| A separate UAT environment | A second Cloud Run service and database: billing changes and extra cost beyond Lab 6 |

## Not changed

The application, the seed (ADR 0053), the migrations, and the rule that billing, IAM and database changes are a human's.

## Source

Issue #104 (scope: "check that the seed and reset work on the deployed app") and the chat decision of 2026-11-19.
