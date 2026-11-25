# Findings: received, triage and outgoing reports (Lab 6 Part C)

Lab 6 Part C, Issue #107. Sprint 1 scope only. This file records (1) every finding we **received** about our own Sprint 1 product and its disposition, and (2) the reports we **prepared for the partner team** about their product. Status date: 2026-11-25. It holds no password, token or student ID.

Channel and answer time (agreed by both teams in the joint session of 2026-11-25, recorded in the comments of Issue #107): findings go as GitHub Issues in the product team's own repository, one Issue per finding, with the report fields of the sheet (§3.3). Findings on our app go to this repository; our findings on the partner's app go to `asamapornch/habit-activity-tracker`. We answer each finding Issue within **24 hours** with its classification (accepted defect, duplicate, not a defect, enhancement) and a reason tied to the Sprint 1 contract.

## 1. Findings received (about our app)

Checked with `gh issue list --repo phittayanan/habit-tracker --state all`. The first check, at about 20:55 Asia/Bangkok on 2026-11-25 (13:55 UTC, the time this table was first written), found no finding Issue from the partner team. **Two arrived afterwards: #126 at 21:39 and #127 at 21:55 Asia/Bangkok (14:39 and 14:55 UTC).** The second check, made after #127 arrived (14:55 UTC) and before 16:01 UTC (the time of GitHub's record of our reply to the review; the times here are taken from GitHub, not from a local clock), found only those two (and #128, our own fix Issue). Each is recorded below. The partner team has not sent a result sheet or other reports to us. The list must be checked again before the evidence PDF (Issue #109) is built, and each finding that arrives is triaged here within 24 hours.

| Finding ID | Reporter | Case / requirement | Classification | Reason (tied to the Sprint 1 contract) | Severity and user impact | Owner | Fix status | Disposition |
|---|---|---|---|---|---|---|---|---|
| [#126](https://github.com/phittayanan/habit-tracker/issues/126) NUL character in the login username returns 500 instead of 401 | asamapornch and warunwora (the partner UAT team), filed 2026-11-25 21:39 Asia/Bangkok | AC-01.2 of F-01, quoted by the partner | **Accepted defect** (triage comment posted 2026-11-25 21:43 Asia/Bangkok, within 24 h) | AC-01.2 gives `401 INVALID_CREDENTIALS` for any unknown username and names no exception for its content; a username with a NUL character returned 500. Reproduced by our failing test TC-81 (500 against the expected 401) | Minor: it needs a character a normal user does not type; no session is issued, nothing is stored, no data is exposed | projectnewy (fix), phittayanan (review) | Fix Issue #128, PR #129 merged into `staging` on 2026-11-25 at 22:53 Asia/Bangkok (15:53 UTC): TC-81 failed on the old code (500 against 401) and passes with the fix, whole server suite 87 of 87. Not yet released, redeployed or retested | Open until the partner retests the corrected revision in #126; the partner closes #126 |
| [#127](https://github.com/phittayanan/habit-tracker/issues/127) NUL character in a template name or unit returns 500 (create and edit) | warunwora, filed 2026-11-25 21:55 Asia/Bangkok | AC-03.1, AC-03.3, AC-04.1, AC-04.4 of F-03 and F-04, quoted by the partner (who says no AC mentions NUL) | **Not yet triaged** | The classification and its reason are recorded here when the triage is done | The partner proposes minor | not assigned yet | none yet | Received; triage is due within 24 h of filing, before 2026-11-26 21:55 Asia/Bangkok. It may share the cause of #126 |

Rules we follow when one arrives: reproduce and clarify before dismissing; never relabel a failing requirement as an enhancement; critical and major defects block acceptance and need a fix with a failing test first (RED), review, release and an independent retest (Part D, Issue #108); minor defects are fixed or accepted by the partner as a documented limitation. If no legitimate defect is found, the instructor or TA is asked for a controlled defect exercise on an isolated branch (sheet §3.5); no defect is invented.

## 2. Reports prepared for the partner team (about their app)

The reports below follow the sheet's fields: Issue ID, product owner and team, reporter, tested version, linked case and requirement, preconditions and data, reproduction steps, expected result, actual result, severity with its reason, and evidence. The severity is by user impact and is a proposal; the partner classifies each report.

**Status: sent on 2026-11-25.** Both reports were opened as GitHub Issues in the partner's repository on 2026-11-25 at about 18:12 Asia/Bangkok (11:12 UTC), one Issue per finding, by projectnewy (the `gh` account of this team) after reading them. The text of each Issue is the report below, with a header table and links to the evidence files in this repository. The partner has not answered yet; their classification and the time of the answer are recorded here when they arrive.

| Report ID | Source | Case / requirement | Title | Proposed severity | Status | Evidence |
|---|---|---|---|---|---|---|
| B1-01 | Observation during UAT-02 and UAT-05 preparation (#105) | none (outside the cases); the partner's package states no behaviour | Mouse wheel changes the value of a focused number field | minor | sent 2026-11-25: [asamapornch/habit-activity-tracker#60](https://github.com/asamapornch/habit-activity-tracker/issues/60); no answer yet | E-B1-30 to E-B1-33 (`partner-uat/evidence/`) |
| B2-01 | Exploratory testing X-01 and X-02 (#122), confirmed by phittayanan | AC-02.11, AC-02.17, NFR-05 of the partner's contract | A template name of about 110,000 characters returns 500 instead of 400, on create and on edit | minor | sent 2026-11-25: [asamapornch/habit-activity-tracker#61](https://github.com/asamapornch/habit-activity-tracker/issues/61); no answer yet | E-B2X-01 to E-B2X-07 (`partner-uat/evidence/`) |

Not reported: X-03 of #122 (a NUL character in a template name or login email returns 500). It was seen on localhost only and not confirmed on the deployed app, so it is not sent.

Common data for both reports: product owner team "Habit and Activity Tracker" (asamapornch, warunwora); reporter: UAT team of the Habit tracker project (projectnewy, phittayanan); tested version: Cloud Run revision `s65da36e2-00009-b4s`, `main` at commit `0619c07db872a5bf1c7946301b4bfc40e9e477d2` (from their package; the app shows no version text); date 2026-11-25, Asia/Bangkok; account MANAGER (password received privately, never written here).

### Report B1-01: mouse wheel changes the value of a focused number field

- **Case / requirement:** observation during UAT-02 and UAT-05 preparation; not a step of a case, so it does not change the result of UAT-01 to UAT-03 (all PASS).
- **Preconditions and data:** signed in as MANAGER on Templates. Chrome (version not recorded). Nothing is created.
- **Steps to reproduce:**
  1. In Create template, type Name `UAT-00-WHEEL-PP`, Unit `test`, Min value `1`, Max value `50`. Do not press Create.
  2. Click the Max value field so it stays focused (it shows 50).
  3. With the pointer over the field, scroll the mouse wheel down 3 clicks.
  4. Click outside the fields (no field focused), then scroll the wheel over the Max value field.
  5. Click the Min value field (it shows 1) and scroll the wheel down 1 click.
- **Expected result:** scrolling the page with the wheel does not change a value the user typed.
- **Actual result:** step 3: Max value changes from 50 to 49.97 (0.01 per click; the page also scrolls slightly). Step 4: no change while no field is focused (as seen by the tester). Step 5: Min value changes from 1 to 0.99.
- **Severity (proposal):** minor. No data is lost and the value is visible before submit, but a user who scrolls the page with the wheel to reach Create while a number field is focused can submit a changed value without noticing, for example a template with the range 1 to 49.99.
- **Defect or enhancement:** we think it is an **enhancement** (input handling), not a failure of a specified behaviour, because the partner's package states no behaviour for it. We do not know the cause in the partner's code and do not guess it. We ask the partner to classify it with a reason tied to their contract.
- **Related observation (not proven):** during UAT-02 a template was created with the range 1 to 49.99 although 50 was intended; this is consistent with the behaviour, but we cannot prove that the wheel caused it.
- **Evidence:** E-B1-30 (Max 50 before), E-B1-31 (Max 49.97 after 3 clicks), E-B1-32 (fields not focused, no change), E-B1-33 (Min 0.99 after 1 click); the manager account is in the top bar. Details in `partner-uat/first-half.md`.

### Report B2-01: a template name of about 110,000 characters returns 500 instead of 400 (create and edit)

- **Case / requirement:** exploratory testing X-01 and X-02 (Issue #122, outside the agreed UAT cases), measured only against the partner's own contract at `0619c07`: AC-02.11 ("a name over 100 ... returns 400"), AC-02.17 (a 400 message is shown verbatim and the form keeps what was typed), NFR-05.
- **Preconditions and data:** signed in as MANAGER on Templates (in phittayanan's Chrome, with the partner team's consent for the AI agent that operated the page; see `partner-uat/exploratory.md`). Test names start with `EXP-PT-`. Nothing was stored.
- **Steps to reproduce (create):** (1) In Create template enter Name `EXP-PT-01-` followed by 110,000 `x` (110,010 characters, pasted into the field), Unit `km`, Min `0`, Max `10`. (2) Click Create.
- **Steps to reproduce (edit):** (1) Click Edit on an existing template (we used our own `UAT-04-PP`, id 3, `times · 0–20`). (2) Replace only the Name with `EXP-PT-02-` followed by 110,000 `x`. (3) Click Save.
- **Expected result:** 400 `VALIDATION_ERROR` and the server's message shown verbatim; the form keeps the typed values; the template is not created or changed.
- **Actual result:** create: the form shows "An unexpected error occurred." and `POST /templates` returns 500 `{"error":{"code":"INTERNAL_ERROR","message":"An unexpected error occurred."}}` (request body 110,060 bytes). Edit: the same message and `PUT /templates/3` returns 500 with the same body (110,063 bytes). After a reload the template list is unchanged (10 templates, none starting with `EXP-PT`; `UAT-04-PP` still `times · 0–20`). The edit stored nothing.
- **Severity (proposal):** minor. A normal user is not affected (the input is far beyond 100 characters and the application stays up); the contract's required 400 is not returned for an oversized body, and the user sees a generic message instead of the validation message.
- **Defect or enhancement:** we think it is a **defect** against AC-02.11 and NFR-05: the contract says a name over 100 characters returns 400, and the deployed app returns 500 for an oversized name. We ask the partner to classify it with a reason tied to their contract.
- **Observation on a local copy (not on the deployed app):** with the partner's public code at `0619c07` on a local database, names of 99,000 and 102,000 characters returned 400, and 110,000 returned 500. We did not verify the cause and offer a hypothesis only: the request body size passes a default limit before validation. We ask the partner to classify the report.
- **Evidence:** E-B2X-01 (list before), E-B2X-02 and E-B2X-05 (the error under the create and edit forms), E-B2X-03 and E-B2X-06 (status 500 and body), E-B2X-04 and E-B2X-07 (list after reload, unchanged); E-B2X-08 is the local observation. Details in `partner-uat/exploratory.md`.
- **Note on consent:** the partner team's written permission for the AI agent covers "template inputs named EXP-PT-…". The edit used such a name on an existing template; it stored nothing. Written consent: E-B2X-09 (a comment of asamapornch on our PR #123).

## 3. What is still open

- Done: the two Issues were opened in the partner's repository on 2026-11-25 (links in section 2). Not done: tell the partner team in the group chat that the Issues exist, and send them our result sheet for UAT-01 to UAT-06.
- Triage #127 here before 2026-11-26 21:55 Asia/Bangkok (classification, reason tied to F-03 and F-04, severity, owner), and follow #126 through PR #129, the release (Issue #108) and the partner retest. Check our repository and the partner team results again for further findings on our app; triage each one here within 24 hours. Re-run both checks before Issue #109: `gh issue list --repo phittayanan/habit-tracker --state all` and `gh issue list --repo asamapornch/habit-activity-tracker --state all`, and ask the partner team whether they sent anything by another route.
- For every accepted critical or major defect: Part D (Issue #108), with a failing test first.
- The partner team's classification of B1-01 and B2-01 and the time they answered; record them here.
