# UAT reset: what it deletes, what it keeps, how a human runs it

Lab 6 Part A, Issue #104, ADR 0059. This is the spec of the reset that the UAT cases refer to ("the Product Team resets the data as the handoff says"). The script is `docs/labs/lab-06/reset/uat-reset.sql`; the test is `docs/labs/lab-06/reset/check-uat-reset.sh`. The accounts are the seeded ones (ADR 0058). No password appears here.

## Scope

| Table | The reset | Why |
|---|---|---|
| Entry | Deletes every entry of a goal of `participant1` or `participant2` | The cases create entries only through these two accounts |
| Goal | Deletes every goal of `participant1` or `participant2` | UAT-01 to UAT-04 leave goals on Water, Walking, UAT-02 Squats and UAT-04 Stretch (the database refuses to delete a goal that has entries, so entries go first) |
| Template | Deletes every template whose name starts with `UAT-` | The cases create `UAT-02 Squats` and `UAT-04 Stretch`; the app cannot delete a template in Sprint 1. A template that still has a goal of another account stops the script (nothing is deleted) |
| Template (others) | Keeps all other templates, including the seeded Reading, Walking and Water, and any change a Manager made to them | ADR 0053 |
| User | Keeps all users and their password hashes | ADR 0058 |
| Session | Keeps all sessions | A reset must not log anybody out |

The goals and entries of `participant1` and `participant2` include any that were made before Lab 6 (for example the record used for the Lab 5 restart and rollback check, whose screenshots are in the Lab 5 PDF). They are deleted too.

## How the script behaves

1. It runs in one transaction (`BEGIN`) and prints the row counts before and after the deletes.
2. It ends without `COMMIT` or `ROLLBACK`. The human reads the counts and types one of them.
3. Any error stops it (`ON_ERROR_STOP`), and the open transaction is rolled back, so a half reset is not possible.
4. Running it twice gives the same result (the second run deletes nothing).

## Acceptance criteria

| ID | Observable outcome |
|---|---|
| R-1 | After `COMMIT`, the two participants have no goal and no entry, and no template named `UAT-...` exists |
| R-2 | After `COMMIT`, every user, every session and every template whose name does not start with `UAT-` is unchanged (same rows) |
| R-3 | After `ROLLBACK`, no row of any table has changed |
| R-4 | If a template named `UAT-...` has a goal of another account, the script fails and no row is deleted |
| R-5 | A second run after a `COMMIT` deletes nothing and ends without an error |

## Human steps on the deployed database (not run by an AI)

1. Create an on-demand Cloud SQL backup of the instance in the Console. Write down its name and time.
2. Open a database session as a human (the exact command is chosen and read by the human; for example `gcloud sql connect` from Cloud Shell).
3. Run `uat-reset.sql`. Read the "before" and "after" counts. The "after" counts of Goal and Entry for the two participants must be 0, and the User count must be 3 (or more if the Product Team added accounts).
4. Type `COMMIT;` if they match, `ROLLBACK;` if not.
5. Record the time, the backup name and the two count lines in the handoff (Issue #103). Do not paste a password or a connection string.

## Limits

- The script and its test run on a disposable local database. Running it on the deployed database is the owner's step; until then the result there is "not run".
- It does not restart or redeploy the service, and it does not touch Cloud Run or Secret Manager.
