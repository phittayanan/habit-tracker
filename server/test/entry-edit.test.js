// F-13 entry edit and delete (Issue #154; contract docs/sprints/sprint-2/F-13-entry-edit-delete.md, section 10).
import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';
import { entryRoutes } from '../src/routes/entries.js';
import { computeProgress } from '../src/services/progress-rules.js';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate disposable test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
let app, a, b, manager, water, cookies, w, e3, e5;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const day = n => new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const asDate = text => new Date(`${text}T00:00:00Z`);
async function goalFor(user, tpl, from, to, target) {
  const goal = await db.goal.create({ data: { participantId: user.id, templateId: tpl.id, dailyTarget: target, startDate: asDate(day(from)), endDate: asDate(day(to)) } });
  await db.goalTarget.create({ data: { goalId: goal.id, effectiveFrom: asDate(day(from)), dailyTarget: target } });
  return goal;
}
// Each entry is saved a moment after the one before, so "newest saved first" has one answer.
let clock = Date.now() - 60000;
const entry = (goal, n, value) => db.entry.create({ data: { goalId: goal.id, entryDate: asDate(day(n)), value, createdAt: new Date(clock += 1000) } });
const url = (goalId, entryId) => `/api/goals/${goalId}/entries/${entryId}`;
const edit = (goalId, entryId, body, cookie = cookies.a) => request(app).patch(url(goalId, entryId)).set('Cookie', cookie).send(body);
const remove = (goalId, entryId, cookie = cookies.a) => request(app).delete(url(goalId, entryId)).set('Cookie', cookie);
const snapshot = async () => JSON.stringify(await db.entry.findMany({ orderBy: { id: 'asc' } }));
const dayTotal = async (goal, n) => (await db.entry.findMany({ where: { goalId: goal.id, entryDate: asDate(day(n)) } })).reduce((sum, row) => sum + Math.round(Number(row.value) * 100), 0) / 100;
const progressOf = async goal => (await request(app).get('/api/goals').set('Cookie', cookies.a).expect(200)).body.goals.find(g => g.id === goal.id).progress;
const listed = async goal => (await request(app).get(`/api/goals/${goal.id}/entries`).set('Cookie', cookies.a).expect(200)).body.entries;

before(async () => db.$connect());
beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  [a, b, manager] = await Promise.all(['PARTICIPANT', 'PARTICIPANT', 'MANAGER'].map((role, i) => db.user.create({ data: {
    username: `edit-user-${i}`, displayName: `Edit User ${i}`, role, passwordHash: 'unused-generated-session-fixture',
  } })));
  cookies = {};
  for (const [key, user] of Object.entries({ a, b, manager })) {
    const id = randomBytes(32).toString('base64url');
    await db.session.create({ data: { id, userId: user.id, createdAt: new Date(), expiresAt: new Date(Date.now() + 3600000) } });
    cookies[key] = `sid=${id}`;
  }
  water = await db.template.create({ data: { name: 'Water', unit: 'glasses', minValue: 1, maxValue: 12, createdBy: manager.id } });
  w = await goalFor(a, water, -10, 10, 8);
  e3 = await entry(w, -1, 3);
  e5 = await entry(w, -1, 5);
  app = createApp({ db });
});
after(async () => db.$disconnect());

test('TC-38 (unit): progress is computed from the entries before and after an edit and a delete', () => {
  const goal = { startDate: day(-10), endDate: day(10), dailyTarget: 8 };
  const met = entries => computeProgress(goal, entries, today()).daysMet;
  assert.equal(met([{ entryDate: day(-1), value: 3 }, { entryDate: day(-1), value: 5 }]), 1);
  assert.equal(met([{ entryDate: day(-1), value: 3 }, { entryDate: day(-1), value: 4 }]), 0);
  assert.equal(met([{ entryDate: day(-1), value: 4 }]), 0);
});

