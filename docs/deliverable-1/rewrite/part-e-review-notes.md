# Part E review notes (not part of the PDF)

Points the contract writers found where the v1.0 contract text and the v1.0 code or tests differ. The contracts in part-e.md describe the code. Each point needs the author's check.

## F-01 to F-03


These points are for review before submission. They sit outside the contracts.

1. **Part C.6 differs from the code on two login points.** C.6 says a successful login deletes "the user's previous session". The code (OP-01.4) deletes only the session named by the cookie sent with that login request; the user's other sessions stay valid. C.6 also says both login failures "take the same time". The contract and ADR 0051 promise only comparable bcrypt work, not equal timing. E.1 follows the code. Part C was not edited.
2. **Wrong-role page is wider in code than in OP-02.2.** The contract names only a Participant on a Manager-only page. The code also shows "This page is not available for your role." to a Manager on `/goals` and `/goals/new`. An unnumbered browser test ("wrong-role addresses preserve bar and exact message") covers both. E.2 describes the code.
3. **TC-08 differs from the contract wording.** The contract says each route is called "with a valid body". The test sends the same placeholder body `{ "name": "valid" }` to every route. It runs the wrong-role call only for routes with exactly one allowed role. It checks "no data changes" through handler spies and the session count, not every table. The result is the same because the checks run before validation, but the wording should match.
4. **TC-09 "restart the app"** is done by building a new app instance on the same database, not by restarting the server process. AC-03.1 says "after the app restarts".
5. **TC-64 has no second client.** The contract describes A "logged in on a second client". The test uses A's one cookie for the foreign logout and then checks `me`.
6. **Some tests check more than the contract lists.** TC-05 (`sid=%ZZ`), TC-09 (trimming, negative minimum), TC-10 (−2, −1), TC-62 (`username` 123, `null`, `[]`, broken JSON, and the "Invalid JSON body." check on a test-only route), TC-64 (malformed, `null` and different-port Origins; `http://app.example`), TC-66 (`?role=MANAGER`, role change in the database) and TC-68 (blank and 31-character unit, ±100000000). E.1 to E.3 describe the tests as run. No AC or test ID was added.
7. **The contracts' own revision tables are incomplete.** The F-01 and F-02 tables stop at review round 1. They do not list the build-time edits `8a374d0`, `71e091e`, `0a92f7b` and `a895122`, and their "Approved by" column still says "pending". The version histories above add these commits from `git log` and record approval as the PR #31 merge (`1c72dbf`).
8. **Tests outside the TC numbering.** OP-01.4 (login replaces the incoming session), OP-02.5 (unknown `/api` path gets 404), the template migration check and the demo-seed check are tested, but have no TC ID. They are described in the Rules tables above, not in the test tables.

## F-04, F-06, F-07


These points are outside the contracts. Each one is a place where the v1.0 contract text and the v1.0 code or tests differ, or where the code does something the contract does not say.

1. **F-04 edit-page details (OP-04.9).** At v1.0 the contract still marks the heading, the empty-change message and the unknown-id page as an open proposal. The code and tests already do exactly what the proposal says. E.4 describes the code. Confirm that the reviewer accepted the proposal, or record it as accepted.
2. **F-04 id above 2,147,483,647.** The edit answers 404 `TEMPLATE_NOT_FOUND` (TC-71 checks 2147483648). Goal creation answers 400 `VALIDATION_ERROR` for a `templateId` above the same limit (TC-53). The contracts do not cover this case. Both behaviours are written as built.
3. **F-07 and a retired template.** Goal creation does not check the template's state. The form only offers active templates, but the API would accept a goal on a `RETIRED` template. This cannot happen through the app at v1.0, because nothing can retire a template yet (Part B.4). It is due with F-05 in Sprint 2.
4. **F-07 past-dated goal beside an active one.** The contract says a goal with a past end date is accepted. The code accepts it only when no goal on that template is still active. Otherwise it answers 409 `ACTIVE_GOAL_EXISTS`, because BR-05 looks at the goals already stored (TC-20 asserts this). E.6 states it that way. Confirm that this reading of BR-05 is intended.
5. **F-07 target below the template minimum.** A target below the template's minimum is accepted (TC-55 stores 0.01 on a template with minimum 10). The contract and A-4 only set "above 0" and "not above the maximum", so this matches them. Check that it is wanted, because every entry on such a goal meets the target.
6. **TC-21 and TC-55 do more than the contract rows say.** TC-21 also tests a future-start duplicate and two identical requests at once. TC-55 creates B's active goal after A's Ended goal, and also checks a one-day goal. E.6 describes what the tests do.
7. **Tests with no TC ID.** These v1.0 tests cover contract behaviour but have no ID or AC: the foreign-Origin refusal on `PATCH /api/templates/:id`; the direct visit to the edit page (stored values, unknown id, Participant refused); the Manager list order; the `Goal` migration checks; and the goals-screen check for the Bangkok default, the Manager refusal and an expired session. Decide whether to give them IDs in `docs/traceability.md` or leave them as supporting tests.
8. **Approval column.** The v1.0 revision tables still say "pending" in the approval column for rows whose pull requests were later merged. The version history tables above leave that column out. The review evidence belongs in Part F.

