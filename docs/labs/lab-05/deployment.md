# Deployment guide (Lab 5)

Version 1, Lab 5 step 2 (Issue #48), written before any container, pipeline or GCP resource existed. Version 2, Lab 5 step 3 (Issue #49), adds section 7 (Docker). Version 3, Lab 5 step 5 (Issue #64), fills in section 5 with the GCP resources of the first deploy and adds section 9. Version 4, Lab 5 step 7 (Issue #80), writes section 6. Version 5 (Issue #85) fills in section 6.6 and corrects the digest comparison in section 6.3. Sections marked "set in step N" are completed in that step. No secret value is written here, only names and where each value comes from.

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
| `DATABASE_URL` | PostgreSQL connection string | yes | `server/.env` | Secret Manager `habit-tracker-database-url` (service and migration job) | `server/prisma/schema.prisma:7`; the Prisma client in `server/src/index.js` and `server/prisma/seed.js` |
| `PORT` | Port the server listens on; default 3000. It binds `0.0.0.0` | no | `server/.env` (optional) | Cloud Run sets it | `server/src/index.js:6` |
| `NODE_ENV` | `production` makes the session cookie `Secure`; any other value does not | no | not set by any npm script; set it in `server/.env` only to try the production cookie | Cloud Run setting `production` (service and migration job) | `server/src/services/session.js:7` |
| `SEED_MANAGER_PASSWORD` | Password of the seeded Manager (`manager1`); required by the seed | yes | `server/.env` | Secret Manager `habit-tracker-seed-manager-password` (migration job only) | `server/prisma/seed.js:4` |
| `SEED_PARTICIPANT_PASSWORD` | Password of the seeded Participants (`participant1`, `participant2`); required by the seed | yes | `server/.env` | Secret Manager `habit-tracker-seed-participant-password` (migration job only) | `server/prisma/seed.js:5` |
| `SEED_DEMO_DATA` | `true` also seeds three demo templates; any other value or unset seeds accounts only | no | `server/.env` (optional) | Cloud Run setting `true` on the migration job (step 5) | `server/prisma/seed.js:15` |

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

Step 5 (Issue #64): the owner signed in as `participant1` on the public URL, so the sign-in `POST` passed the Origin check behind Cloud Run.

## 5. GCP project

| Item | Value |
|---|---|
| Project ID | `habit-tracker0cpe334` (Issue #47) |
| Region | `asia-southeast1` (ADR 0030) |
| Artifact Registry repository | `habit-tracker` (Docker, `asia-southeast1`) |
| Image | `asia-southeast1-docker.pkg.dev/habit-tracker0cpe334/habit-tracker/habit-tracker`, tagged with the commit SHA |
| Cloud SQL instance | `habit-tracker-pg`: PostgreSQL 16, Enterprise edition, `db-f1-micro`, 10 GB SSD, storage auto-increase off, daily backup 03:00 UTC, zone `asia-southeast1-c` |
| Database and database user | `habit_tracker` and `habit_tracker` |
| Runtime service account | `habit-tracker-runner@habit-tracker0cpe334.iam.gserviceaccount.com`: project role `roles/cloudsql.client` only, and `roles/secretmanager.secretAccessor` on each of the three secrets below only |
| Secrets (Secret Manager) | `habit-tracker-database-url`, `habit-tracker-seed-manager-password`, `habit-tracker-seed-participant-password` |
| Migration job (Cloud Run job) | `habit-tracker-migrate`: `npx prisma migrate deploy && npm run prisma:seed`, `SEED_DEMO_DATA=true` |
| Cloud Run service | `habit-tracker`: public, minimum 0 and maximum 3 instances, 512 MiB, 1 CPU, port 3000 |
| Public URL | <https://habit-tracker-rfi4eg2u4q-as.a.run.app> |
| Cloud Build source bucket | `gs://habit-tracker0cpe334_cloudbuild` (made by `gcloud builds submit`) |
| GitHub environment, Workload Identity Federation, deployer service account | set in step 6 |

No project number, key, password or connection string is recorded in this file.

## 6. Release procedure

Written in step 7 (Issue #80, part of Issue #66) before the first release ran; section 6.6 holds the values of the first release (Issue #85).

### 6.1 What deploys and when

`.github/workflows/deploy.yml` runs on every push to `main` (a merged release PR) and by hand for a rollback. `main` is the only branch that deploys: the GitHub environment `demo` accepts `main` only, and the Workload Identity condition (Issue #65) accepts only this workflow file, the branch `main` and the environment `demo`. The deploy job must stay in `deploy.yml`; moving it into another workflow file makes the login fail.

| Step | What it does |
|---|---|
| `test` | Runs `ci-docker.yml` (job `test-and-docker`) again on the pushed commit |
| Validate | Stops if a variable is missing or the image tag is not a full 40-character commit |
| Login | `google-github-actions/auth` with the deployer service account; no key file |
| Build and push | `docker build` of the root `Dockerfile` with `--build-arg BUILD_SHA=<commit>`; pushed as `asia-southeast1-docker.pkg.dev/habit-tracker0cpe334/habit-tracker/habit-tracker:<commit>` |
| `deploy/release.sh` | Resolves the image to a `@sha256` digest, updates and runs the job `habit-tracker-migrate` (waits for it), updates the service `habit-tracker` with the same digest and sends 100% of traffic to the newest revision. A failed migration stops the script before the service changes |
| `deploy/smoke_test.py` | No sign-in (ADR 0052): `/api/health`, `/api/ready`, and the page `/` must contain the first 7 characters of the deployed commit |
| Summary | Commit, digest, URL and smoke result on the run page |

### 6.2 Release steps

1. Every feature PR is merged into `staging` first (required checks green, teammate review).
2. Check that `staging` contains `main`: `git fetch origin && git merge-base --is-ancestor origin/main origin/staging && echo yes`. If not, sync first with a small Issue and PR that merges `main` into `staging` (as Issue #77, PR #78). Every release PR leaves a merge commit on `main` that `staging` does not have, so this is needed after each release.
3. Open the release PR from `staging` into `main`. `Closes #N` does not work here (`main` is not the default branch); refer to the release Issue without a closing keyword. CI must be green on the final head.
4. The teammate who did not open the PR reviews it with a specific check and merges it with a merge commit.
5. The merge starts `Deploy` by itself. Read the run: the commit tag in the summary, the migration job, the smoke test. On the first run, read the `Rollback:` line in the summary: it must say `false`. If it says `true`, stop and fix the workflow before anything else, because a rollback skips the migration.
6. Tag `main` only after the run is green and the Cloud Run revision uses the commit that was merged (section 6.3). The tag for Lab 5 is `v1.1` (ADR 0052). A submitted tag never moves.
7. Record the tag, commit, run link and revision in section 6.6.

### 6.3 Find the running commit

| Where | How |
|---|---|
| The app | The login page and the top bar show `build <first 7 characters of the commit>`; the page source holds `<meta name="build" content="<7 characters>">`. A local run shows `build dev` |
| The run | The run summary lists the full commit tag and the image digest |
| Cloud Run | The newest revision of `habit-tracker` shows the digest of the linux/amd64 image. The run summary shows the digest of the image index that `docker push` uploaded; the amd64 image is listed inside that index. The two numbers are therefore not equal strings. To compare: in Artifact Registry open the digest from the run summary, tab Manifest, and check that the digest in the Cloud Run revision (Console revision details, or `gcloud run services describe habit-tracker --region asia-southeast1`, which a human runs) is one of the `manifests` entries with `linux/amd64`. The other entry is the build attestation |

### 6.4 Roll back

**Which commits can be a target.** Only a commit built by `deploy.yml` after PR #81: its image tag is the full 40-character commit and its page carries the build tag the smoke test looks for. The image running before the first release (tag `761a408`, from step 5) cannot be a target: its 7-character tag is rejected by the 40-character check, and its page has no build tag, so the smoke test would fail even if the service were pointed back. The first release therefore has no one-click way back. Before the release, the owner notes the digest of the running image outside Git, so it can be restored by hand in the Console if needed.

Run the workflow `Deploy` by hand on `main` and enter `image_tag` = the full 40-character commit of an image that is already in Artifact Registry. Tests, build and migration are skipped; only the service is pointed back at that image. The smoke test then expects that commit in the page.

A rollback does not undo a migration. If a migration after the target commit changed the schema in a way the older code cannot read, the older image can fail. Check the migrations between the two commits before a rollback.

### 6.5 Known limits

- The migration job runs the seed on every release. The seed overwrites the unit, minimum and maximum of the three demo templates and resets the three account passwords from the secrets (Issue #79). An edit to a demo template is lost on the next release until that Issue is fixed.
- `deploy/deploy.sh` and `deploy/teardown.sh` still use the `toktickit` names of the kit and are not used by the workflow. Section 9 records that `deploy.sh` was not run.
- `deploy/tests/test_deploy_workflow.py` matches text in `deploy.yml`. It guards against renames and a missing name or variable, but it does not prove the workflow works: only a run does.
- The workflow ran for the first time on 2026-11-13 (section 6.6).

### 6.6 First release (Lab 5 step 7, Issues #66 and #85)

Read on 13 Nov 2026 after the merge. The public URL is the one in section 5.

| Item | Value |
|---|---|
| Release PR | [#84](https://github.com/phittayanan/habit-tracker/pull/84), `staging` (`f57d634`) into `main`, merge commit, merged by projectnewy; the change PR into `staging` was [#81](https://github.com/phittayanan/habit-tracker/pull/81) (Issue #80), approved by projectnewy |
| Tag and commit on `main` | `v1.1` (annotated) on `723efb02a593b0d13912054cc4fc475ede1ecf5d`, the merge commit of #84. `v1.0` is unchanged |
| Deploy run | [43439782760](https://github.com/phittayanan/habit-tracker/actions/runs/43439782760), event `push` on `723efb0`: `test-and-docker` and `deploy` succeeded. The log shows `ROLLBACK: false`, so the migration job ran (a failed migration would have stopped `release.sh` before the service update; none did); the smoke test passed (`/api/health`, `/api/ready`, page with `build 723efb0`) |
| Image in Artifact Registry | Tag `723efb02a593b0d13912054cc4fc475ede1ecf5d` is the OCI image index `sha256:722c4bd0776a0a5dd44d90839888b6d39fadf8d91c734f2092152ed45710a8b9`. Its manifest lists the linux/amd64 image `sha256:374a5279f33b20d8b28219285eb29a3b1d856b8ba9de6e3a8cecb27fc72ff408` and an attestation `sha256:3cab102f0df639b0b691e383a880195cd15fac396820c09a474aec7e22070074` |
| Cloud Run revision | `habit-tracker-00002-ps9`, 100% of traffic ("to latest"), deployed by the deployer service account through gcloud; its image digest is `374a5279…`, the amd64 image inside the index above. The previous revision `habit-tracker-00001-q48` has 0% |
| Public URL | Health and readiness answered and the page source held `<meta name="build" content="723efb0">` on 2026-11-13 |
| Before and after screenshots | Kept by the owner and attached to the Issue #66 closing comment, not in the repository |

The Console pages (Cloud Run revisions, Artifact Registry digests and manifest) were read, read-only, in the owner's signed-in browser session by Claude in Chrome; no `gcloud` or other GCP command was run by an AI agent.

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
| [43176082352](https://github.com/phittayanan/habit-tracker/actions/runs/43176082352) | `5f660bf`, runner Chrome, no browser download | Same 42 passed, 2 failed (Goal TC-47/TC-48 only, Issue #62). Docker build skipped |
| [43182003625](https://github.com/phittayanan/habit-tracker/actions/runs/43182003625) | `daaafc2` (this branch after merging `staging` with the Issue #62 fix, PR #72) | **Green.** All steps passed: deploy-script checks, client build, server suite 82 of 82, browser tests 44 passed, Docker build (`docker build`, not pushed) |

The run on `daaafc2` is the green run on the Issue #50 PR into `staging` (C-01, staging side). The run on a PR into `main` is added by the first release PR after this workflow is on `staging`.

## 9. First deployment (Lab 5 step 5, Issue #64)

Done by hand in Cloud Shell on 13 Nov 2026 (00:00 to 00:35, +07), one command at a time, with the resource names in section 5. The kit's `deploy/deploy.sh` was not run: it still uses the TokTickIT names and secrets. The scripts in `deploy/` (`deploy.sh`, `release.sh`, `teardown.sh` and their tests) still use the `toktickit` names; step 7 (Issue #66) has to use the names in section 5.

### 9.1 What was deployed

| Item | Value |
|---|---|
| Commit | `761a408` on `staging` (merge of PR #71). `main` (`v1.0`) has no Docker files yet; the first release with them into `main` is step 7 (Issues #50, #66) |
| Image | `asia-southeast1-docker.pkg.dev/habit-tracker0cpe334/habit-tracker/habit-tracker:761a408`, built with Cloud Build from the root `Dockerfile` |
| Migration and seed | Job execution `habit-tracker-migrate-llqx2` succeeded: 4 migrations applied (`20261107000100_auth`, `20261108000100_template`, `20261108000200_goal`, `20261109000100_entry`); seed output "Seeded three accounts and three templates." The Reading, Walking and Water templates are sample data |
| Service | `habit-tracker`, `DATABASE_URL` from Secret Manager, `NODE_ENV=production`; the service does not get the seed passwords |

Passwords were generated with `openssl` and piped straight into Secret Manager; no password or connection string was typed, printed or written in a file.

### 9.2 Checks

| Check | Result |
|---|---|
| `curl --fail` on `/api/health` and `/api/ready` at the public URL | `{"status":"ok"}` and `{"status":"ready"}`; the home page returned HTTP 200 |
| Sign-in on the public URL | The owner signed in as `participant1` |
| Cloud SQL settings | `db-f1-micro`, 10 GB, `storageAutoResize: false`, `RUNNABLE` |
| Runtime service account roles | Project: `roles/cloudsql.client` only. Each secret: `roles/secretmanager.secretAccessor` for `habit-tracker-runner` only |
| Scaling | Minimum 0, maximum 3 (Console, Scaling) |
| Budget | `cpe334-lab5-alerts` still in place (alerts only) |

The screenshots (budget, Cloud SQL settings, signed-in public URL) are kept by the owner and go in the Issue #64 closing comment, not in the repository.

### 9.3 Delete after the course

Keep everything running until the instructor announces the end of grading (handout section 12). Save the evidence outside GCP first. Then delete, in this order:

1. Cloud Run service `habit-tracker`
2. Cloud Run job `habit-tracker-migrate`
3. Cloud SQL instance `habit-tracker-pg` (this also deletes the database and user `habit_tracker`); it costs money every hour it exists
4. Artifact Registry repository `habit-tracker` (all images)
5. Secrets `habit-tracker-database-url`, `habit-tracker-seed-manager-password`, `habit-tracker-seed-participant-password`
6. Service account `habit-tracker-runner` and its project role binding `roles/cloudsql.client`
7. Cloud Storage bucket `gs://habit-tracker0cpe334_cloudbuild`
8. The resources added in steps 6 and 7 (GitHub connection, deployer service account), listed in this file by those steps
9. Last: the budget `cpe334-lab5-alerts`, or shut down the project `habit-tracker0cpe334`
