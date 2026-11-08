import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';

if (!process.env.TEST_DATABASE_URL) throw new Error('Set TEST_DATABASE_URL to a disposable PostgreSQL database.');
if (process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Test and application databases must differ.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
const password = randomBytes(24).toString('base64url');
const seedPath = fileURLToPath(new URL('../prisma/seed.js', import.meta.url));
let app;
let manager;
before(async () => { await db.$connect(); });
beforeEach(async () => {
  await db.template.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  for (const [username, displayName, role] of [
    ['manager1', 'Manager One', 'MANAGER'],
    ['participant1', 'Participant One', 'PARTICIPANT'],
  ]) await db.user.create({ data: { username, displayName, role, passwordHash } });
  manager = await db.user.findUniqueOrThrow({ where: { username: 'manager1' } });
  app = createApp({ db });
});
after(async () => { await db.$disconnect(); });

const error = (code, message) => ({ error: { code, message } });
const login = async (username = 'manager1') => {
  const response = await request(app).post('/api/auth/login').send({ username, password });
  assert.equal(response.status, 200);
  return response.headers['set-cookie'][0].split(';')[0];
};
const postTemplate = (cookie, body) => {
  const req = request(app).post('/api/templates').send(body);
  return cookie ? req.set('Cookie', cookie) : req;
};
const templateShape = (body, expected) => {
  assert.equal(typeof body.id, 'number');
  assert.equal(body.name, expected.name);
  assert.equal(body.unit, expected.unit);
  assert.equal(body.minValue, expected.minValue);
  assert.equal(typeof body.minValue, 'number');
  assert.equal(body.maxValue, expected.maxValue);
  assert.equal(typeof body.maxValue, 'number');
  assert.equal(body.state, expected.state);
  assert.deepEqual(Object.keys(body).sort(), ['id', 'maxValue', 'minValue', 'name', 'state', 'unit']);
};

test('the template migration adds the range check and unique name without changing older tables', async () => {
  const checks = await db.$queryRaw`SELECT conname::text AS name FROM pg_constraint WHERE conrelid = '"Template"'::regclass AND contype = 'c'`;
  assert.deepEqual(checks.map(row => row.name), ['Template_min_below_max']);
  const indexes = await db.$queryRaw`SELECT indexname::text AS name FROM pg_indexes WHERE tablename = 'Template' AND indexname = 'Template_name_key'`;
  assert.deepEqual(indexes.map(row => row.name), ['Template_name_key']);
  const userColumns = await db.$queryRaw`SELECT column_name::text AS name FROM information_schema.columns WHERE table_name = 'User' ORDER BY column_name`;
  assert.deepEqual(userColumns.map(row => row.name), ['created_at', 'display_name', 'id', 'password_hash', 'role', 'username']);
});

test('TC-10: the range rule refuses an equal or higher minimum and accepts one just below', async () => {
  const { minimumBelowMaximum } = await import('../src/services/template.js');
  assert.equal(minimumBelowMaximum(5, 5), false);
  assert.equal(minimumBelowMaximum(6, 5), false);
  assert.equal(minimumBelowMaximum(0, 0.01), true);
  assert.equal(minimumBelowMaximum(-2, -1), true);
});

test('TC-09: a manager create strips unknown state, stores an active template, and lists it after a new app', async () => {
  const cookie = await login();
  const body = { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 500, state: 'RETIRED', createdBy: 999 };
  const created = await postTemplate(cookie, body);
  assert.equal(created.status, 201);
  templateShape(created.body.template, { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 500, state: 'ACTIVE' });
  const row = await db.template.findUniqueOrThrow({ where: { name: 'Reading' } });
  assert.equal(row.createdBy, manager.id);
  assert.equal(row.state, 'ACTIVE');
  const restarted = createApp({ db });
  const listed = await request(restarted).get('/api/templates').set('Cookie', cookie);
  assert.equal(listed.status, 200);
  assert.equal(listed.body.templates.length, 1);
  templateShape(listed.body.templates[0], { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 500, state: 'ACTIVE' });
  const trimmed = await postTemplate(cookie, { name: '  Water  ', unit: '  glasses ', minValue: -1, maxValue: 8 });
  assert.equal(trimmed.status, 201);
  assert.equal(trimmed.body.template.name, 'Water');
  assert.equal(trimmed.body.template.unit, 'glasses');
  assert.equal(trimmed.body.template.minValue, -1);
});

test('TC-10: API refuses a minimum that is not below the maximum and stores nothing, then accepts the boundary', async () => {
  const cookie = await login();
  for (const [minValue, maxValue] of [[5, 5], [6, 5]]) {
    const response = await postTemplate(cookie, { name: 'Water', unit: 'glasses', minValue, maxValue });
    assert.equal(response.status, 400);
    assert.deepEqual(response.body, error('MIN_NOT_BELOW_MAX', 'Minimum must be below maximum.'));
  }
  assert.equal(await db.template.count(), 0);
  const accepted = await postTemplate(cookie, { name: 'Water', unit: 'glasses', minValue: 0, maxValue: 0.01 });
  assert.equal(accepted.status, 201);
  templateShape(accepted.body.template, { name: 'Water', unit: 'glasses', minValue: 0, maxValue: 0.01, state: 'ACTIVE' });
  assert.equal(await db.template.count(), 1);
});

test('TC-68: invalid template bodies are validation errors and anonymous calls stay unauthenticated', async () => {
  const cookie = await login();
  const valid = { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 10 };
  const bodies = [
    { ...valid, name: undefined },
    { ...valid, name: '   ' },
    { ...valid, name: 7 },
    { ...valid, name: 'R'.repeat(101) },
    { ...valid, unit: undefined },
    { ...valid, unit: '   ' },
    { ...valid, unit: 'u'.repeat(31) },
    { ...valid, minValue: 'abc' },
    { ...valid, maxValue: undefined },
    { ...valid, maxValue: 10.555 },
    { ...valid, minValue: 100000000 },
    { ...valid, maxValue: -100000000 },
  ];
  for (const body of bodies) {
    const payload = { ...body };
    if (payload.name === undefined) delete payload.name;
    if (payload.unit === undefined) delete payload.unit;
    if (payload.maxValue === undefined) delete payload.maxValue;
    const response = await postTemplate(cookie, payload);
    assert.equal(response.status, 400, JSON.stringify(payload));
    assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  }
  const decimals = await postTemplate(cookie, { ...valid, maxValue: 10.555 });
  assert.equal(decimals.body.error.message, 'Maximum must be a number with at most 2 decimal places.');
  assert.equal(await db.template.count(), 0);
  const anonymousPost = await postTemplate(undefined, valid);
  const anonymousGet = await request(app).get('/api/templates');
  assert.equal(anonymousPost.status, 401);
  assert.deepEqual(anonymousPost.body, error('UNAUTHENTICATED', 'Please log in.'));
  assert.equal(anonymousGet.status, 401);
  assert.deepEqual(anonymousGet.body, error('UNAUTHENTICATED', 'Please log in.'));
  assert.equal(await db.template.count(), 0);
});

test('TC-69: duplicate names conflict after the range rule, including two creates at once', async () => {
  const cookie = await login();
  const first = await postTemplate(cookie, { name: 'Walk', unit: 'steps', minValue: 0, maxValue: 100 });
  assert.equal(first.status, 201);
  const duplicate = await postTemplate(cookie, { name: 'Walk', unit: 'steps', minValue: 0, maxValue: 50 });
  assert.equal(duplicate.status, 409);
  assert.deepEqual(duplicate.body, error('TEMPLATE_NAME_EXISTS', 'A template with this name already exists.'));
  const rangeFirst = await postTemplate(cookie, { name: 'Walk', unit: 'steps', minValue: 5, maxValue: 5 });
  assert.equal(rangeFirst.status, 400);
  assert.deepEqual(rangeFirst.body, error('MIN_NOT_BELOW_MAX', 'Minimum must be below maximum.'));
  const swim = { name: 'Swim', unit: 'laps', minValue: 0, maxValue: 40 };
  const [left, right] = await Promise.all([postTemplate(cookie, swim), postTemplate(cookie, swim)]);
  const statuses = [left.status, right.status].sort((a, b) => a - b);
  assert.deepEqual(statuses, [201, 409]);
  const conflict = left.status === 409 ? left : right;
  assert.deepEqual(conflict.body, error('TEMPLATE_NAME_EXISTS', 'A template with this name already exists.'));
  assert.deepEqual((await db.template.findMany({ orderBy: { name: 'asc' } })).map(row => row.name), ['Swim', 'Walk']);
});

test('TC-16 / TC-17: a participant lists active templates only and cannot create one', async () => {
  const managerCookie = await login();
  for (const body of [
    { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24 },
    { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 500 },
  ]) assert.equal((await postTemplate(managerCookie, body)).status, 201);
  const steps = await db.template.create({ data: {
    name: 'Steps', unit: 'steps', minValue: 0, maxValue: 30000, state: 'RETIRED', createdBy: manager.id,
  } });
  const participantCookie = await login('participant1');
  const before = await db.template.count();
  const listed = await request(app).get('/api/templates').set('Cookie', participantCookie);
  assert.equal(listed.status, 200);
  assert.deepEqual(listed.body.templates.map(row => ({ name: row.name, unit: row.unit, minValue: row.minValue, maxValue: row.maxValue, state: row.state })), [
    { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 500, state: 'ACTIVE' },
    { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, state: 'ACTIVE' },
  ]);
  assert.equal(listed.body.templates.some(row => row.name === 'Steps'), false);
  for (const body of [
    { name: 'Yoga', unit: 'minutes', minValue: 0, maxValue: 120 },
    { name: '' },
    {},
  ]) {
    const response = await postTemplate(participantCookie, body);
    assert.equal(response.status, 403);
    assert.deepEqual(response.body, error('FORBIDDEN', 'You do not have permission to do this.'));
  }
  assert.equal(await db.template.count(), before);
  assert.equal(await db.template.findUnique({ where: { name: 'Yoga' } }), null);
  assert.equal((await db.template.findUniqueOrThrow({ where: { id: steps.id } })).state, 'RETIRED');
});

test('manager list returns every state, ordered by name', async () => {
  const cookie = await login();
  await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, createdBy: manager.id } });
  await db.template.create({ data: {
    name: 'Steps', unit: 'steps', minValue: 0, maxValue: 100, state: 'RETIRED', createdBy: manager.id,
  } });
  const listed = await request(app).get('/api/templates').set('Cookie', cookie);
  assert.equal(listed.status, 200);
  assert.deepEqual(listed.body.templates.map(row => [row.name, row.state]), [['Sleep', 'ACTIVE'], ['Steps', 'RETIRED']]);
});

test('demo seed upserts synthetic templates by name and can run twice', async () => {
  const managerPassword = randomBytes(24).toString('base64url');
  const participantPassword = randomBytes(24).toString('base64url');
  const env = {
    ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, SEED_DEMO_DATA: 'true',
    SEED_MANAGER_PASSWORD: managerPassword, SEED_PARTICIPANT_PASSWORD: participantPassword,
  };
  const seedCwd = mkdtempSync(join(tmpdir(), 'habit-template-seed-'));
  try {
    for (let run = 0; run < 2; run++) execFileSync(process.execPath, [seedPath], { env: { ...env, PATH: '' }, cwd: seedCwd, stdio: 'pipe' });
  } finally { rmSync(seedCwd, { recursive: true, force: true }); }
  const templates = await db.template.findMany({ orderBy: { name: 'asc' }, include: { creator: true } });
  assert.deepEqual(templates.map(row => row.name), ['Reading', 'Walking', 'Water']);
  for (const row of templates) assert.equal(row.creator.username, 'manager1');
  assert.equal(await db.template.count(), 3);
});
