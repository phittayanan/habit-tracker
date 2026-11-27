## Findings received about our product, as filed by the partner team

### F-126 Report by asamapornch, filed 2026-11-25T14:39:10Z: NUL character in the login username returns 500 instead of 401

Source: <https://github.com/phittayanan/habit-tracker/issues/126>

````text
Report from the UAT team of the Habit and Activity Tracker project (asamapornch, warunwora), Lab 6 Part B/C, about your Sprint 1 release. One Issue per finding. It contains no password, token or cookie. Part of the test was operated by an AI agent under the testers' supervision (declared in our report).

| Field | Entry |
|---|---|
| Product owner / team | Habit tracker (phittayanan, projectnewy) |
| Reporter | UAT team: asamapornch, warunwora |
| Tested version | Tag v1.3, commit 50f5605d266d881b4afba3f8ac96d40882f26fd2, built and run LOCALLY (isolated Docker + PostgreSQL). The deployed app was NOT tested. |
| Date / time | 2026-11-25, 21:26 Asia/Bangkok |
| Role | none (before login) |

- **Case / requirement:** exploratory testing (outside the agreed UAT cases), measured against your own contract: **AC-01.2** — *"An unknown username and a wrong password each get `401 INVALID_CREDENTIALS` with the same message, no `Set-Cookie`, and no new session"* (`docs/sprints/sprint-1/F-01-login.md`, line 114).

- **Preconditions and data:** no account signed in; tested directly against a freshly built, local, throwaway instance of your repository (isolated PostgreSQL, random local-only seed passwords generated for this session and never saved or printed — not reused for anything, deleted after the test). No request was sent to the deployed app or to any other URL.

- **Endpoint:** `POST /api/auth/login` (`server/src/routes/auth.js:15`).

- **Code read (file:line), at commit `50f5605`:**
  - `server/src/routes/auth.js:7` — validation schema: `z.object({ username: z.string().trim().min(1), password: z.string().min(1) })`
  - `server/src/routes/auth.js:15–21` — the login handler: parses the body against the schema (line 16), then calls `authenticate(db, parsed.data, ...)` (line 18) with **no try/catch** around the call
  - `server/src/services/auth.js:11` — `authenticate()` passes the username straight into `db.user.findUnique({ where: { username: credentials.username } })`
  - `server/src/app.js:35–43` — the app's single generic error-handling middleware; it special-cases `entity.parse.failed`/`entity.too.large` (lines 36–40), and falls through to `500 INTERNAL_ERROR` for everything else (line 42), with the comment *"Do not print ORM errors: they may include sensitive query parameters."*

- **Steps to reproduce:**
  1. `POST /api/auth/login` with `{"username":"nouser-exp-tn","password":"<any value>"}` (control — an ordinary unknown username, no NUL).
  2. `POST /api/auth/login` with `{"username":"nouser-exp-tn\^@X","password":"<any value>"}` (same but the username contains an embedded NUL character, `\^@`, as a JSON escape).

- **Expected result:** both requests get `401 INVALID_CREDENTIALS` with the same message, no `Set-Cookie` (AC-01.2).

- **Actual result:**
  - Step 1 (control): `401 {"error":{"code":"INVALID_CREDENTIALS","message":"Username or password is incorrect."}}`, no `Set-Cookie`. **Matches** AC-01.2.
  - Step 2 (NUL username): `500 {"error":{"code":"INTERNAL_ERROR","message":"Something went wrong. Please try again."}}`, no `Set-Cookie`. **Differs** from AC-01.2.

- **Severity (proposal):** Minor. No data is lost, no session is issued, and no sensitive information is exposed in the response; the process stayed up and kept serving requests. It is nonetheless a real, trivially reproducible wrong status code on a predictable, specific input, not a cosmetic issue.

- **Defect or enhancement:** We think it is a **defect** against AC-01.2: the contract specifies `401 INVALID_CREDENTIALS` for any unknown username, with no stated exception for its content, and a NUL-containing string is still a non-empty string per the schema at `auth.js:7`. We did not guess the cause beyond what the code shows (the `findUnique` query parameter reaching PostgreSQL, which rejects embedded NUL bytes, uncaught by any try/catch in the route) and ask the partner to classify it with a reason tied to their contract.

