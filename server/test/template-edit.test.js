import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate disposable test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
let app, manager, a, cookies;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const day = n => new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const error = (code, message) => ({ error: { code, message } });
const inUse = error('TEMPLATE_IN_USE', 'This template is used by a goal and cannot be edited.');
const patch = (id, body, cookie = cookies.manager) => {
  const req = request(app).patch(`/api/templates/${id}`).send(body);
  return cookie ? req.set('Cookie', cookie) : req;
};
const template = data => db.template.create({ data: { createdBy: manager.id, ...data } });
const stored = async id => {
  const row = await db.template.findUniqueOrThrow({ where: { id } });
  return { name: row.name, unit: row.unit, minValue: Number(row.minValue), maxValue: Number(row.maxValue), state: row.state };
};
const goal = (templateId, startDate, endDate, dailyTarget = 5) => request(app).post('/api/goals').set('Cookie', cookies.a)
  .send({ templateId, dailyTarget, startDate, endDate });

before(async () => db.$connect());
beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  [manager, a] = await Promise.all([['MANAGER', 'edit-manager'], ['PARTICIPANT', 'edit-participant-a']].map(([role, username]) => db.user.create({ data: {
    username, displayName: username, role, passwordHash: 'unused-generated-session-fixture',
  } })));
  cookies = {};
  for (const [key, user] of Object.entries({ manager, a })) {
    const id = randomBytes(32).toString('base64url');
    await db.session.create({ data: { id, userId: user.id, createdAt: new Date(), expiresAt: new Date(Date.now() + 3600000) } });
    cookies[key] = `sid=${id}`;
  }
  app = createApp({ db });
});
after(async () => db.$disconnect());

test('TC-12: a manager edits an unused template with two partial edits and the list shows the result', async () => {
  const reading = await template({ name: 'Reading', unit: 'pages', minValue: 0, maxValue: 500 });
  const first = await patch(reading.id, { unit: 'pages read', maxValue: 300, state: 'RETIRED', createdBy: a.id, id: 999 });
  assert.equal(first.status, 200);
  assert.deepEqual(first.body, { template: { id: reading.id, name: 'Reading', unit: 'pages read', minValue: 0, maxValue: 300, state: 'ACTIVE' } });
  const second = await patch(reading.id, { name: 'Reading time', minValue: 1 });
  assert.equal(second.status, 200);
  assert.deepEqual(second.body, { template: { id: reading.id, name: 'Reading time', unit: 'pages read', minValue: 1, maxValue: 300, state: 'ACTIVE' } });
  const listed = await request(createApp({ db })).get('/api/templates').set('Cookie', cookies.manager);
  assert.equal(listed.status, 200);
  assert.deepEqual(listed.body.templates, [{ id: reading.id, name: 'Reading time', unit: 'pages read', minValue: 1, maxValue: 300, state: 'ACTIVE' }]);
  assert.equal((await db.template.findUniqueOrThrow({ where: { id: reading.id } })).createdBy, manager.id);
});

test('TC-13: a template used by an Active or only an Ended goal is refused first and stays unchanged', async () => {
  const sleep = await template({ name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24 });
  const steps = await template({ name: 'Steps', unit: 'steps', minValue: 0, maxValue: 30000 });
  assert.equal((await goal(sleep.id, day(0), day(30))).status, 201);
  const ended = await goal(steps.id, day(-10), day(-1));
  assert.equal(ended.status, 201);
  assert.equal(ended.body.goal.state, 'ENDED');
  const before = [await stored(sleep.id), await stored(steps.id)];
  for (const [id, body] of [[sleep.id, { maxValue: 12 }], [sleep.id, { minValue: 50 }], [steps.id, { unit: 'km' }]]) {
    const response = await patch(id, body);
    assert.equal(response.status, 409, JSON.stringify(body));
    assert.deepEqual(response.body, inUse);
  }
  assert.deepEqual([await stored(sleep.id), await stored(steps.id)], before);
});

async function waitForLockWait() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const [row] = await db.$queryRaw`SELECT count(*)::int AS waiting FROM pg_stat_activity WHERE datname = current_database() AND wait_event_type = 'Lock'`;
    if (row.waiting > 0) return true;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  return false;
}

