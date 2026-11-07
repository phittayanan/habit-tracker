# habit-tracker

CPE 334 group project: Habit and Activity Tracking System.

## How we work

Two students build this project with Claude Code. The team rules (Issues, branches, PRs, reviews, spec and tests first) are in [CLAUDE.md](CLAUDE.md). The product docs are in [docs/](docs/).

## Setup

Auth F-01/F-02 is implemented for Issue #32, and template create/view F-03/F-06 for Issue #36, using React/Vite, Node.js, Express, Prisma and PostgreSQL 16. The approved package A provides login and the shared role bar. A Manager's first page lists templates and can create one. A Participant can read active templates. Goals stay an auth-only destination heading; template edit, retire, and later domain features come in later Issues.

Use Node.js 22.16+ (or a newer supported release) and npm. Local verification so far used Node.js 26.8.1, npm 11.19.0 and PostgreSQL 16.15. Use a local PostgreSQL 16 instance; the SDS specifies the starter kit's Compose service, whose Docker delivery belongs to Lab 5. An already running local PostgreSQL 16 also works for this backend verification.

The shell examples use POSIX syntax. On Windows, use Git Bash for `cp` and the inline environment assignments shown below; install Windows Node.js/npm and PostgreSQL and put their tools on PATH. Native PowerShell requires its own environment-variable syntax. For browser artifacts on Windows, set `PLAYWRIGHT_OUTPUT_DIR` to a writable absolute path such as `C:/Temp/habit-auth-playwright` instead of relying on `/tmp`. The seed tests use the current Node executable and an absolute seed-file path, avoiding an npm `.cmd` subprocess. Local checks ran on macOS 27.2; Windows and Git Bash execution have **not** been verified.

First, from `client/`:

```sh
npm ci
npm run build
```

Then, from `server/`:

```sh
npm ci
cp .env.example .env
```

Edit `.env`: set `DATABASE_URL` and `TEST_DATABASE_URL` with an explicit PostgreSQL username and two distinct databases. Create those databases using your local PostgreSQL tools and role before migrating. Replace both seed-password placeholders with private values. Never commit `.env` or share these values in logs or screenshots.

```sh
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run prisma:seed
npm run build
npm start
```

Open `http://localhost:3000/login` (or your configured `PORT`). The API serves the built client and supports direct visits to the contracted page addresses. `GET /api/health` checks the process; `GET /api/ready` checks PostgreSQL. The seed upserts `manager1`, `participant1`, `participant2`; it requires both seed-password variables, stores only bcrypt hashes, and updates hashes from the current environment on a second run. Set `SEED_DEMO_DATA=true` to also upsert three synthetic templates by name (`Reading`, `Walking`, and `Water`), owned by `manager1`. A second run updates those templates and does not add duplicates. Leave the variable unset to seed accounts only.

For API/unit tests, use a **separate disposable database**: each API test deletes its User and Session rows and creates its own Manager and two Participants. Tests generate their passwords at runtime. Migrate that database before running tests (substitute its URL below):

```sh
DATABASE_URL='postgresql://YOUR_LOCAL_ROLE@localhost:5432/habit_tracker_test' npm run prisma:migrate
npm test
```

`npm test` uses `TEST_DATABASE_URL` from the environment or `.env` and refuses an absent URL or a URL identical to `DATABASE_URL`. Do not point it at an application database. Build the client before server tests: the production-serving regression test checks actual built HTML. `npm run dev` starts the source backend. Build output contains only server source and client production assets, never test fixtures.

For Playwright, from `client/`, with the same migrated disposable test database:

```sh
npx playwright install chromium
TEST_DATABASE_URL='postgresql://YOUR_LOCAL_ROLE@localhost:5432/habit_tracker_test' npm test
```

The tests use Playwright's downloaded Chromium by default; set `PLAYWRIGHT_CHANNEL=chrome` to use installed Chrome (the locally verified browser). They start their own test server on port 33132, reset the test database between cases, and run at 375px and 1280px. Run server and client suites sequentially because they reset the same database. No plaintext fixture passwords are stored. Test results go to `/tmp/habit-auth-playwright` by default, or `PLAYWRIGHT_OUTPUT_DIR`.

For development, keep `npm run dev` in `server/` on port 3000 and run `npm run dev` in `client/`; Vite proxies `/api` to that backend. Production uses the built client served by Express, without Vite.

Open limitations: failed-login limiting is excluded from Sprint 1 (OP-01.11); OP-01.12 now performs a cost-10 dummy bcrypt comparison for an unknown username, with the same invalid-credentials response and no session (ADR 0051); comparable bcrypt work does not guarantee identical response times; OP-10.1 belongs to later privacy testing. Issue #36 does not build template edit, `PATCH`, the in-use refusal, or retire. The Manager Edit control is only a visible button. Docker, CI and GCP verification are deferred to Lab 5. See [Auth implementation evidence](docs/auth-implementation-evidence.md) and [Template implementation evidence](docs/template-implementation-evidence.md) for actual checks and their limits.
