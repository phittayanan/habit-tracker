<!-- Deliverable 1 rewrite, Part A (Issue #11). New text; facts checked against tag v1.0 (64831f7): requirement IDs and decisions from the v1.0 SRS and ADRs, Sprint 1 behaviour from the v1.0 code and tests. Each fact has one home (docs/deliverable-1/handout-checklist.md). -->

# Part A. SRS and product scope {#part-a}

This Part is the single place in the report where the business rules, functional requirements and non-functional requirements are written out. Parts B to F refer to them by ID.

## A.1 Problem and context {#a-1}

**Theme.** Theme 8, Habit and Activity Tracking System (Group Work Specification §6.8).

**Context.** A habit programme with no named organisation or real-world setting (ADR 0003). The programme runs recurring activities such as reading, walking or drinking water. The product contains no rule specific to any one activity (ADR 0002). A Program Manager describes each activity as a template, and the same rules then apply to every template.

**Problem.** The programme has two needs that nothing serves today:

1. Program Managers have no shared, consistent definition of an activity. Every activity needs a name, a unit and the range of values that makes sense for one day.
2. Participants have no private place to set a daily target on an activity, record what they did each day, and see how often they reached the target.

**What the product does.** A Manager keeps the list of activity templates. A Participant picks a template, sets a daily goal with start and end dates, records one value per day, and sees progress as the number of days the target was met. Every Participant's data stays private to that Participant.

## A.2 Actors and responsibilities {#a-2}

Each account has exactly one role (Group Work Specification §5.2). Accounts are seeded; nobody registers (ADR 0004).

| Actor | Responsible for | Never allowed to |
|---|---|---|
| Program Manager | Logging in and out. Creating templates. Editing a template that no goal uses yet. Retiring a template (Sprint 2). | Read or change any Participant's goals or entries. |
| Participant | Logging in and out. Reading the active templates. Creating goals. Recording their own daily values, and (Sprint 2) editing or deleting them. Reading their own progress, history, streaks and reminders. | Create, edit or retire a template. Read or change another Participant's data. |
| The system | Hashing passwords. Keeping sessions in the database. Working out goal state and progress from dates and entries. Enforcing every rule and permission on the server; the browser may repeat a check but is never the only one (Group Work Specification §5.2). | Trust a hidden button, a user ID sent by the browser, or a role chosen in the browser. |

The two students and the course staff build and assess the product. They are not users of it.

## A.3 Scope and exclusions {#a-3}

**In scope across the three sprints:**

- Real login, logout and current-user identity for two roles (FR-01 to FR-04).
- Activity templates kept by Managers (FR-05 to FR-09, FR-23).
- Daily goals and daily entries, with date, value and uniqueness rules (FR-10, FR-11, FR-17, FR-18).
- Progress, history, streaks and a stored reminder (FR-12, FR-19 to FR-21).
- A browser interface built around one month calendar for Participants (FR-15, FR-16, FR-19).
- Private Participant data (FR-13, FR-14).

**Sprint 1 slice** (ADR 0020): a Manager defines a template; a Participant chooses it, sets a goal, records daily values and sees computed progress, with the entry rules and access restrictions enforced on the server. Sprints 2 and 3 are in Part D.

**Excluded, for the whole project:**

| Excluded | Why |
|---|---|
| Medical diagnosis or treatment advice | Course brief, Group Work Specification §6.8 |
| Self-registration and password recovery | ADR 0004 |
| Sharing any Participant's data with a Manager or another Participant | ADR 0019 |
| Sending reminders (email, push or SMS); the reminder is only stored and shown | ADR 0016 |
| More than one role per account | Group Work Specification §5.2 |
| Spelling checks on a template's free-text unit | ADR 0007 |
| Templates owned or copied by Participants | ADR 0018 |
| A time zone per user; every user shares one fixed zone | ADR 0006 |

**Terms used in this report:**

- *Template*: a Manager's activity definition: name, free-text unit, and the lowest and highest value one day may hold.
- *Goal*: one Participant's daily target on one template, between a start date and an end date.
- *Entry*: the value one Participant records for one goal on one day.
- *Day*, *day met*, *progress* and *streak* are defined by BR-02, BR-07 and BR-13.

## A.4 Business rules (BR) {#a-4}

A business rule is a domain constraint the server must enforce whatever the screen allows. Each rule is tested at the level shown; the tests are listed per acceptance criterion in Part E.

| ID | Rule | Decision | Sprint | Verified by |
|---|---|---|---|---|
| BR-01 | An entry may only be recorded for today or an earlier day, and only for a day between its goal's start date and end date, both included. Any other date is refused. | ADR 0005 | 1 | Unit and API tests |
| BR-02 | Every date is a day in the Asia/Bangkok time zone, the same for every user. | ADR 0006 | 1 | Unit tests around Bangkok midnight |
| BR-03 | A template's lowest value must be below its highest value. An entry's value must lie between the two, both included. | ADR 0007 | 1 | Unit and API tests at, below and above each limit |
| BR-04 | A goal has at most one entry per day. A second entry for the same goal and day is refused (409); the Participant changes the existing entry instead (from Sprint 2, BR-11). | ADR 0008 | 1 | API test |
| BR-05 | A Participant has at most one active goal per template (active as defined in BR-06, so a goal that starts in the future already counts). | ADR 0010 | 1 | API test |
| BR-06 | A goal is Active from the day it is created until its end date has passed, and Ended after that. The state is worked out from the dates each time and is never stored or set by hand. | ADR 0012 | 1 | Unit tests on the start day, end day and the day after |
| BR-07 | Progress is the number of days met out of the days so far. A day is met when its entry is at least the daily target. The days so far run from the start date to today, or to the end date once the goal has ended; a goal that has not started has 0 of 0. | ADR 0013 | 1 | Unit tests on met, missed and empty days |
| BR-08 | A Manager may edit a template only while no goal uses it. Once a goal uses it, it can only be retired. A retired template cannot start a new goal; goals that already use it carry on. | ADR 0017 | Edit 1; retire 2 | API tests |
| BR-09 | A Participant can never create, edit or retire a template. | ADR 0018 | 1 | API tests (403) |
| BR-10 | A Participant's goals and entries are visible only to that Participant. A Manager or another Participant is refused. | ADR 0019 | 1 | API tests across three accounts |
| BR-11 | An entry may be edited or deleted on any day inside its goal's period; progress and streaks are then worked out again. | ADR 0009 | 2 | — |
| BR-12 | Changing a goal's target takes effect from today. Earlier days are still judged against the old target, so every version of the goal is kept. | ADR 0011 | 2 | — |
| BR-13 | A streak counts consecutive days met. One missed day sets it back to zero. Today does not break the streak until today is over. | ADR 0015 | 3 | — |
| BR-14 | A reminder (a time and weekdays, per goal) is stored and shown. Nothing is sent. | ADR 0016 | 3 | — |
| BR-15 | On the calendar a day is green when every goal was met, yellow when some were, red when none were, and grey when nothing was recorded. | ADR 0040, 0045, 0046 | 2 | — |

## A.5 Functional requirements (FR) {#a-5}

Each FR is behaviour a user or a test can observe.

| ID | Requirement | Decision | Sprint |
|---|---|---|---|
| FR-01 | A user logs in with a seeded username and password. A correct login creates a session row in the database and sets an HTTP-only cookie that carries only the session ID. A wrong login creates no session and gives the same answer whether the username or the password was wrong. | ADR 0027, 0051 | 1 |
| FR-02 | A logged-in user logs out. The session row is deleted, and the old cookie stops working at once. | ADR 0027 | 1 |
| FR-03 | A logged-in user can ask who they are and gets their display name and role. A request to any protected path without a valid session gets 401. | ADR 0027 | 1 |
| FR-04 | A session lasts 8 hours from login and is not extended by use. After that every protected request gets 401. | ADR 0028 | 1 |
| FR-05 | A Manager creates a template with a name, a free-text unit and a lowest and highest value per day. A lowest value that is not below the highest is refused. | ADR 0007, 0043 | 1 |
| FR-06 | A Manager sees all templates in a table (name, unit, range, active or retired) with New and Edit actions. A Retire action joins it in Sprint 2. | ADR 0043 | 1 |
| FR-07 | A Manager edits a template's name, unit or range while no goal uses it, and is refused once a goal uses it. | ADR 0017 | 1 |
| FR-08 | A Manager retires a template. It no longer appears for new goals; goals that already use it keep working. | ADR 0017 | 2 |
| FR-09 | A Participant sees every active template, read-only. | ADR 0018 | 1 |
| FR-10 | A Participant creates a goal with a "+ New goal" form: template, daily target, start date and end date. The target must be above 0 and not above the template's highest value. A second active goal on the same template is refused. | ADR 0010, 0049 | 1 |
| FR-11 | A Participant records a day's value by typing a number. The template's unit is shown. A refused entry (BR-01, BR-03, BR-04) shows a message that says why. | ADR 0008, 0039 | 1 |
| FR-12 | A Participant sees each goal's progress as days met out of days so far. | ADR 0013 | 1 |
| FR-13 | A Participant sees only their own goals, entries and progress. Asking for another Participant's data is refused. | ADR 0019 | 1 |
| FR-14 | A Manager asking for any Participant's goals or entries is refused. | ADR 0019 | 1 |
| FR-15 | After login a Participant first sees this month's calendar. On a desktop the calendar is on the left and a side panel on the right shows the chosen day (today at first) with a number box for every goal. | ADR 0037, 0045, 0047 | 2 |
| FR-16 | The calendar colours each day by BR-15. | ADR 0040, 0045, 0046 | 2 |
| FR-17 | A Participant edits or deletes an entry on any day inside the goal's period. | ADR 0009 | 2 |
| FR-18 | A Participant changes a goal's target from today on; earlier days keep the old target. | ADR 0011 | 2 |
| FR-19 | Two buttons above the calendar switch between Calendar and List. The list shows the same month's records by date, newest first. | ADR 0014, 0041, 0048 | 2 |
| FR-20 | A Participant sees the current streak next to each goal and the best streak on the goal's detail page. | ADR 0015, 0042 | 3 |
| FR-21 | A Participant stores a reminder time and weekdays for a goal; the app shows them and sends nothing. | ADR 0016 | 3 |
| FR-22 | Everyone gets the same layout; the menu items depend on the role. The server still checks every request. | ADR 0026 | 1 |
| FR-23 | A Participant's request to create, edit or retire a template is refused with 403 and changes nothing. | ADR 0018 | 1 (create, edit); 2 (retire) |

## A.6 Non-functional requirements (NFR) {#a-6}

The quality areas are security and privacy, usability and accessibility, and maintainability (ADR 0022). Speed and load are deliberately not targets for this product (ADR 0022).

| ID | Area | Measurable target | How it is verified | Verified in sprint |
|---|---|---|---|---|
| NFR-01 | Security | Every stored password is a bcrypt hash. No plaintext password appears in code, Git history, logs or screens. | Test reads every stored hash; script searches the tracked files for the seed passwords | 1 |
| NFR-02 | Security | Every protected endpoint answers 401 without a session, and every role-restricted endpoint answers 403 to the wrong role. 100% of protected endpoints have an automated test. | API tests; a test that lists every registered route and fails if one is unprotected or untested | 1, rechecked for each new endpoint |
| NFR-03 | Privacy | With two Participants and one Manager, 0 attempts to read or change another account's goals or entries succeed. | API tests on every goal and entry endpoint | 1, rechecked in 2 and 3 |
| NFR-04 | Security | The session cookie is HTTP-only. A session older than 8 hours is refused. Logout ends the session at once. | API tests with an aged session and a logged-out cookie | 1 |
| NFR-05 | Usability | No sideways scrolling, and every control usable, at 375 px and at 1280 px wide: on the Participant's calendar screen and on every Sprint 1 screen (designed for desktop first, ADR 0038). | Browser tests at both widths | 1 for Sprint 1 screens; 2, 3 for later screens |
| NFR-06 | Accessibility | Every action can be done with the keyboard alone. Colour is never the only sign of a day's state on the calendar. | Browser keyboard test; calendar markup review | 1 (keyboard); 2 (calendar) |
| NFR-07 | Maintainability | From a clean clone, the documented commands install, migrate, seed and start the app in 15 minutes or less. | Timed clean-clone run | Setup documented in 1; timed run in Lab 5 |
| NFR-08 | Maintainability | Each rule BR-01 to BR-07 has at least one unit test, and the rule code has at least 80% line coverage. | Unit tests; coverage report | 1; hardening in 3 |
| NFR-09 | Maintainability | Unit, API and browser tests run against a real test database on every pull request. | Test run on each pull request | 1 locally; on every pull request from Lab 5 |

## A.7 Constraints and assumptions {#a-7}

**Constraints set by the course:**

- Theme 8 (Group Work Specification §6.8).
- A real browser interface, a real API and a persistent database; data survives a restart or redeploy (Group Work Specification §5.1).
- The course starter stack: Node.js, Express, React with Vite, Prisma and PostgreSQL in one container, with a JSON REST API (ADR 0023 to ADR 0025). Part C gives the design.

**Assumptions and open points** (status at `v1.0`):

| ID | Assumption or question | Resolution | Affects |
|---|---|---|---|
| A-1 | Where "days so far" in progress starts and ends. | Assumed as written in BR-07; built and unit-tested that way in Sprint 1 | BR-07, FR-12 |
| A-2 | Which sprint builds template edit and retire. | Resolved 2026-11-07: edit in Sprint 1, retire in Sprint 2 (Part B, approved changes) | BR-08, FR-06 to FR-08 |
| A-3 | Which sprint builds the coloured month calendar and side panel. | Resolved 2026-11-07: Sprint 2; Sprint 1 has a plain goals and progress page | BR-15, FR-15, FR-16 |
| A-4 | Limits on a goal's daily target. | Resolved 2026-11-07: above 0 and not above the template's highest value | FR-10 |
| A-5 | Whether a Participant still sees a retired template's name on an existing goal, and how the Manager's table shows it. | Open; decided before FR-08 in Sprint 2 | FR-08, FR-09 |
| A-6 | The product is a browser application only; native phone apps are out of scope. | Assumed from ADR 0038 | A.3 |
| A-7 | Email verification is not built. | Assumed; only self-registration and password recovery are excluded by decision (ADR 0004) | A.3 |
| A-8 | The 375 px, 1280 px and keyboard targets in NFR-05 and NFR-06. | Assumed; proposed by the team | NFR-05, NFR-06 |
| A-9 | Seeded account names; seed passwords come from environment variables and are shared privately, never in Git. | Assumed; the seed works this way in Sprint 1 | FR-01 |
| A-10 | What a goal's detail page shows besides the best streak. | Open; decided before FR-20 in Sprint 3 | FR-20 |
| A-11 | In Sprint 1 a wrong same-day entry cannot be corrected, because editing (FR-17) arrives in Sprint 2. | Accepted as a known Sprint 1 limit | BR-04, FR-11, FR-17 |

## A.8 Design decisions {#a-8}

The team recorded 51 decisions as ADRs (`docs/adr/`). Decisions already written above as a rule, requirement or exclusion are listed by number only; the rest are summarised here once.

| Topic | Decision | ADR |
|---|---|---|
| Already written above | As a BR, FR, NFR or exclusion | 0002 to 0019, 0022, 0026 to 0029, 0037, 0039 to 0043, 0045 to 0049, 0051 |
| Product | Sprint 1 is the handout's example slice; Sprint 2 brings goal changes and history; Sprint 3 brings streaks, reminders and hardening | 0020, 0021 |
| Look and feel | Plain screens; the calendar colours are the only strong colour | 0044 |
| Look and feel | Phone and desktop screens, designed desktop first | 0038 |
| Look and feel | Login is a centred form at most 352 px wide; one top bar for every role | 0050 |
| Technology | The course starter stack, in one container, with a JSON REST API that returns a code and a message on errors | 0023 to 0025 |
| Testing | Unit and API tests against a real test database; browser journeys with Playwright | 0035 |
| Deployment | The course's GCP reference stack; phittayanan owns the GCP project; a merge into `main` deploys without a separate approval; one CI job is the required check | 0030 to 0033 |
| Team process | One `staging` branch for all sprints; each Issue has one assignee and the other student reviews; student IDs are typed into the PDF by hand | 0001, 0034, 0036 |
