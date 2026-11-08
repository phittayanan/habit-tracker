import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate disposable test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
let app, a, b, manager, template, cookies, other;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const day = n => new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const asDate = text => new Date(`${text}T00:00:00Z`);
const goalFor = (user, tpl, from, to, target = 10) => db.goal.create({ data: { participantId: user.id, templateId: tpl.id, dailyTarget: target, startDate: asDate(day(from)), endDate: asDate(day(to)) } });
const post = (goal, data, cookie = cookies.a) => request(app).post(`/api/goals/${goal.id}/entries`).set('Cookie', cookie).send(data);
before(async () => db.$connect());
beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  [a, b, manager] = await Promise.all(['PARTICIPANT', 'PARTICIPANT', 'MANAGER'].map((role, i) => db.user.create({ data: {
    username: `entry-user-${i}`, displayName: `Entry User ${i}`, role, passwordHash: 'unused-generated-session-fixture',
  } })));
  cookies = {};
  for (const [key, user] of Object.entries({ a, b, manager })) {
    const id = randomBytes(32).toString('base64url');
    await db.session.create({ data: { id, userId: user.id, createdAt: new Date(), expiresAt: new Date(Date.now() + 3600000) } });
    cookies[key] = `sid=${id}`;
  }
  template = await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, createdBy: manager.id } });
  other = await db.template.create({ data: { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 100, createdBy: manager.id } });
  app = createApp({ db });
});
after(async () => db.$disconnect());

test('TC-23: valid entry returns 201 with the contract shape, owned by the goal, and is listed', async () => {
  const goal = await goalFor(a, template, -9, 20);
  const r = await post(goal, { entryDate: day(0), value: 7.5, goalId: 99999, participantId: b.id });
  assert.equal(r.status, 201);
  assert.deepEqual(r.body, { entry: { id: r.body.entry.id, goalId: goal.id, entryDate: day(0), value: 7.5 } });
  const listed = await request(app).get(`/api/goals/${goal.id}/entries`).set('Cookie', cookies.a).expect(200);
  assert.deepEqual(listed.body, { entries: [r.body.entry] });
});

test('TC-24: a date after today is ENTRY_DATE_IN_FUTURE, also when it is outside the goal as well', async () => {
  const g1 = await goalFor(a, template, -9, 20);
  const g2 = await goalFor(a, other, -9, 5);
  for (const [goal, date] of [[g1, day(1)], [g2, day(10)]]) {
    const r = await post(goal, { entryDate: date, value: 5 });
    assert.equal(r.status, 400); assert.equal(r.body.error.code, 'ENTRY_DATE_IN_FUTURE');
  }
  assert.equal(await db.entry.count(), 0);
});

test('TC-25 / TC-30: outside the goal period is rejected; inside an ended goal is accepted', async () => {
  const g3 = await goalFor(a, template, -15, 5);
  const g4 = await goalFor(a, other, -15, -5);
  for (const [goal, date] of [[g3, day(-16)], [g4, day(-4)]]) {
    const r = await post(goal, { entryDate: date, value: 5 });
    assert.equal(r.status, 400); assert.equal(r.body.error.code, 'ENTRY_DATE_OUTSIDE_GOAL');
  }
  assert.equal(await db.entry.count(), 0);
  await post(g4, { entryDate: day(-10), value: 5 }).expect(201);
});

test('TC-26: the start date and today (the end date) are accepted', async () => {
  const g5 = await goalFor(a, template, -15, 0);
  await post(g5, { entryDate: day(-15), value: 1 }).expect(201);
  await post(g5, { entryDate: day(0), value: 1 }).expect(201);
});

test('TC-28: value limits over the API, each accepted value on its own day', async () => {
  const g6 = await goalFor(a, template, -15, 5);
  for (const value of [-0.5, 24.5]) {
    const r = await post(g6, { entryDate: day(-15), value });
    assert.equal(r.status, 400); assert.equal(r.body.error.code, 'VALUE_OUT_OF_RANGE');
  }
  assert.equal(await db.entry.count(), 0);
  await post(g6, { entryDate: day(-15), value: 0 }).expect(201);
  await post(g6, { entryDate: day(-14), value: 24 }).expect(201);
});

