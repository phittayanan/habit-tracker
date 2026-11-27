## The approved change request

### CR-139 Issue #139 by projectnewy, filed 2026-11-26T19:05:21Z: docs: change request, impact analysis and revised contract (Lab 7 Part A)

Source: <https://github.com/phittayanan/habit-tracker/issues/139>

````text
Technical task for Lab 7 Part A. This is the main change request for Lab 7.

- **Lab:** CPE334 Lab 7 (due 2026-11-29 23:59, Thailand time).
- **Scope of Lab 7:** one bounded change to behavior already implemented in Sprint 1. Synthetic data only; no password, token or student ID in Git.
- **Owner:** projectnewy. **Reviewer and merger:** phittayanan.
- **Approval:** Instructor/TA approval is not required, per the instructor's announcement changing the Lab 7 spec sheet.

## Change request
- **Original Sprint 1 requirement (ID):** BR-04 and FR-11 (F-08); BR-07 and FR-12 (F-09)
- **Current implemented rule:** at most one entry per goal per day (a second one gets `409 ENTRY_ALREADY_EXISTS`); a day is met when that entry reaches the daily target
- **New rule:** several entries per goal per day, each inside the template range; the day total is not above the template maximum (`409 DAILY_TOTAL_ABOVE_MAX`); a day is met when the day total reaches the daily target
- **Reason:** a Participant who records part of a day cannot add the rest, and Sprint 1 has no edit
- **Scope / out of scope:** in: backend entry rule, one migration, progress, entry list and day total on the goals page. Out: edit or delete (FR-17), calendar, goal changes, streaks, reminders. Access rules unchanged

## Acceptance criteria of the change
AC-08.7 (revised), AC-08.13 to AC-08.18 (F-08); AC-09.1, AC-09.2, AC-09.6 (revised), AC-09.9, AC-09.10 (F-09). Boundaries with maximum 24: a total of 24 is accepted, 24.01 is refused; 0.1 + 0.2 fits a maximum of 0.3; validation, date and range errors come first. Own goal only: others 404, Manager 403, anonymous 401.

