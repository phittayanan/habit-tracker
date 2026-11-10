# Design questions for Issue #3

Each student answers these separately, in their own AI agent (`/design-interview`, see `.claude/skills/design-interview/SKILL.md`). Answers are posted on Issue #3 under each student's own GitHub name. The two sets are compared on a call, and each final decision becomes one ADR in `docs/adr/`.

This file asks questions only. It recommends nothing. Options are in no order of preference. Pick one, or write your own under "Other".

- Time: about 35 questions, 30 to 45 minutes. Skip any question and come back to it.
- Facts come from `docs/assignment.md`. The section numbers (GWS, D1, L5, SG, KIT) are the handout's own.
- Questions marked "(pick any)" accept more than one option.
- Answer IDs are stable (D-01 to D-35). Do not renumber when editing.

## Fixed facts (not questions)

The course or the repo already fixes these.

| Fact | Source |
|---|---|
| Theme 8 (Habit and Activity Tracking) is the working assumption. D-01 confirms it | GWS §6.8; O-1 |
| Two roles: Participant and Program Manager. One role per account | GWS §6.8, §5.2 |
| Managers maintain activity templates | GWS §6.8 |
| Participant histories are private unless the SRS defines consent-based sharing. Managers get no automatic access | GWS §6.8 |
| Medical diagnosis and treatment advice are out of scope | GWS §6.8 |
| Real login, logout and current-user identity from Sprint 1. Roles enforced on the backend, not by hidden controls or a client-chosen user ID | GWS §5.2; D1 §3.3 |
| Passwords are hashed. No plaintext passwords in code, Git or on screen | GWS §5.2; L5 §5 |
| Seeded demo accounts are enough in Sprint 1. No self-registration, password recovery or email verification is required | D1 §2; GWS §5.2 |
| Real UI, then API or application layer, then persistent database. Data survives restart and redeploy | GWS §5.1; L5 R-04 |
| Docker packaging, deployment on GCP, CI on PRs with a required check | L5 R-01, R-03, R-05, R-06 |
| One shared `staging` branch for all sprints (ADR 0001). A TA confirmation is still open (see T-1) | ADR 0001; O-2 |
| Branch names follow `CLAUDE.md` (`feat/|fix/|docs/|chore/<issue>-<slug>`). SG examples use other prefixes but allow the team's own style | CLAUDE.md; SG Ep. 2.1; O-13 |
| Spec first, then a failing test, then code, committed in that order | CLAUDE.md; GWS §8.2 |
| AI use is recorded in `docs/ai-use.md` | CLAUDE.md; GWS §8.4 |
| GitHub Issues and a project board are required. Triage labels are in `docs/agents/triage-labels.md`. Lab 5 Issues and PRs carry a `lab5` label | GWS §5.3; L5 R-10 |
| Health and readiness endpoints (`/api/health`, `/api/ready`) are what the kit's smoke test calls. Paths follow the stack choice (D-22) | KIT; SG Ep. 2.2 |
| Business rules are enforced on the backend. The frontend may repeat them for faster feedback | GWS §5.2; D1 §3.3 |
| Sprint 1 is due 8 Nov 2026. Sprint 2 is due 29 Nov. Sprint 3 is due 13 Dec | GWS §4, §7 |

## Part 1. Context and scope

### D-01 Theme and routine
Source: assignment.md Q1, O-1 (GWS §6, §6.8)
Facts: The handouts do not name our theme. It follows a student ID digit, and the repo name suggests theme 8. Theme 8 says to choose study habits, exercise, sleep or another routine.
- A. Study habits (for example minutes of study per day). Entries are time values, and the rules suit a study programme.
- B. Exercise (for example minutes or distance per day). Entries are time or distance values, with different ranges per activity.
- C. Sleep (for example hours per night). One value per night makes the one-entry-per-day rule natural, and an entry is a duration.
- D. No single routine. Managers define any routine as a template, so the product holds no routine-specific rules.
- Other: your own answer (for example a different theme).

