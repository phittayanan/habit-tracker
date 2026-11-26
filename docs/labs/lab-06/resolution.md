# Lab 6 Parts C and D: our own findings, their correction and the retest

Lab 6, Issue #110. This file is the Part C summary and the Part D record for **our own product** (we are the Product Team here). Our work as the UAT Team on the partner's product is in `partner-uat/` and `findings.md` section 2. The evidence PDF (Issue #109) takes its Part C and D text from this file. It holds no password, token or student ID.

Status date: 2026-11-26, about 21:30 Asia/Bangkok. Every fact below names its source. Anything not done yet is marked **pending** and is not claimed.

## 1. Version table

| Step | Version | Source |
|---|---|---|
| Sprint 1 baseline release | tag `v1.0`, commit `64831f7`, 2026-11-10 | `handoff.md` section 1 |
| Version under UAT (tested by the partner) | tag `v1.3`, commit `50f5605d266d881b4afba3f8ac96d40882f26fd2`, Cloud Run revision `habit-tracker-00006-nj6`, page label `build 50f5605` | `release-check.md`; `handoff.md` section 1 |
| Defective code | `v1.3` (`50f5605`): `server/src/services/auth.js` (login lookup) and `server/src/services/template.js` (the shared `text()` validator) | triage comments on #126 and #127 |
| Fix for #126 | Issue #128, PR #129: spec `4e606d3`, failing test `890bf7a`, fix `6cb474e`; merged into `staging` as `3e431b4` | PR #129 |
| Fix for #127 | Issue #131, PR #132: spec `9932233`, failing test `f8a7e0f`, fix `9e07ab5`, AI-use row `223f2b1`; merged into `staging` as `7bd6283` | PR #132 |
| Sync of `main` into `staging` | Issue #133, PR #134: merge commit `73bdb1a`, merged as `13a2df6`; no file changes (tree `601ce29` on both) | PR #134; review of PR #135, check 1 |
| Corrected release | PR #135 (`staging` `13a2df6` into `main`), merge commit `056ee5c59d1292ad0805f8f5c8c80e1c0e2c3636`, annotated tag `v1.4` | PR #135; `git cat-file -p v1.4` |
| Deployed corrected revision | Cloud Run `habit-tracker-00007-7pd`, page label `build 056ee5c` | deploy run [45806178753](https://github.com/phittayanan/habit-tracker/actions/runs/45806178753); phittayanan's comment on #126, 2026-11-26 18:03 Asia/Bangkok |

**Merge commits.** `056ee5c` is GitHub's merge commit of PR #135, so its commit ID differs from the `staging` head `13a2df6` it carries; the deployed image is built from `056ee5c`. The code difference between `v1.3` and `v1.4` is five files: `server/src/services/auth.js`, `server/src/services/template.js` and three test files under `server/test/` (26 insertions, 2 deletions; review of PR #135, check 2). No migration or seed file changed. The rest of the diff is documents and evidence.

## 2. Part C: findings received about our product

The partner team (UAT Team, "Habit and Activity Tracker": asamapornch, warunwora) sent two finding Issues and one notice. We answered each within 24 hours of filing (channel and answer time agreed in Issue #107). Checked with `gh issue list --repo phittayanan/habit-tracker --state all` on 2026-11-26 at about 21:15 Asia/Bangkok: no other finding has arrived.

| Finding | Reporter, filed (Asia/Bangkok) | Contract | Classification and severity | Reason (short; full text in the triage comment) | Owner | Fix status | Disposition |
|---|---|---|---|---|---|---|---|
| [#126](https://github.com/phittayanan/habit-tracker/issues/126) NUL character in the login username returns 500 instead of 401 | asamapornch, 2026-11-25 21:39 | F-01 AC-01.2 | **Accepted defect, minor.** Triage by projectnewy 2026-11-25 21:43 (4 min after filing). The partner agreed at 21:56. | AC-01.2 gives `401 INVALID_CREDENTIALS` for any unknown username and names no exception, so a written requirement is not met; not an enhancement. Minor: a normal user does not type a NUL character, no session is issued, nothing is stored or exposed, the app keeps serving. | projectnewy (fix), phittayanan (review) | Fixed in #128 / PR #129; released in `v1.4`, deployed 2026-11-26 | Open: waiting for the partner's retest; the partner closes #126 |
| [#127](https://github.com/phittayanan/habit-tracker/issues/127) NUL character in a template name or unit returns 500 (create and edit) | warunwora, 2026-11-25 21:55 | F-03 AC-03.1, AC-03.3; F-04 AC-04.1, AC-04.4 | **Accepted defect, minor.** Triage by phittayanan 2026-11-26 16:19 (within 24 h). | The ACs give such a request only two outcomes, success or a listed `400`; `500` is neither. We reproduced all four requests (create and edit, NUL in `name` and in `unit`) on a disposable local database: all `500`, nothing stored. Minor for the same reasons as #126. | phittayanan (fix), projectnewy (review) | Fixed in #131 / PR #132; released in `v1.4`, deployed 2026-11-26 | Open: waiting for the partner's retest; the partner closes #127 |
| [#130](https://github.com/phittayanan/habit-tracker/issues/130) UAT results and notices | asamapornch, 2026-11-26 15:48 | none | Not a finding: the partner's own label ("not a defect report") | Their UAT results on `v1.3` and notices. We answered on 2026-11-26 17:24 and gave the written OK for the retest requests at 18:03. | phittayanan | none needed | Open, for the final decision |

No duplicate, no not-defect and no enhancement was received. No critical or major defect was reported. Both accepted defects are minor, and we chose to **fix** both rather than ask the partner to accept them as known limitations. So the controlled defect exercise of sheet section 3.5 is not needed.

`findings.md` section 1 still shows #127 as "Not yet triaged" (written before the triage). The table above is the current state. Updating `findings.md` belongs to its owner (projectnewy, suggestion 2 in the review of PR #132).

## 3. Part D: the accepted-defect chain

Both chains follow the same order: triage → fix Issue → spec change → failing test (RED) → fix (GREEN) → whole suite → PR reviewed by the other student → CI → one release PR into `main` → deploy and smoke checks → notice and retest request to the partner.

### 3.1 #126: login with a NUL character in the username

- **Fix Issue:** #128 (owner projectnewy). **Branch:** from `staging`. **PR:** #129, author projectnewy, reviewed and approved by phittayanan (2026-11-25 22:34 and 22:43), merged by phittayanan 2026-11-25 22:53.
- **Spec:** AC-01.2 in `docs/sprints/sprint-1/F-01-login.md` now says that an unknown username includes one with a NUL character. New test TC-81. `docs/traceability.md` row FR-01 lists TC-81 and #128.
- **Test** (`server/test/auth.test.js`, TC-81): a login with `nobody` and with `no\u0000body` must both get `401 INVALID_CREDENTIALS` with identical bodies, no `Set-Cookie`, no Session row, and one bcrypt comparison each.
- **RED**, at `890bf7a` (test only, old code), disposable PostgreSQL 16, project migrations:

  ```
  node --test --test-concurrency=1 test/auth.test.js
  ℹ tests 20   ℹ pass 19   ℹ fail 1
  ✖ TC-81: a username with a NUL character is an unknown username, not a server error
    AssertionError: status for "no\u0000body"   actual: 500   expected: 401
  ```

- **GREEN**, at `6cb474e` (with the fix):

  ```
  node --test --test-concurrency=1 test/auth.test.js   -> ℹ tests 20  ℹ pass 20  ℹ fail 0
  npm test (whole server suite)                         -> ℹ tests 87  ℹ pass 87  ℹ fail 0  ℹ skipped 0
  ```

  Both runs are from the PR #129 description and were repeated by the reviewer (review checks 2 and 3).
- **Code diff** (`server/src/services/auth.js`):

  ```diff
  -  const user = await db.user.findUnique({ where: { username: credentials.username } });
  +  // AC-01.2: no account can have a NUL character in its username (PostgreSQL text cannot hold it), so such a
  +  // username is an unknown username. Skip the lookup, which would fail with a 500, but keep the bcrypt work below.
  +  const user = credentials.username.includes('\u0000') ? null
  +    : await db.user.findUnique({ where: { username: credentials.username } });
  ```

- **Review** (phittayanan, approved, 9 checks): commit order spec → test → fix; RED and GREEN rerun; extra requests (NUL in the middle, only NUL, leading, trailing, a real user plus a trailing NUL, a NUL in the password) all `401` with no cookie, and the control login `200`; the dummy bcrypt comparison is kept (OP-01.12); traceability; CI read. One question: whether #127 would get its own Issue and a shared check. It did get its own Issue (#131); its fix is in the shared template validator, not in a helper shared with login.
- **CI** on the PR head: `test-and-docker` and `pr-issue-link` succeeded.

### 3.2 #127: NUL character in a template name or unit

- **Fix Issue:** #131 (owner phittayanan). **PR:** #132, author phittayanan, approved by projectnewy 2026-11-26 16:35, merged by projectnewy 16:36.
- **Spec:** AC-03.3 (`F-03-template-create.md`) and AC-04.4 (`F-04-template-edit.md`) now list a `name` or `unit` that contains a NUL character as `400 VALIDATION_ERROR` (PostgreSQL text cannot hold it). TC-68 and TC-71 carry both cases. Revision rows in both contracts. `docs/traceability.md` rows BR-03 and BR-08 link #131 and #127.
- **Test:** a NUL `name` and a NUL `unit` added to TC-68 (`server/test/template.test.js`) and TC-71 (`server/test/template-edit.test.js`).
- **RED**, at `f8a7e0f` (tests only, old code), disposable PostgreSQL 16:

  ```
  node --test --test-concurrency=1 test/template.test.js test/template-edit.test.js
  ✖ TC-71: invalid edits are validation errors, an unknown id is 404, anonymous is 401, and nothing changes
      AssertionError [ERR_ASSERTION]: {"unit":"X\u0000Y"}   actual: 500, expected: 400
  ✖ TC-68: invalid template bodies are validation errors and anonymous calls stay unauthenticated
      AssertionError [ERR_ASSERTION]: {"name":"Re\u0000ad","unit":"pages","minValue":0,"maxValue":10}   actual: 500, expected: 400
  ℹ tests 20
  ℹ pass 18
  ℹ fail 2
  ```

- **GREEN**, at `9e07ab5` (whole server suite):

  ```
  node --test --test-concurrency=1 test/*.test.js
  ℹ tests 87
  ℹ pass 87
  ℹ fail 0
  ```

- **Code diff** (`server/src/services/template.js`):

  ```diff
  -const text = (message, max) => z.string({ error: message }).trim().min(1, { error: message }).max(max, { error: message });
  +// AC-03.3, AC-04.4: PostgreSQL text cannot hold a NUL character, so refuse it here instead of failing in the database.
  +const text = (message, max) => z.string({ error: message }).trim().min(1, { error: message }).max(max, { error: message })
  +  .refine(value => !value.includes('\u0000'), { error: message });
  ```

- **Review** (projectnewy, approved, 7 checks): spec wording, commit order, RED and GREEN rerun, the four requests of #131 on a fresh local database (all `400` with the field's message, only the control template stored and unchanged; the same script before the fix gave `500` for all four), the other `z.string()` inputs in `server/src`, CI read. Two suggestions, no change asked: the NUL message reuses the length message, and `findings.md` needed the #127 triage (section 2 above).
- **CI** on the PR head: `test-and-docker` and `pr-issue-link` succeeded.

### 3.3 Release and redeploy (Issue #108)

- **Sync:** Issue #133, PR #134 merged `main` into `staging` (no file change) so the release PR would contain `main`. Approved by projectnewy 2026-11-26 17:38. The first `pr-issue-link` check failed and a later run succeeded; both are on the PR.
- **Release PR:** #135, `staging` `13a2df6` into `main`, author phittayanan, approved by projectnewy 2026-11-26 17:57 with 7 checks (`main` contained in `staging`; only the five code files above differ; no migration; the source changes are the reviewed ones of #129 and #132; CI log read; a scan of added lines for secrets; the rollback path), merged by projectnewy 17:57:53.
- **Notice before deployment:** posted on #126 and #127 at 17:14 (before the merge), and on #130 at 17:24, as the handoff requires.
- **CI and deploy:** run [45806178753](https://github.com/phittayanan/habit-tracker/actions/runs/45806178753) on `056ee5c`, triggered by the push to `main`. Job `test / test-and-docker`: server suite `ℹ tests 87 ℹ pass 87 ℹ fail 0 ℹ skipped 0`, browser tests `46 passed`. Job `deploy`: `IMAGE_TAG: 056ee5c59d1292ad0805f8f5c8c80e1c0e2c3636`, `ROLLBACK: false`, success; its smoke step checks health, readiness and that the build label equals the commit. (Read from the run log on 2026-11-26.)
- **Tag:** annotated `v1.4` on `056ee5c` by phittayanan. Earlier tags were not moved.
- **After the deploy:** phittayanan reported revision `habit-tracker-00007-7pd`, the page label `build 056ee5c`, and `/api/health` and `/api/ready` returning 200 at 18:02 (comment on #126, 18:03). **We did not send the NUL requests to the deployed app ourselves**; the fixes are covered by the automated tests above, and the retest belongs to the partner.

### 3.4 Independent retest and the Sprint 1 decision

| Item | State |
|---|---|
| Retest request #126 | Posted 2026-11-26 18:03: an ordinary unknown username and a username with an embedded NUL character, both expected `401 INVALID_CREDENTIALS` with the same body and no `Set-Cookie`. |
| Retest request #127 | Posted 2026-11-26 18:03: a template create with a NUL in `name` and an edit of an unused template with a NUL in `unit`, both expected `400 VALIDATION_ERROR` with nothing stored or changed. |
| Written OK for the partner's requests to our app | Posted on #130 at 18:03 (scope: the retest of #126 and #127 only, the three agreed accounts, synthetic data). |
| Partner retest result (tester, version, result, evidence) | **Pending.** Not received at the status time. |
| Re-run of affected UAT cases | **Pending** (the partner's choice which cases are affected). |
| Final Sprint 1 decision by the UAT Team | **Pending.** Only the partner team can record it (Accepted, Accepted with documented minor limitations, or Not Accepted), with tester names, the version `v1.4` / `build 056ee5c`, the date and evidence. |

This section is updated in the same PR when the partner answers. If no answer arrives before submission, the PDF reports the retest and the decision as pending, with the requests above as the evidence that they were asked for.

## 4. Contributions (Lab 6)

From the Issue assignees, PR authors and reviewers on GitHub. "Pair" means both students worked in the same session.

| Work | phittayanan | projectnewy |
|---|---|---|
| Part A: UAT cases | UAT-02 (#100), UAT-04 (#102) | UAT-01 (#99), UAT-03 (#101) |
| Part A: handoff and release check | release check, accounts, backup and reset on GCP (#104) | handoff package (#103) |
| Part B: partner's UAT | second half, UAT-04 to UAT-06 (#106); exploratory testing X-01 to X-03 (#122) | first half, UAT-01 to UAT-03 (#105) |
| Part C: reports and triage | triage of #127 | outgoing reports B1-01 and B2-01, triage of #126, findings record (#107) |
| Part D: fixes | fix #131 / PR #132 (spec, RED, GREEN) | fix #128 / PR #129 (spec, RED, GREEN) |
| Part D: reviews | reviewed PR #129 | reviewed PR #132, #134 and #135 |
| Part D: release | sync PR #134, release PR #135, tag `v1.4`, deploy check, notices (#108, #133) | merged PR #132, #134 and #135 (phittayanan merged PR #129) |
| Write-up | this file and the AI-use rows (#110) | the evidence PDF (#109) |

## 5. Limitations

- **Retest and decision pending** (section 3.4). Until the partner records its decision, Sprint 1 acceptance of `v1.4` is not claimed.
- **The deployed fix was not exercised by us.** We checked health, readiness and the build label on the deployed revision, not the NUL requests; the partner's retest is the deployed check.
- **The NUL message.** A template name with a NUL character gets the length message ("Name must be 1 to 100 characters."), which does not name the real problem. The contract asks for no new message (review of PR #132, suggestion 1).
- **Timing of the NUL login path** was not measured: the review checked that the bcrypt comparison still runs, not that the time matches an ordinary unknown username (review of PR #129, "Not checked").
- **Client and browser tests** were not run for the two fix PRs (no client change); they ran in CI on the release (46 passed).
- **`findings.md`** is out of date for #127 until its owner updates it (section 2).
