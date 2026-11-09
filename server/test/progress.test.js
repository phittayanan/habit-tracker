import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';
import { listGoals } from '../src/services/goal.js';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate disposable test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
let app, a, b, manager, template, cookies;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const day = n => new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const asDate = text => new Date(`${text}T00:00:00Z`);
const goalFor = (user, from, to, target = 30) => db.goal.create({ data: { participantId: user.id, templateId: template.id, dailyTarget: target, startDate: asDate(day(from)), endDate: asDate(day(to)) } });
const entry = (goal, n, value) => db.entry.create({ data: { goalId: goal.id, entryDate: asDate(day(n)), value } });
const list = (cookie = cookies.a) => request(app).get('/api/goals').set('Cookie', cookie);
before(async () => db.$connect());
beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  [a, b, manager] = await Promise.all(['PARTICIPANT', 'PARTICIPANT', 'MANAGER'].map((role, i) => db.user.create({ data: {
    username: `progress-user-${i}`, displayName: `Progress User ${i}`, role, passwordHash: 'unused-generated-session-fixture',
  } })));
  cookies = {};
  for (const [key, user] of Object.entries({ a, b, manager })) {
    const id = randomBytes(32).toString('base64url');
    await db.session.create({ data: { id, userId: user.id, createdAt: new Date(), expiresAt: new Date(Date.now() + 3600000) } });
    cookies[key] = `sid=${id}`;
  }
  template = await db.template.create({ data: { name: 'Sleep', unit: 'minutes', minValue: 0, maxValue: 120, createdBy: manager.id } });
  app = createApp({ db });
});
after(async () => db.$disconnect());

test('TC-31 / AC-09.1 to AC-09.3 over the API: progress object from the goal and its entries', async () => {
  const goal = await goalFor(a, -9, 20);
  await entry(goal, -9, 30); await entry(goal, -8, 29.9); await entry(goal, -6, 45);
  const r = await list().expect(200);
  assert.equal(r.body.goals.length, 1);
  assert.deepEqual(r.body.goals[0].progress, { daysMet: 2, daysSoFar: 10 });
  assert.equal(r.body.goals[0].id, goal.id);
  assert.equal(r.body.goals[0].dailyTarget, 30);
});

test('AC-09.4 / AC-09.5 over the API: future goal is 0 of 0; an Ended goal does not grow', async () => {
  await goalFor(a, 5, 15);
  const ended = await db.goal.create({ data: { participantId: a.id, templateId: (await db.template.create({ data: { name: 'Walk', unit: 'steps', minValue: 0, maxValue: 100, createdBy: manager.id } })).id, dailyTarget: 10, startDate: asDate(day(-12)), endDate: asDate(day(-8)) } });
  await entry(ended, -12, 10);
  const goals = (await list().expect(200)).body.goals;
  const byEnd = Object.fromEntries(goals.map(g => [g.endDate, g.progress]));
  assert.deepEqual(byEnd[day(15)], { daysMet: 0, daysSoFar: 0 });
  assert.deepEqual(byEnd[day(-8)], { daysMet: 1, daysSoFar: 5 });
});