### D-02 Stakeholder and problem
Source: assignment.md Q2 (D1 §3.1)
Facts: The SRS needs the stakeholders, the problem they have, and the actors. The two actors are fixed (Participant, Program Manager).
- A. A university course or study programme. The manager is an instructor or advisor, and participants are students.
- B. A fitness or sports programme. The manager is a coach, and participants are members.
- C. A workplace or community wellness programme. The manager is a programme coordinator, and participants are staff or residents.
- D. A general programme with no named organisation. The SRS describes the roles only, with no real-world setting.
- Other: your own answer.

### D-03 Out of scope (pick any)
Source: assignment.md Q3 (D1 §3.1; GWS §6.8)
Facts: Out of scope already: medical advice. Not required in Sprint 1: self-registration, password recovery, email verification, several roles per account. The SRS must list its exclusions. Pick the items you want listed as excluded for the whole product.
- A. Sending real reminders (email, push or SMS). The product only stores and shows a reminder.
- B. Any sharing of history between participants. Participants see only their own data.
- C. Self-registration and password recovery for the whole project, not only Sprint 1.
- D. Native or mobile apps. The product is a browser app only.
- Other: your own answer (items you want excluded or kept in scope).

## Part 2. Domain rules

### D-04 Valid entry dates
Source: assignment.md Q6 (GWS §6.8)
Facts: The brief says to specify dates and valid values and dates for an entry. Sprint 1 must reject invalid dates.
- A. Today only. Nothing can be backfilled, and the date check is a single comparison.
- B. Today and past dates, no future dates. Backfilling is possible, so edits and streaks must handle older days.
- C. Past or today, but only inside the goal's start and end dates. Entries outside the goal period are rejected.
- D. Any date inside the goal's period, including future dates. Planned entries are possible, and progress must handle days not yet reached.
- Other: your own answer.

### D-05 What a day is
Source: assignment.md Q6 (GWS §6.8)
Facts: One entry per day (or a daily total) needs a rule for where a day starts and ends.
- A. One fixed time zone for everyone (for example Asia/Bangkok). The same date for all users, and users in other zones may see odd cut-offs.
- B. Each participant has a time zone setting. Dates are right for each person, and the data model stores a zone per user.
- C. The UTC calendar date of the server. No time-zone setting, and a late-evening local entry can land on the next UTC date.
- Other: your own answer.

### D-06 Units and valid ranges
Source: assignment.md Q7 (GWS §6.8)
Facts: A template has a unit and a valid range (Sprint 1 example). The brief says to specify units.
- A. The manager types a free-text unit and a minimum and maximum per entry. Any routine fits, and unit spelling is not checked.
- B. The manager picks a unit from a fixed list (for example minutes, hours, count, km) and sets a minimum and maximum per entry. Units are consistent, and a new unit needs a code change.
- C. One unit per product (set by D-01), with a minimum and maximum per entry in the template. Fewer fields, and the product covers one kind of value.
- Other: your own answer (for example also a daily maximum).

### D-07 Second entry on the same day
Source: assignment.md Q8 (GWS §6.8)
Facts: The brief says to specify the duplicate-entry behaviour. The Sprint 1 example says to enforce "the specified one-entry-per-day or accumulation rule".
- A. One entry per participant, template and day. A second entry is rejected with an error.
- B. One entry per day. A second entry is rejected, but the participant can edit the existing entry (see D-08).
- C. One entry per day. A second entry replaces the first.
- D. Several entries per day are added together. Each entry must be inside the range, and the daily total may also have a maximum.
- Other: your own answer.

### D-08 Editing and deleting entries
Source: assignment.md Q8 (GWS §6.8)
Facts: This changes progress and streaks after the fact. Edits are not in the Sprint 1 example.
- A. Entries cannot be edited or deleted once saved. Fewer rules, and a wrong entry stays.
- B. Edit or delete on the same day only. A short correction window, and older data is fixed.
- C. Edit or delete on any day inside the goal period. Progress and streaks are recomputed after each change.
- D. Delete only, no edit. A wrong entry is removed and entered again.
- Other: your own answer.

### D-09 What a goal is
Source: assignment.md Q9 (GWS §6.8)
Facts: In the Sprint 1 example a participant selects a template and sets a goal. The brief says to specify goal changes.
- A. A daily target for one template, with a start date and an end date.
- B. A total target for one template over a period (for example 600 minutes in 30 days), with a start and end date.
- C. A weekly target (for example an amount or a number of days per week), with a start date and no end date.
- D. A daily target with a start date and no end date. It runs until the participant stops it.
- Other: your own answer (also say whether a participant may have more than one active goal per template).

