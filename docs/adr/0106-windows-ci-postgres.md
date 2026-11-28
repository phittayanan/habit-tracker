# 0106. The Windows CI job gets PostgreSQL 16 from a pinned action, in its own workflow, required only after v2.1

Status: option A proposed by phittayanan and agreed by projectnewy in [Issue #164](https://github.com/phittayanan/habit-tracker/issues/164) on 2026-11-28, with the condition that the job becomes a required check only after the `v2.1` release. The runner label, the separate workflow file and the follow-up Issue for the required check were chosen by phittayanan on 2026-11-28 in the Claude Code session for #164.

## Context

#164 adds a Windows job that runs the server tests (`npm test` in `server/`) against PostgreSQL 16, because TC-89 passed the Linux CI in PR #146 and failed on Windows.

- GitHub-hosted Windows runners cannot run service containers, which the Linux job uses for PostgreSQL ([GitHub docs](https://github.com/github/docs/blob/main/data/reusables/actions/docker-container-os-support.md)). The official `postgres` image has no Windows build ([official-images](https://github.com/docker-library/official-images/blob/master/library/postgres)). So PostgreSQL must run as a Windows program in the job.
- The PostgreSQL already on the Windows images is 17 (`windows-2025`) or 14 (`windows-2022`), not 16 ([Windows 2025 image](https://github.com/actions/runner-images/blob/main/images/windows/Windows2025-VS2026-Readme.md)).
- `deploy.yml` runs `ci-docker.yml` as its `test` job, and `deploy` waits for it. A job added to `ci-docker.yml` would also have to pass before every deploy to `main`.

## Decision

1. **PostgreSQL 16:** the action [`ikalnytskyi/action-setup-postgres`](https://github.com/ikalnytskyi/action-setup-postgres) `v9`, pinned to commit `325155bfd7807b2a21ac9c2c7bb9b9a6eacc44df`, with `postgres-version: "16"`. On Windows it installs PostgreSQL 16 with Chocolatey (retrying failed downloads), runs `initdb` and starts the server. If the action stops being maintained or becomes unreliable, we replace it with our own `choco install postgresql16` step (option B).
2. **Own workflow file:** the job `server-tests-windows` lives in `.github/workflows/ci-windows.yml`, on pull requests into `main` and `staging` and by hand, not in `ci-docker.yml`. Deploys to `main` do not wait for it.
3. **Runner:** `windows-2025`, not `windows-latest`, so the image changes only when we change the label.
4. **Required check:** not required until `v2.1` is released. After that release, the repository owner adds `server-tests-windows` to the required checks on `staging`, tracked in its own Issue. Until then a failing Windows job shows on the PR but does not block the merge.

## Options considered

- **A. The pinned action (chosen).** One step; third-party code from a small one-maintainer project, pinned to a commit.
- B. Our own `choco install postgresql16` step. Same result; we write and keep the setup and retry script.
- C. Our own step with the EDB zip binaries. Exact minor version; longest script, download links are file ids kept by hand.
- D. The PostgreSQL on the runner. Not version 16.

For the job's place: in `ci-docker.yml` with deploys also waiting for it (against the condition above), or in `ci-docker.yml` with a condition that skips it when `deploy.yml` calls it (harder to read, since deploys run on push and by hand).

## Consequences

- Every PR into `staging` or `main` also runs the server tests on Windows. A, B and C all download PostgreSQL from EDB, so a rare download failure fails the job; re-running it fixes that.
- The Issue's scope line names `ci-docker.yml`; the job is in `ci-windows.yml` instead, for the reason in point 2.
- Until the follow-up Issue is done, a Windows failure must be read by the reviewer; nothing stops the merge.