## Baseline
- **Accepted Sprint 1 tag/commit:** `v1.4`, `056ee5c` (accepted by the partner team on 2026-11-26); the old rule was first released in `v1.0`, `64831f7`
- **Pre-change commit / deployed version:** `staging` `a43070f` (no code difference from `v1.4`); `habit-tracker-00007-7pd`, `build 056ee5c`, as recorded on 2026-11-26
- **Intervening development:** `v1.0` to `v1.4`: Lab 5 container and readiness work, seed keeping edited templates, goal target above the template minimum (#74), the Lab 6 NUL-character fixes. No Sprint 2 or 3 feature, no schema change

## Tasks
- [ ] Impact table: requirement ID, feature, SRS / Feature SDS / System-Level SDS sections, acceptance criteria, STS test IDs, code modules
- [ ] Callers and dependencies, UI/API validation, roles and ownership, persistence, historical data and migrations (give a reason for each item that does not apply)
- [ ] Unchanged behavior and the regression tests that protect it
- [ ] Revise and version the SRS, SDS, acceptance criteria and STS
- [ ] Teammate review of the revised contract

**Done when:** the revised contract is reviewed by phittayanan and merged before any implementation commit.

Details, impact table and unchanged behaviour: `docs/labs/lab-07/change-request.md` and ADR 0061 in the PR for this Issue.


````

## Review of the revised contract, before any test or code (PR 143)

### R-143-6079956119 Review of PR 143 by phittayanan, 2026-11-26T20:06:36Z, APPROVED, head 6f27fac

Source: <https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119>

````text
Review of 6f27fac. Drafted with Claude Code (AI-assisted); decisions and agreement are phittayanan's.

Approving. Checked against Issue #139 scope and F-08 AC-08.7, AC-08.13 to AC-08.18, F-09 AC-09.1, AC-09.2, AC-09.6, AC-09.9, AC-09.10.

What I checked
1. Every changed file in `git diff origin/staging...6f27fac` (11 files: ADR 0008, ADR 0061, ai-use, features, change-request, F-08, F-09, Sprint 1 README, SRS, system SDS, traceability) was read — consistent: BR-04, FR-11, error code, AC and TC IDs match across all of them [AI-assisted]
2. Boundary arithmetic of the new tests — TC-82 (20 + 4.01 refused, + 4 = 24 accepted, + 0.01 refused, + 0 accepted), TC-83 (0.1 + 0.2 within 0.3), TC-84 (20 + 3 + 3: one 201, one 409, total 23; lock case total 22), TC-87 (2 of 10 met) — each expected result follows from the rule [AI-assisted]
3. The impact table names real code — `server/src/services/entry.js`, `entry-rules.js`, `progress-rules.js` (`computeProgress` compares each entry with the target, line 10), `goal.js` (calls `computeProgress`, line 20), `client/src/goals.jsx`, `schema.prisma` (`@@unique([goalId, entryDate])`, line 77) all exist at 6f27fac [AI-assisted]
4. The rollback risk is real — `entry.js:34-35` in `v1.4` turns Prisma `P2002` from the unique index into `ENTRY_ALREADY_EXISTS`; with the index dropped, `v1.4` code would store any number of same-day entries with no total check [AI-assisted]
5. The goal-row lock is feasible in this codebase — `goal.js:27` already uses `$queryRaw ... FOR UPDATE` inside `db.$transaction` [AI-assisted]
6. The tests and the schema test that change are named in the "Old expectations that change" table — `entry.test.js:88` (`ENTRY_ALREADY_EXISTS`) and `entry.test.js:146` (unique goal+day schema test) are the ones listed [AI-assisted]
7. Other docs that still state the old rule — only Deliverable 1, Lab 5/6 records and the ADR 0010 rationale, which are past evidence and correctly left unchanged [AI-assisted]
8. CI at 6f27fac — `test-and-docker` and `pr-issue-link` success (read from GitHub, not run locally)
9. I agree with the two rules projectnewy chose (day total capped at the template maximum, target rule unchanged) and with OP-08.9 to OP-08.12 as drafted.
Not checked: no test was run (this PR changes only documents; the tests are written in #140); rendered Markdown view on GitHub.

Findings
1. issue: `docs/adr/0061-multiple-entries-per-day.md:3`, `docs/labs/lab-07/change-request.md:169`, F-08 OP-08.9 to OP-08.13 — they say my agreement is "pending". After merge they would stay wrong. Please record the agreement with a link to this review before merge.
2. issue: `docs/srs.md`, `docs/system-sds.md` — Issue #139 asks to "Revise and version the SRS, SDS, acceptance criteria and STS". F-08, F-09 and the Sprint 1 overview got revision-history rows, but the SRS and the system SDS have no version or revision line, so the reader cannot tell which version holds the Lab 7 rule. Please add one (for example a revision row naming Lab 7, Issue #139, ADR 0061), or say why the traceability change log is enough.
3. suggestion: F-08 section 10 — OP-08.12 (negative template values; only the upper limit is checked on the total) has no AC or test. A TC such as "template min -5, max 24: 24, then -5, then 5, all 201, total 24" would pin it down for #140.


````

### R-143-6083813777 Review of PR 143 by phittayanan, 2026-11-27T05:20:44Z, APPROVED, head eda4c6b

Source: <https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6083813777>

````text
Re-check of eda4c6b (after my review of 6f27fac and the three follow-up comments). Drafted with Claude Code (AI-assisted); the decision is phittayanan's.

Approving. Checked against Issue #139 scope and the 7 points listed in `docs/labs/lab-07/change-request.md` section 6.

What I checked
1. What changed since my review — `git diff 6f27fac eda4c6b`: the merge 5aa9630 brings only `staging` (Lab 6 evidence, #109 ai-use row); eda4c6b changes 9 files. Every file in `git diff origin/staging...eda4c6b` (11 files) is in scope for #139 [AI-assisted]
2. Conflict fix — `docs/ai-use.md:111-112`: #109 (2026-11-26) then #139 (2026-11-27), no markers left [AI-assisted]
3. Agreement recorded — ADR 0061, change-request section 6, OP-08.9 to OP-08.13, SRS, SDS, traceability link to review 6079956119, which is my APPROVED review of 6f27fac (read from the GitHub API) [AI-assisted]
4. SRS and system SDS — both now end with a revision history row for Lab 7, Issue #139, ADR 0061 [AI-assisted]
5. Exactness example can now fail — ran `node -e 'console.log(0.7+0.1, 0.7+0.1>=0.8)'` — prints `0.7999999999999999 false`, so AC-09.9 / TC-87 catch a careless float sum; `goal.js` is in the impact table and the Precision row [AI-assisted]
6. Negative values — AC-08.19 and TC-90: 24, -5, 5 → 201, 201, 201 (total 24), then 0.01 → 409; arithmetic checked; the IDs are in F-08, the Sprint 1 README, traceability and the change request [AI-assisted]
7. Message wording — F-08 section 4 row 8 uses the proposed pattern; TC-61 expects "Only 16.5 hours left for today." (24 − 7.5 = 16.5) and TC-82 expects "Only 4 hours left for today." and "Today is full (24 hours)." [AI-assisted]
8. Rollback risk — Issue #141 body now has the task line for the release plan [AI-assisted]
9. "Goal met" signal — F-09 OP-09.4 and the change-request out-of-scope row record it as not in Lab 7 [AI-assisted]
10. CI at eda4c6b — `test-and-docker` and `pr-issue-link` success; mergeable (read from GitHub, not run locally)
Not checked: no test was run (documents only; the tests come in #140); rendered Markdown on GitHub.

Findings
1. issue: `docs/sprints/sprint-1/F-08-entry.md:145` (TC-61) — the expected text says "hours", but the Given says only "template max 24", with no unit. Since the message now contains the unit, the browser test in #140 needs it. Please add "unit hours" to the Given, as TC-82 does.
2. suggestion: `docs/labs/lab-07/change-request.md:104`, `F-08-entry.md:16` and `:191`, `F-09-progress.md:16` and `:136`, `sprints/sprint-1/README.md:267` and `:272` say my re-check is "pending". This review is that re-check. To avoid another review round just for wording, you could update them to link this review in the #140 PR instead of here.
3. suggestion: the separate Sprint 2 Issue for the "goal met" signal (OP-09.4) is not opened yet. It can go with the Sprint 2 Issue set.


````

### C-143-1 Comment by phittayanan on #143, 2026-11-26T20:28:38Z

Source: <https://github.com/phittayanan/habit-tracker/pull/143#issuecomment-7202728642>

````text
Follow-up to my approving review of 6f27fac. Drafted with Claude Code (AI-assisted); the decision to post is phittayanan's. These are three points beyond the three in that review.

What I checked
1. Whether the exactness examples can fail — ran `node -e 'console.log(0.1+0.2>=0.3, 0.7+0.1>=0.8)'` — prints `true false` [AI-assisted]
2. How progress gets its values — `server/src/services/goal.js:19` maps each entry to `Number(entry.value)` before `computeProgress` [AI-assisted]
3. Whether Issue #141 records the rollback risk — read its body and comments — no mention of rollback [AI-assisted]

Findings
1. issue: `docs/sprints/sprint-1/F-09-progress.md:96` (AC-09.9) and `:108` (TC-87) — the exactness example cannot fail on the bug it is meant to catch. In binary floating point `0.1 + 0.2` is 0.30000000000000004, which still meets a target of 0.3, so TC-87 passes even if the day total is added carelessly. `0.7 + 0.1` is 0.7999999999999999, below 0.8, so it would catch it. Proposal: target 0.8 with entries 0.7 and 0.1. Related: since `goal.js:19` turns values into `Number`, `goal.js` probably belongs in the "Code to change" column of `docs/labs/lab-07/change-request.md:39` next to `progress-rules.js`. (TC-83 for the day-total cap is fine: there floating point refuses the 0.2.)
2. question: should a day that becomes met get a visible "goal met" signal on the goals page, beyond "N of M days met" changing? My proposal: not in Lab 7, which asks for one bounded change, and F-09 says Sprint 1 has no colours; open a separate Issue for Sprint 2 next to the calendar colours (FR-15, FR-16). Do you agree?
3. suggestion: `docs/labs/lab-07/change-request.md` says Issue #141 must record the rollback risk, but #141 does not mention it yet. Adding one line to #141 now keeps it from being missed at release.


````

### C-143-2 Comment by phittayanan on #143, 2026-11-26T21:06:56Z

Source: <https://github.com/phittayanan/habit-tracker/pull/143#issuecomment-7203404404>

````text
One more point on 6f27fac, a UI wording choice (drafted with Claude Code; the choice of wording is phittayanan's).

suggestion: `docs/sprints/sprint-1/F-08-entry.md:48` (section 4, row 8) — make the `DAILY_TOTAL_ABOVE_MAX` message shorter and tell the Participant what still fits, so they do not have to work it out:

| Case | Current message | Proposed message |
|---|---|---|
| Something is left for that day (max 24, recorded 20, typed 6) | "The day total must not be above 24. Already recorded for this day: 20." | "Only 4 hours left for today." |
| Nothing is left (recorded 24, typed 1) | "The day total must not be above 24. Already recorded for this day: 24." | "Today is full (24 hours)." |

Pattern: "Only {max − total} {unit} left for {day}." and, when nothing is left, "{Day} is full ({max} {unit})." "{day}" is "today" when the entry date is today, otherwise the date, for example "Only 4 hours left for 2026-11-26." The code and status (409) stay the same, and styling stays as for the other entry messages.

If you agree, AC-08.13 and TC-61 already point to "the message of section 4", so only row 8 changes; the browser test in #140 would then check "Only 16.5 {unit} left for today." for TC-61 (7.5 recorded, 17 typed, max 24). If you prefer the current wording, say so and I will drop this.


````

### C-143-3 Comment by phittayanan on #143, 2026-11-26T21:56:35Z

Source: <https://github.com/phittayanan/habit-tracker/pull/143#issuecomment-7204208358>

````text
This branch now conflicts with `staging` on `docs/ai-use.md` (drafted with Claude Code; posted by phittayanan).

Why: PR #137 merged into `staging` at a05db84 and added the 2026-11-26 #109 row right after the #110 row; this PR adds the 2026-11-27 #139 row at the same spot. Per `CLAUDE.md`, the PR that merges second fixes the conflict.

Fix: update this branch from `staging` (the "Update branch" button, or `git merge origin/staging`), keep both rows in date order (#109 on 2026-11-26, then #139 on 2026-11-27), delete the conflict markers, and push.

Note: approvals are not dismissed on push in this repo, so please ping me after pushing. I will re-check the new commit (and any changes for the 7 points above) before I merge.


````

### C-143-4 Comment by projectnewy on #143, 2026-11-27T05:07:27Z

Source: <https://github.com/phittayanan/habit-tracker/pull/143#issuecomment-7210368492>

````text
@phittayanan Thanks for the review. I resolved the conflict (both ai-use rows kept) and pushed eda4c6b. Drafted with Claude Code (AI-assisted).

1. Agreement: recorded with a link to your review of 6f27fac. The later changes are marked as waiting for your re-check.
2. SRS and system SDS: added revision history tables.
3. Exactness example: now 0.7 + 0.1 against a target of 0.8. You are right, the old one could not fail. Added goal.js to the impact table.
4. "Goal met" signal: agreed, not in Lab 7 (F-09 OP-09.4). I have not opened a Sprint 2 Issue yet.
5. Negative values: added AC-08.19 and TC-90.
6. Rollback risk: added a task line to #141.
7. Message wording: accepted (F-08 OP-08.14); TC-61 and TC-82 expect the new text.

Could you re-check the new commits before merging?


````

### C-143-5 Comment by projectnewy on #143, 2026-11-27T05:28:18Z

Source: <https://github.com/phittayanan/habit-tracker/pull/143#issuecomment-7210662024>

````text
@phittayanan Thanks, noted.

1. TC-61 unit: agreed. Could we add "unit hours" to its Given in the #140 PR, to avoid another CI run and review round here?
2. "Pending re-check" wording: also in the #140 PR, linking your re-check of eda4c6b.
3. Sprint 2 Issue for the "goal met" signal: not opened yet. It can go with the Sprint 2 Issue set.

#143 is ready for you to merge.


````

## Review of the tests and code (PR 146)

### R-146-6084399396 Review of PR 146 by projectnewy, 2026-11-27T06:33:07Z, CHANGES_REQUESTED, head a3ea23a

Source: <https://github.com/phittayanan/habit-tracker/pull/146#pullrequestreview-6084399396>

````text
Review of a3ea23a. Drafted with Claude Code (AI-assisted); the decision is projectnewy's.

Requesting changes for finding 1 only.

What I checked
1. Commit order: 2c78509 (docs), 761d87e (tests only), bbf12a2 (code and migration) [AI-assisted]
2. Read the code, migration and test diff against F-08 and F-09: goal-row lock, day sum in the database after the lock, check order, messages, list order, progress by day total, day total on the page [AI-assisted]
3. RED re-run on 761d87e (server/src, prisma and client/src same as v1.4). Local Windows 11, Node 24.14.0, PostgreSQL 16 in Docker, Chrome: server 99 tests, 84 pass, 15 fail; browser 44 pass, 6 fail (counts only for the browser run). On Windows TC-89 fails there with spawn ENOENT; with the change in finding 1 it fails on the unique index, as intended [AI-assisted]
4. GREEN on a3ea23a: browser 50 passed; server 99 tests, 98 pass, 1 fail (TC-89, finding 1) [AI-assisted]
5. prisma migrate diff from the migrations to the schema: no difference [AI-assisted]
6. Changed old expectations: TC-29, the TC-61 step and the schema test match the contract table; the two-requests case moved to TC-84. The list-order test gained a same-day check [AI-assisted]
7. Your question 1: goal.js can stay unchanged; computeProgress adds whole hundredths and TC-87 passes [AI-assisted]
Not checked: the Docker image, deployment, and a manual run of the page.

Findings
1. issue (blocking): server/test/entry-migration.test.js:16 runs node_modules/.bin/prisma with execFile. On Windows this fails with "spawn ... ENOENT", so npm test cannot pass there (the README documents Windows). Running the CLI through Node fixes it: execFile(process.execPath, [<path to node_modules/prisma/build/index.js>, 'migrate', 'deploy', '--schema', ...]). I tried this in a temporary copy: TC-89 passes on a3ea23a.
2. issue: docs/labs/lab-07/implementation.md section 3 says "npm test (all 16 files)". At a3ea23a server/test has 14 *.test.js files (16 .js files with the two helpers). Please correct it.
3. suggestion: implementation.md summarises the RED and GREEN runs. Lab 7 needs the actual failure and pass output in the PDF, so please keep the output excerpts (command, tested commit, assertion lines and counts) in the repo for #142.


````

### C-146-1 Comment by phittayanan on #146, 2026-11-27T06:35:35Z

Source: <https://github.com/phittayanan/habit-tracker/pull/146#issuecomment-7211667897>

````text
@projectnewy Thanks for the review. All three findings are done. Drafted with Claude Code (AI-assisted); posted by phittayanan.

**1. issue (blocking), TC-89 on Windows:** fixed in `f8736c9`. `server/test/entry-migration.test.js` now runs `execFile(process.execPath, [<server>/node_modules/prisma/build/index.js, 'migrate', 'deploy', ...])`, as you proposed.
- I ran the fixed test against the `761d87e` code and migrations, in a temporary worktree on macOS. It still fails at the intended point: `no unique goal+day index: CREATE UNIQUE INDEX "Entry_goal_id_entry_date_key" ...`.
- Not run here: Windows. Your temporary-copy run is the Windows evidence.

**2. issue, file count:** fixed in `d30cf8c`. `implementation.md` section 3 now says "all 14 `*.test.js` files".

**3. suggestion, keep the output:** done in `d30cf8c`. `docs/labs/lab-07/evidence/` now holds the full output of the RED run (`761d87e`) and the GREEN run (`f8736c9`), server and browser. Each file starts with its command, tested commit and versions. Local paths are replaced by `<repo>` and `<tmp>`. `implementation.md` links each file.

Tests on `f8736c9` (macOS, Node 26.8.1, PostgreSQL 16.15, Chrome 158):
```
cd server && npm test
ℹ tests 99
ℹ pass 99
ℹ fail 0
ℹ skipped 0
cd client && npx playwright test
  50 passed (31.7s)
```
`d30cf8c` changes only docs. Not run: the Docker image (CI runs it) and deployment (#141).

Could you re-review?


````

### R-146-6084528918 Review of PR 146 by projectnewy, 2026-11-27T06:51:21Z, APPROVED, head d30cf8c

Source: <https://github.com/phittayanan/habit-tracker/pull/146#pullrequestreview-6084528918>

````text
Re-check of d30cf8c. Drafted with Claude Code (AI-assisted); the decision is projectnewy's.

Approving. All three findings of my review of a3ea23a are resolved.

What I checked
1. Since a3ea23a the only server or client change is server/test/entry-migration.test.js (the Prisma CLI now runs through Node) [AI-assisted]
2. Local Windows 11, Node 24.14.0, PostgreSQL 16 in Docker, Chrome, on d30cf8c: server 99 tests, 99 pass, 0 fail, 0 skipped; browser 50 passed [AI-assisted]
3. The new TC-89 test against the 761d87e code and migrations fails on the unique goal+day index, as intended [AI-assisted]
4. implementation.md now says 14 *.test.js files and links the four evidence files [AI-assisted]
5. The evidence files name the command, tested commit and versions; their totals are 99/84/15 and 6 failed/44 passed (RED), and 99 passed and 50 passed (GREEN). They are macOS runs [AI-assisted]
6. A pattern search of the added lines for local user paths, database URLs with passwords, password values, tokens, long numeric IDs, email addresses, run.app URLs and bcrypt hashes found nothing [AI-assisted]
7. CI at d30cf8c: test-and-docker and pr-issue-link succeeded (read from GitHub)
Not checked: deployment and a manual run of the page.

No findings.


````

## Review of the sync and release (PR 149, PR 147) and the release evidence (PR 162)

### R-149-6084603999 Review of PR 149 by phittayanan, 2026-11-27T07:01:27Z, APPROVED, head 4f3a1c4

Source: <https://github.com/phittayanan/habit-tracker/pull/149#pullrequestreview-6084603999>

````text
Review of 4f3a1c4. Drafted with Claude Code (AI-assisted); the decision is phittayanan's.

Approving. Checked against Issue #148 "Done when".

What I checked
1. Merge parents: 4f3a1c4 has parents 83ab8a2 (current `staging` tip, PR #146 merge) and 056ee5c (current `main` tip, tag `v1.4`). It is a real merge commit, not a rebase [AI-assisted]
2. `git merge-base --is-ancestor origin/main 4f3a1c4`: exit 0. `origin/staging` is also an ancestor, so nothing on `staging` is lost [AI-assisted]
3. No file changes: `git diff --name-only origin/staging 4f3a1c4` prints nothing, and both have the same tree (70c0a1a) [AI-assisted]
4. `main` holds only one commit that `staging` lacks: 056ee5c, the #135 merge. No other commit comes in [AI-assisted]
5. Checks on 4f3a1c4: `test-and-docker` success, `pr-issue-link` success; GitHub reports MERGEABLE [AI-assisted]
6. Scope: no change to `main`, no tag moved, no force push (`v1.4` still points at 056ee5c) [AI-assisted]
Not checked: local test run (no file changed, CI ran the suite on this head).

Findings: none. The unticked AI-use box is explained in the PR (the row comes with #141), which matches the Issue.


````

### R-147-6084904251 Review of PR 147 by phittayanan, 2026-11-27T07:38:53Z, APPROVED, head c482474

Source: <https://github.com/phittayanan/habit-tracker/pull/147#pullrequestreview-6084904251>

````text
Review of c482474. Drafted with Claude Code (AI-assisted); the decision is phittayanan's.

Approving. Checked against Issue #141 (release task 2 and the rollback-risk task) and the Lab 7 change (#139, #140). The approval is for the code and the release description; the "Before merging" boxes still gate the merge.

What I checked
1. Release candidate = tested code: `staging` c482474, 83ab8a2 and d30cf8c (the reviewed PR #146 head) all have tree 70c0a1a. The 49 changed files against `main` (056ee5c, `v1.4`) are the Lab 7 change plus the Lab 6 records (#136, #137) and ADR 0062 (#145), as the description says; no Sprint 2 or 3 code [AI-assisted]
2. Server tests on tree 70c0a1a (macOS, Node 26.8.1, PostgreSQL 16, new empty test database `habit_147_test`, migrations applied with `prisma migrate deploy`): `cd server && npm test` → tests 99, pass 99, fail 0, skipped 0 [AI-assisted]
3. Browser tests on the same tree and database, Chrome channel: `cd client && npx playwright test` → 50 passed (32.1s) [AI-assisted]
4. Migration `20261127000100_entry_several_per_day`: drops `Entry_goal_id_entry_date_key`, adds a non-unique index on the same columns, changes no row; `schema.prisma` matches (`@@index([goalId, entryDate])`) [AI-assisted]
5. Deploy order in `deploy/release.sh`: migration job (`--wait`) runs before `gcloud run services update`, so the description's "old v1.4 code still serves between the migration and the service update" is right, and a failed migration stops before the service changes. A rollback skips the migration, as the description says [AI-assisted]
6. Public-repo check on the added lines: no token, password, webhook URL or student ID; the long numbers are GitHub review IDs. The Lab 6 evidence shows the GCP project ID and image digests, which are not secrets [AI-assisted]
7. CI on c482474: `test-and-docker` success [AI-assisted]
Not checked: Windows; the Docker image run locally; the deploy itself (after merge, #141).

Findings
1. issue: PR description, "Before merging" — it names phittayanan for the Cloud SQL backup and the image digest. They belong to the release owner (projectnewy, #141). Please change both lines to projectnewy, and tick them with the backup name and time when done. I will merge only after every box is ticked and we agree a time.


````

### R-162-6086487403 Review of PR 162 by phittayanan, 2026-11-27T10:06:22Z, APPROVED, head dd163ad

Source: <https://github.com/phittayanan/habit-tracker/pull/162#pullrequestreview-6086487403>

````text
Approving. Checked against Issue #141 (Lab 7 Part B tasks) at head `dd163ad`.

What I checked
1. Version table against git and GitHub: tags `v1.0` = `64831f7`, `v1.4` = `056ee5c`, `v1.5` = `b8d5acb` (annotated); merge commits #143 `c4ba749`, #146 `83ab8a2`, #149 `c482474`, #147 `b8d5acb`, and the merge times (12:38, 15:57 +07:00) — all match. [AI-assisted]
2. "Same tree" claim: `d30cf8c`, `83ab8a2`, `c482474` and `b8d5acb` all have tree `70c0a1a` — confirmed. `c4ba749` has no `server`/`client` difference from `v1.4` — confirmed. [AI-assisted]
3. "No Sprint 2 or 3 feature": PRs merged between `v1.4` and `v1.5` are #136, #137, #143, #145, #146, #147, #149; the only non-`docs/` changes are `CLAUDE.md` (#145) and the Lab 7 server/client/test/migration files — matches section 1. [AI-assisted]
4. Deploy run 45969767744 log: success on `b8d5acb`; server tests 99/99 pass, 0 skipped; browser 50 passed; `ROLLBACK: false`; `habit-tracker-migrate-5p6mb` completed; revision `habit-tracker-00008-jgf` serving 100 percent — all match section 3. [AI-assisted]
5. Live site at 2026-11-27 (read today): `/api/health` 200, `/api/ready` 200, anonymous `/api/goals` 401, page has `b8d5acb`. [AI-assisted]
6. All 19 screenshots opened one by one against their rows in section 4: values, order (4, 3, 5), day totals, "2 of 5" → "3 of 5", both refusal messages with the value kept, the JSON (goal id 2, daysMet 3 / daysSoFar 5, entries newest first), Participant Two sees only their own goals and gets `GOAL_NOT_FOUND`, Manager sees Templates only and gets `FORBIDDEN` twice. All match. Backup screenshot: `before-lab7-release`, 15:27:57, before the 15:57 merge. Tag `v1.5` dated 16:54:57, after the last check (16:53) — matches "pushed after the checks". [AI-assisted]
7. Privacy (public repo): no password, token, email or student ID in any screenshot; browser profile areas are masked; PNGs carry no text metadata. The backup screenshot shows the GCP project ID and the pages show the service URL, but both are already in `docs/labs/lab-05` and `lab-06` on `staging`. [AI-assisted]
8. `docs/ai-use.md` row: #145 and #146 merged by projectnewy, #147 and #149 merged by phittayanan — matches GitHub. Every relative link in `release.md` resolves to a file in the PR. `git diff --check` clean. [AI-assisted]

Not checked: the Cloud Run Console; the Claude Code actions in the ai-use row that leave no GitHub trace (I can only check the merges and the tag); HTTP status codes for E-PD-09/11/12 (also listed as not checked in the doc).

Findings
1. suggestion: `docs/labs/lab-07/release.md` section 4, "Actual" column — most rows say "As expected". Writing the seen values (for example "Saved; order 3, 5; total 8; 3 of 5") would let a reader of the PDF check each row without opening the image. Optional.


````

## Review of the metrics and readiness (PR 163)

### R-163-6086779392 Review of PR 163 by projectnewy, 2026-11-27T10:31:53Z, CHANGES_REQUESTED, head daefb86

Source: <https://github.com/phittayanan/habit-tracker/pull/163#pullrequestreview-6086779392>

````text
Review of daefb86. Drafted with Claude Code (AI-assisted); the decision is projectnewy's.

Requesting changes for findings 1 and 2.

What I checked
1. M1: PR #143 createdAt 2026-11-26T19:12:22Z and the "serving 100 percent" log line of run 45969767744 at 09:02:01Z give 13 h 49 min 39 s [AI-assisted]
2. M2: the totals in the four evidence files match S2 [AI-assisted]
3. M3: review states of #143, #146, #149, #147 and #162 match S3 [AI-assisted]
4. M4: the "CI & Docker Build" runs on the listed branches from 02:12 to 16:47 are the 9 in S4: 8 success, 1 cancelled [AI-assisted]
5. M5: the latest deploy run is 45969767744; no later one [AI-assisted]
6. The interpretation is within 100 words (90 by wc); no open Issue has the bug label [AI-assisted]
7. My retrospective answers match my comment on #142. CI at daefb86 succeeded [AI-assisted]
Not checked: no test was run (documents only).

Findings
1. issue (blocking): readiness.md says UAT-02 (step C9) and UAT-03 expect the old one-entry rule, also in the interpretation action and the open items. I found no step in UAT-03 that expects a second same-day entry to be refused; its "one entry" text is a count. The claim comes from my side: change-request.md section 3 says it, and it was wrong about UAT-03. For C9, Water has maximum 12, so 8 + 9 is still refused on v1.5; only the message differs ("Only 4 glasses left for today."). Please correct the text, and the change-request.md sentence in this PR too.
2. issue (blocking): the lab asks for a problem or risk shown by the metrics. Stale UAT cases are not shown by M1 to M5. M3 with M4 do show one: CI passed every completed run, but review found a Windows-only failure. Please base the action on that (for example the Windows CI job of debt item 1, with an owner and a milestone), within 100 words. The UAT revision can stay as an open item.
3. issue: the readiness checklist should state the documentation and run instructions. The Documentation row does not mention README. README does not describe several entries per day or the day total, and it still says Docker, CI and GCP verification are deferred to Lab 5. Please update README, or record this as an open item with an owner.
4. suggestion: in section 7, say that M3 counts only "changes requested" states; #143 and #147 also had findings that led to changes.
5. suggestion: your "What will change?" answer describes something already set up. The lab asks for a concrete next action; consider adding what you will do next. Your wording is your choice.
6. note on my file: the clock of my computer is about 10 minutes ahead of GitHub (measured today, 10 min 23 s). In release.md section 4 the screenshot times, and "Public site, read by Claude Code at 16:35", come from that clock. Please add one line there saying so in this PR. The times from GitHub and the Console are not affected.


````

### R-163-6086886889 Review of PR 163 by projectnewy, 2026-11-27T10:41:26Z, APPROVED, head 7452f46

Source: <https://github.com/phittayanan/habit-tracker/pull/163#pullrequestreview-6086886889>

````text
Re-check of 7452f46. Drafted with Claude Code (AI-assisted); the decision is projectnewy's.

Approving. My findings on daefb86 are resolved.

What I checked
1. UAT: readiness.md and change-request.md section 3 now say that only the C9 message differs and that UAT-03 does not depend on the one-entry rule [AI-assisted]
2. Interpretation: 93 words by wc; the problem comes from M3 and M4, and the action (a Windows CI job) has an owner and a milestone [AI-assisted]
3. README describes several entries per day and the day total, no longer defers Docker, CI and GCP, and the Documentation row says so [AI-assisted]
4. Section 7 states the M3 limitation; the retrospective answer has a next step; release.md section 4 has the clock note [AI-assisted]
5. Relative links in README.md, readiness.md, change-request.md and release.md point to existing paths; external links not opened. git diff --check is clean, and a pattern search of the new lines for digests, tokens, passwords, webhook URLs and email addresses found nothing [AI-assisted]
6. CI at 7452f46: test-and-docker and pr-issue-link succeeded (read from GitHub)
Not checked: no test was run (documents only).

Findings
1. suggestion: the PR description still gives the old interpretation (92 words, the UAT-02/03 action and open item). Update it so it matches the files.


````

## Retrospective answers as posted (Issue 142)

### RQ-142 Comment by phittayanan on #142, 2026-11-27T10:22:03Z

Source: <https://github.com/phittayanan/habit-tracker/issues/142#issuecomment-7215799301>

````text
@projectnewy Lab 7 retrospective (Part D) needs answers from both of us. Please reply here with a few sentences for each, about Lab 7 (Issues #139 to #142):

1. **What helped?**
2. **What hurt** (slowed us down or caused rework)?
3. **What will you change** next time?

I will put your answers into `docs/labs/lab-07/readiness.md` section 4 as you wrote them, next to mine. Due with Lab 7, 2026-11-29 23:59 (date from Issue #139; check LEB2).


````

### RA-142 Comment by projectnewy on #142, 2026-11-27T10:25:43Z

Source: <https://github.com/phittayanan/habit-tracker/issues/142#issuecomment-7215873068>

````text
@phittayanan My Lab 7 retrospective answers (drafted with Claude Code, AI-assisted; reviewed by me):

1. What helped? Reviewing the contract and the code before merging caught real problems: a decimal example in the contract that could not fail, and TC-89 passing CI but failing on Windows.

2. What hurt? Work waited in a chain of reviews, and extra rounds came from docs/ai-use.md merge conflicts and from the sync PR that the release needed before it could be merged.

3. What will you change? Before asking for review, I will check the new tests on Windows as well as CI and confirm that each boundary example would fail on the bug it targets; before each release I will check that staging contains main and open the sync PR first.


````
