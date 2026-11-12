# Deployment guide (Lab 5)

Version 1, Lab 5 step 2 (Issue #48), written before any container, pipeline or GCP resource existed. Version 2, Lab 5 step 3 (Issue #49), adds section 7 (Docker). Sections marked "set in step N" are completed in that step. No secret value is written here, only names and where each value comes from.

## 1. Stack and how it differs from the starter kit

| Part | This project | Difference from the kit |
|---|---|---|
| Server | Node.js 22.16+ (checked on 24.14.0 and 26.8.1), Express 5, plain JavaScript | No TypeScript build. `server/scripts/build.js` copies `server/src/` to `server/dist/`; `npm start` runs `dist/index.js` |
| Database access | Prisma 6.19, PostgreSQL 16, migrations in `server/prisma/migrations/` | Prisma 6 (not the kit's version); migrations run with `prisma migrate deploy` |
| Client | React 19 with Vite 8, built to `client/dist/` | The built client is served by the API process (same origin); Vite only runs in development, where it proxies `/api` to port 3000 |
| Packaging | One container with the API and the built client (ADR 0024) | Same plan as the kit; the Docker files were added in step 3 (section 7) |
| Sessions | Rows in the `Session` table (ADR 0027) | Nothing is kept in server memory |

Sources: SDS sections 7.1 and 7.4, ADR 0023, 0024, 0027, 0030.

## 2. Environment variables

Every setting comes from the environment. Locally the npm scripts load `server/.env` (`node --env-file-if-exists=.env`). In a container there is no `.env` file; the platform supplies the values. This table was checked against `git grep process.env` and `env(` on the commit of the Lab 5 step 2 PR (the command and its output are in that PR).

### 2.1 Read by the application

| Variable | Purpose | Secret | Local source | GCP source | Read at |
|---|---|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | yes | `server/.env` | Secret Manager (set in step 5) | `server/prisma/schema.prisma:7`; the Prisma client in `server/src/index.js` and `server/prisma/seed.js` |
| `PORT` | Port the server listens on; default 3000. It binds `0.0.0.0` | no | `server/.env` (optional) | Cloud Run sets it | `server/src/index.js:6` |
| `NODE_ENV` | `production` makes the session cookie `Secure`; any other value does not | no | not set by any npm script; set it in `server/.env` only to try the production cookie | Cloud Run setting `production` | `server/src/services/session.js:7` |
| `SEED_MANAGER_PASSWORD` | Password of the seeded Manager (`manager1`); required by the seed | yes | `server/.env` | Secret Manager (set in step 5) | `server/prisma/seed.js:4` |
| `SEED_PARTICIPANT_PASSWORD` | Password of the seeded Participants (`participant1`, `participant2`); required by the seed | yes | `server/.env` | Secret Manager (set in step 5) | `server/prisma/seed.js:5` |
| `SEED_DEMO_DATA` | `true` also seeds three demo templates; any other value or unset seeds accounts only | no | `server/.env` (optional) | Cloud Run setting (set in step 5) | `server/prisma/seed.js:15` |

### 2.2 Tests only (never set on GCP)

| Variable | Purpose | Secret | Where used |
|---|---|---|---|
| `TEST_DATABASE_URL` | A separate disposable database. The test suites refuse it if it equals `DATABASE_URL` | yes (it can hold a password) | `server/test/*.test.js`, `client/test/*.spec.js`, `client/test/serve.js` |
| `TEST_SERVER_PORT` | Port of the test server started by Playwright; default 33132 | no | `client/test/serve.js:19` |
| `PLAYWRIGHT_OUTPUT_DIR` | Where Playwright writes artifacts; needed on Windows (no `/tmp`) | no | `client/playwright.config.js:6` |
| `PLAYWRIGHT_CHANNEL` | Use installed Chrome (`chrome`) instead of the downloaded Chromium | no | `client/playwright.config.js:8` |

Two server tests set `process.env.TZ = 'UTC'` inside the test file to prove the date rules do not use the machine zone. That is not a setting the application reads.

### 2.3 Not used

`VITE_API_URL` was listed in SDS 7.1 as an API base URL for the development client. Nothing in `client/` reads it: the client calls relative `/api` paths and Vite proxies them (`client/vite.config.js`). It is not a variable of this project and has no entry in `.env.example`.

## 3. Commands

Run from the repository root. POSIX shell syntax (on Windows use Git Bash). See the README for first-time setup and the Windows notes.

| Step | Command | Where |
|---|---|---|
| Install | `npm ci` | `client/`, then `server/` |
| Build client | `npm run build` | `client/` (writes `client/dist/`) |
| Build server | `npm run build` | `server/` (writes `server/dist/`) |
| Generate Prisma client | `npm run prisma:generate` | `server/` |
| Migrate | `npm run prisma:migrate` (`prisma migrate deploy`) | `server/`, needs `DATABASE_URL` |
| Seed | `npm run prisma:seed` | `server/`, needs both seed passwords; safe to run again |
| Run | `npm start` | `server/`, serves the API and the built client on `PORT` |
| Develop | `npm run dev` in `server/` and in `client/` | Vite proxies `/api` to port 3000 |
| Test (server) | `npm test` | `server/`, needs `TEST_DATABASE_URL` and a migrated disposable database, and the client built first |
| Test (browser) | `npm test` | `client/`, same database; run after the server tests, not at the same time |
| Health check | `GET /api/health` (process up) | any running instance |
| Readiness check | `GET /api/ready` (200 if PostgreSQL answers, 503 if not) | any running instance |

The seed updates the three seeded accounts' password hashes from the current environment each time it runs, so running it again with new passwords changes those accounts' passwords.

## 4. Cloud-readiness check (SG Episode 2.2)

| # | Check | Result | Where |
|---|---|---|---|
| 1 | No uploaded files kept in a local folder | Already OK: the app has no upload feature and writes no file at run time | `git grep` for `upload`, `multer`, `writeFile`, `createWriteStream` in `server/src` and `client/src` finds nothing |
| 2 | Seed safe to run again; demo passwords come from environment variables | Already OK | `server/prisma/seed.js:27` and `:33` use `upsert`; passwords from `server/prisma/seed.js:4-5` |
| 3 | No development shortcut in production | Already OK: the test routes exist only when a test harness passes `registerTestRoutes`; `server/src/index.js` never does | `server/src/app.js:11` and `:26`; the login page has no default password (`client/src/App.jsx`) |
| 4 | Sessions in the database, not in memory | Already OK | `Session` model, `server/prisma/schema.prisma:32` |
| 5 | Port from `PORT`, not bound to localhost only | Already OK | `server/src/index.js:6` |
| 6 | Readiness endpoint returns 503 if the database cannot be reached | Behavior already OK; an automated test is added in this step | `server/src/app.js:17-20`; `server/test/ready.test.js` |

Not verified in this step: how the Origin check (`server/src/middleware/auth.js:29`, which compares the request's `Origin` host with its `Host` header) behaves behind Cloud Run. It is checked on the public URL in step 5.

## 5. GCP project

| Item | Value |
|---|---|
| Project ID | `habit-tracker0cpe334` (Issue #47) |
| Region | `asia-southeast1` (ADR 0030) |
| Artifact Registry, Cloud SQL instance, database, Cloud Run service, secrets, runtime service account | set in step 5 |
| GitHub environment, Workload Identity Federation, deployer service account | set in step 6 |

No project number, key, password or connection string is recorded in this file.

## 6. Release procedure

Completed in step 7: how a merge from `staging` into `main` is deployed, and how to find the running commit.

## 7. Docker

Added in step 3 (Issue #49) from the Lab 5 starter kit's 7 files. Local only: nothing here is pushed to a registry or deployed. GCP values come in step 5.

### 7.1 Files and what changed from the kit

| File | Used by | Change from the kit |
|---|---|---|
| `Dockerfile` (root) | CI and Cloud Run in later steps; one image with the API and the built client on `PORT` 3000 | No `VITE_API_URL` (the client reads none). The server is built with `npm run build` (copies `src/` to `dist/`). `server/src/app.js` finds `/app/client/dist` from `/app/server/dist` without a change |
| `.dockerignore` | Root build context | None |
| `docker-compose.yml` | Local run: `db`, `migrate`, `server`, `client` | Names are `habit-tracker-*`. `migrate` reads `SEED_MANAGER_PASSWORD`, `SEED_PARTICIPANT_PASSWORD` and `SEED_DEMO_DATA` from `server/.env`; no password is written in the file (the kit's `ADMIN_PASSWORD`/`DEMO_USER_PASSWORD` defaults are removed). `db` publishes no host port |
| `server/Dockerfile` | `migrate` and `server` services | No `COPY tsconfig.json` (there is none); copies `scripts/` and builds with `npm run build` |
| `server/docker-entrypoint.sh` | Both server images | Comment only; still ends with `exec "$@"` |
| `client/Dockerfile` | `client` service (nginx) | Copies only `index.html`, `vite.config.js` and `src/`: the root `.dockerignore` does not apply to the `./client` context, so the kit's `COPY . .` copied a local `node_modules` and `dist` into the build. No `VITE_API_URL` |
| `client/nginx.conf` | `client` service | `proxy_set_header Host $http_host` instead of `$host`, so the port reaches the server. The Origin check (`requireOrigin`, `server/src/middleware/auth.js:29`) compares the `Origin` host, port included, with `Host`; with `$host` sign-in through `:5173` returned 403 `ORIGIN_NOT_ALLOWED` |

Sign-in works both through the nginx client on `http://localhost:5173` and through the server on `http://localhost:3000`, which also serves the built client.

### 7.2 Settings

| Setting | Where it comes from | Notes |
|---|---|---|
| `SEED_MANAGER_PASSWORD`, `SEED_PARTICIPANT_PASSWORD` | `server/.env` (copied from `server/.env.example`), read by `migrate` through `env_file` | No fallback. If either is missing the seed stops, `migrate` exits 1 and `server` does not start |
| `SEED_DEMO_DATA` | `server/.env` | `true` also seeds the three demo templates |
| `DATABASE_URL` | Built in `docker-compose.yml` from the `POSTGRES_*` values; it replaces the local URL in `server/.env` inside the containers | Points at the `db` container |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Shell or a root `.env`; otherwise the fallbacks in `docker-compose.yml` | The fallbacks are for a throwaway database on your own computer only. Whether a committed local fallback is acceptable is an open review question (Issue #49) |
| `NODE_ENV`, `PORT`, `TZ` | `docker-compose.yml` and the Dockerfiles | `NODE_ENV=production`, so the session cookie is `Secure`; Chrome accepts it on `http://localhost` |

No Dockerfile `ARG` or `ENV` holds a secret.

### 7.3 Commands

Run from the repository root. Docker must be running and ports 3000 and 5173 free.

| Step | Command |
|---|---|
| Settings | `cp server/.env.example server/.env`, then set the two `SEED_*` passwords (and `SEED_DEMO_DATA=true` for demo templates) |
| Build and start | `docker compose up --build -d` |
| Check | `docker compose ps -a` (`db`, `server`, `client` up; `migrate` `Exited (0)`) |
| Health and readiness | `curl --fail http://localhost:3000/api/health` and `curl --fail http://localhost:3000/api/ready` (`curl.exe` in PowerShell) |
| Open | `http://localhost:5173` (nginx) or `http://localhost:3000` |
| Logs | `docker compose logs migrate` or `docker compose logs server` |
| Look in the database | `docker compose exec db psql -U habit_tracker -d habit_tracker` |
| Stop (data kept) | `docker compose down` |
| Stop and delete the data | `docker compose down -v` |
| Root image only | `docker build .` |

Windows line endings: `.gitattributes` sets `*.sh text eol=lf`, so `server/docker-entrypoint.sh` stays LF even with `core.autocrlf=true`. Without it, Git for Windows writes CRLF, the `#!/bin/sh\r` line cannot run in the Linux container, and `migrate` exits 255 with `exec ./docker-entrypoint.sh: no such file or directory`. A clone made before this file existed, or an old working copy, keeps the CRLF file until the file is checked out again; a fresh clone straight onto the branch (`git clone -b <branch>`) is the simple way.

### 7.4 Checks run in step 3 (Issue #49)

Run on macOS with Docker Desktop (Docker 29.7.2, Compose 5.5.0) and headless Chrome 157. Passwords were generated fake values and are not in any output.

| Check | Result | Commit |
|---|---|---|
| Kit files as copied | `docker compose build server` failed: `"/tsconfig.json": not found` | `28d53f2` |
| Sign-in through `:5173` with the kit's `Host $host` | 403 `ORIGIN_NOT_ALLOWED`; through `:3000` 200 | `822cada` |
| Same with `Host $http_host` | 200, cookie `HttpOnly; Secure; SameSite=Lax` | `60c62e1` |
| `docker compose up --build -d` from an empty volume | `db`, `server`, `client` up; `migrate` `Exited (0)`; `curl --fail` on `/api/health` and `/api/ready` answer | `cfac799` |
| `Secure` cookie on `http://localhost:5173` in the browser | Stored and sent back (`GET /api/goals` 200 after sign-in) | `cfac799` |
| A missing seed password | `migrate` prints "Both SEED_MANAGER_PASSWORD and SEED_PARTICIPANT_PASSWORD are required." and exits 1 | `cfac799` |
| Persistence (R-04, local only; C-05 on GCP is separate) | A goal created as `participant1` is listed again after `docker compose down`, `docker compose up -d` and a new sign-in | `cfac799` |
| Root image | `docker build .` succeeds; it runs as `node`, serves `/`, `/login`, `/api/health` and `/api/ready` from `/app/client/dist` and `/app/server/dist` | `cfac799` |
| C-03 / TC-50: fresh clone | Empty folder, `git clone`, branch checked out, `server/.env` from `server/.env.example` with only its values filled (fake), `docker compose build --no-cache --pull`, `docker compose up -d`: all services up, `migrate` `Exited (0)`, both endpoints answer, `manager1` and `participant1` sign in. **27 seconds** from clone to sign-in (target 15 minutes, NFR-07). The base images were already on the machine, so their first download is not counted | `ad3300a` |
| Windows line endings (review of PR #70 by projectnewy, Windows 11, `core.autocrlf=true`) | Red at `68f4e13`: `server/docker-entrypoint.sh` checked out with CRLF, `migrate` Exited (255), `exec ./docker-entrypoint.sh: no such file or directory`. The same red reproduced on macOS with `git clone -c core.autocrlf=true`. | `68f4e13` |
| Same clone config after `.gitattributes` (`*.sh text eol=lf`) | Script is LF, `migrate` `Exited (0)`, `/api/health` and `/api/ready` answer, sign-in through `:5173` 200 (macOS, `autocrlf=true`; Windows is still the reviewer's check) | `daf6382` |

Not run here: Windows by the author (the reviewer's check), CI, any registry or GCP step.

## 8. Continuous integration (Lab 5 step 4, Issue #50)

Written before the workflow exists. Section 8.3 is filled in with the real runs once the workflow has run.

### 8.1 What it does

`.github/workflows/ci-docker.yml`, workflow name "CI & Docker Build", one job with the id `test-and-docker` (the job name the later required-check setting and the deploy workflow refer to; do not rename it).

| Item | Choice |
|---|---|
| Triggers | `pull_request` into `main` and into `staging`; `workflow_call` (the step 7 deploy workflow reuses it); `workflow_dispatch` (manual) |
| Permissions | `contents: read` only |
| Database | A PostgreSQL 16 service container with two databases: the application database and a separate test database (the tests refuse a `TEST_DATABASE_URL` equal to `DATABASE_URL`, `server/test/auth.test.js:18-19`). The database password is a throw-away value that exists only inside the job's service container |
| Seed passwords | Generated at run time (`openssl rand`) and masked in the log; no password is written in the workflow file |
| Runtimes | Node.js 24; Python 3.14 only for the offline deploy-script tests |
| Actions | Pinned to a commit SHA with the version in a comment |

### 8.2 Steps, in order

1. Check out the repository without keeping the token.
2. Set up Node.js 24 and Python 3.14.
3. Deploy scripts (`deploy/`, copied from the kit unchanged in this step): `bash -n` on the three scripts, the two stub tests and the Python smoke-test unit tests. They run offline and need no GCP access. They do nothing against GCP until step 5.
4. Client: `npm ci` and `npm run build`. The server's production-serving test needs `client/dist/index.html`, so this comes before the server tests.
5. Server: `npm ci`, create the test database, `prisma migrate deploy` on both databases, seed the application database with the generated passwords, `npm test` (the unit and API tests).
6. Browser tests: `npm test` in `client/` with `PLAYWRIGHT_CHANNEL=chrome` (the Google Chrome already installed on the runner, so no browser is downloaded; the README names Chrome as the browser the tests were verified with). It runs after the server suite because both reset the same test database. The first run with the downloaded Chromium failed 3 of 44 browser tests (see 8.3).
7. `docker build .` of the root `Dockerfile` (the image is not pushed).

A failing step fails the job. Failed runs are kept and not re-run over (R-10).

### 8.3 Runs (C-01, R-05)

All runs are kept (R-10).

| Run | Commit | Result |
|---|---|---|
| [43144991544](https://github.com/phittayanan/habit-tracker/actions/runs/43144991544) | `0a8280e`, downloaded Chromium | Deploy-script checks, client build and server suite (82 of 82) passed. Browser tests 41 passed, 3 failed: Goal TC-47/TC-48 at both widths (Issue #62) and the template edit page test at 375 px (a timeout while filling the login form). Docker build skipped |
| [43145730587](https://github.com/phittayanan/habit-tracker/actions/runs/43145730587) | `65fc246`, runner Chrome | Same, browser tests 42 passed, 2 failed (Goal TC-47/TC-48 only). Docker build skipped |

The Docker build step has not run in CI yet. The green run on the Issue #50 PR into `staging`, with its commit and counts, is added after Issue #62 is fixed and this branch is updated from `staging`. The run on a PR into `main` is added by the first release PR after this workflow is on `staging`.