test('TC-38: edit then delete recompute the day total and days met; date, order and changes persist after a restart', async () => {
  assert.deepEqual(await progressOf(w), { daysMet: 1, daysSoFar: 11 });
  const before = await listed(w);
  assert.deepEqual(before.map(e => e.id), [e5.id, e3.id]);
  // Fields other than value are ignored (ADR 0080).
  const r = await edit(w.id, e5.id, { value: 4, entryDate: day(-2), goalId: 99999 }).expect(200);
  assert.deepEqual(r.body, { entry: { id: e5.id, goalId: w.id, entryDate: day(-1), value: 4 } });
  assert.deepEqual(await progressOf(w), { daysMet: 0, daysSoFar: 11 });
  assert.equal(await dayTotal(w, -1), 7);
  assert.deepEqual((await listed(w)).map(e => [e.id, e.entryDate]), [[e5.id, day(-1)], [e3.id, day(-1)]], 'date and order unchanged');
  const del = await remove(w.id, e3.id);
  assert.equal(del.status, 204); assert.equal(del.text, '');
  assert.equal(await dayTotal(w, -1), 4);
  assert.deepEqual(await progressOf(w), { daysMet: 0, daysSoFar: 11 });
  const child = spawn(process.execPath, [fileURLToPath(new URL('./goal-process.js', import.meta.url))], { env: process.env, stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  try {
    const [{ port }] = await Promise.race([once(child, 'message'), once(child, 'exit').then(() => { throw new Error('App exited before startup'); })]);
    const again = await request(`http://127.0.0.1:${port}`).get(`/api/goals/${w.id}/entries`).set('Cookie', cookies.a).expect(200);
    assert.deepEqual(again.body.entries, [{ id: e5.id, goalId: w.id, entryDate: day(-1), value: 4 }]);
  } finally { child.kill('SIGTERM'); await once(child, 'exit'); }
});

test('TC-144: entries of a goal with a retired template and of an ended goal can be edited', async () => {
  await db.template.update({ where: { id: water.id }, data: { state: 'RETIRED' } });
  const reading = await db.template.create({ data: { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 100, createdBy: manager.id } });
  const ended = await goalFor(a, reading, -9, -1, 10);
  const old = await entry(ended, -5, 10);
  await edit(w.id, e3.id, { value: 2 }).expect(200);
  await edit(ended.id, old.id, { value: 20 }).expect(200);
  assert.equal(await dayTotal(ended, -5), 20);
});

test('TC-145: bad values, values outside the range and a fraction of a minute are refused, changing nothing', async () => {
  const sleep = await db.template.create({ data: { name: 'Sleep', unit: 'minutes', minValue: 0, maxValue: 720, kind: 'TIME', createdBy: manager.id } });
  const s = await goalFor(a, sleep, -10, 10, 420);
  const s45 = await entry(s, -1, 45);
  const before = await snapshot();
  for (const [goalId, entryId, body, code] of [[w.id, e5.id, {}, 'VALIDATION_ERROR'], [w.id, e5.id, { value: 'x' }, 'VALIDATION_ERROR'],
    [w.id, e5.id, { value: 2.555 }, 'VALIDATION_ERROR'], [w.id, e5.id, { value: 0 }, 'VALUE_OUT_OF_RANGE'], [w.id, e5.id, { value: 13 }, 'VALUE_OUT_OF_RANGE'],
    [s.id, s45.id, { value: 45.5 }, 'VALIDATION_ERROR']]) {
    const r = await edit(goalId, entryId, body);
    assert.equal(r.status, 400, JSON.stringify(body)); assert.equal(r.body.error.code, code, JSON.stringify(body));
  }
  assert.equal((await edit(s.id, s45.id, { value: 45.5 })).body.error.message, 'Minutes must be a whole number.');
  assert.equal((await edit(w.id, e5.id, { value: 13 })).body.error.message, 'The value must be between 1 and 12.');
  assert.equal(await snapshot(), before);
});

test('TC-146: an edit or delete that would take the day total above the maximum is 409; equal is accepted', async () => {
  // Saving the same value is accepted.
  await edit(w.id, e5.id, { value: 5 }).expect(200);
  const at = await edit(w.id, e5.id, { value: 9 });
  assert.equal(at.status, 200); assert.equal(await dayTotal(w, -1), 12);
  const over = await edit(w.id, e5.id, { value: 9.01 });
  assert.equal(over.status, 409); assert.equal(over.body.error.code, 'DAILY_TOTAL_ABOVE_MAX');
  assert.equal(over.body.error.message, `Only 9 glasses left for ${day(-1)}.`);
  assert.equal(await dayTotal(w, -1), 12);

  const balance = await db.template.create({ data: { name: 'Balance', unit: 'hours', minValue: -5, maxValue: 24, createdBy: manager.id } });
  const g = await goalFor(a, balance, -10, 10, 5);
  const minus = await entry(g, 0, -5); const top = await entry(g, 0, 24); await entry(g, 0, 5);
  const before = await snapshot();
  const del = await remove(g.id, minus.id);
  assert.equal(del.status, 409); assert.equal(del.body.error.code, 'DAILY_TOTAL_ABOVE_MAX');
  assert.equal(del.body.error.message, 'Today would be above 24 hours. Change other entries first.');
  const toZero = await edit(g.id, minus.id, { value: 0 });
  assert.equal(toZero.status, 409); assert.equal(toZero.body.error.message, 'Today would be above 24 hours. Change other entries first.');
  assert.equal(await snapshot(), before, 'a refused request changes nothing');
  await edit(g.id, top.id, { value: 23 }).expect(200);
  assert.equal(await dayTotal(g, 0), 23);
});

test('TC-147 / TC-08: roles, ownership and wrong entry ids for both routes; a second delete is ENTRY_NOT_FOUND', async () => {
  for (const method of ['patch', 'delete']) {
    assert.ok(entryRoutes.some(route => route.method === method && route.path === '/api/goals/:id/entries/:entryId'), `TC-08 lists ${method}`);
  }
  const bGoal = await goalFor(b, water, -10, 10, 8);
  const bEntry = await entry(bGoal, -1, 2);
  const before = await snapshot();
  const call = (method, goalId, entryId, cookie, body = { value: 4 }) => {
    const r = request(app)[method](url(goalId, entryId));
    if (cookie) r.set('Cookie', cookie);
    return method === 'patch' ? r.send(body) : r;
  };
  for (const method of ['patch', 'delete']) {
    const anon = await call(method, w.id, e5.id);
    assert.equal(anon.status, 401); assert.equal(anon.body.error.code, 'UNAUTHENTICATED');
    const mgr = await call(method, w.id, e5.id, cookies.manager);
    assert.equal(mgr.status, 403); assert.equal(mgr.body.error.code, 'FORBIDDEN');
    // Another Participant's goal and an unknown goal give the same answer, also with a bad body.
    const other = await call(method, w.id, e5.id, cookies.b, {});
    const unknown = await call(method, 99999, e5.id, cookies.b, {});
    assert.equal(other.status, 404); assert.equal(other.body.error.code, 'GOAL_NOT_FOUND');
    assert.deepEqual(unknown.body, other.body);
    for (const entryId of [bEntry.id, 99999, 'abc']) {
      const r = await call(method, w.id, entryId, cookies.a, {});
      assert.equal(r.status, 404, `${method} ${entryId}`);
      assert.deepEqual(r.body, { error: { code: 'ENTRY_NOT_FOUND', message: 'Entry not found.' } });
    }
  }
  assert.equal(await snapshot(), before, 'nothing changes');
  await remove(w.id, e3.id).expect(204);
  const twice = await remove(w.id, e3.id);
  assert.equal(twice.status, 404); assert.equal(twice.body.error.code, 'ENTRY_NOT_FOUND');
});

test('TC-148: an edit and a create on one day at the same time never leave the day total above the maximum', async () => {
  for (let round = 0; round < 5; round += 1) {
    await db.entry.deleteMany({ where: { goalId: w.id } });
    await entry(w, -1, 3);
    const five = await entry(w, -1, 5);
    const [edited, created] = await Promise.all([
      edit(w.id, five.id, { value: 9 }),
      request(app).post(`/api/goals/${w.id}/entries`).set('Cookie', cookies.a).send({ entryDate: day(-1), value: 4 }),
    ]);
    assert.equal([edited.status === 200, created.status === 201].filter(Boolean).length, 1, `round ${round}: ${edited.status} ${created.status}`);
    assert.ok([edited.status, created.status].includes(409));
    assert.equal(await dayTotal(w, -1), 12);
  }
});
