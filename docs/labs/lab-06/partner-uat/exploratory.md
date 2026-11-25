# Partner app: exploratory testing against the partner's own contract

Lab 6 Part B/C, Issue #122. Optional extra testing outside the agreed UAT cases (#105, #106); the sheet does not require it and the defect count earns no points (§3.5, p.7). Every expected result below comes from the **partner team's own contract**, not from ours. Confirmed defects are handed to #107 (projectnewy) to report in the partner's repository; this file does not report them.

## Tested release

| Field | Value |
|---|---|
| Product Team | Team "Habit and Activity Tracker" (GitHub: asamapornch, warunwora) |
| Contract read | `docs/srs.md` v1.1 and `docs/sprints/sprint-1/F-01` to `F-05` at commit `0619c07db872a5bf1c7946301b4bfc40e9e477d2` (the version under test, from the handoff) |
| Deployed URL | https://s65da36e2-4d7hbszvwq-as.a.run.app |
| Deployed revision | Cloud Run `s65da36e2-00009-b4s` (handoff; the app shows no version text) |
| Test date | 2026-11-25 (Asia/Bangkok) |
| Test data | Names start with `EXP-PT-` (the partner's system cannot delete data). No item stored any data (see the protected-state column). |

## Consent and who operated the app

| Item | Record |
|---|---|
| Human exploratory testing | Allowed by the partner team (group chat, before 2026-11-25; recorded in the #122 handover). |
| AI agent operating the deployed app | phittayanan reported on 2026-11-25 (in the Claude Code session for #122) that the partner team approved it, on the condition that no password leaks. Evidence: screenshot of the group-chat message, `E-B2X-09` — **TO ADD** (phittayanan). |
| Change to the #106 rule | #106 said "no agent browser automation on the partner's deployed app". For #122 phittayanan changed this on 2026-11-25: the agent may operate the deployed app in phittayanan's own Chrome, in a session phittayanan signed in to, for the items phittayanan approved (X-01, X-02). This row is that record. |
| Password | The agent never typed, saw or stored a password. The Chrome tab was already signed in as MANAGER (`manager@example.com`) when the agent opened the app. |
| Who ran each item | X-01, X-02: Claude Code (Claude in Chrome), after phittayanan's approval ("ทำให้ได้เลยตาม spec"). X-03: localhost only, not run on the deployed app (phittayanan's decision). |

## How the items were found

1. Claude Code read the partner's SRS and F-01 to F-05 contracts and their backend and frontend code at `0619c07`.
2. It ran the partner's backend on localhost (throw-away PostgreSQL 16, the partner's migrations and seed, random local passwords not kept) and sent API requests with `curl` to check suspected mismatches.
3. It showed phittayanan three candidates in Thai; phittayanan approved X-01 and X-02 for the deployed app and kept X-03 to localhost.

Checked on localhost and **matched** the contract (no item raised): check order 401 → 403 → 400 → 404 → 409 on templates, goals and entries; `:id` rules (`0001`, `abc`, above 2147483647); two-decimal values (`0.07`, `1.15`, `5.123`); impossible and malformed dates; Asia/Bangkok "today"; the BR-09 progress formula; forms keeping typed values after a 400/409. One wording question, not raised as a defect: a name of 51 emoji is rejected with 400 because the length is counted in UTF-16 code units (102), while AC-02.11 says "100 characters".

## Results

`confirmed / not reproduced` is phittayanan's decision.

| Item | AC (partner contract) | Input | Expected (from their contract) | Actual | Protected-state check | Evidence | Confirmed / not reproduced |
|---|---|---|---|---|---|---|---|
| X-01 | AC-02.11, AC-02.17, NFR-05 | As MANAGER, Create template: Name `EXP-PT-01-` followed by 110,000 `x` (110,010 characters, pasted into the field), Unit `km`, Min `0`, Max `10`, click Create | 400 `VALIDATION_ERROR`; the server's message (`Invalid template fields.`) shown verbatim; form keeps the values | The form shows "An unexpected error occurred."; `POST /templates` returned **500** `{"error":{"code":"INTERNAL_ERROR","message":"An unexpected error occurred."}}`; the form kept the values. Submitted three times in all: the first showed the message; the second and third were the same submit, repeated to capture the status code | After reload: still the same 10 templates, none starting with `EXP-PT` | E-B2X-01, E-B2X-02, E-B2X-03, E-B2X-04 | **TO DECIDE** (phittayanan) |
| X-02 | AC-02.11, AC-02.17, NFR-05 | As MANAGER, Edit on `UAT-04-PP` (our own template from #106, id 3, pre-filled `times · 0–20`): Name replaced with `EXP-PT-02-` followed by 110,000 `x`, click Save | 400; message shown verbatim; template unchanged | The edit form shows "An unexpected error occurred."; `PUT /templates/3` returned **500** with the same body; Cancel was then clicked | After reload: `UAT-04-PP · times · 0–20`, unchanged; 10 templates | E-B2X-01, E-B2X-05, E-B2X-06, E-B2X-07 | **TO DECIDE** (phittayanan) |
| X-03 | AC-02.5, AC-01.7, NFR-05 | Localhost only: template name `EXP-PT-\u0000`; login email `a\u0000@x` | 400 | 500 `INTERNAL_ERROR` for both | Template count unchanged | E-B2X-08 | Not run on the deployed app (localhost observation only) |

Likely cause (from reading the partner's code, not verified with the partner): `express.json()` uses its default 100 kB body limit, and the error handler (`backend/src/middleware/errorHandler.ts`) turns every error that is not a JSON syntax error into 500, so the 413 "body too large" error becomes 500. On localhost, names of 99,000 and 102,000 characters still returned 400; 110,000 returned 500. X-03 reaches PostgreSQL, which rejects the NUL character, and that error also becomes 500.

## Evidence register

Files are in `evidence/`. Screenshots show the page only (no browser bar or personal data). Times are Asia/Bangkok.

| Evidence ID | Item | Action | Expected | Actual (observed) | Time | Revision | File |
|---|---|---|---|---|---|---|---|
| E-B2X-01 | X-01, X-02 | MANAGER template list before testing | Baseline | 10 templates (Persistence test, UAT-01-PP, UAT-04-PP `times · 0–20`, UAT-02-PP, UAT-02-PP2, UAT-02-PP3, UAT-05-PT, UAT-05-PT2, UAT-03-PP, UAT-03b-PP); the screenshot shows the first five | 2026-11-25 ~14:56 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2X-01-X-01-before-template-list.jpg` |
| E-B2X-02 | X-01 | Create with the 110,010-character name | 400 with the server's message | "An unexpected error occurred." under the form; the fields still hold the name, `km`, 0, 10 | 2026-11-25 ~14:56 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2X-02-X-01-create-long-name-error.jpg` |
| E-B2X-03 | X-01 | Status of the form's `POST /templates` | 400 | 500 `INTERNAL_ERROR` | 2026-11-25 ~14:57 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2X-03-X-01-post-templates-500.txt` |
| E-B2X-04 | X-01 | Reload; template list | No `EXP-PT-01` template | 10 templates, none starting with `EXP-PT` | 2026-11-25 ~14:57 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2X-04-X-01-after-reload-no-EXP-PT.jpg` |
| E-B2X-05 | X-02 | Edit `UAT-04-PP` with the long name, Save | 400 with the server's message | "An unexpected error occurred." under the edit form; the fields hold the long name, `times`, 0, 20 | 2026-11-25 ~14:57 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2X-05-X-02-edit-UAT-04-PP-long-name-error.jpg` |
| E-B2X-06 | X-02 | Status of the form's `PUT /templates/3` | 400 | 500 `INTERNAL_ERROR` | 2026-11-25 ~14:57 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2X-06-X-02-put-templates-500.txt` |
| E-B2X-07 | X-02 | Cancel, reload; template list | `UAT-04-PP` unchanged | `UAT-04-PP · times · 0–20`; no `EXP-PT` template | 2026-11-25 ~14:57 | s65da36e2-00009-b4s (handoff) | `evidence/E-B2X-07-X-02-after-reload-UAT-04-PP-unchanged.jpg` |
| E-B2X-08 | X-03 (and X-01/X-02 on localhost) | `curl` against the partner's backend on localhost | 400 | 500 for the NUL character and for the 110,000-character name; 400 at 99,000 and 102,000 | 2026-11-25 ~14:51 | Commit `0619c07` on localhost, not the deployed revision | `evidence/E-B2X-08-X-03-localhost-nul-500.txt` |
| E-B2X-09 | Consent | Partner team's message allowing the AI agent | Consent and its scope | **TO ADD** (phittayanan's screenshot, cropped) | — | — | — |

## Hand-over to #107

Items that phittayanan marks **confirmed** go to #107 (projectnewy) to report as GitHub Issues in the partner's repository, with the AC, input, expected, actual and evidence IDs above. X-01 and X-02 share one likely cause and could be one report.