### D-10 Changing a goal
Source: assignment.md Q9, Q16 (GWS §6.8)
Facts: The theme text puts goal revisions in later sprints. The brief says to specify what happens to earlier progress when a goal changes.
- A. A change applies from today on. Earlier days keep the old target, so the product stores each goal version.
- B. A change applies to the whole goal period. Earlier progress is recomputed against the new target, and history shows only the current target.
- C. A goal cannot be changed. The participant ends it and creates a new one, so each goal keeps one target.
- Other: your own answer.

### D-11 Goal states and transitions
Source: assignment.md Q16 (GWS §6; D1 §3.5)
Facts: The SRS needs a rule for each state change and the invalid ones (for example, recording to an ended goal).
- A. Active, then Ended when the end date passes. The system sets the state from dates, and the participant takes no state action.
- B. Active, Completed (target met) or Ended (period over). The system sets the state from dates and progress.
- C. Active, Completed, or Cancelled by the participant. The participant can cancel, and cancelled goals take no new entries.
- D. Active or Archived only. The participant archives a goal, and it keeps its history.
- Other: your own answer.

### D-12 How progress is computed
Source: assignment.md Q10 (GWS §6.8)
Facts: Sprint 1 shows "computed progress".
- A. Percent of the target reached: the sum of entries divided by the goal target.
- B. Days met: the count of days where the day's value reached the daily target, out of the days so far.
- C. Both A and B on the same screen. Two measures to specify and test.
- D. The total so far and the amount remaining, with no percentage. Plain numbers only.
- Other: your own answer.

### D-13 What history shows
Source: assignment.md Q11 (GWS §6.8)
Facts: History is a theme feature, listed for later sprints.
- A. A list of entries by date for one goal, newest first.
- B. A day-by-day grid or calendar per goal, marking each day met, missed or empty.
- C. The list in A with a summary line per week or month.
- Other: your own answer.

### D-14 What a streak means
Source: assignment.md Q11 (GWS §6.8)
Facts: "Streak and history logic" is listed for later sprints. The definition has to be written in the SRS.
- A. Consecutive days where the daily target was met. One missed day resets it to zero.
- B. Consecutive days with any entry, whatever the value.
- C. Consecutive days where the target was met, and one missed day in a row is allowed.
- D. The product has no streak. The theme's streak item is not built, and the change is recorded as an approved scope change.
- Other: your own answer.

### D-15 Reminder or schedule placeholder
Source: assignment.md Q12 (GWS §6.8)
Facts: The theme lists "reminder placeholders" for later sprints. D-03 may already exclude real sending.
- A. A participant stores a reminder time and weekdays per goal. The app shows them and sends nothing.
- B. A goal has a schedule (the weekdays it applies to). The dashboard lists goals due today, and there is no reminder time.
- C. A stored reminder time plus an in-app banner when a goal has no entry yet today.
- D. No reminder or schedule field in the product.
- Other: your own answer.

### D-16 Template changes and retirement
Source: assignment.md Q13 (GWS §6.8)
Facts: Managers maintain templates (fixed). Participants must be unable to edit shared templates, and this is tested.
- A. A manager can edit a template's unit and range at any time. Existing entries are not re-checked.
- B. A manager can edit a template only while no goals use it. Used templates are retired instead.
- C. A manager can retire a template. Retired templates cannot start new goals, and existing goals continue.
- D. A manager can retire a template. Its existing goals end at once.
- Other: your own answer (options may be combined).

### D-17 Template visibility
Source: assignment.md Q13 (GWS §6.8)
Facts: The brief says participants select a template. Whether they can copy or own one is open.
- A. Participants see all active templates, read-only. They cannot copy or create their own.
- B. Participants see all active templates, and can make a private copy with their own range.
- C. Managers assign templates to chosen participants. A participant sees only the templates assigned to them.
- Other: your own answer.

