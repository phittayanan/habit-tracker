// TC-89 (Lab 7, Issue #140): a database at the v1.4 migrations, with entries, is moved across the Lab 7 migration.
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

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate disposable test database required.');
const run = promisify(execFile);
const prismaDir = fileURLToPath(new URL('../prisma/', import.meta.url));
// The CLI runs through Node, not the .bin shim, so execFile also works on Windows (review of PR #146).
const prismaCli = fileURLToPath(new URL('../node_modules/prisma/build/index.js', import.meta.url));
const LAST_V14_MIGRATION = '20261109000100_entry';

test('TC-89: the Lab 7 migration keeps every entry row, removes the unique goal+day index and keeps delete-restrict', async () => {
  const schemaName = `tc89_${randomBytes(4).toString('hex')}`;
  const url = new URL(process.env.TEST_DATABASE_URL); url.searchParams.set('schema', schemaName);
  const dir = await mkdtemp(join(tmpdir(), 'tc89-'));
  const migrate = () => run(process.execPath, [prismaCli, 'migrate', 'deploy', '--schema', join(dir, 'schema.prisma')], { env: { ...process.env, DATABASE_URL: url.href } });
  const db = new PrismaClient({ datasources: { db: { url: url.href } } });
  try {
    // 1. Only the migrations that v1.4 shipped.
    await cp(join(prismaDir, 'schema.prisma'), join(dir, 'schema.prisma'));
    await cp(join(prismaDir, 'migrations', 'migration_lock.toml'), join(dir, 'migrations', 'migration_lock.toml'));
    const all = (await readdir(join(prismaDir, 'migrations'), { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).sort();
    for (const name of all.filter(n => n <= LAST_V14_MIGRATION)) await cp(join(prismaDir, 'migrations', name), join(dir, 'migrations', name), { recursive: true });
    await migrate();
    // 2. v1.4-shaped data: one entry per goal and day, on several goals and days (raw SQL, as v1.4 stored it).
    await db.$executeRawUnsafe(`INSERT INTO "User" (username, display_name, role, password_hash) VALUES ('m', 'M', 'MANAGER', 'unused'), ('p', 'P', 'PARTICIPANT', 'unused')`);
    await db.$executeRawUnsafe(`INSERT INTO "Template" (name, unit, min_value, max_value, created_by) SELECT 'Sleep', 'hours', 0, 24, id FROM "User" WHERE username = 'm'`);
    await db.$executeRawUnsafe(`INSERT INTO "Goal" (participant_id, template_id, daily_target, start_date, end_date) SELECT u.id, t.id, 8, DATE '2026-11-01', d FROM "User" u, "Template" t, (VALUES (DATE '2026-11-30'), (DATE '2026-11-20')) v(d) WHERE u.username = 'p'`);
    await db.$executeRawUnsafe(`INSERT INTO "Entry" (goal_id, entry_date, value) SELECT g.id, DATE '2026-11-01' + n, 7.25 + n FROM "Goal" g, generate_series(0, 2) n`);
    const read = () => db.$queryRawUnsafe(`SELECT id, goal_id, entry_date::text AS d, value::text AS v, created_at::text AS c FROM "Entry" ORDER BY id`);
    const before = await read();
    assert.equal(before.length, 6);
    // 3. Every current migration, which includes the Lab 7 one.
    for (const name of all) await cp(join(prismaDir, 'migrations', name), join(dir, 'migrations', name), { recursive: true });
    await migrate();
    assert.deepEqual(await read(), before, 'the rows are identical');
    const indexes = await db.$queryRawUnsafe(`SELECT indexdef FROM pg_indexes WHERE schemaname = $1 AND tablename = 'Entry'`, schemaName);
    const onGoalDay = indexes.map(i => i.indexdef).filter(d => d.includes('(goal_id, entry_date)'));
    assert.equal(onGoalDay.some(d => d.startsWith('CREATE UNIQUE')), false, `no unique goal+day index: ${onGoalDay}`);
    assert.equal(onGoalDay.length, 1, 'one non-unique goal+day index');
    const [{ id: goalId }] = await db.$queryRawUnsafe(`SELECT goal_id AS id FROM "Entry" ORDER BY id LIMIT 1`);
    await db.$executeRawUnsafe(`INSERT INTO "Entry" (goal_id, entry_date, value) VALUES ($1, DATE '2026-11-01', 1)`, goalId);
    await assert.rejects(db.$executeRawUnsafe(`DELETE FROM "Goal" WHERE id = $1`, goalId), 'a goal with entries cannot be deleted');
  } finally {
    await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`).catch(() => {});
    await db.$disconnect();
    await rm(dir, { recursive: true, force: true });
  }
});
