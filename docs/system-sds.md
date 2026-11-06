# System Design Specification

Part C of Deliverable 1 (Issue #6). The design is built from the ADRs (`docs/adr/`) and the requirements in `docs/srs.md`. Each section cites its source. Where no ADR or SRS line settles a point, the design gives a **proposal** and lists it in section 8.2 as an open point for the students (S-1 to S-14). Nothing here changes a requirement or an ADR. Per-feature detail (exact request and response shapes, acceptance criteria) belongs to the Sprint 1 contracts (Part E).

## 1. Overview

### 1.1 What this document covers
How the Habit Tracker is built: the stack and components, the data model, the screens and API conventions, who may do what, how login and sessions work, and how the app is configured and later deployed. It covers the whole product. Sprint 1 (the handout's slice) is marked where the design differs by sprint.

### 1.2 Design at a glance
| Topic | Decision | Source |
|---|---|---|
| Stack | Node.js, Express, React with Vite, Prisma, PostgreSQL | ADR 0023 |
| Shape | One container: the API serves the built frontend. A modular monolith | ADR 0024 |
| API | REST over JSON, standard status codes, JSON error body with a code and message | ADR 0025 |
| Layout | One layout for everyone; menu items follow the role | ADR 0026 |
| Sessions | A session row in the database; an HTTP-only cookie holds the session ID; logout deletes the row | ADR 0027 |
| Session length | 8 hours from login | ADR 0028 |
| Passwords | bcrypt (the `bcryptjs` package) | ADR 0029 |
| Day | A calendar date in Asia/Bangkok for every user | ADR 0006 |
| Goal state | Derived from dates, never stored | ADR 0012 |
| Hosting | GCP reference stack with the kit defaults | ADR 0030 |
| Tests | Unit and API tests against a real test database; Playwright for browser journeys | ADR 0035 |

### 1.3 Constraints from the course
Real UI, API, then persistent database; data survives a restart and a redeploy (GWS §5.1). Roles are enforced on the backend, never by a hidden control or a client-chosen user ID (GWS §5.2). Docker, CI and GCP come in Lab 5, so Sprint 1 is designed for them but does not need them. No real secret in Git, the image, logs or the PDF (L5 §4.3).

## 2. Architecture

### 2.1 Components
| Component | Responsibility | Talks to |
|---|---|---|
| Browser app (React, built with Vite) | Screens, form validation for fast feedback, calling the API. Holds no business rule that the server does not also enforce | API over HTTPS, same origin |
| API (Express, Node.js) | Authentication, authorization, every business rule (BR-01 to BR-15), request validation, serving the built frontend files | Database through Prisma |
| Database (PostgreSQL) | Durable storage, constraints (unique, foreign key, check), migrations | API only |
| Test database | A separate PostgreSQL database that the test suite resets and seeds | API tests |

```mermaid
flowchart LR
  B["Browser<br/>React app"] -- "HTTPS, JSON,<br/>session cookie" --> A["API (Express)<br/>rules + auth<br/>serves built UI"]
  A -- "Prisma" --> D[("PostgreSQL")]
  subgraph one["One container (ADR 0024)"]
    A
  end
```

### 2.2 Where business rules are enforced
The API enforces every rule. The frontend may repeat a rule to show a message sooner, but a request that breaks a rule is refused by the API whatever the frontend does (GWS §5.2; SRS 6.1). Inside the API a request passes through these steps:

1. Session check: read the cookie, load the session row, refuse with 401 if it is missing or expired.
2. Role check: refuse with 403 if the role may not use the route.
3. Ownership check: for goal and entry routes, the record's participant must be the session user.
4. Validation: shape and types of the input.
5. Rule check: date, range, uniqueness and state rules (section 3.4).
6. Write through Prisma, with database constraints as the last guard.

The user ID for any action comes from the session, never from the request body or the URL.

### 2.3 Time and dates
"Today" is computed on the server as a calendar date in Asia/Bangkok (BR-02, ADR 0006). Dates are stored as plain `DATE` values with no time part, so there is no time-zone field and no per-user setting.

### 2.4 Code layout (proposal, S-1)
The Lab 5 kit expects a `client/` folder and a `server/` folder, each with `package.json`, `npm ci`, `npm test` and `npm run build`; Prisma migrations and a seed script (`npm run prisma:seed`) in `server/`; and a server that starts with `node dist/index.js` and reads `PORT` (KIT README). The design follows that layout. Inside `server/src/`: routes (HTTP only), services (rules), and a thin data layer (Prisma).

## 3. Data Design

### 3.1 Entities
Sprint 1 entities are User, Session, Template, Goal and Entry. Later sprints add to them (3.5). Names and types are a proposal (S-2); the relationships and constraints come from the SRS and ADRs.

```mermaid
erDiagram
  USER ||--o{ SESSION : "has"
  USER ||--o{ GOAL : "owns (Participant)"
  USER ||--o{ TEMPLATE : "creates (Manager)"
  TEMPLATE ||--o{ GOAL : "used by"
  GOAL ||--o{ ENTRY : "has"
```

### 3.2 Fields and constraints
**User** (seeded; no self-registration, ADR 0004)
| Field | Type | Constraint | Note |
|---|---|---|---|
| id | integer or UUID | primary key | S-2 |
| username | text | unique, not null | Login name; seeded account names are open (SRS A-9) |
| display_name | text | not null | Shown by "who am I" (FR-03) |
| role | `PARTICIPANT` or `MANAGER` | not null | One role per account (GWS §5.2) |
| password_hash | text | not null | bcrypt hash only (NFR-01) |
| created_at | timestamp | not null | |

**Session** (ADR 0027, ADR 0028)
| Field | Type | Constraint | Note |
|---|---|---|---|
| id | random text, at least 128 bits | primary key | The value in the cookie. Not guessable |
| user_id | reference to User | not null, on delete cascade | |
| created_at | timestamp | not null | |
| expires_at | timestamp | not null | `created_at` plus 8 hours; not extended by activity |

**Template** (ADR 0007, ADR 0017)
| Field | Type | Constraint | Note |
|---|---|---|---|
| id | integer or UUID | primary key | |
| name | text | not null | Unique name is open (S-4) |
| unit | text | not null | Free text; spelling is not checked (ADR 0007) |
| min_value | decimal | not null | Per entry |
| max_value | decimal | not null, `min_value < max_value` | Database check (BR-03) |
| state | `ACTIVE` or `RETIRED` | not null, default `ACTIVE` | Retire is built in Sprint 2 (FR-08); the column exists from the start |
| created_by | reference to User | not null | The Manager who created it |
| created_at | timestamp | not null | |

**Goal** (ADR 0010, ADR 0012)
| Field | Type | Constraint | Note |
|---|---|---|---|
| id | integer or UUID | primary key | |
| participant_id | reference to User | not null | Ownership link. Set from the session, never from the request |
| template_id | reference to Template | not null | |
| daily_target | decimal | not null, greater than 0 | Whether it must lie inside the template range is open (SRS A-4) |
| start_date | date | not null | |
| end_date | date | not null, `end_date >= start_date` | Database check |
| created_at | timestamp | not null | |

The goal's state (Active or Ended) is not a column. It is computed from the dates (ADR 0012, BR-06).

**Entry** (ADR 0005, ADR 0008)
| Field | Type | Constraint | Note |
|---|---|---|---|
| id | integer or UUID | primary key | |
| goal_id | reference to Goal | not null, on delete restrict | Ownership follows the goal's participant |
| entry_date | date | not null | |
| value | decimal | not null | Range checked against the template (BR-03) |
| created_at | timestamp | not null | |
| | | **unique (goal_id, entry_date)** | One entry per goal per day (BR-04). The database enforces it even under two requests at once |

### 3.3 Ownership links
- A Goal belongs to one Participant (`participant_id`). An Entry belongs to that Participant through its Goal. This is what makes "a Participant sees only their own data" (BR-10) a single check.
- A Template belongs to no Participant. Any Manager may see it; whether a Manager may change another Manager's template is not settled (S-5).
- A Manager has no link to a Participant's Goal or Entry, so there is nothing for a Manager to be granted (ADR 0019, no sharing).

### 3.4 Where each rule lives
| Rule | Enforced by | Test (traceability) |
|---|---|---|
| BR-01 entry date today or earlier, inside the goal period | Service (needs the goal and "today") | TC-24 to TC-26 |
| BR-02 day is an Asia/Bangkok date | Service computes "today" | TC-27 |
| BR-03 value inside the template range; min below max | Service for the entry range; database check for min below max | TC-10, TC-28 |
| BR-04 one entry per goal per day | Database unique constraint, mapped to a 409 | TC-29 |
| BR-05 one active goal per template per Participant | Service, inside a transaction (S-6) | TC-21 |
| BR-06 goal state from dates | Computed; no stored state | TC-22, TC-30 |
| BR-07 progress is days met | Computed from entries | TC-31 |
| BR-08 edit a template only while no goal uses it | Service (checks for goals on the template) | TC-12, TC-13 |
| BR-09, BR-10 role and ownership | Role and ownership checks (2.2) | TC-17, TC-18, TC-33 to TC-35 |

### 3.5 Planned additions (later sprints)
| Sprint | Addition | Source |
|---|---|---|
| 2 | Goal versions: each change of the daily target is a new row with an effective-from date, so earlier days keep the old target. The Sprint 1 `daily_target` column then moves to the version rows | ADR 0011, BR-12 |
| 2 | Entry edit and delete | ADR 0009, BR-11 |
| 2 | Template retire (the `state` column is already there) | ADR 0017, FR-08 |
| 3 | Reminder time and weekdays per goal (stored, nothing is sent) | ADR 0016, BR-14 |
| 3 | Streaks: computed from entries and goal versions, never stored | ADR 0015 |

Progress, streaks and calendar colours are computed from entries each time, so an edit needs no extra update step (ADR 0009).

### 3.6 Database setup, migrations and seed data
- **Setup:** PostgreSQL 16 (the kit's version). The connection comes only from `DATABASE_URL` (section 7).
- **Migrations:** Prisma migrations, applied with `prisma migrate deploy`. They are additive only (add tables or columns), so an older image still works after a rollback (SG Ep. 0.4). Each migration is committed with the feature that needs it.
- **Seed:** a script that is safe to run twice (the kit's `npm run prisma:seed`). It creates synthetic data only: one Manager, at least two Participants (the cross-account tests need two), and a few templates. Seeded passwords are read from environment variables, never written in code or the repository (SG Ep. 2.2). Account names are open (SRS A-9).
- **Tests:** the test suite uses its own database and resets it before each run (ADR 0035).

## 4. Interface Design

### 4.1 Screens and navigation
One layout for everyone: a top bar with the user's name, the role's menu items and a Log out control (ADR 0026, FR-22). The menu only hides what a role cannot use; the API still checks every request.

| Screen | Role | Sprint | Source |
|---|---|---|---|
| Login | everyone | 1 | FR-01 |
| Template list: a table (name, unit, min-max, active or retired) with New and Edit. Retire appears in Sprint 2 | Manager | 1 | FR-06, ADR 0043 |
| Template form (create and edit) | Manager | 1 | FR-05, FR-07 |
| Templates: active templates, read-only | Participant | 1 | FR-09, ADR 0018 |
| Goals page: the Participant's goals with computed progress. A plain page in Sprint 1 | Participant | 1 | FR-10, FR-12; SRS A-3 |
| New goal form: template dropdown, daily target, start and end dates | Participant | 1 | FR-10, ADR 0049 |
| Record a day: a number box with the unit shown, per goal | Participant | 1 | FR-11, ADR 0039 |
| Month calendar with a side panel for the chosen day (today at start): every goal with a number box and its current streak | Participant | 2 | FR-15, ADR 0037, ADR 0047 |
| Calendar colours: green all met, yellow some met, red none met, grey nothing recorded | Participant | 2 | FR-16, ADR 0040, ADR 0045, ADR 0046 |
| Calendar and List switch (list is newest first, for the same month) | Participant | 2 | FR-19, ADR 0041, ADR 0048 |
| Goal detail page with the best streak | Participant | 3 | FR-20, ADR 0042 |
| Reminder settings on a goal | Participant | 3 | FR-21 |

Sprint 1 does not build the calendar; the calendar becomes the Participant's first screen in Sprint 2 (SRS A-3). The look is plain, with colour only on the calendar (ADR 0044). Desktop is designed first, and the screens also work at 375 px wide (ADR 0038, NFR-05).

### 4.2 Shared UI behaviour
| State | Behaviour |
|---|---|
| Validation | A rule message is shown next to the field or the form. The text comes from the API error's `message`. The frontend may check the same rule first |
| Loading | While a request runs, the control that sent it is disabled and a loading indicator is shown. Nothing is shown as saved until the API answers |
| Empty | Each list has a plain sentence when it has no rows (for example "No templates yet"), and the New button stays visible for the role that can create |
| Error | A failed request shows one clear message and keeps the user's input. A 401 returns the user to the login screen. A 5xx shows a generic message with no technical detail |
| Keyboard and colour | Every action works with the keyboard alone, and a colour is never the only signal of a state (NFR-06) |

Exact wording of the messages is set in each feature contract.

### 4.3 API conventions (ADR 0025)
- REST over JSON. Paths start with `/api`. Resource names are plural nouns.
- **Status codes:** 200 and 201 for success; 204 for success with no body; 400 for input that fails validation; 401 for no valid session; 403 for a valid session whose role may not do this; 404 for a record that does not exist or (for another Participant's record) is not visible to the caller (S-7); 409 when a rule about uniqueness or state refuses the request (for example a second entry on the same day); 500 for a server fault.
- **Error body:** `{ "error": { "code": "ENTRY_ALREADY_EXISTS", "message": "..." } }`. `code` is a stable name tests can check; `message` is plain language for the user.
- **Validation:** every request body, parameter and query is validated on the server before any rule runs. Unknown fields are ignored or refused, never stored. The validation library is open (S-8).
- **Safe errors:** responses never carry a stack trace, SQL, file path, secret or another user's data. The full detail goes to the server log only. Login failures give the same message for an unknown user and a wrong password.
- **Dates and numbers:** dates are `YYYY-MM-DD` strings (Asia/Bangkok dates); values are numbers.

### 4.4 Endpoints (proposal, S-9)
Exact shapes belong to the feature contracts. Roles are in section 5.

| Method and path | Purpose | Sprint | FR |
|---|---|---|---|
| `GET /api/health` | Process is up | 1 | kit smoke test |
| `GET /api/ready` | 200 when the database answers, 503 when it does not | 1 | kit smoke test |
| `POST /api/auth/login` | Log in, set the session cookie | 1 | FR-01 |
| `POST /api/auth/logout` | Delete the session row, clear the cookie | 1 | FR-02 |
| `GET /api/auth/me` | Name and role of the session user | 1 | FR-03 |
| `GET /api/templates` | Participant: active templates. Manager: all | 1 | FR-06, FR-09 |
| `POST /api/templates` | Create a template | 1 | FR-05 |
| `PATCH /api/templates/:id` | Edit a template that no goal uses | 1 | FR-07 |
| `POST /api/templates/:id/retire` | Retire a template | 2 | FR-08 |
| `GET /api/goals` | The caller's own goals, each with progress | 1 | FR-10, FR-12 |
| `POST /api/goals` | Create a goal for the caller | 1 | FR-10 |
| `POST /api/goals/:id/entries` | Record a value for a day | 1 | FR-11 |
| `GET /api/goals/:id/entries` | List the entries of the caller's goal | 1 | FR-12, FR-13 |
| `PATCH` and `DELETE /api/goals/:id/entries/:entryId` | Edit or delete an entry | 2 | FR-17 |
| `PATCH /api/goals/:id` | Change the daily target from today on | 2 | FR-18 |

## 5. Roles and Permissions

Two roles, one per account: Participant and Manager (GWS §5.2, GWS §6.8). A request with no valid session is "anonymous". The permissions below are enforced by the API (section 2.2); a hidden control is not authorization.

### 5.1 Role / Permission Matrix
| Operation | Anonymous | Participant | Manager | Records it may touch |
|---|---|---|---|---|
| Log in | allowed | allowed | allowed | own account |
| Log out, who am I | 401 | allowed | allowed | own session |
| View templates | 401 | active only, read-only | all | all templates |
| Create a template | 401 | 403 | allowed | |
| Edit a template | 401 | 403 | allowed while no goal uses it | any template |
| Retire a template (Sprint 2) | 401 | 403 | allowed | any template |
| Create a goal | 401 | allowed | 403 | for self only |
| View goals and progress | 401 | own goals only | 403 | only records with `participant_id` equal to the session user |
| Record an entry | 401 | on own goal only | 403 | only goals owned by the session user |
| View entries | 401 | own only | 403 | only entries of own goals |
| Edit or delete an entry (Sprint 2) | 401 | own only | 403 | only entries of own goals |

Rules behind the matrix:
- **Ownership:** a Participant's goals and entries are private. Another Participant and any Manager are refused (BR-10, ADR 0019). A Manager sees templates only.
- **No client-chosen identity:** the acting user is always the session user. A request field such as `participant_id` is ignored or refused (GWS §5.2).
- **Test cover:** NFR-02 asks that every protected endpoint has a test for 401 and for the wrong role (TC-08); NFR-03 asks for cross-account tests with two Participants and a Manager (TC-33, TC-34).

## 6. Authentication and Session Lifecycle

### 6.1 Credentials
Accounts are seeded; there is no self-registration or password recovery (ADR 0004). Passwords are stored only as bcrypt hashes (ADR 0029, NFR-01). Seed passwords come from environment variables and are never in code, Git, logs or screens.

### 6.2 Login
1. The browser sends `POST /api/auth/login` with the username and password.
2. The API looks up the user and compares the password with the bcrypt hash. An unknown user and a wrong password give the same 401 and the same message, and create no session (FR-01).
3. On success the API creates a Session row with a random ID and `expires_at` = now plus 8 hours (ADR 0028), and sets a cookie holding that ID.

### 6.3 Session cookie
HTTP-only, so page scripts cannot read it (ADR 0027, NFR-04). Also proposed: `Secure` in production, `SameSite=Lax`, path `/`, and no `Max-Age` beyond the 8 hours (S-10). The cookie holds only the random session ID, never user data.

### 6.4 Every protected request
The API reads the cookie, loads the Session row, and refuses with 401 if the row is missing or `expires_at` has passed. The 8 hours run from login and are not extended by activity (ADR 0028). Expired rows are removed when found, and also by a periodic clean-up (S-11).

### 6.5 Current user
`GET /api/auth/me` returns the name and role of the session user, or 401 (FR-03).

### 6.6 Logout
`POST /api/auth/logout` deletes the Session row and clears the cookie. The old cookie value no longer gives access, even if it is replayed (FR-02, NFR-04, TC-03).

### 6.7 Why a database session
A redeploy or a new container does not log users out, and logout really ends the session (ADR 0027, SG Ep. 2.2). No session data lives in server memory.

### 6.8 Cross-site requests (S-12)
A cookie session needs protection against cross-site requests. Proposed: `SameSite=Lax`, JSON-only bodies, and a refusal of state-changing requests whose `Origin` is not the app's own origin. The exact mechanism is open.

## 7. Configuration and Deployment Plan

### 7.1 Environment variables (proposal, S-13)
Every setting comes from the environment. `.env` is never committed; `.env.example` holds placeholders only (L5 R-02, R-12). Names follow the kit; the table is the design baseline and is finalised in `docs/labs/lab-05/deployment.md`.

| Variable | Purpose | Secret | Local source | GCP source |
|---|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | yes | `server/.env` | Secret Manager |
| `PORT` | Port the server listens on (3000) | no | `server/.env` | Cloud Run sets it |
| `NODE_ENV` | `development`, `test` or `production` | no | npm scripts | Cloud Run setting |
| `SEED_MANAGER_PASSWORD` | Password for the seeded Manager | yes | `server/.env` | Secret Manager |
| `SEED_PARTICIPANT_PASSWORD` | Password for the seeded Participants | yes | `server/.env` | Secret Manager |
| `SEED_DEMO_DATA` | Whether the seed also loads demo templates | no | `server/.env` | Cloud Run setting |
| `VITE_API_URL` | API base URL for the dev frontend only | no | `client/.env` | not used (same origin) |

The container listens on `PORT` at `0.0.0.0`, keeps no data on its own disk and reads every setting from the environment (SG Ep. 3.3).

### 7.2 Secret handling
- No secret in Git, the image, logs, screenshots or the PDF. `.gitignore` already covers `.env`, `*.pem`, `*.key` and `service-account*.json`.
- Runtime secrets live in GCP Secret Manager. Pipeline settings live in GitHub environment variables and secrets. GitHub signs in to GCP with Workload Identity Federation, not a key file (SG Ep. 0.4).
- Seeded passwords are shared with testers privately, not in the repository (D1 §4.4).
- If a secret is ever pushed: change it at once, redeploy and tell a TA (L5 §4.3).

### 7.3 Database configuration
Local: a PostgreSQL 16 instance reached through `DATABASE_URL`; how a student starts it before Lab 5 is open (S-14). GCP: Cloud SQL for PostgreSQL 16, `db-f1-micro`, storage auto-increase off, reached by Cloud Run through the connection name (ADR 0030, KIT `deploy.sh`).

### 7.4 Planned GCP deployment (Lab 5; ADR 0030 to ADR 0033)
| Part | Plan |
|---|---|
| Image | One Docker image: the API plus the built frontend, port 3000, non-root user (ADR 0024) |
| Registry | Artifact Registry. The image tag is the full commit SHA, and the service is deployed by image digest |
| Run | Cloud Run: minimum 0, maximum 3 instances, region `asia-southeast1`, public access for the demo |
| Database | Cloud SQL for PostgreSQL 16, smallest tier. Data lives here, so it survives a restart and a redeploy |
| Migrations | A separate job runs `prisma migrate deploy` before the service is updated; migrations are additive only |
| Secrets | Secret Manager for `DATABASE_URL` and the seed passwords |
| CI | GitHub Actions, one job `test-and-docker`, the single required check, on every PR into `staging` and `main` (ADR 0033) |
| Release | Only `main` deploys. The reviewed release PR is the gate; there is no extra approval step (ADR 0032). A smoke test runs after each deploy (read-only, no admin account) |
| Rollback | Redeploy an earlier image SHA; the database is not rolled back |
| Ownership | phittayanan creates and owns the GCP project and adds projectnewy as Editor (ADR 0031) |

The kit's names (`toktickit`, `toktickit-migrate`, `toktickit-pg`, `toktickit-runner`, `toktickit-deployer`) are replaced everywhere by this project's names in Lab 5. The kit's smoke test calls `/api/categories`, which this app does not have; it will check `/api/health`, `/api/ready` and `/`, with an optional login as a seeded Participant (S-9).

Sprint 1 itself needs only the local setup: install, migrate, seed, run and test, documented in the README. Docker and GCP are due in Lab 5.

## 8. Key Design Decisions

### 8.1 Decisions this design rests on
| Decision | ADR |
|---|---|
| Kit stack, one container, REST over JSON | 0023, 0024, 0025 |
| One layout; roles checked on the backend | 0026; GWS §5.2 |
| Database sessions, 8 hours, bcrypt | 0027, 0028, 0029 |
| Fixed Asia/Bangkok day | 0006 |
| Free-text unit with a per-entry range | 0007 |
| One entry per goal per day | 0008 |
| Daily-target goal with start and end dates; one active goal per template | 0010 |
| Goal state from dates, not stored | 0012 |
| Progress as days met | 0013 |
| Template edit only while unused; retire | 0017 |
| No sharing; a Manager sees templates only | 0019 |
| Sprint 1 is the handout slice; later split | 0020, 0021 |
| GCP reference stack; no approval step; one CI job | 0030, 0032, 0033 |
| Tests at three levels against a real database | 0035 |

### 8.2 Open points for the students
Nothing below is decided. Each needs an answer from the students (or the TA) before the matching contract is final.

| ID | Open point | Affects |
|---|---|---|
| S-1 | Folder layout: the design follows the kit (`client/`, `server/`). Confirm | 2.4 |
| S-2 | Primary key type (integer or UUID), field and table names, decimal precision for values and targets | 3.2 |
| S-3 | Whether a goal can be deleted at all. The SRS has no goal delete and goals only end by date; entries use `on delete restrict`, so a goal with entries cannot be removed | 3.2 |
| S-4 | Whether `name` on Template must be unique | 3.2 |
| S-5 | Whether a Manager may edit or retire a template made by another Manager | 3.3, section 5 |
| S-6 | How BR-05 is enforced under two requests at once: a transaction in the service, or a database rule on overlapping goal periods | 3.4 |
| S-7 | For another Participant's record: answer 404 (hides that it exists) or 403. The SRS accepts either (BR-10) | 4.3, section 5 |
| S-8 | Which library validates request input | 4.3 |
| S-9 | Endpoint names and paths in 4.4 are proposals; the smoke-test check (SRS A-9 for seeded accounts) | 4.4, 7.4 |
| S-10 | Cookie flags beyond HTTP-only: `Secure`, `SameSite` | 6.3 |
| S-11 | Clean-up of expired sessions: on access only, or also on a schedule | 6.4 |
| S-12 | Protection against cross-site requests (6.8) | 6.8 |
| S-13 | Final environment variable names and the `.env.example` contents | 7.1 |
| S-14 | How a student runs PostgreSQL locally before Lab 5 (an installed server or the kit's Compose file) | 7.3 |

The SRS open points (A-1 to A-11) and the TA questions (T-1 to T-10) still apply to the parts of this design they affect: A-1 to the progress calculation, A-4 to the goal form, A-9 to the seed, T-5 to the merge gate in 7.4.