### D-18 Sharing and what a manager sees
Source: assignment.md Q14 (GWS §6.8)
Facts: Histories are private unless the SRS defines consent-based sharing. Managers do not automatically see private records. Tests cover cross-participant access.
- A. No sharing. A manager sees only templates, nothing about participants' goals or entries.
- B. No individual sharing. A manager sees counts across all participants (for example participants per template), with no names.
- C. A participant can grant a manager read access to one goal's history and withdraw it at any time. Consent is stored and tested.
- D. A participant can grant read access to a goal's history to a manager or to another participant, with an optional end date.
- Other: your own answer.

## Part 3. Sprint scope and quality targets

### D-19 Sprint 1 slice
Source: assignment.md Q5, Q21 (GWS §6; D1 §3.4)
Facts: The handout's example: a manager logs in and defines a template with a unit and valid range. A participant logs in, selects a template, sets a goal, records daily activity and sees computed progress. Sprint 1 also needs the business-rule rejection and access restriction tests. Due 8 Nov. A different slice needs instructor or TA agreement with equal depth.
- A. The handout's example only, with the rules chosen above.
- B. The handout's example plus a history list of entries for a goal.
- C. A different slice from the example. It needs TA agreement (see T-8) and equal depth.
- Other: your own answer.

### D-20 Sprint 2 and Sprint 3 split
Source: assignment.md Q20 (D1 §3.4; D2 §2)
Facts: The theme lists these for later sprints: goal revisions, streak and history logic, reminder placeholders, progress summaries. Sprint 2 must be complete by 29 Nov, and required features must not move to Sprint 3 only to finish Sprint 2. Sprint 3 ends 13 Dec, and the exam period is 1 to 11 Dec.
- A. Sprint 2: goal changes and history. Sprint 3: streaks, reminders, summaries and hardening.
- B. Sprint 2: history and progress summaries. Sprint 3: goal changes, streaks, reminders and hardening.
- C. Sprint 2: all four themed items. Sprint 3: hardening, regression tests and defect fixes only.
- Other: your own answer (the allocation by feature, or a different split).

### D-21 Non-functional requirements (pick any)
Source: assignment.md Q18 (D1 §3.1)
Facts: Important NFRs need a measurable target, a verification method and a sprint. Persistence over a restart is already required. Pick the areas you want an NFR for. Targets are filled in while writing the SRS.
- A. Security and privacy (for example password hashing, no cross-user data access, tested).
- B. Performance (for example a page or API response time under a stated load).
- C. Usability and accessibility (for example works at phone width, keyboard use).
- D. Maintainability (for example a test coverage level, setup from a clean clone in a stated time).
- Other: your own answer.

## Part 4. Stack and architecture

### D-22 Stack
Source: assignment.md Q23, Q24 (GWS §5.1; D1 §3.3; SG Ep. 0.2, 0.4)
Facts: The stack is the team's choice, and the same stack as Labs 1 to 4 is encouraged. The Lab 5 kit assumes Node.js 24, React 18 with TypeScript and Vite, Express with TypeScript, Prisma 5 and PostgreSQL 16. Another stack means adapting the kit and writing the choice in the SDS. Cloud SQL offers PostgreSQL, MySQL and SQL Server. Another database needs the lecturer's agreement first. (The stack used in Labs 1 to 4 is not in this repo. Say what it was in your "why".)
- A. The kit's stack as it is (Node.js, Express, React with Vite, Prisma, PostgreSQL). The kit's files work without changes.
- B. One full-stack framework in TypeScript (for example Next.js) with PostgreSQL. The kit's Dockerfile and CI need adapting.
- C. A Python backend (for example Django or FastAPI) with a separate or built-in frontend and PostgreSQL. The kit's Dockerfile, CI and deploy scripts need adapting.
- D. The stack used in Labs 1 to 4, if it is none of A to C, with a database Cloud SQL offers. The kit needs adapting, and the team already knows the tools.
- Other: your own answer.

### D-23 Shape of the application
Source: assignment.md Q25 (D1 §3.3; GWS §5.1)
Facts: A modular monolith is accepted. Three layers need not mean three servers or containers. The kit builds the API and the built frontend into one container on port 3000.
- A. One container: the API serves the built frontend.
- B. Two containers: a frontend server and a separate API. Two images to build and two deploy targets.
- C. One server-rendered application with no separate frontend. Pages are rendered by the server.
- Other: your own answer.

