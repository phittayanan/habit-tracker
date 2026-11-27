// Template kind, Count or Time (Issue #168; ADR 0064, ADR 0065): TC-118, TC-127, TC-128, TC-129.
import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, cp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';
import { bangkokToday } from '../src/services/goal-rules.js';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate disposable test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
const password = randomBytes(24).toString('base64url');
let app;
let users;
before(async () => { await db.$connect(); });
beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany();
  await db.session.deleteMany(); await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  users = {};
  for (const [username, role] of [['manager1', 'MANAGER'], ['participant1', 'PARTICIPANT']]) {
    users[username] = await db.user.create({ data: { username, displayName: username, role, passwordHash } });
  }
  app = createApp({ db });
});
after(async () => { await db.$disconnect(); });

const login = async username => {
  const response = await request(app).post('/api/auth/login').send({ username, password });
  assert.equal(response.status, 200);
  return response.headers['set-cookie'][0].split(';')[0];
};
const send = (method, path, cookie, body) => request(app)[method](path).set('Cookie', cookie).send(body);
const stored = async name => {
  const row = await db.template.findUnique({ where: { name } });
  return row && { unit: row.unit, minValue: Number(row.minValue), maxValue: Number(row.maxValue), kind: row.kind };
};
const makeTemplate = data => db.template.create({ data: { createdBy: users.manager1.id, ...data } });
const assertError = (response, status, code, message) => {
  assert.equal(response.status, status, JSON.stringify(response.body));
  assert.equal(response.body.error.code, code);
  if (message) assert.equal(response.body.error.message, message);
};

