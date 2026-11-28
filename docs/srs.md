# Software Requirements Specification

Part A of Deliverable 1 (Issue #4). Every requirement cites the ADR it comes from. Where no ADR settles a point, it is listed in section 6.3 as an open point for the students. Nothing here is decided beyond the ADRs.

**Status at `v2.1`** (commit `9b09bfe`, 2026-11-28; Deliverable 2 Part D, Issue #161): FR-01 to FR-19 and FR-21 to FR-23 are built, and their planned tests pass in the release CI. FR-20 (streaks, Sprint 3) is not built; its tests are not written. Every NFR has a result at `v2.1` except NFR-07 (the timed clean-clone run, not repeated since Lab 5); NFR-08's coverage is a local run, not CI. Per-requirement results: `docs/traceability.md`, "Results at `v2.1`".

## 1. Introduction

### 1.1 Purpose
This document states what the Habit Tracker must do: the problem, the actors, the scope, and numbered business (BR), functional (FR) and non-functional (NFR) requirements. It is the baseline for the feature inventory (`docs/features.md`), the SDS (`docs/system-sds.md`) and the sprint plan.

Problem and context (ADR 0003: a general programme, no named organisation, no real-world setting): a programme runs recurring activities. Its Program Managers need one place to define what those activities are (a name, a unit and a valid range). Its Participants need to set a daily goal on an activity, record what they did each day, and see whether they met the goal and how long they have kept it up. Today there is no shared definition of an activity and no private record per Participant. The product holds no routine-specific rules (ADR 0002): a Manager defines any routine as a template.

### 1.2 Scope
In scope for the product (all three sprints):
- Real login, logout and current-user identity, with two roles (Participant, Program Manager), one role per account. Seeded accounts (ADR 0004, ADR 0027).
- Activity templates kept by Program Managers (ADR 0007, ADR 0017, ADR 0018).
- Daily-target goals set by Participants on a template (ADR 0010, ADR 0011, ADR 0012).
- Daily entries with date and value rules (ADR 0005, ADR 0006, ADR 0008, ADR 0009).
- Progress as days met, history, streaks, and a stored reminder (ADR 0013 to ADR 0016).
- A browser UI built around one month calendar (ADR 0037 to ADR 0049).
- Private participant data (ADR 0019).

Sprint allocation (ADR 0020, ADR 0021): Sprint 1 (due 8 Nov 2026 in the handout; 15 Nov 2026 on LEB2, read 2026-11-10) is the handout's example only: a Manager defines a template; a Participant selects it, sets a goal, records daily activity and sees computed progress, with the entry rules and access restrictions enforced. Sprint 2 (due 29 Nov): goal changes and history. Sprint 3 (due 13 Dec): streaks, reminders, summaries and hardening.

### 1.3 Scope Exclusions
- Medical diagnosis and treatment advice (course brief, GWS §6.8).
- Self-registration and password recovery, for the whole project (ADR 0004). Email verification is also not required in Sprint 1 (D1 §2); whether it is ever built is open (6.3, A-7).
- Any sharing of history. A Manager sees templates only, nothing about Participants' goals or entries (ADR 0019).
- Sending real reminders. The product stores and shows a reminder and sends nothing (ADR 0016).
- Several roles per account (course brief, GWS §5.2).
- Free-text unit spelling checks (ADR 0007).
- Participant-owned or copied templates (ADR 0018).
- Per-user time-zone settings (ADR 0006).

### 1.4 Definitions
- **Template**: a Manager-defined activity with a name, a free-text unit and a per-entry minimum and maximum. Active or retired.
- **Goal**: a Participant's daily target on one template, with a start and an end date. At most one active goal per template per Participant (ADR 0010).
- **Entry**: one value a Participant records for one goal on one day. A day may hold several entries; their sum is the **day total** (ADR 0061).
- **Day**: a calendar date in the fixed time zone Asia/Bangkok (ADR 0006).
- **Day met**: a day whose total reached the goal's daily target (ADR 0013, ADR 0061).
- **Goal states**: Active until its end date passes, then Ended; derived from dates, never set by hand (ADR 0012).
- **Streak**: consecutive days met; one missed day resets it to zero; today does not break it until the day is over (ADR 0015).
- Domain terms are kept in `GLOSSARY.md`.

## 2. Stakeholders and Users

| Stakeholder | Interest |
|---|---|
| Program Manager | Keeps a shared, consistent set of activity definitions for the programme. |
| Participant | Tracks their own daily progress toward a goal, privately. |
| Course team (two students) and TA / instructor | Build and assess the product against the course brief. They do not use it. |

### 2.1 Actors and Responsibilities

| Actor | Responsibilities | Must not |
|---|---|---|
| Program Manager | Log in and out. Create templates. Edit a template while no goal uses it. Retire a template (ADR 0017). | See any Participant's goals or entries (ADR 0019). |
| Participant | Log in and out. View active templates read-only. Create a goal. Record, edit and delete own entries. View own progress, history, streak and reminder (ADR 0018, ADR 0009). | Edit or create templates. See another Participant's data. |
| System | Hash passwords, keep sessions in the database, derive goal state and progress from dates and entries, enforce every rule on the backend. | Rely on a hidden control, a client-chosen user ID or a role selector. |

## 3. Business Requirements (BR)

| ID | Business rule | Source | Sprint | Tested by |
|---|---|---|---|---|
| BR-01 | An entry's date must be today or earlier, and inside its goal's start and end dates. Anything else is rejected. | ADR 0005 | 1 | Unit and API: future date, before start, after end, today, boundary days |
| BR-02 | A day is a date in Asia/Bangkok, for every user. | ADR 0006 | 1 | Unit: entries either side of midnight Bangkok |
| BR-03 | An entry's value must lie within its template's minimum and maximum (inclusive). A template's minimum must be below its maximum. | ADR 0007 | 1 | Unit and API: below, at, above each limit; min not below max |
| BR-04 | A Participant may record several entries for one goal on one day. The sum of a goal's values on one day (the day total) is not above the template's `max_value` (equal is allowed); an entry that would take it above is rejected and stores nothing. Entries cannot be edited or deleted until FR-17 (Sprint 2), so a wrong entry cannot be fixed. Revised in Lab 7; before, a second entry for the same day was rejected. | ADR 0061 (replaces ADR 0008) | 1, revised in Lab 7 | Unit and API: below, at and above the day maximum; two requests at once |
| BR-05 | A Participant has at most one active goal per template. | ADR 0010 | 1 | API: second active goal rejected |
| BR-06 | A goal is Active until its end date passes, then Ended. The state is computed from dates. An entry to an ended goal is rejected by BR-01. | ADR 0012 | 1 | Unit: state on start, end, day after end |
| BR-07 | Progress is days met: the count of days whose total (the sum of that day's entries) reached the daily target, out of the days so far. | ADR 0013, ADR 0061 | 1, revised in Lab 7 | Unit: counts for met, missed and empty days; days with several entries |
| BR-08 | A Manager may edit a template only while no goal uses it. A used template can only be retired. A retired template cannot start new goals; existing goals continue. | ADR 0017 | 1 for edit; 2 for retire (see A-2) | API: edit used template refused; new goal on retired template refused; existing goal still takes entries |
| BR-09 | A Participant cannot create, edit or retire a template. | ADR 0018; GWS §6.8 | 1 | API: Participant request returns 403 |
| BR-10 | A Participant's goals and entries are private. A Manager and any other Participant are refused access (no sharing). | ADR 0019; GWS §6.8 | 1 | API: cross-Participant and Manager reads and writes return 403 or 404 |
| BR-11 | An entry may be edited or deleted on any day inside its goal's period. Progress and streaks are recomputed from entries. | ADR 0009 | 2 | API and unit: edit and delete, then recompute |
| BR-12 | A goal change applies from today on. Earlier days keep the old target, so each goal version is stored. | ADR 0011 | 2 | Unit: past days judged against the old target |
| BR-13 | A streak is consecutive days met. One missed day resets it to zero. Today does not break the streak until the day is over. | ADR 0015 | 3 | Unit: runs, a miss, today without an entry |
| BR-14 | A reminder (time and weekdays, per goal) is stored and shown. Nothing is sent. | ADR 0016 | 3 | API: store and read; no outbound call |
| BR-15 | A day on the calendar is green when every goal active that day was met, yellow when some were met, red when none were met, grey when nothing was recorded. A day with no active goal, or after today, has no colour. | ADR 0045, ADR 0046, ADR 0040, ADR 0070 | 2 (see A-3) | Unit: colour per combination |

## 4. Functional Requirements (FR)

Observable behaviour. "Sprint 1" items are the handout's example.

| ID | Requirement | Source | Sprint |
|---|---|---|---|
| FR-01 | A user logs in with a seeded account's credentials. A valid login creates a database session and sets an HTTP-only cookie holding the session ID. An invalid login is refused with no session. | ADR 0027, ADR 0004 | 1 |
| FR-02 | A logged-in user logs out. The session row is deleted and the cookie no longer gives access. | ADR 0027 | 1 |
| FR-03 | A logged-in user can retrieve who they are (name and role). A request with no valid session to a protected path is refused with 401. | ADR 0027; GWS §5.2 | 1 |
| FR-04 | A session ends 8 hours after login. After that, protected requests are refused with 401. | ADR 0028 | 1 |
| FR-05 | A Manager creates a template with a name, a free-text unit, and a minimum and maximum per entry. A minimum not below the maximum is rejected. From Sprint 2 a template also has a kind, Count or Time; a Time template is in whole minutes. | ADR 0007, ADR 0043, ADR 0064, ADR 0065 | 1; kind in 2 |
| FR-06 | A Manager sees a table of templates (name, unit, min-max, active or retired) with New and Edit actions. The Retire action appears with FR-08 in Sprint 2 and is hidden in Sprint 1. | ADR 0043 | 1 (see A-2) |
| FR-07 | A Manager edits a template's name, unit or range while no goal uses it, and is refused once a goal uses it. | ADR 0017 | 1 (see A-2) |
| FR-08 | A Manager retires a template. It no longer appears for new goals; goals already using it keep working. Retiring is permanent. | ADR 0017, ADR 0078, ADR 0079 | 2 (see A-2) |
| FR-09 | A Participant sees all active templates, read-only. | ADR 0018 | 1 |
| FR-10 | A Participant creates a goal from a "+ New goal" form: template dropdown, daily target, start and end dates. A second active goal on the same template is rejected. | ADR 0049, ADR 0010 | 1 |
| FR-11 | A Participant records a day's value by typing a number. The unit is shown and the template's range is checked. Rejections follow BR-01, BR-03 and BR-04, each with a clear message. | ADR 0039, ADR 0061 | 1 |
| FR-12 | A Participant sees computed progress for a goal: days met out of days so far. | ADR 0013 | 1 |
| FR-13 | A Participant sees only their own goals, entries and progress. Requests for another Participant's data are refused. | ADR 0019 | 1 |
| FR-14 | A Manager's request for any Participant's goals or entries is refused. | ADR 0019 | 1 |
| FR-15 | After login a Participant sees this month's calendar first (its own page; the Sprint 1 goals page stays, ADR 0073). On desktop the calendar is on the left and a side panel on the right shows the chosen day (today at start); on a phone the day opens in a centre box. The day shows every goal active that day with an input for its kind and a typed number. The streak is not shown here; it comes in Sprint 3 with FR-20 (decided on PR #23). | ADR 0037, ADR 0047, ADR 0045, ADR 0063 to ADR 0069, ADR 0073, ADR 0074 | 2 (see A-3) |
| FR-16 | The calendar colours each day green, yellow, red or grey per BR-15. | ADR 0040, ADR 0045, ADR 0046 | 2 (see A-3) |
| FR-17 | A Participant edits or deletes an entry on any day inside the goal period. | ADR 0009 | 2 |
| FR-18 | A Participant changes a goal's target from today on. Earlier days keep the old target. | ADR 0011 | 2 |
| FR-19 | A Participant switches between Calendar and List above the calendar. The list shows records by date, newest first, for the same month, grouped by day. | ADR 0014, ADR 0041, ADR 0048, ADR 0071 | 2 |
| FR-20 | A Participant sees the current streak next to each goal and the best streak on the goal's detail page. | ADR 0015, ADR 0042 | 3 |
| FR-21 | A Participant stores a reminder time and weekdays per goal. The app shows them and sends nothing. | ADR 0016 | 3 |
| FR-22 | The layout is the same for everyone. Menu items change with the role; the backend still checks every request. | ADR 0026 | 1 |
| FR-23 | A request from a Participant to create, edit or retire a template is refused with 403 and changes nothing. | ADR 0018; GWS §5.2 | 1 |

## 5. Non-Functional Requirements (NFR)

Areas are security and privacy, usability and accessibility, and maintainability (ADR 0022). Performance is deliberately not an NFR area (ADR 0022). ADR 0022 leaves the targets to this SRS; the numbers below are proposed from the course limits and are for the students to confirm (A-8).

| ID | Area | Requirement (measurable target) | Source | Verification |
|---|---|---|---|---|
| NFR-01 | Security | Stored passwords are bcrypt hashes. Zero plaintext passwords in code, Git, logs or screens. | ADR 0029; GWS §5.2 | Test reads the user table; repository search for seed passwords finds none |
| NFR-02 | Security | Every protected endpoint returns 401 without a session. Every role-restricted endpoint returns 403 for the wrong role. 100% of protected endpoints are covered by an automated test. | ADR 0027, ADR 0026; GWS §5.2 | API test per endpoint, listed in the role matrix |
| NFR-03 | Privacy | Across two Participant accounts and one Manager account, 0 reads or writes of another account's goals or entries succeed. | ADR 0019 | API tests on every goal and entry endpoint |
| NFR-04 | Security | Session cookie is HTTP-only. A session older than 8 hours is refused. Logout invalidates the session at once. | ADR 0027, ADR 0028 | API tests with an aged and a logged-out session |
| NFR-05 | Usability | The Participant's calendar screen has no horizontal scroll and all controls work at 375 px width and at 1280 px width (desktop designed first). | ADR 0038 | Playwright run at both widths |
| NFR-06 | Accessibility | Every Participant and Manager action reachable by keyboard alone. Calendar colours are never the only signal for a day's state. | ADR 0022, ADR 0040 | Playwright keyboard run; review of the calendar markup |
| NFR-07 | Maintainability | From a clean clone, the documented commands build, migrate, seed and start the app in 15 minutes or less. | ADR 0022 | Clean-clone run, timed, in Lab 5 |
| NFR-08 | Maintainability | Business-rule code (BR-01 to BR-07) has one unit test per rule and at least 80% line coverage of the rule code. | ADR 0022, ADR 0035 | Coverage report from CI |
| NFR-09 | Maintainability | Tests run in CI on every PR, against a real test database, at unit, API and browser level. | ADR 0035, ADR 0033 | CI run on a PR |

### 5.1 NFR Verification by Sprint

| NFR ID | Requirement | Verified in Sprint |
|---|---|---|
| NFR-01 | Password hashing | 1 |
| NFR-02 | 401 and 403 coverage | 1 (rechecked on each later endpoint) |
| NFR-03 | Cross-account privacy | 1 (rechecked in 2 and 3 as endpoints are added) |
| NFR-04 | Session cookie and expiry | 1 |
| NFR-05 | Phone and desktop width | 1 for Sprint 1 screens; 2 and 3 for later screens |
| NFR-06 | Keyboard and non-colour signal | 1 for Sprint 1 screens; 2 and 3 for later screens |
| NFR-07 | Clean-clone setup | 1 (documented setup); timed run in Lab 5 |
| NFR-08 | Rule unit tests and coverage | 1; hardening in 3 |
| NFR-09 | Tests in CI | 1 locally; in CI from Lab 5 |

## 6. Constraints and Assumptions

### 6.1 Constraints (fixed by the course or the repo)
- Theme 8, Habit and Activity Tracking, is the working assumption (GWS §6.8).
- Real UI, API, then persistent database. Data survives restart and redeploy (GWS §5.1).
- Business rules are enforced on the backend. The frontend may repeat them (GWS §5.2).
- Stack: Node.js, Express, React with Vite, Prisma, PostgreSQL; one container; REST over JSON (ADR 0023 to ADR 0025). Detail belongs in the SDS.
- One `staging` branch for all sprints (ADR 0001).

### 6.2 Decisions recorded
All design decisions are in `docs/adr/`. ADR 0002 to ADR 0049 are the baseline agreed by both students for Deliverable 1; ADR 0050 to ADR 0106 were added through Labs 5 to 7 and Sprints 2 and 3, each in the PR of its Issue; the Approved Changes table of `docs/traceability.md` records who agreed to the ones that change requirements or scope. The requirements above cite them by number.

### 6.3 Assumptions and open points for the students
No ADR settles these. Each is left open and needs a decision before the requirement is final.

| ID | Open point | Affects |
|---|---|---|
| A-1 | "Days so far" for progress: assumed to run from the goal's start date to today, or to the end date if the goal has ended. Confirm. | BR-07, FR-12 |
| A-2 | Which sprint builds template edit and retire. The handout's Sprint 1 example only requires defining a template. Template edit (FR-07) stays in Sprint 1 because the handout's "Participant cannot edit a template" test needs it. Retire (FR-08, and the retire part of BR-08) moves to Sprint 2, as the partner's review listed. | BR-08, FR-06 to FR-08 |
| A-3 | Which sprint builds the coloured calendar and the side panel. ADR 0037 puts the calendar first for the Participant, but no ADR says which of ADR 0040 to 0049 land in Sprint 1. Sprint 1 is the handout's slice, so Sprint 1 has only a plain page for goals and progress (FR-10 to FR-12). The month calendar and side panel (FR-15) and the colours (FR-16, BR-15) move to Sprint 2, as the partner's review listed. | BR-15, FR-15, FR-16 |
| A-4 | Decided on PR #23: a goal's daily target is greater than 0 and not above the template's maximum (`max_value`), so every target can be met. Revised by Issue #74 (ADR 0054, 2026-11-14): the target must also be greater than the template's minimum (`min_value`), so a day can be missed and "day met" (BR-07) means something. | FR-10 |
| A-5 | Decided (ADR 0079): existing goals show the name and unit as before; the Manager's row shows "Retired" with no Edit or Retire button. The question was: whether Participants can see template names after retirement on their existing goals, and what the Manager's table shows for them. | FR-08, FR-09 |
| A-6 | Whether native or mobile apps are out of scope. ADR 0038 says the design covers phone and desktop screens, which this SRS reads as a browser app only. | 1.3 |
| A-7 | Whether email verification is excluded for the whole project. Only self-registration and password recovery are (ADR 0004). | 1.3 |
| A-8 | NFR numbers: the width and keyboard targets are proposed here, not agreed. | NFR-05, NFR-06 |
| A-9 | Seeded account names and the way their passwords are shared privately (not in the repository). | FR-01 |
| A-10 | Decided (ADR 0091): a short summary of the goal. The question was: what a goal's detail page shows besides the best streak (ADR 0042 names the page, not its content). | FR-20 |
| A-11 | Sprint 1 limit: a wrong entry cannot be fixed until editing (FR-17) arrives in Sprint 2. Since ADR 0061 a later entry on the same day adds to the day total; it does not replace the wrong one. | BR-04, FR-11, FR-17 |

### 6.4 Questions for the TA (open)
The team cannot settle these. They are open points in the handouts (`docs/design-questions.md`, "Ask the TA"). Record each reply here or in an ADR.

| ID | Question for the TA | Status |
|---|---|---|
| T-1 | One `staging` branch for all sprints, or one per sprint? ADR 0001 proposes one. | Open |
| T-2 | How long may the final demo video be: 4 minutes (FD Part E) or 10 minutes (FD §2, GWS §9)? | Open |
| T-3 | Is the final video worth 8 points with a separate one-page release summary (GWS §9) or 10 points with no summary (FD)? | Open |
| T-4 | What must the final video and the final PDF contain where GWS §9 and FD disagree? | Open |
| T-5 | Must the merge gate cover PRs into `staging`, or only `main`? Does the ruleset include the default branch, which is `staging` here? How many approvals are required? | Open |
| T-6 | Lab 5 sits in the 3 and 5 Nov workshop but needs an accepted Sprint 1 release due 8 Nov. What is the real order? | Open |
| T-7 | Is there a Lab 6 and Lab 7 handout? When? | Open |
| T-8 | How do we ask for agreement on an alternative Sprint 1 slice or a brief ambiguity, and how long does a reply take? | Open |
| T-9 | May student IDs be left out of the PDF and given only on LEB2, given the repository is public? | Open |
| T-10 | Which GCP access method applies: the instructor's announced method or a personal Gmail Free Trial? | Open |

## 7. Revision history

| Date | Change | Approved by |
|---|---|---|
| 2026-11-07 to 2026-11-26 | Earlier changes are recorded in Git history and in the Approved Changes table of `docs/traceability.md` | see there |
| 2026-11-27 | Lab 7, Issue #139, ADR 0061: definitions of Entry and Day met (1.4); BR-04 and BR-07; source of FR-11; A-11 | projectnewy; agreed by phittayanan in the [review of 6f27fac](https://github.com/phittayanan/habit-tracker/pull/143#pullrequestreview-6079956119) |
| 2026-11-27 | Issue #151, ADR 0063 to ADR 0072: template kind in FR-05; FR-15 phone box and kind inputs; FR-19 grouped by day; BR-15 edge cases; after the PR #167 review, FR-15 names the kept goals page (ADR 0073) | projectnewy, [review of 5cb03fd](https://github.com/phittayanan/habit-tracker/pull/167#pullrequestreview-6087285792) of PR #167 |
| 2026-11-27 | Issue #150: FR-08 permanent retire; A-5 decided | phittayanan, [review of 32c04e0](https://github.com/phittayanan/habit-tracker/pull/171#pullrequestreview-6088317635) of PR #171 |
| 2026-11-27 | Issue #157: A-10 decided | phittayanan, [review of 4010b68](https://github.com/phittayanan/habit-tracker/pull/174#pullrequestreview-6089586014) of PR #174 |
| 2026-11-28 | Issue #161: status line at `v2.1`; Sprint 1 due date with its LEB2 source (1.2); ADR range (6.2). No requirement changed | pending (reviewer projectnewy) |