- **Evidence:**
  - **E-L1-01** (control — ordinary unknown username): request `POST /api/auth/login {"username":"nouser-exp-tn","password":"<any value>"}`; response `401 {"error":{"code":"INVALID_CREDENTIALS","message":"Username or password is incorrect."}}`, no `Set-Cookie`.
  - **E-L1-02** (NUL-containing username): request `POST /api/auth/login {"username":"nouser-exp-tn\^@X","password":"<any value>"}`; response `500 {"error":{"code":"INTERNAL_ERROR","message":"Something went wrong. Please try again."}}`, no `Set-Cookie`.
  - Both requests were sent exactly once each, to `http://localhost:4100` only (an isolated local Docker instance of this repository at the tested commit); no request was sent to any deployed URL. No request was retried to try to force a difference.

- **Note on consent / AI use:** part of this test (building and running the local Docker stack, and sending the two curl requests above) was operated by an AI agent under the testers' supervision, as declared above. No password, token or cookie value is included anywhere in this report; the seed passwords generated for the local instance were random, never printed, and deleted after the test.
- Related finding: a NUL character in a template name or unit also gives 500 — see #127; it may share the same root cause.

## What we ask

Please classify this report (accepted defect, duplicate, not a defect, enhancement) with a reason tied to your Sprint 1 contract, and tell us when you can answer.



````

### F-127 Report by warunwora, filed 2026-11-25T14:55:47Z: NUL character in a template name or unit returns 500 instead of the documented validation/success response (create and edit)

Source: <https://github.com/phittayanan/habit-tracker/issues/127>

````text
### Steps to reproduce

Report from the UAT team of the Habit and Activity Tracker project (asamapornch, warunwora), Lab 6 Part B/C, about your Sprint 1 release. One Issue per finding. It contains no password, token or cookie. Part of the test was operated by an AI agent under the testers' supervision (declared in our report).

| Field | Entry |
|---|---|
| Product owner / team | Habit tracker (phittayanan, projectnewy) |
| Reporter | UAT team: asamapornch, warunwora |
| Tested version | Tag v1.3, commit 50f5605d266d881b4afba3f8ac96d40882f26fd2, built and run LOCALLY (isolated Docker + PostgreSQL). The deployed app was NOT tested. |
| Date/time | 2026-11-25, Asia/Bangkok (same local test session recorded in `LOCAL-1-result.md`; that file does not record a clock time for individual requests, so none is given here) |
| Role | Manager (manager1) |

**Preconditions and data:** Manager account `manager1` signed in; tested directly against a freshly built, local, throwaway instance of your repository (isolated PostgreSQL, random local-only seed passwords generated for that session and never saved or printed, not reused for anything, deleted after the test). No request was sent to the deployed app or to any other URL.

**Endpoint:** `POST /api/templates` (create) and `PATCH /api/templates/:id` (edit), `server/src/routes/templates.js:16` and `:25`. (Edit uses `PATCH`, not `PUT`; this codebase has no `PUT` route for templates.)

**Steps to reproduce** (verbatim from our local test record, rows 1 and 2):
1. `POST /api/templates` as manager1: `{"name":"EXP-LOCAL-NUL\^@X","unit":"x","minValue":1,"maxValue":10}`
2. `PATCH /api/templates/1` as manager1 (template unused): `{"unit":"X\^@Y"}`

### Expected

**Case/requirement:** exploratory testing (outside the agreed UAT cases), measured against your own contract. The directly relevant acceptance criteria are:

