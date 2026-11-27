// TC-156 (F-14, Issue #153): a database at the v1.5 migrations, with goals and entries, is moved across the GoalTarget migration.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, cp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { computeProgress } from '../src/services/progress-rules.js';
import { listGoals } from '../src/services/goal.js';
import { bangkokToday } from '../src/services/goal-rules.js';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate disposable test database required.');
const run = promisify(execFile);
const prismaDir = fileURLToPath(new URL('../prisma/', import.meta.url));
const prismaCli = fileURLToPath(new URL('../node_modules/prisma/build/index.js', import.meta.url));
const LAST_V15_MIGRATION = '20261127000100_entry_several_per_day';

test('TC-156: the GoalTarget migration keeps every goal row, gives each goal one version from its start date, and keeps progress', async () => {
  const schemaName = `tc156_${randomBytes(4).toString('hex')}`;
  const url = new URL(process.env.TEST_DATABASE_URL); url.searchParams.set('schema', schemaName);
  const dir = await mkdtemp(join(tmpdir(), 'tc156-'));
  const migrate = () => run(process.execPath, [prismaCli, 'migrate', 'deploy', '--schema', join(dir, 'schema.prisma')], { env: { ...process.env, DATABASE_URL: url.href } });
  const db = new PrismaClient({ datasources: { db: { url: url.href } } });
  try {
    await cp(join(prismaDir, 'schema.prisma'), join(dir, 'schema.prisma'));
    await cp(join(prismaDir, 'migrations', 'migration_lock.toml'), join(dir, 'migrations', 'migration_lock.toml'));
    const all = (await readdir(join(prismaDir, 'migrations'), { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).sort();
    assert.ok(all.some(n => n > LAST_V15_MIGRATION), 'a migration after v1.5 exists');
    for (const name of all.filter(n => n <= LAST_V15_MIGRATION)) await cp(join(prismaDir, 'migrations', name), join(dir, 'migrations', name), { recursive: true });
    await migrate();
    // v1.5-shaped data, written with raw SQL as v1.5 stored it: three goals with decimal targets, past, running and future.
    const today = bangkokToday();
    await db.$executeRawUnsafe(`INSERT INTO "User" (username, display_name, role, password_hash) VALUES ('m', 'M', 'MANAGER', 'unused'), ('p', 'P', 'PARTICIPANT', 'unused')`);
    await db.$executeRawUnsafe(`INSERT INTO "Template" (name, unit, min_value, max_value, created_by) SELECT n, 'u', 0, 24, id FROM "User", (VALUES ('A'), ('B'), ('C')) v(n) WHERE username = 'm'`);
    await db.$executeRawUnsafe(`INSERT INTO "Goal" (participant_id, template_id, daily_target, start_date, end_date)
      SELECT u.id, t.id, v.target, DATE '${today}' + v.s, DATE '${today}' + v.e FROM "User" u, "Template" t,
      (VALUES ('A', 7.5, -20, -3), ('B', 8, -6, 10), ('C', 2.25, 4, 9)) v(n, target, s, e) WHERE u.username = 'p' AND t.name = v.n`);
    await db.$executeRawUnsafe(`INSERT INTO "Entry" (goal_id, entry_date, value) SELECT g.id, g.start_date + n, 7.49 + n * 0.01 FROM "Goal" g, generate_series(0, 2) n`);
    const readGoals = () => db.$queryRawUnsafe(`SELECT id, participant_id, template_id, daily_target::text AS t, start_date::text AS s, end_date::text AS e, created_at::text AS c FROM "Goal" ORDER BY id`);
    const goalsBefore = await readGoals();
    const entries = await db.$queryRawUnsafe(`SELECT goal_id, entry_date::text AS d, value::float AS v FROM "Entry"`);
    const progressBefore = goalsBefore.map(g => computeProgress({ startDate: g.s, endDate: g.e, dailyTarget: Number(g.t) },
      entries.filter(e => e.goal_id === g.id).map(e => ({ entryDate: e.d, value: e.v })), today));
    // Every current migration, which includes the GoalTarget one.
    for (const name of all) await cp(join(prismaDir, 'migrations', name), join(dir, 'migrations', name), { recursive: true });
    await migrate();
    assert.deepEqual(await readGoals(), goalsBefore, 'Goal rows are identical');
    const rows = await db.$queryRawUnsafe(`SELECT goal_id, effective_from::text AS f, daily_target::text AS t FROM "GoalTarget" ORDER BY goal_id`);
    assert.deepEqual(rows, goalsBefore.map(g => ({ goal_id: g.id, f: g.s, t: g.t })), 'one version per goal, from its start date, with its daily_target');
    const [{ id: participantId }] = await db.$queryRawUnsafe(`SELECT id FROM "User" WHERE username = 'p'`);
    const after = await listGoals(db, { id: participantId });
    assert.deepEqual(goalsBefore.map(g => after.find(x => x.id === g.id).progress), progressBefore, 'same progress');
    assert.ok(progressBefore.some(p => p.daysMet > 0) && progressBefore.some(p => p.daysSoFar > p.daysMet), 'fixture has met and missed days');
    // The new table refuses a second version for one goal and date.
    await assert.rejects(db.$executeRawUnsafe(`INSERT INTO "GoalTarget" (goal_id, effective_from, daily_target) VALUES ($1, DATE '${goalsBefore[0].s}', 3)`, goalsBefore[0].id));
  } finally {
    await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`).catch(() => {});
    await db.$disconnect();
    await rm(dir, { recursive: true, force: true });
  }
});