### D-24 API conventions
Source: assignment.md Q29 (D1 §3.3)
Facts: The SDS states endpoint conventions, request and response shapes, validation and safe error handling. The kit smoke test calls plain JSON paths.
- A. REST over JSON: resource paths, standard HTTP status codes, and a JSON error body with a code and message.
- B. JSON over HTTP with action-style paths (for example `POST /api/entries/record`), and a JSON error body.
- C. A typed RPC layer or GraphQL. Client and server share types, and the kit's JSON smoke test needs extra routes.
- D. Server-rendered form posts with no public JSON API. It fits D-23 option C.
- Other: your own answer.

### D-25 Navigation
Source: assignment.md Q28 (D1 §3.3)
Facts: The SDS lists the main screens and navigation. Validation, loading, empty and error states are written in the SDS once the screens are known.
- A. One layout for everyone. The menu items change with the role.
- B. A separate area for each role (for example `/manager/...` and `/participant/...`) with its own layout.
- C. One dashboard per role as the only home screen. Other screens open from it.
- Other: your own answer.

## Part 5. Authentication

### D-26 Session design
Source: assignment.md Q31, Q32 (GWS §5.2; D1 §3.3; SG Ep. 2.2)
Facts: The design must say how a session or token is created, how it expires, how the current user is retrieved and how logout works. SG recommends sessions kept in the database, not in server memory, so a redeploy does not log users out.
- A. A server-side session row in the database, with an HTTP-only cookie holding the session ID. Logout deletes the row.
- B. A signed token (JWT) in an HTTP-only cookie, with a short expiry. No session table, and logout clears the cookie while a stolen token works until it expires.
- C. A signed token (JWT) sent in an `Authorization` header and kept by the frontend. No session table, and the browser stores the token.
- D. The login feature of the chosen framework or library, with its default session store. The library decides the storage.
- Other: your own answer.

### D-27 Session length
Source: assignment.md Q31 (D1 §3.3)
Facts: The SDS states the expiry. Seeded demo accounts are used by Lab 6 testers.
- A. 30 minutes without activity.
- B. 8 hours from login.
- C. 7 days from login.
- D. Until logout, with no expiry.
- Other: your own answer.

### D-28 Password hashing method
Source: assignment.md Q31 (GWS §5.2; D1 §3.3)
Facts: Hashing is required. The method is open. The library follows the stack (D-22).
- A. bcrypt.
- B. argon2id.
- C. scrypt.
- D. The hashing method the chosen framework uses by default.
- Other: your own answer.

## Part 6. Deployment and delivery

### D-29 GCP components
Source: assignment.md Q36 (D1 §3.3; L5 §5; SG Ep. 0.2)
Facts: The reference stack is Artifact Registry, Cloud Run, Cloud SQL for PostgreSQL, Secret Manager and GitHub Actions. Kit defaults: region `asia-southeast1`, Cloud SQL `db-f1-micro`, Cloud Run minimum 0 and maximum 3 instances. Cloud SQL is billed for every hour it exists (about USD 14 to 18 a month per the guide). Another choice must be written in `deployment.md` and the SDS.
- A. The reference stack, with the kit defaults.
- B. The reference stack with a different region or sizes (say which in "Other").
- C. Cloud Run with a different managed database. It needs the lecturer's agreement if Cloud SQL does not offer it.
- D. A Compute Engine VM running Docker Compose. More to set up by hand, and the kit's deploy scripts do not apply.
- Other: your own answer.

### D-30 Who owns the GCP project
Source: assignment.md Q37 (L5 §4.4; SG Ep. 1)
Facts: One member signs up for the Free Trial (USD 300) with a personal Gmail that has never used it. That member creates one project for Labs 5 to 7 and the Final Project, and adds the teammate in IAM with the Editor role. Nobody pays a prepayment or clicks Upgrade. Lab 5 is due 15 Nov.
- A. phittayanan creates and owns the project and adds projectnewy as Editor.
- B. projectnewy creates and owns the project and adds phittayanan as Editor.
- C. Decide when Lab 5 starts, depending on whose Gmail has not used the Free Trial.
- Other: your own answer.