test('TC-118: a template made before the kind migration is COUNT and its other columns are unchanged', async () => {
  const run = promisify(execFile);
  const prismaDir = fileURLToPath(new URL('../prisma/', import.meta.url));
  const prismaCli = fileURLToPath(new URL('../node_modules/prisma/build/index.js', import.meta.url));
  const LAST_V15_MIGRATION = '20261127000100_entry_several_per_day';
  const schemaName = `tc118_${randomBytes(4).toString('hex')}`;
  const url = new URL(process.env.TEST_DATABASE_URL); url.searchParams.set('schema', schemaName);
  const dir = await mkdtemp(join(tmpdir(), 'tc118-'));
  const migrate = () => run(process.execPath, [prismaCli, 'migrate', 'deploy', '--schema', join(dir, 'schema.prisma')], { env: { ...process.env, DATABASE_URL: url.href } });
  const old = new PrismaClient({ datasources: { db: { url: url.href } } });
  try {
    await cp(join(prismaDir, 'schema.prisma'), join(dir, 'schema.prisma'));
    await cp(join(prismaDir, 'migrations', 'migration_lock.toml'), join(dir, 'migrations', 'migration_lock.toml'));
    const all = (await readdir(join(prismaDir, 'migrations'), { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).sort();
    for (const name of all.filter(n => n <= LAST_V15_MIGRATION)) await cp(join(prismaDir, 'migrations', name), join(dir, 'migrations', name), { recursive: true });
    await migrate();
    await old.$executeRawUnsafe(`INSERT INTO "User" (username, display_name, role, password_hash) VALUES ('m', 'M', 'MANAGER', 'unused')`);
    await old.$executeRawUnsafe(`INSERT INTO "Template" (name, unit, min_value, max_value, created_by) SELECT 'Sleep', 'hours', 0, 24, id FROM "User"`);
    const read = () => old.$queryRawUnsafe(`SELECT id, name, unit, min_value::text AS lo, max_value::text AS hi, state::text AS state, created_by, created_at::text AS made FROM "Template"`);
    const before = await read();
    for (const name of all) await cp(join(prismaDir, 'migrations', name), join(dir, 'migrations', name), { recursive: true });
    await migrate();
    assert.deepEqual(await read(), before);
    assert.deepEqual(await old.$queryRawUnsafe(`SELECT kind::text AS kind FROM "Template"`), [{ kind: 'COUNT' }]);
  } finally {
    await old.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`).catch(() => {});
    await old.$disconnect();
    await rm(dir, { recursive: true, force: true });
  }
});

test('TC-118: create defaults to COUNT; TIME stores unit minutes and whole numbers; a bad kind is refused', async () => {
  const cookie = await login('manager1');
  const reading = await send('post', '/api/templates', cookie, { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 500 });
  assert.equal(reading.status, 201);
  assert.equal(reading.body.template.kind, 'COUNT');
  assert.equal(reading.body.template.unit, 'pages');

  const sleep = await send('post', '/api/templates', cookie, { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 720, kind: 'TIME' });
  assert.equal(sleep.status, 201, JSON.stringify(sleep.body));
  assert.equal(sleep.body.template.kind, 'TIME');
  assert.equal(sleep.body.template.unit, 'minutes');
  assert.deepEqual(await stored('Sleep'), { unit: 'minutes', minValue: 0, maxValue: 720, kind: 'TIME' });

  const noUnit = await send('post', '/api/templates', cookie, { name: 'Walk', minValue: 0, maxValue: 90, kind: 'TIME' });
  assert.equal(noUnit.status, 201, JSON.stringify(noUnit.body));
  assert.equal(noUnit.body.template.unit, 'minutes');

  for (const body of [{ minValue: 0, maxValue: 90.5 }, { minValue: 0.5, maxValue: 90 }]) {
    assertError(await send('post', '/api/templates', cookie, { name: 'Nap', unit: 'x', kind: 'TIME', ...body }),
      400, 'VALIDATION_ERROR', 'Minimum and maximum must be whole minutes.');
  }
  assertError(await send('post', '/api/templates', cookie, { name: 'Run', unit: 'km', minValue: 0, maxValue: 10, kind: 'DISTANCE' }),
    400, 'VALIDATION_ERROR', 'Kind must be Count or Time.');
  assert.equal(await stored('Nap'), null);
  assert.equal(await stored('Run'), null);

  const listed = await send('get', '/api/templates', cookie);
  assert.deepEqual(listed.body.templates.map(t => [t.name, t.kind]), [['Reading', 'COUNT'], ['Sleep', 'TIME'], ['Walk', 'TIME']]);
});

test('TC-129: an unused template changes kind with whole minutes; a used one is refused', async () => {
  const manager = await login('manager1');
  const participant = await login('participant1');
  const rest = await makeTemplate({ name: 'Rest', unit: 'hours', minValue: 0, maxValue: 2 });
  const nap = await makeTemplate({ name: 'Nap', unit: 'hours', minValue: 0, maxValue: 1.5 });
  const sleep = await makeTemplate({ name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24 });
  const today = bangkokToday();
  assert.equal((await send('post', '/api/goals', participant, { templateId: sleep.id, dailyTarget: 8, startDate: today, endDate: today })).status, 201);

  const changed = await send('patch', `/api/templates/${rest.id}`, manager, { kind: 'TIME', maxValue: 120 });
  assert.equal(changed.status, 200, JSON.stringify(changed.body));
  assert.deepEqual(await stored('Rest'), { unit: 'minutes', minValue: 0, maxValue: 120, kind: 'TIME' });

  // A unit sent for a TIME template is replaced; a fraction in a later edit is refused.
  const unitSent = await send('patch', `/api/templates/${rest.id}`, manager, { unit: 'hours' });
  assert.equal(unitSent.body.template.unit, 'minutes');
  assertError(await send('patch', `/api/templates/${rest.id}`, manager, { maxValue: 90.5 }),
    400, 'VALIDATION_ERROR', 'Minimum and maximum must be whole minutes.');

  assertError(await send('patch', `/api/templates/${nap.id}`, manager, { kind: 'TIME' }),
    400, 'VALIDATION_ERROR', 'Minimum and maximum must be whole minutes.');
  assert.deepEqual(await stored('Nap'), { unit: 'hours', minValue: 0, maxValue: 1.5, kind: 'COUNT' });
  assertError(await send('patch', `/api/templates/${nap.id}`, manager, { kind: 'DISTANCE' }),
    400, 'VALIDATION_ERROR', 'Kind must be Count or Time.');

  // The in-use rule comes before the whole-minute and range rules (F-04 section 4).
  assertError(await send('patch', `/api/templates/${sleep.id}`, manager, { kind: 'TIME' }), 409, 'TEMPLATE_IN_USE');
  assert.deepEqual(await stored('Sleep'), { unit: 'hours', minValue: 0, maxValue: 24, kind: 'COUNT' });

  const back = await send('patch', `/api/templates/${rest.id}`, manager, { kind: 'COUNT' });
  assert.equal(back.status, 200);
  assert.deepEqual(await stored('Rest'), { unit: 'minutes', minValue: 0, maxValue: 120, kind: 'COUNT' });
});

test('TC-128: a TIME goal target must be whole minutes', async () => {
  const participant = await login('participant1');
  const sleep = await makeTemplate({ name: 'Sleep', unit: 'minutes', minValue: 0, maxValue: 720, kind: 'TIME' });
  const today = bangkokToday();
  const goal = dailyTarget => send('post', '/api/goals', participant, { templateId: sleep.id, dailyTarget, startDate: today, endDate: today });
  assertError(await goal(420.5), 400, 'VALIDATION_ERROR', 'Target must be whole minutes.');
  // A validation row comes before the rule rows (F-07 section 4).
  assertError(await goal(720.5), 400, 'VALIDATION_ERROR', 'Target must be whole minutes.');
  assert.equal(await db.goal.count(), 0);
  const accepted = await goal(420);
  assert.equal(accepted.status, 201, JSON.stringify(accepted.body));
  assert.equal(accepted.body.goal.template.kind, 'TIME');
});

test('TC-127: a TIME entry must be whole minutes', async () => {
  const participant = await login('participant1');
  const sleep = await makeTemplate({ name: 'Sleep', unit: 'minutes', minValue: 0, maxValue: 720, kind: 'TIME' });
  const today = bangkokToday();
  const created = await send('post', '/api/goals', participant, { templateId: sleep.id, dailyTarget: 420, startDate: today, endDate: today });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const entry = (value, entryDate = today) => send('post', `/api/goals/${created.body.goal.id}/entries`, participant, { entryDate, value });
  assertError(await entry(45.5), 400, 'VALIDATION_ERROR', 'Minutes must be a whole number.');
  // Row 4 comes before the date rules (F-08 section 4).
  assertError(await entry(45.5, '2999-01-01'), 400, 'VALIDATION_ERROR', 'Minutes must be a whole number.');
  assert.equal(await db.entry.count(), 0);
  assert.equal((await entry(45)).status, 201);
});
