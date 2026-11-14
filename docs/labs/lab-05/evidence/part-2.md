# Answer Part 2: Docker and Reproducible Configuration

**Files.** Root [`Dockerfile`](https://github.com/phittayanan/habit-tracker/blob/v1.3/Dockerfile) (multi-stage; one image serves the API and the built client on port 3000; runs as user `node`), [`.dockerignore`](https://github.com/phittayanan/habit-tracker/blob/v1.3/.dockerignore), [`docker-compose.yml`](https://github.com/phittayanan/habit-tracker/blob/v1.3/docker-compose.yml) with `server/Dockerfile` and `client/Dockerfile` for the local three-container run (database, `migrate`, server, client). Issue [#49](https://github.com/phittayanan/habit-tracker/issues/49), PR [#70](https://github.com/phittayanan/habit-tracker/pull/70).

**Configuration comes only from the environment.** [`server/.env.example`](https://github.com/phittayanan/habit-tracker/blob/v1.3/server/.env.example) holds fake values; `server/.env` is ignored by Git. The table of every variable (name, meaning, required or not, where it is set locally and on GCP) is section 2 of [`deployment.md`](https://github.com/phittayanan/habit-tracker/blob/v1.3/docs/labs/lab-05/deployment.md). On GCP the values come from Secret Manager and Cloud Run settings (sections 5 and 9). Two checks show that no secret is in the repository: the test `TC-44 / TC-45` (`server/test/auth.test.js`) runs `git grep` for the seed passwords it generated and fails if one is tracked, and the seed stops with an error when a password is missing (it exits 1, so the `migrate` container fails and the server does not start).

**C-03 (R-01), fresh clone builds and runs.** Section 7.4 of `deployment.md` records the checks per commit. In short: an empty folder, `git clone`, `server/.env` from `server/.env.example`, `docker compose build --no-cache --pull`, `docker compose up -d`; the services start, `migrate` exits 0, `/api/health` and `/api/ready` answer and `manager1` and `participant1` sign in, 27 seconds after the clone (target 15 minutes, NFR-07; macOS, Docker 29.7.2). The review of PR #70 by the teammate on Windows 11 with `core.autocrlf=true` found a real defect (shell scripts checked out with CRLF, `migrate` exited 255, commit `68f4e13`); the fix is `.gitattributes` (`*.sh text eol=lf`, commit `daf6382`) and the same clone then passed. Review: [CHANGES_REQUESTED](https://github.com/phittayanan/habit-tracker/pull/70#pullrequestreview-5863418894), then [APPROVED](https://github.com/phittayanan/habit-tracker/pull/70#pullrequestreview-5868245992).

**C-03 again on the submitted tag, on Windows.** On 14 November 2026 the same check was run on tag `v1.3` (commit `50f5605`), Windows 11, Docker 29.8.1, `core.autocrlf=true` (section 7.4 of `deployment.md`, last row). Output of the run, the two seed passwords not shown:

```
git -c core.autocrlf=true clone --branch v1.3 ...   HEAD 50f5605; docker-entrypoint.sh: POSIX shell script (LF)
server/.env made from server/.env.example (only the two seed passwords changed)
docker compose build --no-cache --pull              exit 0
docker compose up -d                                exit 0
SERVICE   STATE     STATUS
client    running   Up 25 seconds
db        running   Up 33 seconds (healthy)
migrate   exited    Exited (0) 26 seconds ago
server    running   Up 25 seconds
GET :5173/api/health  {"status":"ok"}     GET :5173/api/ready  {"status":"ready"}
POST :5173/api/auth/login (participant1)  200     GET /api/goals with the session  200
63 seconds from clone to sign-in (target 15 minutes, NFR-07; some base images were cached)
```