### D-31 Manual approval before deploy
Source: assignment.md Q42 (GWS §5.3; L5 R-07)
Facts: A documented manual approval inside the pipeline is allowed. Only `main` deploys, so each merge into `main` is a release. The guide says not to merge into `main` while the database is paused.
- A. No approval step. A merge into `main` deploys through the pipeline.
- B. A reviewer approval on the GitHub environment before each deploy. The release PR and the deploy are two separate gates.
- C. Deploys only start by a manual run of the workflow. A merge into `main` does not deploy by itself.
- Other: your own answer.

### D-32 Shape of the CI check
Source: assignment.md O-14, Q40 (SG Ep. 4.2, 6.5; KIT `docs/gcp-cicd-guide.md` §6)
Facts: The kit's `ci-docker.yml` has one job named `test-and-docker`, and the required check must match the job name. The kit's guide §6 names three checks: Backend Test, Frontend Test and Build, Docker Build.
- A. One job `test-and-docker`, as in the kit, as the single required check.
- B. Three jobs (backend test, frontend test and build, Docker build), each a required check. Failures are easier to locate, and the ruleset lists three names.
- C. The kit's one job, plus a separate end-to-end job. The end-to-end job is required or not (say which in "Other").
- Other: your own answer.

### D-33 Student IDs in the PDF
Source: assignment.md O-16 (D1 §4; GWS §11; CLAUDE.md Safety)
Facts: The PDFs must show both students' names and IDs. The repository is public, and `CLAUDE.md` forbids student IDs in the repository. The PDF text is built from repository documents.
- A. A private cover page file, kept out of Git, is merged into the PDF when it is built.
- B. IDs are typed into the final PDF by hand after export from the repository documents.
- C. IDs are given only in the LEB2 submission, if the TA agrees that this replaces the PDF requirement (see T-9).
- Other: your own answer.

## Part 7. Testing and process

### D-34 Test levels and tools
Source: assignment.md Q43 (GWS §8.2; D1 §3.5)
Facts: Three levels are required: unit tests for rules, API and database integration tests for persistence and permissions, and UI or end-to-end tests for selected journeys. Tests must run in CI. Stub-only or mock-only persistence does not count as evidence. The tools follow the stack (D-22).
- A. The stack's usual test runner for unit and API tests against a real test database, and Playwright for the browser journeys.
- B. The same unit and API setup as A, and Cypress for the browser journeys.
- C. The same unit and API setup as A, and component-level UI tests (for example Testing Library) in Sprint 1, with a browser journey test added later.
- Other: your own answer.

### D-35 Recording each student's part
Source: assignment.md Q47 (GWS §2; L5 R-11)
Facts: Both students must take part in requirements, testing, AI supervision, implementation, review and deployment. Permanent roles such as "one writes specs, one writes code" are not allowed. Contributions are recorded in Issues, commits, PR author and review, and a contribution table. Pair work is allowed if both names are in the Issue or PR.
- A. Each Issue has one assignee, and the other student reviews its PR. The assignee alternates between areas.
- B. Pair work on most Issues, with both names in the Issue and PR, and one student as author and the other as reviewer.
- C. Each area (requirements, tests, implementation, review, deployment) is split by sprint, so each student covers every area across the three sprints.
- Other: your own answer.

## Answered while writing the docs

These section 10 items are document work. They follow from the answers above and are written in the named doc. No question is asked.

