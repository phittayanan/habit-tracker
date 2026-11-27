# Part B: independent execution on the partner's product

We are the UAT Team. All six cases the partner team supplied were run by hand in a browser on 2026-11-25 against Cloud Run revision `s65da36e2-00009-b4s` (`main` `0619c07`, from their package; the app shows no version text). Both students took part: each ran one half.

## B.1 Result summary

| Case | Category | Tester | Time (Asia/Bangkok) | Result | Evidence |
|---|---|---|---|---|---|
| UAT-01 | Normal journey | projectnewy | about 13:35–13:43 | PASS | E-B1-01 to E-B1-06 |
| UAT-02 | Business rules on entries | projectnewy | about 13:49–14:11 | PASS with deviations (tester input errors, B.3) | E-B1-07 to E-B1-20 |
| UAT-03 | Business rules on goals | projectnewy | about 14:14–14:23 | PASS | E-B1-21 to E-B1-29 |
| UAT-04 | Forbidden role | phittayanan | about 13:25–13:41 | PASS | E-B2-01 to E-B2-07 |
| UAT-05 | Ownership and privacy | phittayanan | about 14:00–14:16 | PASS | E-B2-08 to E-B2-16 |
| UAT-06 | Session, logout and persistence | phittayanan | about 14:17–14:28 | PASS | E-B2-17 to E-B2-29 |

None was FAIL or BLOCKED. An AI assistant did not operate the partner's app for these six cases: the students ran every step and decided each result. For the optional exploratory items X-01 and X-02 an AI agent did operate the app (B.5 and the AI-use declaration in Part D).

## B.2 Selected evidence

Every screenshot has an ID. The full registers in B.3 and B.4 list all of them with action, expected and actual result, time and revision. The registers are printed without their file name column; each file is in `docs/labs/lab-06/partner-uat/evidence/` and its name starts with the ID. All screenshots below: 2026-11-25, revision `s65da36e2-00009-b4s`, manual.

### Normal journey (UAT-01)

![**E-B1-02**, 13:37. Action: MANAGER creates template UAT-01-PP. Expected: listed with unit and range. Actual: `UAT-01-PP · km · 0–20`.](../partner-uat/evidence/E-B1-02-UAT-01-template-created.png)

![**E-B1-03**, 13:39. Action: P1 creates a goal. Expected: listed with target and dates. Actual: `5 km · 2026-11-23 → 2026-11-30`.](../partner-uat/evidence/E-B1-03-UAT-01-goal-created.png)

![**E-B1-04**, 13:40. Action: P1 opens the goal. Expected: progress 0%. Actual: 0%, "0 of 3 days met".](../partner-uat/evidence/E-B1-04-UAT-01-goal-open-p1.png)

![**E-B1-06**, 13:43. Action: P1 records 6 for today. Expected: 1 of 3 days, 33.33%. Actual: "1 of 3 days met", 33.33%.](../partner-uat/evidence/E-B1-06-UAT-01-entry-33-33.png)

### Rejected operations (UAT-02, UAT-03)

![**E-B1-09**, 14:05. Action: a second entry for the same date. Expected: rejected, first entry unchanged. Actual: "An entry already exists for this date."](../partner-uat/evidence/E-B1-09-UAT-02-step2-conflict.png)

![**E-B1-11**, 14:06. Action: value 51 on a range up to 50. Expected: rejected, nothing added. Actual: "Value must be within the template range.", history unchanged.](../partner-uat/evidence/E-B1-11-UAT-02-step3-range.png)

![**E-B1-23**, 14:18. Action: an overlapping goal. Expected: rejected, list unchanged. Actual: the overlap message; the form keeps the values.](../partner-uat/evidence/E-B1-23-UAT-03-step2-overlap.png)

### Forbidden role, privacy and session (UAT-04 to UAT-06), with the protected-state checks

![**E-B2-04**, about 13:36. Action: P1 sends `POST /templates` from the console. Expected: 403, nothing created. Actual: 403 (the account is the tester's statement).](../partner-uat/evidence/E-B2-04-UAT-04-p1-post-templates-403.png)

![**E-B2-06**, about 13:39. Protected-state check after E-B2-04: the Manager's list has the same 3 templates and no probe template.](../partner-uat/evidence/E-B2-06-UAT-04-manager-list-no-probe.webp)

![**E-B2-16**, about 14:16. Action: P2 requests P1's goal by ID, and an unknown ID. Expected: all 404, same message. Actual: four identical 404 bodies, no P1 data.](../partner-uat/evidence/E-B2-16-UAT-05-step5-p2-get-p1-goal-404.png)

![**E-B2-15**, about 14:14. Protected-state check: P1's goal still has its own entry (4 cups, 50%).](../partner-uat/evidence/E-B2-15-UAT-05-step4-p1-entry-still-4-progress-50.webp)

![**E-B2-26**, about 14:25. Action: Back and Forward after Logout, then `GET /goals`. Expected: no data of P1. Actual: sign in page and 401.](../partner-uat/evidence/E-B2-26-UAT-06-step5-rerun-back-forward-401.png)

![**E-B2-27**, about 14:27. Action: P1 signs in again. Expected: same entries and progress as before logout. Actual: 4 cups, "1 of 2 days met", 50%.](../partner-uat/evidence/E-B2-27-UAT-06-step6-p1-goal-after-relogin.webp)

## B.3 Full record, first half (UAT-01 to UAT-03)

{{include:../partner-uat/first-half.md}}

## B.4 Full record, second half (UAT-04 to UAT-06)

{{include:../partner-uat/second-half.md}}

## B.5 Optional exploratory testing

{{include:../partner-uat/exploratory.md}}