## F-08 to F-10


These points compare the v1.0 contract files with the v1.0 code and tests. The contracts above describe the code.

1. **Malformed JSON before ownership (F-08).** The v1.0 contract puts the ownership check (404) before validation (400). That holds for every zod check. But a body that is not valid JSON is refused with 400 `VALIDATION_ERROR` by `express.json()`, which runs before the service, so it gets 400 even for another Participant's goal. The tests send broken JSON only to the caller's own goal.
2. **Non-numeric goal id (F-08, F-10).** The contract does not mention it. In the code, an id that is not a whole number up to 2,147,483,647 (for example `abc`) gets 404 `GOAL_NOT_FOUND`. TC-56 tests `abc`.
3. **TC-27 level.** The contract says "Unit". The date-box half is a Playwright browser test with a fixed clock and the browser in America/Los_Angeles (`client/test/entries.spec.js`), not a unit test of a helper.
4. **TC-56 level and inputs.** The contract says "API". The cases also run as a unit test of `parseEntryCreate`, which adds 2026-02-30, the string `"7"`, `1e-7` and -100000000. The API test also sends a body that is not JSON, and bad bodies to B's goal and to 99999 (all 404).
5. **TC-23 page text.** The contract expects the page to show "7.5 hours". The page shows the entry as "`<date>`: 7.5 hours". TC-23 and TC-61 run as one browser test, which also checks the 409 message "An entry already exists for this day." and the disabled Save button.
6. **TC-29 concurrency.** The two simultaneous requests use day `D-1`, not `D` as the contract implies, because `D` already holds an entry in that test.
7. **TC-31 inputs.** The contract names a template (minutes, 0 to 120). The unit test passes no template, since the calculation does not need one; the same data is repeated over the API with such a template.
8. **Tests without a TC ID.** These checks exist at v1.0 but have no TC number: entry list newest first and owner only; migration columns, unique index and restrict-on-delete; two goals of one Participant keep separate progress; `listGoals` takes today from the Bangkok date of a given instant; Participant sees progress for own goals only. Consider giving them IDs in `docs/traceability.md`.
9. **F-10 has no code commit of its own.** PR #51 adds the privacy tests (`af813de`), but `df8f61b` changes only progress code. The ownership checks came with F-07 (goal list filter) and F-08 (`ownGoal` in the entry service). The privacy tests may therefore not have been seen failing before code, as the contract's definition of done asks. Check the evidence file before claiming it in Part F.
10. **Points still "Open (proposal)" at v1.0.** The code follows these proposals, but the contracts still list them as open: OP-08.1 (400 for BR-01 and BR-03, 409 for BR-04), OP-08.2 (date required in the API), OP-08.4 (a value above the target is allowed), OP-08.7 (rule order), OP-09.2 (counts only, no percentage), OP-09.3 (0 of 0 before the start), OP-10.1 (TC-34 repeats 401 and 403), OP-10.2 (template endpoints are outside F-10). Each may need a recorded decision (ADR) before the report calls them decided.
11. **Order of checks in Part C.1.** Part C.1 says that entry routes check the owner first. That is true for zod validation but not for broken JSON (note 1).

## Decisions on these notes (phittayanan, 2026-11-13)

- F-07, a past-dated goal blocked by an active goal on the same template: intended. No change.
- F-07, a daily target below the template's minimum is accepted (TC-55): not intended; a defect in v1.0. Part F.6 lists it as a known limitation. Fix tracked in Issue #74; the lower-limit rule must be decided first.
- The nine open proposals (OP-04.9, OP-08.1, OP-08.2, OP-08.4, OP-08.7, OP-09.2, OP-09.3, OP-10.1, OP-10.2): confirmed as applied; Part E.0 says so.