test('TC-29: a second entry for the same day is 409, also for two requests at once; the first value stays', async () => {
  const goal = await goalFor(a, template, -9, 20);
  await post(goal, { entryDate: day(0), value: 3 }).expect(201);
  const again = await post(goal, { entryDate: day(0), value: 9 });
  assert.equal(again.status, 409); assert.equal(again.body.error.code, 'ENTRY_ALREADY_EXISTS');
  const row = await db.entry.findFirstOrThrow({ where: { goalId: goal.id } });
  assert.equal(Number(row.value), 3);
  const responses = await Promise.all([post(goal, { entryDate: day(-1), value: 4 }), post(goal, { entryDate: day(-1), value: 5 })]);
  assert.deepEqual(responses.map(r => r.status).sort(), [201, 409]);
  assert.equal(await db.entry.count({ where: { goalId: goal.id } }), 2);
});

test('TC-56 / TC-08: validation, roles, ownership and both endpoints', async () => {
  const goal = await goalFor(a, template, -9, 20);
  const bGoal = await goalFor(b, template, -9, 20);
  for (const body of [{ value: 5 }, { entryDate: '11/05/2026', value: 5 }, { entryDate: day(0) }, { entryDate: day(0), value: 'abc' },
    { entryDate: day(0), value: 7.555 }, { entryDate: day(0), value: 24.555 }, { entryDate: day(0), value: 100000000 }, {}]) {
    const r = await post(goal, body);
    assert.equal(r.status, 400, JSON.stringify(body)); assert.equal(r.body.error.code, 'VALIDATION_ERROR');
  }
  await request(app).post(`/api/goals/${goal.id}/entries`).set('Cookie', cookies.a).set('Content-Type', 'application/json').send('{').expect(400);
  const valid = { entryDate: day(0), value: 5 };
  for (const method of ['get', 'post']) {
    const anon = await request(app)[method](`/api/goals/${goal.id}/entries`).send(valid);
    assert.equal(anon.status, 401); assert.equal(anon.body.error.code, 'UNAUTHENTICATED');
    const mgr = await request(app)[method](`/api/goals/${goal.id}/entries`).set('Cookie', cookies.manager).send(valid);
    assert.equal(mgr.status, 403); assert.equal(mgr.body.error.code, 'FORBIDDEN');
    for (const id of [bGoal.id, 99999]) {
      const r = await request(app)[method](`/api/goals/${id}/entries`).set('Cookie', cookies.a).send(valid);
      assert.equal(r.status, 404); assert.equal(r.body.error.code, 'GOAL_NOT_FOUND');
    }
  }
  assert.equal((await request(app).get('/api/goals/abc/entries').set('Cookie', cookies.a)).status, 404);
  assert.equal(await db.entry.count(), 0);
});

test('Entry list is newest date first and only for the owner', async () => {
  const goal = await goalFor(a, template, -9, 20);
  for (const n of [-3, 0, -5]) await post(goal, { entryDate: day(n), value: 1 + Math.abs(n) }).expect(201);
  const r = await request(app).get(`/api/goals/${goal.id}/entries`).set('Cookie', cookies.a).expect(200);
  assert.deepEqual(r.body.entries.map(e => e.entryDate), [day(0), day(-3), day(-5)]);
  assert.equal((await request(app).get(`/api/goals/${goal.id}/entries`).set('Cookie', cookies.b)).status, 404);
});

test('TC-58: the entry survives an app restart (new process, new connection)', async () => {
  const goal = await goalFor(a, template, -9, 20);
  const saved = await post(goal, { entryDate: day(0), value: 7.5 }).expect(201);
  const child = spawn(process.execPath, [fileURLToPath(new URL('./goal-process.js', import.meta.url))], { env: process.env, stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  try {
    const [{ port }] = await Promise.race([once(child, 'message'), once(child, 'exit').then(() => { throw new Error('App exited before startup'); })]);
    const r = await request(`http://127.0.0.1:${port}`).get(`/api/goals/${goal.id}/entries`).set('Cookie', cookies.a).expect(200);
    assert.deepEqual(r.body, { entries: [saved.body.entry] });
  } finally { child.kill('SIGTERM'); await once(child, 'exit'); }
});

test('Entry migration: unique goal+day and restrict-on-delete are enforced by the database', async () => {
  const goal = await goalFor(a, template, -9, 20);
  const columns = await db.$queryRaw`SELECT column_name::text AS name FROM information_schema.columns WHERE table_name = 'Entry' ORDER BY column_name`;
  assert.deepEqual(columns.map(r => r.name), ['created_at', 'entry_date', 'goal_id', 'id', 'value']);
  await db.entry.create({ data: { goalId: goal.id, entryDate: asDate(day(0)), value: 1 } });
  await assert.rejects(db.entry.create({ data: { goalId: goal.id, entryDate: asDate(day(0)), value: 2 } }));
  await assert.rejects(db.goal.delete({ where: { id: goal.id } }), 'a goal with entries cannot be deleted');
});