- **AC-03.1** (`docs/sprints/sprint-1/F-03-template-create.md`, §9): "A Manager who sends a valid request gets 201 and a template with `state` `ACTIVE`; it then appears in the Manager's `GET /api/templates` and is still there after the app restarts. Unknown fields such as `"state": "RETIRED"` are stripped, and the request is accepted"
- **AC-03.3** (same file, §9): "A missing, empty or non-string `name` or `unit`, a name or unit over the length limit, and a missing or non-numeric `minValue` or `maxValue`, or one with more than 2 decimal places, get `400 VALIDATION_ERROR` and nothing is stored"
- **AC-04.1** (`docs/sprints/sprint-1/F-04-template-edit.md`, §9): "A Manager who edits an unused template (any subset of name, unit, minimum, maximum) gets 200 with the new values, and `GET /api/templates` then shows them"
- **AC-04.4** (same file, §9): "An empty body, a field with a wrong type or more than 2 decimal places, and a non-integer id get `400 VALIDATION_ERROR`; an unknown id gets `404 TEMPLATE_NOT_FOUND`; an anonymous edit gets `401 UNAUTHENTICATED`; nothing changes"

**Honest statement on contract basis:** we read all of `F-03-template-create.md` and `F-04-template-edit.md` in full (both are present at the tested tag/commit) and searched them for any mention of NUL characters or control characters. Neither file mentions NUL or control characters anywhere. No AC says a NUL-containing `name` or `unit` must be refused, and none says it must be accepted either. We are not claiming a written requirement names this exact input. What we can say is narrower: a NUL-containing string is a present, non-empty string within the length limit, so it does not match any of the specific invalid cases AC-03.3 and AC-04.4 enumerate; by the contract's own structure, an input that is not one of the listed invalid cases should fall under AC-03.1/AC-04.1 ("a valid request... gets 201/200"). The actual behavior is neither: it is a `500` that AC-03.3/AC-04.4 also do not describe. We rely on this structural gap, not on a direct textual rule about NUL.

**Expected result:** per AC-03.1, step 1 gets `201` with the template stored. Per AC-04.1, step 2 gets `200` with the template updated.

### Actual

**Actual result:**
- Step 1 (create): `500 {"error":{"code":"INTERNAL_ERROR","message":"Something went wrong. Please try again."}}`. Differs.
- Step 2 (edit): `500 {"error":{"code":"INTERNAL_ERROR","message":"Something went wrong. Please try again."}}`. Differs.

**Severity (proposal):** Minor, by user impact. No data is lost, nothing is stored by either request, and no protected data is exposed in the response. The server process stayed up and kept serving other requests. It is nonetheless a real, reproducible wrong status code on a specific input, on two separate endpoints, so it is not purely cosmetic.

