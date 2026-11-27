// F-14 goal change (Issue #153): TC-152 to TC-155 and TC-157 against a real database.
import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp, protectedRoutes } from '../src/app.js';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate disposable test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
let app, a, b, manager, water, cookies, w;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const day = n => new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const asDate = text => new Date(`${text}T00:00:00Z`);
const patch = (id, body, cookie = cookies.a) => {
  const call = request(app).patch(`/api/goals/${id}`);
  return (cookie ? call.set('Cookie', cookie) : call).send(body);
};
const versions = async goalId => (await db.goalTarget.findMany({ where: { goalId }, orderBy: { effectiveFrom: 'asc' } }))
  .map(row => ({ id: row.id, from: row.effectiveFrom.toISOString().slice(0, 10), target: Number(row.dailyTarget) }));
const snapshot = async () => ({
  goals: (await db.goal.findMany({ orderBy: { id: 'asc' } })).map(g => ({ id: g.id, target: Number(g.dailyTarget), start: g.startDate.toISOString(), end: g.endDate.toISOString(), templateId: g.templateId })),
  versions: (await db.goalTarget.findMany({ orderBy: { id: 'asc' } })).map(v => ({ id: v.id, goalId: v.goalId, from: v.effectiveFrom.toISOString(), target: Number(v.dailyTarget) })),
});
async function makeGoal({ participant = a, template = water, target = 8, start, end, withVersion = true }) {
  const goal = await db.goal.create({ data: { participantId: participant.id, templateId: template.id, dailyTarget: target, startDate: asDate(start), endDate: asDate(end) } });
  if (withVersion) await db.goalTarget.create({ data: { goalId: goal.id, effectiveFrom: asDate(start), dailyTarget: target } });
  return goal;
}
const listed = async (id, url = app) => (await request(url).get('/api/goals').set('Cookie', cookies.a).expect(200)).body.goals.find(goal => goal.id === id);

before(async () => db.$connect());
beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  [a, b, manager] = await Promise.all(['PARTICIPANT', 'PARTICIPANT', 'MANAGER'].map((role, i) => db.user.create({ data: {
    username: `change-user-${i}`, displayName: `Change User ${i}`, role, passwordHash: 'unused-generated-session-fixture',
  } })));
  cookies = {};
  for (const [key, user] of Object.entries({ a, b, manager })) {
    const id = randomBytes(32).toString('base64url');
    await db.session.create({ data: { id, userId: user.id, createdAt: new Date(), expiresAt: new Date(Date.now() + 3600000) } });
    cookies[key] = `sid=${id}`;
  }
  water = await db.template.create({ data: { name: 'Water', unit: 'glasses', minValue: 1, maxValue: 12, createdBy: manager.id } });
  w = await makeGoal({ start: day(-10), end: day(10) });
  for (const n of [-2, 0]) await db.entry.create({ data: { goalId: w.id, entryDate: asDate(day(n)), value: 7 } });
  app = createApp({ db });
});
after(async () => db.$disconnect());

