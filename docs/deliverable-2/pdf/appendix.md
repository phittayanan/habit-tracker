# Appendices {#appendix}

## Decision records since Deliverable 1 {#adr-list}

ADR 0002 to ADR 0049 are listed in the Deliverable 1 PDF. These were added since; each file in `docs/adr/` holds its status, decision and reasons. ADR 0096 is not used (the F-17 ADRs were renumbered to 0099 and 0100).

| ADR | Title |
|---|---|
| 0050 | Auth layout package A |
| 0051 | Unknown-user bcrypt comparison |
| 0052 | Deploy smoke test, build label and release tag |
| 0053 | The seed keeps existing templates and still sets the passwords |
| 0054 | A goal's daily target must be above the template's minimum |
| 0055 | Review routing, card moves by the agent and one review format |
| 0056 | UAT case IDs stay outside `docs/traceability.md` |
| 0057 | Work until blocked: blocked-by links, review first, even split |
| 0058 | The UAT accounts are the three seeded accounts |
| 0059 | The UAT reset is a tested SQL script that a human runs, after a backup |
| 0060 | Complete deployment preparation before partner UAT |
| 0061 | Several entries per day, with a day total up to the template maximum |
| 0062 | Team status through a Discord bot, checked before review |
| 0063 | Day box design on phone and desktop |
| 0064 | Template kind: Count or Time |
| 0065 | A Time goal stores whole minutes |
| 0066 | Each goal in the day box keeps a typed amount row |
| 0067 | Ask before discarding an unsaved amount |
| 0068 | Month arrows, and weeks start on Monday |
| 0069 | Which days open, and which goals a day lists |
| 0070 | Day colour edge cases, and today's live colour |
| 0071 | The List groups records by day |
| 0072 | One month endpoint for the calendar, the day box and the List |
| 0073 | The calendar is a new first page; the Sprint 1 goals page stays |
| 0074 | The counter and the bar save nothing at +0 |
| 0075 | Goal versions in a new table; daily_target stays as the latest target |
| 0076 | A target can change while the goal has not ended |
| 0077 | One target version per goal and effective date |
| 0078 | Retiring a template is permanent and asks first |
| 0079 | Screens after a template is retired |
| 0080 | Only the value of an entry can be edited |
| 0081 | Edit and Delete are in the day box and on the goals page |
| 0082 | Deleting an entry asks first |
| 0083 | An edit or delete cannot take the day total above the maximum |
| 0084 | The target is changed on the goals page |
| 0085 | Shorter review format |
| 0086 | One reminder per goal, which can be removed |
| 0087 | A reminder can be set while the goal has not ended |
| 0088 | The reminder is set and shown on the goals page |
| 0089 | An ended goal has no current streak |
| 0090 | The current streak shows on the goals page and on today's calendar cards |
| 0091 | The goal detail page is a short summary |
| 0092 | Target versions are deleted with their goal |
| 0093 | The whole-minutes check of a target change waits for the template kind |
| 0094 | Merge rules for busy files, ADR numbers, blocked by, staging updates and worktrees |
| 0095 | Focus after a successful retire |
| 0097 | F-11 leaves the day state, colour and sign to F-12 |
| 0098 | ADR numbers on pushed branches, a per-worktree browser test port, and union merge for the AI use log |
| 0099 | A goal's reminder is deleted with its goal |
| 0100 | The calendar step of TC-43 waits for the calendar endpoint |
| 0101 | Ask before discarding an unsaved entry edit |
| 0102 | "+ New goal" also sits above the calendar |
| 0103 | On desktop the day panel stays while the List is shown |
| 0104 | A List day with no entry shows only "No entries" |
| 0105 | The chosen day is marked by a thick border, not a dark fill |
| 0106 | The Windows CI job gets PostgreSQL 16 from a pinned action, in its own workflow, required only after v2.1 |

## Contributions {#contributions}

All 30 pull requests merged into `staging` on 27 and 28 Nov 2026, Asia/Bangkok (Lab 6 and Lab 7 work, Sprint 2, Sprint 3 and the D2 records), by author; read with `gh pr list --state merged --base staging`. Every one was approved and merged by the other student. PR #202 (this PDF's Issue #161) is still open.

| Student | Contracts | Feature code | Releases and records | Team rules, tests and CI |
|---|---|---|---|---|
| phittayanan | Calendar contracts F-11, F-12, F-15 and template kind (PR #167) | Lab 7 several entries per day (PR #146), F-14 goal change (PR #176), F-11 calendar (PR #180), F-13 entry edit and delete (PR #184), F-17 reminder (PR #183) | Lab 7 metrics and readiness (PR #163), Lab 7 report (PR #169), UAT-02 update (PR #175); D2 Part D and the PDF (#161, PR #202, open) | Team status bot, ADR 0062 (PR #145), review format (PR #172), merge and worktree rules (PR #178), TC-07 fix (PR #193), Windows CI (PR #197, PR #201) |
| projectnewy | Lab 7 contract for several entries per day (PR #143); rules contracts F-05, F-13, F-14 (PR #171); Sprint 3 contracts F-16, F-17 (PR #174) | template kind (PR #173), F-05 retire (PR #179), F-12 and F-15 colours and List (PR #185) | Lab 6 evidence PDF (PR #137), Lab 7 release (PR #162), `v2.0` records (PR #191), `v2.1` records, readiness and plan (PR #200), D2 Part A (PR #186); syncs of `main` (PR #149, PR #188, PR #196); release PRs #189 and #198 | ADR numbers and test ports (PR #182) |

## AI use {#ai-use}

Both students used Claude Code for drafting contracts, tests, code and records, for running tests and for the checks on the deployed app (on the students' sign-in). Each use is a row in `docs/ai-use.md`: what the AI did and what the student checked or changed. Every decision named in this PDF was made by a student and is recorded in an ADR, an Issue or a review; approvals and merges were the students' own.
