# Part E. Integrated release candidate {#part-e}

<!-- source: docs/deliverable-2/v2.0-release.md, v2.1-release.md and readiness-and-plan.md (PR #191, PR #200; owner projectnewy) -->

## E.1 Release candidate on `main` and its deployment {#e-1}

| Item | `v2.1` (candidate) | `v2.0` (Sprint 2 release) |
|---|---|---|
| Tag and commit | annotated `v2.1` on `9b09bfe` | annotated `v2.0` on `f510619` |
| Release PR (`staging` → `main`) | PR #198, author projectnewy, approved and merged by phittayanan | PR #189, author projectnewy, approved and merged by phittayanan |
| CI and deploy run | [46124923270](https://github.com/phittayanan/habit-tracker/actions/runs/46124923270): server 161 of 161; browser 126 passed, 6 skipped; smoke test passed | [46053447699](https://github.com/phittayanan/habit-tracker/actions/runs/46053447699): server 151 of 151; browser 120 passed, 6 skipped; smoke test passed |
| Cloud Run revision | `habit-tracker-00010-qsv`, 100% of traffic, page label `build 9b09bfe` | `habit-tracker-00009-xss`, page label `build f510619` |
| Image in Cloud Run | `sha256:ef347eb7…`, the image manifest exported by the deploy run's build | `sha256:599fef7c…`, the same link |
| Migration and backup | `20261127000400_goal_reminder` after backup `before-v2.1-release` | `template_kind` and `goal_target` after backup `before-v2.0-release` |

**How they match.** The page label shows the commit the image was built from; it equals the tagged commit and the commit of the deploy run, and the image digest in Cloud Run is the one that run built (each record, sections 1 and 3).

## E.2 Build, regression and CI output {#e-2}

| Run | Command | Commit | Result |
|---|---|---|---|
| Server suite, CI (Linux) | `npm test` in `server/` (`node --test --test-concurrency=1 test/*.test.js`) against PostgreSQL 16 | `9b09bfe` | 161 tests, 161 passed, 0 failed, 0 skipped |
| Browser suite, CI (Linux) | `npm test` in `client/` (Playwright, 375 px and 1280 px) | `9b09bfe` | 126 passed, 0 failed, 6 skipped (cases written for one width, skipped at the other) |
| Docker build, CI | `docker build` of the root `Dockerfile` | `9b09bfe` | success |
| Server suite, CI (Windows) | the same server command | `d5f968b` (same tree as `9b09bfe`) | 161 of 161 passed |
| Rule coverage, local (TC-51), unit files only | `node --experimental-test-coverage --test --test-concurrency=1 test/*-rules.test.js` | `9b09bfe` | 33 of 33 passed; line coverage `entry-rules.js` 81.94%, `goal-rules.js` 86.67%, the other three rule files 100%; `template.js` not loaded |
| Rule coverage, local (TC-51), whole server suite | `node --experimental-test-coverage --test --test-concurrency=1 test/*.test.js` | `9b09bfe` | 161 of 161 passed; every rule file 100%, `template.js` included |

**Excerpt 1: a cross-feature rule (F-12 with F-14), `server/test/calendar.test.js` at `v2.1`.** Setup: Water has target 8 from 30 days ago and Sleep 420 minutes; the Water target is changed to 6 from today. Both days get Water 7 and Sleep 420. A past day is judged against the target valid that day, so two days ago Water (7 of 8) is missed and today it (7 of 6) is met.

```js
test('TC-123 (API): a past day is judged against the target valid on that day', async () => {
  await db.entry.deleteMany();
  await db.goalTarget.create({ data: { goalId: w.id, effectiveFrom: asDate(day(0)), dailyTarget: 6 } });
  await db.goal.update({ where: { id: w.id }, data: { dailyTarget: 6 } });
  for (const date of [day(-2), day(0)]) {
    await entry(w, date, 7, new Date());
    await entry(s, date, 420, new Date());
  }
  assert.equal(await stateOf(day(-2)), 'SOME_MET');
  assert.equal(await stateOf(day(0)), 'ALL_MET');
});
```

Result on `9b09bfe`: passed. Red before its code: the F-12 server tests at `c9f4a68` gave 4 failures, TC-123 (API) among them (Part B.2).

**Excerpt 2: an access restriction (F-11, NFR-02, NFR-03), the same file.** Participant B asks for the calendar: only B's goals come back. A Manager gets 403 and an anonymous caller 401, also before any input check, and the route audit TC-08 lists the route as Participant-only.

```js
test('TC-121: B sees only own goals; Manager 403; anonymous 401; TC-08 lists the route', async () => {
  const res = await get('', cookies.b).expect(200);
  const goals = res.body.days.flatMap(item => item.goals);
  assert.ok(goals.length > 0);
  assert.ok(goals.every(g => g.goalId === bGoal.id));
  const asManager = await get('', cookies.manager);
  assert.equal(asManager.status, 403); assert.equal(asManager.body.error.code, 'FORBIDDEN');
  const anonymous = await request(app).get('/api/calendar');
  assert.equal(anonymous.status, 401); assert.equal(anonymous.body.error.code, 'UNAUTHENTICATED');
  // Session (401) and role (403) come before validation (400).
  assert.equal((await request(app).get('/api/calendar?month=abc')).status, 401);
  assert.equal((await get('?month=abc', cookies.manager)).status, 403);
  assert.deepEqual(protectedRoutes.find(route => route.path === '/api/calendar'), { method: 'get', path: '/api/calendar', roles: ['PARTICIPANT'] });
});
```

Two lines that check B's totals are left out above. Result on `9b09bfe`: passed. Red before its code: at `91a930e` the F-11 server tests gave 6 of 6 failures (Part B.2).

## E.3 Setup summary {#e-3}

From `README.md` and `docs/labs/lab-05/deployment.md` section 7. Synthetic data only; no real secret is in Git or in this PDF.

| Topic | Summary |
|---|---|
| Dependencies | Node.js 22.16 or newer with npm (CI uses Node 24), PostgreSQL 16; Playwright Chromium for the browser tests; Docker for the container setup |
| Environment variables (`server/.env`, from `server/.env.example`) | `DATABASE_URL`, `TEST_DATABASE_URL` (a separate disposable database), `PORT` (3000), `NODE_ENV` (`production` on GCP makes the cookie `Secure`), `SEED_MANAGER_PASSWORD`, `SEED_PARTICIPANT_PASSWORD`, optional `SEED_DEMO_DATA`. Example: `DATABASE_URL=postgresql://YOUR_LOCAL_ROLE@localhost:5432/habit_tracker` |
| Build and run | `client/`: `npm ci`, `npm run build`. `server/`: `npm ci`, `npm run prisma:generate`, `npm run prisma:migrate`, `npm run prisma:seed`, `npm run build`, `npm start`; open `http://localhost:3000/login` |
| Tests | `server/`: migrate the test database, then `npm test`. `client/`: `npx playwright install chromium`, then `npm test` |
| Migrations and seed | 8 additive Prisma migrations, applied with `prisma migrate deploy`; the seed is safe to run twice, creates the three accounts with passwords from the environment, and keeps existing templates (ADR 0053) |
| Docker | from the repository root: `docker compose up --build -d` (database, migrate, server, client); `docker compose down` to stop |
| Deployment | a push to `main` runs `.github/workflows/deploy.yml`: the full CI, an image build tagged with the commit, the migration job, the Cloud Run deploy and a smoke test (health, ready, build label). A rollback is a manual run with an earlier commit's image (Lab 5 deployment.md section 6) |

**Known gap.** `README.md` still names the Lab 7 release as the latest; bringing it up to date is a plan row (E.5).

## E.4 Post-deployment checks {#e-4}

### `v2.1` record

<!-- include: docs/deliverable-2/v2.1-release.md -->

### `v2.0` record

<!-- include: docs/deliverable-2/v2.0-release.md -->

## E.5 Readiness review and plan to 13 December {#e-5}

The plan below was written on 2026-11-28 before PR #186 merged; its first row (Sprint 1 continuity and change register, #159) is now done: PR #186 is merged and #159 is closed.

<!-- include: docs/deliverable-2/readiness-and-plan.md -->
