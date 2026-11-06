# habit-tracker

CPE 334 group project: Habit and Activity Tracking System.

## How we work

Two students build this project with Claude Code. The team rules (Issues, branches, PRs, reviews, spec and tests first) are in [CLAUDE.md](CLAUDE.md). The product docs are in [docs/](docs/).

## Setup

Auth backend is implemented for Issue #32 using Node.js, Express, Prisma and PostgreSQL 16. The React/Vite auth UI is pending design agreement; this is not yet the complete Sprint 1 application.

Use Node.js 22.16+ (or a newer supported release) and npm. Local verification so far used Node.js 26.8.1, npm 11.19.0 and PostgreSQL 16.15. Use a local PostgreSQL 16 instance; the SDS specifies the starter kit's Compose service, whose Docker delivery belongs to Lab 5. An already running local PostgreSQL 16 also works for this backend verification.

From `server/`:

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

The API listens on `PORT` (default 3000). `GET /api/health` checks the process; `GET /api/ready` checks PostgreSQL. The seed upserts `manager1`, `participant1`, `participant2`; it requires both seed-password variables, stores only bcrypt hashes, and updates hashes from the current environment on a second run. It creates no templates or other domain data.

For API/unit tests, use a **separate disposable database**: each API test deletes its User and Session rows and creates its own Manager and two Participants. Tests generate their passwords at runtime. Migrate that database before running tests (substitute its URL below):

```sh
DATABASE_URL='postgresql://YOUR_LOCAL_ROLE@localhost:5432/habit_tracker_test' npm run prisma:migrate
npm test
```

`npm test` uses `TEST_DATABASE_URL` from the environment or `.env` and refuses an absent URL or a URL identical to `DATABASE_URL`. Do not point it at an application database. `npm run dev` starts the source backend. Build output contains only server source, never test fixtures. Client install/build, browser tests and screenshots will be documented after the auth UI is approved and implemented.

Open limitations: failed-login limiting is excluded from Sprint 1 (OP-01.11); unknown-user timing mitigation OP-01.12 remains unapproved and unimplemented; OP-10.1 belongs to later privacy testing. Docker, CI and GCP verification are deferred to Lab 5. See [Auth implementation evidence](docs/auth-implementation-evidence.md) for actual checks and their limits.