**Defect or enhancement:** We think this is a defect, on a narrower basis than a direct textual rule: AC-03.3 and AC-04.4 each give a complete, specific list of inputs that must be refused, and a NUL-containing `name`/`unit` is not on either list; AC-03.1/AC-04.1 say a request that is not one of those listed failures should succeed. Getting `500` is consistent with neither AC. We state the strength of this basis honestly: no AC names NUL or control characters, so we are not claiming the contract was violated word for word; we are claiming the two ACs together leave no room for a `500` on this input. We ask you to classify it with a reason tied to your contract. We did not guess beyond what the code shows (the validator's `text()` helper accepts the NUL byte; the database then rejects it; only Prisma code `P2002` is caught, everything else is re-thrown to the generic 500 handler).

**Code read (file:line), at commit `50f5605`:**
- `server/src/services/template.js:23`: the shared validator `const text = (message, max) => z.string({ error: message }).trim().min(1, { error: message }).max(max, { error: message });` accepts any non-empty, within-length string, including one containing `\^@`.
- `server/src/services/template.js:24-29`: `createBody` applies `text()` to `name` and `unit`. Lines 43-48: `editBody` applies the same (optional) for edit.
- `server/src/services/template.js:116-127` (`createTemplate`) and `:74-95` (`editTemplate`): the `try/catch` only recognizes Prisma code `P2002` (duplicate name); any other error is re-thrown.
- `server/src/routes/templates.js:16-24` and `:25-33`: both handlers forward errors with `next(error)`.
- `server/src/app.js:35-43`: the generic error handler special-cases `entity.parse.failed`/`entity.too.large` and falls through to `500 INTERNAL_ERROR` for everything else.

**Evidence:**
- E-L1-03 (create): request `POST /api/templates {"name":"EXP-LOCAL-NUL\^@X","unit":"x","minValue":1,"maxValue":10}`; response `500 {"error":{"code":"INTERNAL_ERROR","message":"Something went wrong. Please try again."}}`.
- E-L1-04 (edit): request `PATCH /api/templates/1 {"unit":"X\^@Y"}`; response `500 {"error":{"code":"INTERNAL_ERROR","message":"Something went wrong. Please try again."}}`.
- Both requests were sent once each, to `http://localhost:4100` only (an isolated local Docker instance of this repository at the tested commit). No request was sent to any deployed URL. Nothing was retried to force a difference.

**Note on consent/AI use:** part of this test (building and running the local Docker stack, and sending the requests above) was operated by an AI agent under the testers' supervision, as declared above. No password, token or cookie value is included anywhere in this report.

**Related finding:** a NUL character in the login username gives the same `500` response, reported separately as https://github.com/phittayanan/habit-tracker/issues/126 . It may share the same root cause (the same validator pattern and the same generic error handler).

## What we ask

Please classify this report (accepted defect, duplicate, not a defect, enhancement) with a reason tied to your Sprint 1 contract, and tell us when you can answer.

### Files this Issue will change

None. This is a report from the UAT team of another project. We will not change your code; the fix is yours to decide.

````

## Review texts of the fix and release pull requests

### R-129 Review of PR 129 by phittayanan, 2026-11-25T15:43:08Z, head 6cb474e

Source: <https://github.com/phittayanan/habit-tracker/pull/129#pullrequestreview-6060732067>

````text
Approving. Checked against Issue #128 (AC-01.2, TC-81, FR-01) at head 6cb474eb656422aab4ba990136aa4c9616cb2bec.

## What I checked

1. All five changed files in the head/base diff, and the commit order: 4e606d3 (spec) -> 890bf7a (failing test) -> 6cb474e (fix). Result: spec first, then test, then fix, as CLAUDE.md asks.
2. RED: at 890bf7a (test only, old code), `node --test --test-concurrency=1 test/auth.test.js` on a disposable local PostgreSQL 16 with the project migrations. Result: TC-81 fails, `actual: 500, expected: 401`. [AI-assisted]
3. GREEN: at 6cb474e, same command: TC-81 passes. Whole `npm test`: 87 tests, 87 pass, 0 fail, 0 skipped. (My first run had 86/87: `client.test.js` needs `client/dist`, which my fresh checkout lacked; after `vite build` it passed.) [AI-assisted]
4. Extra requests beyond TC-81, sent with supertest at 6cb474e: NUL in the middle, only a NUL, leading NUL, trailing NUL, an existing user plus a trailing NUL with the correct password, a NUL in the password (existing and unknown user). Result: all `401 INVALID_CREDENTIALS`, no `Set-Cookie`. Control (existing user, correct password): 200 with a cookie. [AI-assisted]
5. The spec claim "no account can have such a username": `select 'a' || chr(0)` on PostgreSQL 16 gives `ERROR: null character not permitted`. [AI-assisted]
6. OP-01.12: `server/src/services/auth.js:13-16` skips only `findUnique`; the dummy-hash `bcrypt.compare` still runs, and TC-81 asserts two compare calls (one per unknown username).
7. Traceability: TC-81 is new (the highest before was TC-80); the FR-01 row in `docs/traceability.md` lists TC-81 and #128; AC-01.2, the TC table and the revision-history row in `F-01-login.md` agree with each other.
8. Busy files: staging's tip is an ancestor of this head and GitHub shows the PR mergeable. PR #125 also appends to `docs/ai-use.md`, so whichever of #125 and #129 merges second resolves that conflict (the PR body says so). CI on this head: `test-and-docker` and `pr-issue-link` succeeded (I read the result; I did not run them).
9. PR text: `Closes #128` only; #126 stays open for the partner's retest, as Issue #128 says.

Not checked: the deployed app and the corrected release (Issue #108); the browser tests (no client change); whether the NUL path takes the same time as an ordinary unknown username (I checked the number of bcrypt calls, not the timing); endpoints other than login (#127).

## Findings

1. question: #127 (a NUL character in a template name or unit gives 500) is the same kind of input. This PR fixes login only, as Issue #128 scopes it, and I ask for no change here. Will #127 get its own Issue and PR, and will that one check for NUL in one shared place instead of repeating `includes('\^@')`?


````

### R-132 Review of PR 132 by projectnewy, 2026-11-26T09:35:50Z, head 223f2b1

Source: <https://github.com/phittayanan/habit-tracker/pull/132#pullrequestreview-6071653008>

````text
Review at head 223f2b1. **Approved.** Checked against Issue #131 scope and Done-when and the partner finding #127. Drafted with Claude Code (AI-assisted) and posted by projectnewy after reading it.

## What I checked
1. The diff against `staging` (merge-base cddc29c, the staging tip): the two contracts, `docs/traceability.md`, the two test files, `server/src/services/template.js` and `docs/ai-use.md`. Commit order is spec (9932233), failing test (f8a7e0f), fix (9e07ab5), AI-use row (223f2b1). [AI-assisted]
2. Spec wording: AC-03.3 and AC-04.4 now name a `name` or `unit` with a NUL character as `400 VALIDATION_ERROR`; TC-68 and TC-71 carry both cases; each contract has a revision row; the BR-03 and BR-08 rows of `traceability.md` link #131 and #127.
3. RED, run by the agent on a disposable PostgreSQL 16 at f8a7e0f (tests only): `template.test.js` and `template-edit.test.js`, 20 tests, 18 pass, 2 fail (TC-68 and TC-71), actual 500, expected 400. [AI-assisted]
4. GREEN at 223f2b1: the whole server suite, 87 tests, 87 pass, 0 fail, 0 skipped. [AI-assisted]
5. The four requests of #131 against the fix on a fresh local database: create with a NUL in `name` and in `unit`, edit with a NUL in `unit` and in `name`, all `400 VALIDATION_ERROR` with the field's existing message; only the control template is stored and it is unchanged. The same script on 2026-11-26, before this fix, returned 500 for all four. [AI-assisted]
6. The validator: the `refine` is on the shared `text()` after `trim`, `min` and `max`, so the existing messages and the optional fields of the edit body keep working (checks 3 to 5). The other `z.string()` inputs in `server/src` are the login username (fixed in #129) and the two date fields, which must match a calendar date, so no other text reaches the database from a request through `z.string()`. [AI-assisted]
7. CI at the head: `test-and-docker` and `pr-issue-link` SUCCESS (read from the PR). The `docs/ai-use.md` row says what the AI did and what phittayanan decided; it does not claim a run on the deployed app.
Not checked: the client and Playwright tests (no client change), the deployed app, and the release.

## Findings
1. **suggestion**: a NUL name gets "Name must be 1 to 100 characters.", which does not describe the problem. It is the field's existing message and the contract asks for no new one, so no change is needed here.
2. **suggestion** (follow-up, mine as owner of the findings record): `docs/labs/lab-06/findings.md` on `staging` still says #127 is "Not yet triaged". After this merge it should record the classification (triage comment on #127, 2026-11-26 09:19 UTC), #131 and this PR. Nothing to change in this PR.


````

### R-135 Review of PR 135 by projectnewy, 2026-11-26T10:57:29Z, head 13a2df6

Source: <https://github.com/phittayanan/habit-tracker/pull/135#pullrequestreview-6072909741>

````text
Review of the release PR at head 13a2df6 (`staging` into `main` 50f5605). **Approved.** Checked against Issue #108. Drafted with Claude Code (AI-assisted) and posted by projectnewy after reading it.

## What I checked
1. `git merge-base --is-ancestor origin/main origin/staging` succeeds, and the tree of 13a2df6 (601ce29) is the same as the tree of 73bdb1a (the head of PR #134). [AI-assisted]
2. Code, deploy, workflow and package paths outside `docs/`: only five files differ (`server/src/services/auth.js`, `server/src/services/template.js` and three test files under `server/test/`), 26 insertions and 2 deletions. No file under `server/prisma` changes, so there is no migration or seed change. 121 files differ in the whole diff, as the PR says. [AI-assisted]
3. The two source changes are the reviewed ones of PR #129 (a username with NUL is an unknown username, dummy bcrypt comparison kept) and PR #132 (the shared `text()` validator refuses NUL). I reviewed #132 and ran its RED and GREEN there. [AI-assisted]
4. CI on 13a2df6 (`test-and-docker`, read from the run log, not re-run): server 87 tests, 87 pass, 0 fail, 0 skipped; browser tests 46 passed. [AI-assisted]
5. A text scan of the added lines of the whole diff (images and lock files left out) for passwords, tokens, keys and connection strings with a password found only the throw-away values in `reset/check-uat-reset.sh`. I did not look at every image again; the Lab 6 screenshots were checked in the reviews of their PRs. [AI-assisted]
6. Rollback: with no migration in this release, `docs/labs/lab-05/deployment.md` section 6.4 allows running `Deploy` by hand on `main` with `image_tag` = `50f5605d266d881b4afba3f8ac96d40882f26fd2` (`v1.3`, built by `deploy.yml`).
7. The partner was told on #130 (2026-11-26 10:24 UTC) that the fixes were not deployed yet, that the new tag and `build` label follow the release, and not to send requests until a separate written OK.
Not checked: GCP, the running image, the deploy run and the app after the release.

## Findings
1. **question**: the PR asks to note the digest of the running image outside Git before merging (section 6.4). Has it been noted? Merging this PR starts the deploy.
2. **suggestion**: the handoff (section 1, "Changes during testing") says we tell the UAT Team before we deploy. The #130 comment announces the release without a time. A one-line "deploying now" there just before the merge would meet it plainly.
3. **suggestion**: the `docs/ai-use.md` rows for #133 and #108 are not in this release, as the PR says; please add them with the observed result in a PR into `staging` after the deploy (the same point as in my review of #134).
4. **note**: after the deploy, #108 still needs the new tag (`v1.4`, earlier tags unmoved), the `build` label, the smoke checks, and then the written OK and the retest requests in #126, #127 and #130. #126 and #127 stay open until the partner retests.


````

## Independent retest of our fixes (by the partner team)

### RT-126 Comment by asamapornch, 2026-11-26T14:33:33Z

Source: <https://github.com/phittayanan/habit-tracker/issues/126#issuecomment-7194992804>

````text
Retest result: PASS.
- Version tested: tag v1.4, build 056ee5c, commit 056ee5c59d1292ad0805f8f5c8c80e1c0e2c3636, Cloud Run revision habit-tracker-00007-7pd (build label confirmed in the page and in /api/health).
- Date and time: 2026-11-26, about 21:10 to 21:30 (approximate) (Asia/Bangkok). Tester: asamapornch. Manual run with a browser; account: the agreed synthetic account only; within the scope of your written OK in #130.
- Case 1, login with an unknown ordinary username: 401 INVALID_CREDENTIALS, body 'Username or password is incorrect.', no session created.
- Case 2, login with a username containing a NUL character: 401 INVALID_CREDENTIALS with the identical body, no session created (checked with /api/auth/me after each attempt).
- Expected per issue: both 401 INVALID_CREDENTIALS with the same body and no session. Actual: matches. Not tested: anything outside these two requests.
Thank you for the quick fix. We think this Issue can be closed by you if you agree. Evidence is in our result file RETEST-126-127-result.md (we will link it from our repository).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

````

### RT-127 Comment by asamapornch, 2026-11-26T14:33:43Z

Source: <https://github.com/phittayanan/habit-tracker/issues/127#issuecomment-7194997077>

````text
Retest result: PASS.
- Version tested: tag v1.4, build 056ee5c, commit 056ee5c59d1292ad0805f8f5c8c80e1c0e2c3636, Cloud Run revision habit-tracker-00007-7pd.
- Date and time: 2026-11-26, about 21:10 to 21:30 (approximate) (Asia/Bangkok). Tester: asamapornch. Manual run with a browser; account manager1 (agreed synthetic account); within the scope of your written OK in #130.
- Case 1, template create with a NUL character in name: 400 VALIDATION_ERROR ('Name must be 1 to 100 characters.'); the template list was unchanged afterwards.
- Case 2, edit with a NUL character in unit: 400 VALIDATION_ERROR ('Unit must be 1 to 30 characters.'); a read afterwards showed the template unchanged (id 18, name EXP-EditA, unit a, min 1, max 10, ACTIVE).
- Note on case 2: the template edited was EXP-EditA, an unused synthetic template that we ourselves created with manager1 during our exploratory testing (we had told you about leftover test records in #130). None of your three seed templates was unused, and we did not create a new template for this retest.
- Expected per issue: both 400 VALIDATION_ERROR, nothing stored or changed. Actual: matches. Not tested: anything outside these two requests.
Thank you for the fix. Please close the Issue if you agree. Our test records (EXP-* templates) are still on your demo as listed in #130; tell us if you want them removed in a particular way.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

````

## Acceptance record for our product (decided by the partner team)

### AD-1 Comment by asamapornch, 2026-11-26T14:45:23Z

Source: <https://github.com/phittayanan/habit-tracker/issues/130#issuecomment-7195278883>

````text
Our UAT decision on your Sprint 1 release (Lab 6).

Decision: ACCEPTED, no blocking conditions.
Version assessed: UAT-01 to UAT-04 and EXP-1 on tag v1.3 (commit 50f5605d266d881b4afba3f8ac96d40882f26fd2); fixes for #126 and #127 retested on tag v1.4, build 056ee5c, commit 056ee5c59d1292ad0805f8f5c8c80e1c0e2c3636 (Cloud Run revision habit-tracker-00007-7pd).
Date: 2026-11-26.
Decided by: asamapornch and warunwora (our UAT team).
Test runs: UAT-01 to UAT-04 and EXP-1 were run by asamapornch with warunwora present and agreeing with the results; the retest of #126 and #127 was run by asamapornch alone.

Basis:
- UAT-01 to UAT-04 and EXP-1: PASS, no defect found in the cases tested.
- Two minor defects found by us (#126, #127: a NUL character in the login username, template name and unit returned 500) were fixed in v1.4. Our retest passed 4 of 4 cases (comments in #126 and #127).
Conditions: none. We ask you to close #126 and #127 if you agree.
Not covered by this decision: anything outside the cases in our result files, and any change to your app after v1.4.
Leftover test data: the EXP-* and UAT-* test templates and goals we created are still on your demo, as listed earlier in this Issue; tell us if you want them removed in a particular way.

Prepared with the help of an AI assistant (Claude Code); decided by asamapornch and warunwora.

````

## Our retest of the partner fixes (we are the UAT Team)

### RT-61 Comment by projectnewy, 2026-11-26T11:46:35Z

Source: <https://github.com/asamapornch/habit-activity-tracker/issues/61#issuecomment-7191150762>

````text
Retest of B2-01 on your deployed app, 2026-11-26 between 18:35 and 18:46 Asia/Bangkok (11:35 to 11:46 UTC, taken from GitHub timestamps; corrected from "about 18:55", which came from a local clock that was ahead). **Result: PASS.**

Version: the app shows no revision on screen. At the time of the test the latest successful "Deploy demo" run was 45812026155 (`main` `b53e7bc`, 11:35 UTC, your Lab 7 release), which comes after the revision `s65da36e2-00010-2mh` you named and includes the fix (PR #63).

Name used: `EXP-PT-61-` + 110,000 `x`.
- **Create** (MANAGER): `POST /templates` -> 400. The form shows "Request body is too large." and keeps the typed values. After a reload there are still 10 templates; none was created.
- **Edit** (a template we created for this test, `EXP-PT-61-edit`, km 0–10): `PUT /templates/11` -> 400 with the same message. After a reload it is unchanged.

We observed the HTTP status and the message on screen. We did not capture the response body; the code `VALIDATION_ERROR` is what your `errorHandler.ts` at `b53e7bc` returns for this case.

How it was run: an AI agent (Claude Code) operated the pages in our tester's signed-in browser, filling the long name with a page script and clicking Create and Save; our tester logged in, never shared a password, and decided the result. One test template, `EXP-PT-61-edit`, remains on your app.



````

### RT-60 Comment by projectnewy, 2026-11-26T11:50:57Z

Source: <https://github.com/asamapornch/habit-activity-tracker/issues/60#issuecomment-7191242616>

````text
Checked B1-01 on your deployed app on 2026-11-26, as MANAGER, in the Create template form (nothing was created). **Result: PASS for Min value and Max value.**

- Max value 50, field focused, then the mouse wheel over it: the value stays 50 and the field loses focus (before the fix it became 49.97).
- Min value 1: the value stays 1 after scrolling (tester's observation; we have a screenshot of the focused field, none after the scroll).

Version: the page in our tester's tab did not show the "Back-dating limit" field, so it was loaded before your Lab 7 client; the app shows no revision text, so we cannot name the revision for certain. We did not re-test your Lab 7 client.

We did not test the daily target and entry value fields, which you list as a known limitation. We accept that limitation as minor.


````

## Acceptance record for the partner's product (decided by our team)

### AD-2 Comment by phittayanan, 2026-11-26T15:10:42Z

Source: <https://github.com/asamapornch/habit-activity-tracker/issues/68#issuecomment-7195894403>

````text
**UAT decision on your Sprint 1 release: Accepted with documented minor limitations.**

- **Testers (UAT Team):** phittayanan and projectnewy. UAT-01 to UAT-03 run by projectnewy, UAT-04 to UAT-06 by phittayanan; exploratory X-01 and X-02 by phittayanan's session (AI agent operating the browser, approved and confirmed by phittayanan).
- **Version tested:** `main` `0619c07db872a5bf1c7946301b4bfc40e9e477d2`, Cloud Run `s65da36e2-00009-b4s`, 2026-11-25. Retest of #61 on 2026-11-26 on the deployment after `main` `b53e7bc` (which includes the PR #63 fix).
- **Date of decision:** 2026-11-26.
- **Basis:** UAT-01 to UAT-06 all PASS (UAT-02 with deviations caused by our tester's input, not by the app). B2-01 (#61, accepted defect, minor) fixed and retested PASS: create and edit with a 110,000-character name returned 400, nothing stored.
- **Documented minor limitation:** B1-01 (#60, enhancement, minor): the mouse wheel changes a focused number field in the Create template form. Not required by your Sprint 1 contract; we accept it as a known limitation.
- **Not covered:** anything outside UAT-01 to UAT-06, X-01, X-02 and the #61 retest. A NUL character in a template name or login email gave 500 on a **local copy** at `0619c07` (our X-03); we did not run it on your deployed app and did not report it. Changes after `b53e7bc` (including your Lab 7 release) are outside this decision, which covers the Sprint 1 scope only.
- **Conditions:** none.

Our full results: `docs/labs/lab-06/partner-uat/` in phittayanan/habit-tracker.


````

### AD-3 Comment by phittayanan, 2026-11-26T15:15:21Z

Source: <https://github.com/asamapornch/habit-activity-tracker/issues/68#issuecomment-7196006157>

````text
**Correction to our decision above (the limitation line only; the decision is unchanged).** B1-01 (#60) is fixed in the Create template form (your PR #64), and our tester checked it on your deployed app: Min value and Max value no longer change with the mouse wheel (comment on #60). The documented minor limitation is what you stated in #60: the **daily target field (Goals) and the entry value field (GoalDetail) still respond to the wheel**. We accept that as a known limitation. The decision stays **Accepted with documented minor limitations**.


````