test('TC-13 race (a): an edit waits for a goal transaction holding the template lock, then is refused as in use', async () => {
  const water = await template({ name: 'Water', unit: 'glasses', minValue: 0, maxValue: 24 });
  let release, locked;
  const gate = new Promise(resolve => { release = resolve; });
  const lockTaken = new Promise(resolve => { locked = resolve; });
  const holder = db.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "Template" WHERE id = ${water.id} FOR UPDATE`;
    await tx.goal.create({ data: { participantId: a.id, templateId: water.id, dailyTarget: '5.00', startDate: new Date(`${day(0)}T00:00:00Z`), endDate: new Date(`${day(30)}T00:00:00Z`) } });
    locked();
    await gate;
  }, { timeout: 20000, maxWait: 20000 });
  await lockTaken;
  let settled = false;
  const edit = patch(water.id, { maxValue: 10 }).then(response => { settled = true; return response; });
  const waited = await waitForLockWait();
  const settledWhileLocked = settled;
  release();
  await holder;
  const response = await edit;
  assert.equal(waited, true, 'the edit must wait on the template row lock');
  assert.equal(settledWhileLocked, false);
  assert.equal(response.status, 409);
  assert.deepEqual(response.body, inUse);
  assert.equal((await stored(water.id)).maxValue, 24);
});

test('TC-13 race (b): an edit and a new goal sent together never leave a goal beside an edited range', async () => {
  for (let round = 0; round < 10; round += 1) {
    await db.goal.deleteMany(); await db.template.deleteMany();
    const water = await template({ name: 'Water', unit: 'glasses', minValue: 0, maxValue: 24 });
    const [edit, created] = await Promise.all([patch(water.id, { maxValue: 10 }), goal(water.id, day(0), day(30), 20)]);
    const goals = await db.goal.count({ where: { templateId: water.id } });
    const max = (await stored(water.id)).maxValue;
    if (created.status === 201) {
      assert.equal(edit.status, 409, `round ${round}`);
      assert.deepEqual(edit.body, inUse);
      assert.equal(max, 24);
      assert.equal(goals, 1);
    } else {
      assert.equal(edit.status, 200, `round ${round}`);
      assert.equal(created.status, 400);
      assert.equal(created.body.error.code, 'TARGET_ABOVE_TEMPLATE_MAX');
      assert.equal(max, 10);
      assert.equal(goals, 0);
    }
  }
});

test('TC-71: invalid edits are validation errors, an unknown id is 404, anonymous is 401, and nothing changes', async () => {
  const t = await template({ name: 'Walk', unit: 'steps', minValue: 0, maxValue: 100 });
  const before = await stored(t.id);
  const bodies = [
    [{}, 'Change at least one of name, unit, minimum or maximum.'],
    [{ state: 'RETIRED' }, 'Change at least one of name, unit, minimum or maximum.'],
    [{ minValue: 'abc' }, 'Minimum must be a number with at most 2 decimal places.'],
    [{ maxValue: 10.555 }, 'Maximum must be a number with at most 2 decimal places.'],
    [{ name: '   ' }, 'Name must be 1 to 100 characters.'],
    [{ name: null }, 'Name must be 1 to 100 characters.'],
    [{ unit: 'u'.repeat(31) }, 'Unit must be 1 to 30 characters.'],
    [{ maxValue: 100000000 }, 'Maximum must be a number with at most 2 decimal places.'],
  ];
  for (const [body, message] of bodies) {
    const response = await patch(t.id, body);
    assert.equal(response.status, 400, JSON.stringify(body));
    assert.deepEqual(response.body, error('VALIDATION_ERROR', message));
  }
  for (const id of ['abc', '0', '-1', '1.5', '1e3']) {
    const response = await patch(id, { unit: 'x' });
    assert.equal(response.status, 400, id);
    assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  }
  for (const id of [99999, 2147483648]) {
    const response = await patch(id, { unit: 'x' });
    assert.equal(response.status, 404, String(id));
    assert.deepEqual(response.body, error('TEMPLATE_NOT_FOUND', 'Template not found.'));
  }
  const unknownAndInvalid = await patch(99999, { maxValue: 10.555 });
  assert.equal(unknownAndInvalid.status, 400);
  const anonymous = await patch(t.id, { unit: 'x' }, null);
  assert.equal(anonymous.status, 401);
  assert.deepEqual(anonymous.body, error('UNAUTHENTICATED', 'Please log in.'));
  const badJson = await request(app).patch(`/api/templates/${t.id}`).set('Cookie', cookies.manager).set('Content-Type', 'application/json').send('{"unit":');
  assert.equal(badJson.status, 400);
  assert.equal(badJson.body.error.code, 'VALIDATION_ERROR');
  assert.deepEqual(await stored(t.id), before);
});

test('TC-72: the merged range rule refuses a sent minimum at the stored maximum', async () => {
  const { mergedRangeAllowed } = await import('../src/services/template.js');
  assert.equal(mergedRangeAllowed({ minValue: 0, maxValue: 100 }, { minValue: 100 }), false);
  assert.equal(mergedRangeAllowed({ minValue: 0, maxValue: 100 }, { maxValue: 0 }), false);
  assert.equal(mergedRangeAllowed({ minValue: 0, maxValue: 100 }, { minValue: 99.99 }), true);
  assert.equal(mergedRangeAllowed({ minValue: 0, maxValue: 100 }, { minValue: 200, maxValue: 300 }), true);
  assert.equal(mergedRangeAllowed({ minValue: 0, maxValue: 100 }, { name: 'x' }), true);
});

test('TC-72: range before duplicate name, own name accepted, rejected edits change nothing', async () => {
  const walk = await template({ name: 'Walk', unit: 'km', minValue: 0, maxValue: 100 });
  await template({ name: 'Swim', unit: 'laps', minValue: 0, maxValue: 50 });
  const range = await patch(walk.id, { minValue: 100 });
  assert.equal(range.status, 400);
  assert.deepEqual(range.body, error('MIN_NOT_BELOW_MAX', 'Minimum must be below maximum.'));
  const duplicate = await patch(walk.id, { name: 'Swim' });
  assert.equal(duplicate.status, 409);
  assert.deepEqual(duplicate.body, error('TEMPLATE_NAME_EXISTS', 'A template with this name already exists.'));
  const both = await patch(walk.id, { name: 'Swim', minValue: 100 });
  assert.equal(both.status, 400);
  assert.equal(both.body.error.code, 'MIN_NOT_BELOW_MAX');
  assert.deepEqual(await stored(walk.id), { name: 'Walk', unit: 'km', minValue: 0, maxValue: 100, state: 'ACTIVE' });
  const own = await patch(walk.id, { name: 'Walk', unit: 'steps' });
  assert.equal(own.status, 200);
  assert.deepEqual(own.body.template, { id: walk.id, name: 'Walk', unit: 'steps', minValue: 0, maxValue: 100, state: 'ACTIVE' });
  const trimmed = await patch(walk.id, { name: '  Walking  ' });
  assert.equal(trimmed.body.template.name, 'Walking');
});

test('TC-18: a participant edit is forbidden for an existing and an unknown id, and nothing changes', async () => {
  const sleep = await template({ name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24 });
  for (const [id, body] of [[sleep.id, { maxValue: 12 }], [99999, { unit: 'x' }], ['abc', {}]]) {
    const response = await patch(id, body, cookies.a);
    assert.equal(response.status, 403, String(id));
    assert.deepEqual(response.body, error('FORBIDDEN', 'You do not have permission to do this.'));
  }
  assert.equal((await stored(sleep.id)).maxValue, 24);
});

test('a foreign Origin is refused before the session check and nothing changes', async () => {
  const t = await template({ name: 'Walk', unit: 'steps', minValue: 0, maxValue: 100 });
  const response = await request(app).patch(`/api/templates/${t.id}`).set('Origin', 'https://evil.example').set('Cookie', cookies.manager).send({ unit: 'x' });
  assert.equal(response.status, 403);
  assert.equal(response.body.error.code, 'ORIGIN_NOT_ALLOWED');
  assert.equal((await stored(t.id)).unit, 'steps');
});