test('AC-09.6: a saved entry raises daysMet on the next read, also after an app restart; nothing is stored as progress', async () => {
  const goal = await goalFor(a, 0, 10);
  assert.deepEqual((await list().expect(200)).body.goals[0].progress, { daysMet: 0, daysSoFar: 1 });
  await request(app).post(`/api/goals/${goal.id}/entries`).set('Cookie', cookies.a).send({ entryDate: day(0), value: 30 }).expect(201);
  assert.deepEqual((await list().expect(200)).body.goals[0].progress, { daysMet: 1, daysSoFar: 1 });
  const child = spawn(process.execPath, [fileURLToPath(new URL('./goal-process.js', import.meta.url))], { env: process.env, stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  try {
    const [{ port }] = await Promise.race([once(child, 'message'), once(child, 'exit').then(() => { throw new Error('App exited before startup'); })]);
    const r = await request(`http://127.0.0.1:${port}`).get('/api/goals').set('Cookie', cookies.a).expect(200);
    assert.deepEqual(r.body.goals[0].progress, { daysMet: 1, daysSoFar: 1 });
  } finally { child.kill('SIGTERM'); await once(child, 'exit'); }
  const columns = await db.$queryRaw`SELECT column_name::text AS name FROM information_schema.columns WHERE table_name IN ('Goal', 'Entry') AND (column_name ILIKE '%progress%' OR column_name ILIKE '%days%')`;
  assert.deepEqual(columns, [], 'no progress value is stored');
});

test('TC-59 / AC-09.8: anonymous 401 and Manager 403 on the goal list', async () => {
  const anon = await request(app).get('/api/goals');
  assert.equal(anon.status, 401); assert.equal(anon.body.error.code, 'UNAUTHENTICATED');
  const mgr = await list(cookies.manager);
  assert.equal(mgr.status, 403); assert.equal(mgr.body.error.code, 'FORBIDDEN');
});

test('A Participant sees progress only for own goals', async () => {
  const goalA = await goalFor(a, -2, 10, 10);
  const goalB = await goalFor(b, -2, 10, 10);
  await entry(goalA, -2, 10); await entry(goalB, -1, 10); await entry(goalB, 0, 10);
  assert.deepEqual((await list(cookies.a).expect(200)).body.goals.map(g => [g.id, g.progress]), [[goalA.id, { daysMet: 1, daysSoFar: 3 }]]);
  assert.deepEqual((await list(cookies.b).expect(200)).body.goals.map(g => [g.id, g.progress]), [[goalB.id, { daysMet: 2, daysSoFar: 3 }]]);
});

test('AC-09.1 to AC-09.3: two active goals of one Participant keep separate progress, even with entries on the same day', async () => {
  const walk = await db.template.create({ data: { name: 'Walk', unit: 'steps', minValue: 0, maxValue: 100000, createdBy: manager.id } });
  const sleep = await goalFor(a, -3, 10, 8);
  const steps = await db.goal.create({ data: { participantId: a.id, templateId: walk.id, dailyTarget: 5000, startDate: asDate(day(-3)), endDate: asDate(day(10)) } });
  await entry(sleep, -1, 8); await entry(sleep, 0, 9);
  await entry(steps, -1, 4000); await entry(steps, 0, 5000); await entry(steps, -2, 6000);
  const byId = Object.fromEntries((await list().expect(200)).body.goals.map(g => [g.id, g.progress]));
  assert.deepEqual(byId[sleep.id], { daysMet: 2, daysSoFar: 4 });
  assert.deepEqual(byId[steps.id], { daysMet: 2, daysSoFar: 4 });
  await entry(sleep, -2, 1);
  const again = Object.fromEntries((await list().expect(200)).body.goals.map(g => [g.id, g.progress]));
  assert.deepEqual(again[sleep.id], { daysMet: 2, daysSoFar: 4 });
  const third = await db.template.create({ data: { name: 'Water', unit: 'ml', minValue: 0, maxValue: 10000, createdBy: manager.id } });
  const water = await db.goal.create({ data: { participantId: a.id, templateId: third.id, dailyTarget: 1, startDate: asDate(day(-3)), endDate: asDate(day(10)) } });
  await entry(water, -3, 5);
  const last = Object.fromEntries((await list().expect(200)).body.goals.map(g => [g.id, g.progress]));
  assert.deepEqual(last[water.id], { daysMet: 1, daysSoFar: 4 });
  assert.deepEqual(last[sleep.id], { daysMet: 2, daysSoFar: 4 });
  assert.deepEqual(last[steps.id], { daysMet: 2, daysSoFar: 4 });
});

test('The list takes "today" from the Asia/Bangkok date of the instant it is given', async () => {
  const goal = await db.goal.create({ data: { participantId: a.id, templateId: template.id, dailyTarget: 30, startDate: asDate('2026-11-01'), endDate: asDate('2026-11-30') } });
  await db.entry.create({ data: { goalId: goal.id, entryDate: asDate('2026-11-01'), value: 30 } });
  const before = await listGoals(db, a, new Date('2026-11-10T16:59:59Z'));
  assert.deepEqual(before[0].progress, { daysMet: 1, daysSoFar: 10 });
  const after = await listGoals(db, a, new Date('2026-11-10T17:00:00Z'));
  assert.deepEqual(after[0].progress, { daysMet: 1, daysSoFar: 11 });
});