test('TC-152: change to 5 then 6 keeps one version for today, old days keep 8, and survives a restart', async () => {
  assert.deepEqual((await listed(w.id)).progress, { daysMet: 0, daysSoFar: 11 });
  const first = await patch(w.id, { dailyTarget: 5 });
  assert.equal(first.status, 200);
  assert.equal(first.body.goal.dailyTarget, 5);
  const second = await patch(w.id, { dailyTarget: 6 });
  assert.equal(second.status, 200);
  assert.deepEqual(second.body.goal, { id: w.id, templateId: water.id, dailyTarget: 6, startDate: day(-10), endDate: day(10), state: 'ACTIVE',
    template: { id: water.id, name: 'Water', unit: 'glasses', minValue: 1, maxValue: 12 } }, 'F-07 shape, no progress');
  assert.deepEqual((await versions(w.id)).map(({ from, target }) => ({ from, target })), [{ from: day(-10), target: 8 }, { from: day(0), target: 6 }]);
  assert.equal(Number((await db.goal.findUniqueOrThrow({ where: { id: w.id } })).dailyTarget), 6, 'daily_target holds the latest target');
  const shown = await listed(w.id);
  assert.equal(shown.dailyTarget, 6);
  assert.deepEqual(shown.progress, { daysMet: 1, daysSoFar: 11 }, 'D-2 (7 < 8) not met, D (7 >= 6) met');
  assert.deepEqual(Object.keys(shown).sort(), ['dailyTarget', 'endDate', 'id', 'progress', 'startDate', 'state', 'template', 'templateId'], 'GET keeps its shape');
  const child = spawn(process.execPath, [fileURLToPath(new URL('./goal-process.js', import.meta.url))], { env: process.env, stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  try {
    const [{ port }] = await Promise.race([once(child, 'message'), once(child, 'exit').then(() => { throw new Error('App exited before startup'); })]);
    const restarted = await listed(w.id, `http://127.0.0.1:${port}`);
    assert.equal(restarted.dailyTarget, 6);
    assert.deepEqual(restarted.progress, { daysMet: 1, daysSoFar: 11 });
  } finally { child.kill('SIGTERM'); await once(child, 'exit'); }
});

test('TC-153: a goal not yet started takes the new target from its start date, in one version', async () => {
  const other = await db.template.create({ data: { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 100, createdBy: manager.id } });
  const created = await request(app).post('/api/goals').set('Cookie', cookies.a).send({ templateId: other.id, dailyTarget: 8, startDate: day(3), endDate: day(20) }).expect(201);
  const changed = await patch(created.body.goal.id, { dailyTarget: 6 });
  assert.equal(changed.status, 200);
  assert.deepEqual((await versions(created.body.goal.id)).map(({ from, target }) => ({ from, target })), [{ from: day(3), target: 6 }]);
});

test('TC-154: ended goals, bad values and out-of-range targets are refused in contract order and change nothing', async () => {
  const sleep = await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, createdBy: manager.id } });
  const steps = await db.template.create({ data: { name: 'Steps', unit: 'k', minValue: 0, maxValue: 30, createdBy: manager.id } });
  const ended = await makeGoal({ template: sleep, start: day(-20), end: day(-1) });
  const endsToday = await makeGoal({ template: steps, start: day(-5), end: day(0) });
  const before = await snapshot();
  const refuse = async (id, body, status, code) => {
    const res = await patch(id, body);
    assert.equal(res.status, status, `${JSON.stringify(body)} on ${id}`);
    assert.equal(res.body.error.code, code, JSON.stringify(body));
    assert.equal(typeof res.body.error.message, 'string');
  };
  // (a) an ended goal
  await refuse(ended.id, { dailyTarget: 6 }, 409, 'GOAL_ENDED');
  const endedRes = await patch(ended.id, { dailyTarget: 6 });
  assert.equal(endedRes.body.error.message, 'This goal has ended and cannot be changed.');
  // (c) bad values and the range on W
  for (const bad of [0, 'x', 2.555, -1, null]) await refuse(w.id, { dailyTarget: bad }, 400, 'VALIDATION_ERROR');
  await refuse(w.id, {}, 400, 'VALIDATION_ERROR');
  await refuse(w.id, { dailyTarget: 13 }, 400, 'TARGET_ABOVE_TEMPLATE_MAX');
  await refuse(w.id, { dailyTarget: 1 }, 400, 'TARGET_NOT_ABOVE_TEMPLATE_MIN');
  // Check order (section 4): not found before validation, validation before ended, ended before the range.
  await refuse(2147483000, { dailyTarget: 'x' }, 404, 'GOAL_NOT_FOUND');
  await refuse(ended.id, { dailyTarget: 'x' }, 400, 'VALIDATION_ERROR');
  await refuse(ended.id, { dailyTarget: 99 }, 409, 'GOAL_ENDED');
  assert.deepEqual(await snapshot(), before, 'a refused request changes nothing');
  // (b) a goal ending today can still change
  assert.equal((await patch(endsToday.id, { dailyTarget: 6 })).status, 200);
  // (e) the maximum is accepted; sending the current target again writes nothing
  const atMax = await patch(w.id, { dailyTarget: 12 });
  assert.equal(atMax.status, 200);
  const afterFirst = await snapshot();
  const again = await patch(w.id, { dailyTarget: 12 });
  assert.equal(again.status, 200);
  assert.equal(again.body.goal.dailyTarget, 12);
  assert.deepEqual(await snapshot(), afterFirst, 'the second 12 writes no row');
  // Other body fields are ignored.
  const extra = await patch(w.id, { dailyTarget: 9, templateId: sleep.id, startDate: day(-1), endDate: day(1), participantId: b.id });
  assert.equal(extra.status, 200);
  const row = await db.goal.findUniqueOrThrow({ where: { id: w.id } });
  assert.deepEqual([row.templateId, row.participantId, row.startDate.toISOString().slice(0, 10), row.endDate.toISOString().slice(0, 10), Number(row.dailyTarget)], [water.id, a.id, day(-10), day(10), 9]);
});