| Q | What it asks | Written in |
|---|---|---|
| Q4 | Which ambiguities go to the TA, which the team decides | `docs/srs.md` (assumptions and decisions). The TA list is in "Ask the TA" below |
| Q15 | Business rules and how each is tested | `docs/srs.md` (BR), `docs/traceability.md` |
| Q17 | FR, BR and NFR with stable IDs | `docs/srs.md` |
| Q19 | Features per requirement, sprint that builds and verifies each | `docs/features.md`, `docs/traceability.md` |
| Q22 | Definition of Done for a feature and the product | `docs/sprints/` (contracts) |
| Q26 | Entities, fields, relationships, constraints, ownership links | `docs/system-sds.md` (from D-06 to D-18) |
| Q27 | Database setup, migration and seed | `docs/system-sds.md`, README (after D-22) |
| Q28 | Shared UI states (validation, loading, empty, error) | `docs/system-sds.md` (after D-25) |
| Q30 | Role and permission matrix | `docs/system-sds.md` (roles are fixed. D-16 to D-18 fill in the cells) |
| Q33 | Seeded accounts per role, passwords kept out of code and shared privately | `docs/system-sds.md`, README |
| Q34 | What "another user's protected data" means and how it is tested | `docs/srs.md` (BR), `docs/sprints/` (AC, after D-18) |
| Q35 | Environment variables, which are secret, source of each value | `docs/system-sds.md`, `.env.example` |
| Q38 | Health and readiness endpoint, smoke test contents | `docs/system-sds.md`, `docs/labs/lab-05/deployment.md` |
| Q39 | Commands to build, test, migrate, seed and run | README |
| Q40 | CI steps, required check name, protected branches | `docs/labs/lab-05/deployment.md`. The check shape is D-32. Which branches are gated is T-5 |
| Q41 | Release procedure, running-commit identification, bad-release handling | `docs/labs/lab-05/deployment.md` |
| Q44 | AC to test ID to actual test, and failing-first evidence | `docs/traceability.md`, `docs/sprints/` |
| Q46 | Issues, board, labels, links from Issues to features and contracts | Fixed by GWS §5.3, L5 R-10 and `docs/agents/`. The board is set up in a chore Issue |
| Q48 | AI-use declaration | `docs/ai-use.md` (format fixed by `CLAUDE.md`) |
| Q49 | Evidence per PDF part and where it is kept | `docs/report.md`, `docs/sprints/` |

Section 10 questions answered by a D- question: Q1 D-01; Q2 D-02; Q3 D-03; Q5 D-19; Q6 D-04, D-05; Q7 D-06; Q8 D-07, D-08; Q9 D-09, D-10; Q10 D-12; Q11 D-13, D-14; Q12 D-15; Q13 D-16, D-17; Q14 D-18; Q16 D-10, D-11; Q18 D-21; Q20 D-20; Q21 D-19; Q23, Q24 D-22; Q25 D-23; Q28 D-25; Q29 D-24; Q31 D-26, D-27, D-28; Q32 D-26; Q36 D-29; Q37 D-30; Q42 D-31; Q43 D-34; Q47 D-35. Q45 is fixed (ADR 0001) with T-1 open. Open point O-1 is D-01, O-13 is fixed, O-14 is D-32 and O-16 is D-33.

## Ask the TA

The team cannot settle these. They are open points in the handouts. Collect them and ask the TA or instructor once. Record each reply in `docs/srs.md` or an ADR.

| ID | Question for the TA | From |
|---|---|---|
| T-1 | One `staging` branch for all sprints, or one per sprint? ADR 0001 proposes one | O-2; Q45 |
| T-2 | How long may the final demo video be: 4 minutes (FD Part E) or 10 minutes (FD §2, GWS §9)? | O-3 |
| T-3 | Is the final video worth 8 points with a separate one-page release summary (GWS §9) or 10 points with no summary (FD)? | O-4 |
| T-4 | What must the final video and the final PDF contain where GWS §9 and FD disagree? | O-5, O-6 |
| T-5 | Must the merge gate cover PRs into `staging`, or only `main`? Does the ruleset include the default branch, which is `staging` here? How many approvals are required? | O-9, O-10, O-11 |
| T-6 | Lab 5 sits in the 3 and 5 Nov workshop but needs an accepted Sprint 1 release due 8 Nov. What is the real order? | O-7 |
| T-7 | Is there a Lab 6 and Lab 7 handout? When? | O-8 |
| T-8 | How do we ask for agreement on an alternative Sprint 1 slice or a brief ambiguity, and how long does a reply take? | O-15; D-19 |
| T-9 | May student IDs be left out of the PDF and given only on LEB2, given the repository is public? | O-16; D-33 |
| T-10 | Which GCP access method applies: the instructor's announced method or a personal Gmail Free Trial? | O-12 |
