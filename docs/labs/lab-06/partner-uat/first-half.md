# Partner UAT, first half: normal journey and business rules

Lab 6 Part B (sheet §3.2), Issue #105. Our team is the **UAT Team**; the partner team is the **Product Team**. The second half (forbidden role/ownership and state/persistence, UAT-04 to UAT-06) is Issue #106 and is recorded in `second-half.md`.

Every value below comes from what the tester saw in the browser. The agent did not run these cases. Expected results stay in the partner's case files; the "Actual result" column holds only what was observed. Credentials are never written here.

## Tested release (from the partner team's handoff)

| Field | Value |
|---|---|
| Product Team | Team "Habit and Activity Tracker" (GitHub: asamapornch, warunwora) |
| Handoff reference | "Lab 6 – Exchange 1: UAT package", version 1.0, dated 23 Nov 2026, received 2026-11-25 (not committed here) |
| Product repository | https://github.com/asamapornch/habit-activity-tracker |
| Deployed URL | https://s65da36e2-4d7hbszvwq-as.a.run.app |
| Release tag | `v1.0-sprint1` (Sprint 1 features F-01 to F-05) |
| Version under test | `main` at commit `0619c07db872a5bf1c7946301b4bfc40e9e477d2` (handoff: later commits add only Docker, CI and deployment files) |
| Deployed revision | Cloud Run `s65da36e2-00009-b4s` (handoff); the app shows no revision or version text, so the revision seen on the day is the one the handoff names |
| Cases in this half | UAT-01 Normal journey, UAT-02 Business rules on entries, UAT-03 Business rules on goals |
| Accounts | MANAGER, P1 (labels from the handoff; passwords sent privately to the testers, never written here) |
| Template names used | `UAT-<case id>-<initials>` as the handoff asks; the initials are `PP` |
| Test session | 2026-11-25, the three cases in one sitting (no midnight crossing). The tester gives the session as 13:00 to 14:40 Asia/Bangkok; the screenshots were taken between 13:35 and 14:37 |
| Browser | Chrome; version not recorded |
| Tester (UAT Team) | projectnewy ran UAT-01, UAT-02 and UAT-03 in the browser, took the screenshots and decided the results |
| Pairing | Each student ran one half of Part B in the same session: projectnewy ran UAT-01 to UAT-03 (#105), phittayanan ran UAT-04 to UAT-06 (#106) and is the checker of this Issue. Neither ran the other's cases. |

**State before the first case.** The partner's database was not empty, although the handoff says it starts with no templates and no goals unless a previous tester left data. A template and a P1 goal named "Persistence test" (`times`, 0 to 10; goal 2026-11-17 to 2026-11-24) were already there; we did not touch them. Templates and goals of UAT-04 and UAT-05 from the second half appeared on the same accounts during the session; the rules count per template, so they do not affect these cases.

**Real dates.** T = 2026-11-25. T-4 = 11-21, T-3 = 11-22, T-2 = 11-23, T-1 = 11-24, T+1 = 11-26, T+3 = 11-28, T+5 = 11-30, T+10 = 12-05, T+11 = 12-06, T+12 = 12-07, T+15 = 12-10, T+20 = 12-15, T+25 = 12-20, T+30 = 12-25, T+40 = 2027-01-04, T+41 = 2027-01-05. The date fields of the app take month/day/year in this browser.

## Results

One row per case; the step numbers are inside "Actual result". BLOCKED is not a pass. For a rejected operation, the actual result states both the rejection seen and the check that the protected data was not changed.

| Case ID | Tester name / team | Date and time | Tested version | Inputs | Actual result | PASS / FAIL / BLOCKED (+ reason) | Evidence ID |
|---|---|---|---|---|---|---|---|
| UAT-01 | projectnewy (UAT Team) | 2026-11-25, about 13:35–13:43 (screenshot times; the sign-in page was retaken at 14:34) | Handoff revision `s65da36e2-00009-b4s`; no version text on the screens | MANAGER, then P1. Template `UAT-01-PP`, unit `km`, min 0, max 20. P1 goal: target 5, 2026-11-23 → 2026-11-30. Entry 2026-11-25 = 6 | 1: Sign in page with Email, Password and Log in; no sign-up or recovery link; signed in as MANAGER. 2: `UAT-01-PP` shown as `km · 0–20`, form cleared. 3: signed out, signed in as P1 (top bar `participant1@example.com`, Participant). 4: goal `UAT-01-PP`, `5 km · 2026-11-23 → 2026-11-30`. 5: "No entries yet.", 0%, "0 of 3 days met". 6: history row 2026-11-25 = 6 km, 33.33%, "1 of 3 days met". | PASS (decided by projectnewy) | E-B1-01 to E-B1-06 |
| UAT-02 | projectnewy (UAT Team) | 2026-11-25, about 13:49–14:11 (first run 13:49–13:55, PP2 at 13:58, official run 14:04–14:11) | same | MANAGER, then P1. Template `UAT-02-PP3`, unit `pages`, min 1, max 50. P1 goal: target 10, 2026-11-22 → 2026-11-28 (4 days elapsed). Entries as in the table below | 1 (11-25 / 10): accepted, 25%, "1 of 4 days met". 2 (11-25 / 12): "An entry already exists for this date."; value 12 stayed in the form; history unchanged. 3 (11-24 / 51): "Value must be within the template range."; nothing added. 4 (11-24 / 50): accepted, 50%, "2 of 4 days met". 5 (11-26 / 10): "Entry date must not be in the future." 6 (11-21 / 10): "Entry date must be within the goal's start and end dates." 7 (11-23 / 0): "Value must be within the template range." 8 (11-23 / 10.555): "Invalid entry fields."; history unchanged. After step 4 to 8 the history showed 11-24 = 50 and 11-25 = 10, plus 11-23 = 10.55 (see deviations). | PASS with deviations (decided by projectnewy): all 8 rules behaved as the case expects; the final-state check differs because of the tester's own input errors, see below | E-B1-07 to E-B1-20 |
| UAT-03 | projectnewy (UAT Team) | 2026-11-25, about 14:14–14:23 | same | MANAGER, then P1. Templates `UAT-03-PP` (`min`, 0 to 120) and `UAT-03b-PP` (`min`, 0 to 10; the case gives no unit, we used `min`). P1 creates goals as in the table below | 1 (UAT-03-PP, 30, 11-25 → 12-05): accepted. 2 (30, 11-30 → 12-10): "You already have a goal for this template that overlaps these dates."; values kept in the form. 3 (30, 12-05 → 12-07): same message (the last day 12-05 overlaps). 4 (30, 12-06 → 12-15): accepted. 5 (30, 12-25 → 12-20): "End date must not be before start date." 6 (121, 2027-01-04 → 2027-01-05): "Daily target must be within the template range." 7 (120, 2027-01-04 → 2027-01-04): accepted. 8 (UAT-03b-PP, 5, 11-25 → 12-05): accepted. End: the goal list shows exactly four new goals (three of UAT-03-PP, one of UAT-03b-PP); none from steps 2, 3, 5 or 6. | PASS (decided by projectnewy) | E-B1-21 to E-B1-29 |

### UAT-02 steps with their real dates

| Step | Date / value | Expected (partner) | Observed | Match |
|---|---|---|---|---|
| 1 | 11-25 / 10 | accepted | accepted | yes |
| 2 | 11-25 / 12 | rejected, conflict | "An entry already exists for this date." | yes |
| 3 | 11-24 / 51 | rejected, range | "Value must be within the template range." | yes |
| 4 | 11-24 / 50 | accepted (maximum is inclusive) | accepted | yes |
| 5 | 11-26 / 10 | rejected, future | "Entry date must not be in the future." | yes |
| 6 | 11-21 / 10 | rejected, outside the goal dates | "Entry date must be within the goal's start and end dates." | yes |
| 7 | 11-23 / 0 | rejected, below the minimum 1 | "Value must be within the template range." | yes |
| 8 | 11-23 / 10.555 | rejected, more than two decimals | "Invalid entry fields." (the date 11-23 already held the 10.55 entry of the first attempt, so the precondition differs from the case; the message is the validation one, not the conflict one, which supports the match) | yes |

### UAT-03 steps with their real dates

| Step | Template / target / dates | Expected (partner) | Observed | Match |
|---|---|---|---|---|
| 1 | UAT-03-PP / 30 / 11-25 → 12-05 | accepted | accepted | yes |
| 2 | UAT-03-PP / 30 / 11-30 → 12-10 | rejected, overlap | overlap message | yes |
| 3 | UAT-03-PP / 30 / 12-05 → 12-07 | rejected (inclusive dates overlap) | overlap message | yes |
| 4 | UAT-03-PP / 30 / 12-06 → 12-15 | accepted | accepted | yes |
| 5 | UAT-03-PP / 30 / 12-25 → 12-20 | rejected, end before start | "End date must not be before start date." | yes |
| 6 | UAT-03-PP / 121 / 2027-01-04 → 2027-01-05 | rejected, target out of range | "Daily target must be within the template range." | yes |
| 7 | UAT-03-PP / 120 / 2027-01-04 → 2027-01-04 | accepted | accepted | yes |
| 8 | UAT-03b-PP / 5 / 11-25 → 12-05 | accepted (other template) | accepted | yes |

### Deviations in UAT-02 (all caused by the tester's input, none by the application)

- **Final state.** The case expects 2 entries (11-24 = 50, 11-25 = 10) and 50.00%. The goal shows 3 entries (it adds 2026-11-23 = 10.55) and 75% ("3 of 4 days met"). In the first attempt of step 8 the tester typed 10.55 instead of 10.555; 10.55 has two decimals, so the application correctly accepted it. The second attempt typed 10.555 on the same date and was rejected as in the table (a validation message, although an entry for that date already existed).
- **Abandoned first run on `UAT-02-PP`** (pages, 1 to 50, goal 11-22 → 11-28). Steps 1 and 2 matched. In step 3 the tester typed 11 instead of 51; the application accepted 11, a valid value, so entry 11-24 = 11 pages exists and the case could not continue as written. The run was not used.
- **`UAT-02-PP2`** was created with the range `1–49.99` although 50 was intended. It was not used. The cause is not certain; see the observation below.

## Evidence register

Evidence IDs in this half are `E-B1-01`, `E-B1-02`, …; the second half (#106) uses `E-B2-xx` (announced by phittayanan in the #105 and #106 comments, 2026-11-25). Sheet §4.2 (p.6): each screenshot has an ID, the action, the expected and actual result, the time and the tested revision. Screenshots are stored in `evidence/` next to this file, named `E-B1-xx-<case-id>-<short-action>.png`. **Times** are the capture times in the file names of the original screenshots (Asia/Bangkok, 2026-11-25); the files are unchanged copies of the originals except E-B1-01, whose browser bookmarks, profile picture and extension icons were cropped out. **Tested revision** is the handoff's `s65da36e2-00009-b4s` for every row (the app shows no version). "Account visible" says whether the page shows the signed-in account.

| Evidence ID | Case ID | Action | Expected (partner) | Observed | Account visible | Time | File |
|---|---|---|---|---|---|---|---|
| E-B1-01 | UAT-01 | Step 1: sign in page before signing in | Sign in screen; no sign-up or recovery link | Sign in page, Email filled, Password empty, the address bar shows the URL. Retaken at 14:34 after the case; step 1 itself was done at the start of UAT-01 (about 13:35) | n/a | 14:34:58 | `evidence/E-B1-01-UAT-01-sign-in-page.png` |
| E-B1-02 | UAT-01 | Step 2: MANAGER creates `UAT-01-PP` | Template listed with name, km, 0 and 20 | Template list with `UAT-01-PP · km · 0–20`, form cleared | not in the image | 13:37:09 | `evidence/E-B1-02-UAT-01-template-created.png` |
| E-B1-03 | UAT-01 | Step 4: P1 creates the goal | Goal listed with template name, target 5 km, both dates | Goal list with `UAT-01-PP`, `5 km · 2026-11-23 → 2026-11-30` | not in the image | 13:39:43 | `evidence/E-B1-03-UAT-01-goal-created.png` |
| E-B1-04 | UAT-01 | Step 5: P1 opens the goal | Progress 0% | Top bar `participant1@example.com`; 0%, "0 of 3 days met" | P1 | 13:40:36 | `evidence/E-B1-04-UAT-01-goal-open-p1.png` |
| E-B1-05 | UAT-01 | Step 5: history of the open goal | Empty-history message | "No entries yet.", Record entry form | n/a | 13:41:51 | `evidence/E-B1-05-UAT-01-empty-history.png` |
| E-B1-06 | UAT-01 | Step 6: P1 records 11-25 = 6 | Entry in the history; 1 of 3 days = 33.33% | History 2026-11-25 = 6 km; 33.33%; "1 of 3 days met" | n/a | 13:43:08 | `evidence/E-B1-06-UAT-01-entry-33-33.png` |
| E-B1-07 | UAT-02 | Setup: P1 creates the goal on `UAT-02-PP3` | Goal 11-22 → 11-28, target 10 | `UAT-02-PP3`, `10 pages · 2026-11-22 → 2026-11-28` in the goal list | not in the image | 14:04:42 | `evidence/E-B1-07-UAT-02-goal-created.png` |
| E-B1-08 | UAT-02 | Step 1 (11-25 / 10) | Accepted | History row 11-25 = 10 pages; 25%; "1 of 4 days met" | n/a | 14:05:18 | `evidence/E-B1-08-UAT-02-step1-accepted.png` |
| E-B1-09 | UAT-02 | Step 2 (11-25 / 12) | Rejected with a conflict message; first entry unchanged; typed values stay | "An entry already exists for this date."; value 12 kept in the form | n/a | 14:05:55 | `evidence/E-B1-09-UAT-02-step2-conflict.png` |
| E-B1-10 | UAT-02 | Step 3 before pressing Record | (input check) | Date 11/24/2026, Value 51 in the form; the step 2 message is still shown | n/a | 14:06:40 | `evidence/E-B1-10-UAT-02-step3-before.png` |
| E-B1-11 | UAT-02 | Step 3 after pressing Record | Rejected: value must be within the template range; nothing added | "Value must be within the template range."; history still one row | n/a | 14:06:52 | `evidence/E-B1-11-UAT-02-step3-range.png` |
| E-B1-12 | UAT-02 | Step 4 (11-24 / 50) | Accepted (maximum is inclusive) | History rows 11-24 = 50 and 11-25 = 10; 50%; "2 of 4 days met" | n/a | 14:08:08 | `evidence/E-B1-12-UAT-02-step4-accepted.png` |
| E-B1-13 | UAT-02 | Step 5 (11-26 / 10) | Rejected: date must not be in the future | "Entry date must not be in the future."; history unchanged | n/a | 14:08:46 | `evidence/E-B1-13-UAT-02-step5-future.png` |
| E-B1-14 | UAT-02 | Step 6 (11-21 / 10) | Rejected: date must be within the goal's dates | "Entry date must be within the goal's start and end dates."; history unchanged | n/a | 14:09:14 | `evidence/E-B1-14-UAT-02-step6-outside.png` |
| E-B1-15 | UAT-02 | Step 7 (11-23 / 0) | Rejected (below the minimum 1) | "Value must be within the template range."; history unchanged | n/a | 14:09:43 | `evidence/E-B1-15-UAT-02-step7-below-min.png` |
| E-B1-16 | UAT-02 | Step 8 before pressing Record | (input check) | Date 11/23/2026, Value 10.555 in the form; the history already has 11-23 = 10.55 from the first attempt | n/a | 14:11:35 | `evidence/E-B1-16-UAT-02-step8-before.png` |
| E-B1-17 | UAT-02 | Step 8 after pressing Record | Rejected as invalid (more than two decimals) | "Invalid entry fields."; history unchanged | n/a | 14:11:45 | `evidence/E-B1-17-UAT-02-step8-invalid.png` |
| E-B1-18 | UAT-02 | First run on `UAT-02-PP`, step 3 | Rejected (case value 51) | History with 2026-11-24 = 11 pages (the tester typed 11); 50%, "2 of 4 days met" | n/a | 13:54:43 | `evidence/E-B1-18-UAT-02-first-run-step3-typed-11.png` |
| E-B1-19 | UAT-02 | `UAT-02-PP2` in the template list | Range 1 to 50 (intended) | `UAT-02-PP2 · pages · 1–49.99` | not in the image | 13:58:20 | `evidence/E-B1-19-UAT-02-pp2-range-49-99.png` |
| E-B1-20 | UAT-02 | Step 8, first attempt | (the tester typed 10.55 instead of 10.555) | History 2026-11-23 = 10.55; 75%, "3 of 4 days met" | n/a | 14:10:18 | `evidence/E-B1-20-UAT-02-step8-first-attempt-10-55.png` |
| E-B1-21 | UAT-03 | Setup: MANAGER creates the two templates | `UAT-03` (min, 0–120) and `UAT-03b` (0–10) | `UAT-03-PP · min · 0–120` and `UAT-03b-PP · min · 0–10` | not in the image | 14:15:19 | `evidence/E-B1-21-UAT-03-templates-created.png` |
| E-B1-22 | UAT-03 | Step 1 | Accepted | Goal list with `UAT-03-PP`, `30 min · 2026-11-25 → 2026-12-05` | not in the image | 14:17:02 | `evidence/E-B1-22-UAT-03-step1-accepted.png` |
| E-B1-23 | UAT-03 | Step 2 | Rejected: conflict; list unchanged; form keeps values | Overlap message; values 30, 11/30/2026 and 12/10/2026 kept | n/a | 14:18:24 | `evidence/E-B1-23-UAT-03-step2-overlap.png` |
| E-B1-24 | UAT-03 | Step 3 | Rejected (inclusive dates overlap on 12-05) | Same overlap message; values 30, 12/05/2026 and 12/07/2026 kept | n/a | 14:19:09 | `evidence/E-B1-24-UAT-03-step3-overlap-last-day.png` |
| E-B1-25 | UAT-03 | Step 4 | Accepted | Goal list with the second `UAT-03-PP` goal `2026-12-06 → 2026-12-15` | not in the image | 14:19:40 | `evidence/E-B1-25-UAT-03-step4-accepted.png` |
| E-B1-26 | UAT-03 | Step 5 | Rejected: end must not be before start | "End date must not be before start date." | n/a | 14:20:46 | `evidence/E-B1-26-UAT-03-step5-end-before-start.png` |
| E-B1-27 | UAT-03 | Step 6 | Rejected: target must be within the template range | Target 121 in the form; "Daily target must be within the template range." | n/a | 14:21:32 | `evidence/E-B1-27-UAT-03-step6-target-121.png` |
| E-B1-28 | UAT-03 | Step 7 | Accepted (target equals the maximum; start equals end) | Goal list with `120 min · 2027-01-04 → 2027-01-04` | not in the image | 14:21:59 | `evidence/E-B1-28-UAT-03-step7-accepted.png` |
| E-B1-29 | UAT-03 | Step 8 and the final list | Accepted (other template); exactly 4 new goals | `UAT-03b-PP`, `5 min · 2026-11-25 → 2026-12-05`; the three UAT-03-PP goals above it | not in the image | 14:23:19 | `evidence/E-B1-29-UAT-03-step8-final-list.png` |
| E-B1-30 | observation | Wheel test, before | (not a case) | Top bar `manager@example.com` Manager; Create template form, Max value 50, field focused | MANAGER | 14:28:38 | `evidence/E-B1-30-observation-wheel-max-before.png` |
| E-B1-31 | observation | Wheel test, after 3 wheel clicks | (not a case) | Max value 49.97; top bar as above | MANAGER | 14:28:50 | `evidence/E-B1-31-observation-wheel-max-after.png` |
| E-B1-32 | observation | Wheel test, fields not focused | (not a case) | Min 1, Max 49.97, no focus; no change seen when not focused, per the tester | MANAGER | 14:30:14 | `evidence/E-B1-32-observation-wheel-not-focused.png` |
| E-B1-33 | observation | Wheel test, Min value, 1 wheel click | (not a case) | Min value 0.99 | MANAGER | 14:30:36 | `evidence/E-B1-33-observation-wheel-min.png` |
| E-B1-34 | overview | Template list at the end of the session (zoomed out) | n/a | All templates created by both halves | n/a | 14:37:03 | `evidence/E-B1-34-overview-templates.png` |

## Observations and finding

- A template and a P1 goal named "Persistence test" existed before our cases (see "State before the first case"). They match no UAT case.
- The application shows no version or revision on screen; the tested version is the one the handoff names.
- **Finding B1-01 (sent to the Product Team as a report, not a failure of a case):** in the Create template form, scrolling the mouse wheel over a focused number field changes its value by 0.01 per click (Max 50 became 49.97 after 3 clicks; Min 1 became 0.99 after 1 click). No change was seen when the field was not focused. Nothing was created for this test. Proposed severity: minor. We do not know the cause in the partner's code and ask the Product Team to classify it. The `1–49.99` template of UAT-02 is consistent with this behaviour, but we cannot prove that it was the cause. The report is kept as text for Issue #107.
- The UAT-04 and UAT-05 templates created by the second half use the initials `PP` and `PT`; one of them has the maximum `9.86` (see `second-half.md`). They are not part of these cases.
- Chrome version was not recorded.