test.todo('TC-154 (d): a fraction on a TIME goal gets 400 VALIDATION_ERROR (added once Template.kind from #168 is in staging, ADR 0087)');

test('TC-155: anonymous 401, Manager 403, another Participant and an unknown id 404; nothing changes; the route is audited', async () => {
  const before = await snapshot();
  const anonymous = await patch(w.id, { dailyTarget: 6 }, null);
  assert.equal(anonymous.status, 401); assert.equal(anonymous.body.error.code, 'UNAUTHENTICATED');
  const asManager = await patch(w.id, { dailyTarget: 6 }, cookies.manager);
  assert.equal(asManager.status, 403); assert.equal(asManager.body.error.code, 'FORBIDDEN');
  for (const [id, cookie] of [[w.id, cookies.b], [2147483000, cookies.a], ['abc', cookies.a], [0, cookies.a], [99999999999, cookies.a]]) {
    const res = await patch(id, { dailyTarget: 6 }, cookie);
    assert.equal(res.status, 404, `id ${id}`); assert.equal(res.body.error.code, 'GOAL_NOT_FOUND');
  }
  // Section 4 order 3 before 4: a body that is not JSON still gets 404 on a goal that is not the caller's.
  const raw = (id, cookie) => request(app).patch(`/api/goals/${id}`).set('Cookie', cookie).set('Content-Type', 'application/json').send('{"dailyTarget":');
  for (const [id, cookie] of [[w.id, cookies.b], [2147483000, cookies.a]]) {
    const res = await raw(id, cookie);
    assert.equal(res.status, 404, `bad JSON on ${id}`); assert.equal(res.body.error.code, 'GOAL_NOT_FOUND');
  }
  const own = await raw(w.id, cookies.a);
  assert.equal(own.status, 400); assert.equal(own.body.error.code, 'VALIDATION_ERROR');
  assert.deepEqual(await snapshot(), before);
  // TC-08 audits every protected route; the change route must be listed there.
  assert.deepEqual(protectedRoutes.find(route => route.method === 'patch' && route.path === '/api/goals/:id'),
    { method: 'patch', path: '/api/goals/:id', requestPath: '/api/goals/1', roles: ['PARTICIPANT'] });
});

test('TC-157: a created goal has its first version; a goal with no version uses daily_target, then keeps it for earlier days', async () => {
  const other = await db.template.create({ data: { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 100, createdBy: manager.id } });
  const created = await request(app).post('/api/goals').set('Cookie', cookies.a).send({ templateId: other.id, dailyTarget: 20, startDate: day(0), endDate: day(5) }).expect(201);
  assert.deepEqual((await versions(created.body.goal.id)).map(({ from, target }) => ({ from, target })), [{ from: day(0), target: 20 }]);
  const sleep = await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, createdBy: manager.id } });
  const legacy = await makeGoal({ template: sleep, start: day(-5), end: day(5), withVersion: false });
  for (const n of [-2, 0]) await db.entry.create({ data: { goalId: legacy.id, entryDate: asDate(day(n)), value: 7 } });
  assert.deepEqual((await listed(legacy.id)).progress, { daysMet: 0, daysSoFar: 6 }, 'no version: every day uses daily_target 8');
  assert.equal((await patch(legacy.id, { dailyTarget: 6 })).status, 200);
  assert.deepEqual((await versions(legacy.id)).map(({ from, target }) => ({ from, target })), [{ from: day(-5), target: 8 }, { from: day(0), target: 6 }]);
  assert.deepEqual((await listed(legacy.id)).progress, { daysMet: 1, daysSoFar: 6 });
});
