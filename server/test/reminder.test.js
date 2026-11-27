// F-17 stored reminder (Issue #158): TC-43 and TC-168 to TC-172 against a real database.
import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp, protectedRoutes } from '../src/app.js';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate disposable test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
let app, a, b, manager, water, cookies, w, e;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const day = n => new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const asDate = text => new Date(`${text}T00:00:00Z`);
const put = (id, body, cookie = cookies.a, target = app) => {
  const call = request(target).put(`/api/goals/${id}/reminder`);
  return (cookie ? call.set('Cookie', cookie) : call).send(body);
};
const remove = (id, cookie = cookies.a) => {
  const call = request(app).delete(`/api/goals/${id}/reminder`);
  return cookie ? call.set('Cookie', cookie) : call;
};
const rows = async () => (await db.goalReminder.findMany({ orderBy: { goalId: 'asc' } }))
  .map(row => ({ goalId: row.goalId, time: row.time, weekdays: row.weekdays }));
const listed = async (id, target = app) => (await request(target).get('/api/goals').set('Cookie', cookies.a).expect(200)).body.goals.find(goal => goal.id === id);
async function makeGoal({ participant = a, template = water, target = 8, start, end }) {
  const goal = await db.goal.create({ data: { participantId: participant.id, templateId: template.id, dailyTarget: target, startDate: asDate(start), endDate: asDate(end) } });
  await db.goalTarget.create({ data: { goalId: goal.id, effectiveFrom: asDate(start), dailyTarget: target } });
  return goal;
}

before(async () => db.$connect());
beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  [a, b, manager] = await Promise.all(['PARTICIPANT', 'PARTICIPANT', 'MANAGER'].map((role, i) => db.user.create({ data: {
    username: `reminder-user-${i}`, displayName: `Reminder User ${i}`, role, passwordHash: 'unused-generated-session-fixture',
  } })));
  cookies = {};
  for (const [key, user] of Object.entries({ a, b, manager })) {
    const id = randomBytes(32).toString('base64url');
    await db.session.create({ data: { id, userId: user.id, createdAt: new Date(), expiresAt: new Date(Date.now() + 3600000) } });
    cookies[key] = `sid=${id}`;
  }
  water = await db.template.create({ data: { name: 'Water', unit: 'glasses', minValue: 1, maxValue: 12, createdBy: manager.id } });
  const sleep = await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, createdBy: manager.id } });
  w = await makeGoal({ start: day(-5), end: day(5) });
  e = await makeGoal({ template: sleep, start: day(-20), end: day(-1) });
  app = createApp({ db });
});
after(async () => db.$disconnect());

// Replaces fetch, http.request and https.request with recorders. Calls to the app's own test server are not counted.
function recordOutbound(ownPort) {
  const calls = [];
  const saved = { fetch: globalThis.fetch, http: http.request, https: https.request };
  const own = args => {
    const [first, second] = args;
    const target = typeof first === 'string' || first instanceof URL ? new URL(first) : null;
    const options = target ? (typeof second === 'object' ? second : {}) : (first || {});
    const host = target ? target.hostname : (options.hostname || options.host);
    const port = Number(target ? target.port : options.port);
    return ['127.0.0.1', 'localhost'].includes(host) && port === ownPort;
  };
  globalThis.fetch = (...args) => { calls.push(['fetch', String(args[0])]); return Promise.reject(new Error('outbound fetch blocked in TC-43')); };
  http.request = function (...args) { if (!own(args)) calls.push(['http', args[0]]); return saved.http.apply(this, args); };
  https.request = function (...args) { calls.push(['https', args[0]]); return saved.https.apply(this, args); };
  return { calls, restore() { globalThis.fetch = saved.fetch; http.request = saved.http; https.request = saved.https; } };
}

test('TC-43: a stored reminder is returned Monday first, survives a restart, rides on POST and PATCH, is not in the calendar, and nothing is sent', async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const recorder = recordOutbound(port);
  try {
    const saved = await put(w.id, { time: '07:30', weekdays: ['FRI', 'MON'] }, cookies.a, base);
    assert.equal(saved.status, 200);
    assert.deepEqual(saved.body, { reminder: { time: '07:30', weekdays: ['MON', 'FRI'] } });
    assert.deepEqual((await listed(w.id, base)).reminder, { time: '07:30', weekdays: ['MON', 'FRI'] });
    assert.equal((await listed(e.id, base)).reminder, null, 'a goal with no reminder has reminder null');
    const reading = await db.template.create({ data: { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 100, createdBy: manager.id } });
    const created = await request(base).post('/api/goals').set('Cookie', cookies.a).send({ templateId: reading.id, dailyTarget: 20, startDate: day(0), endDate: day(10) });
    assert.equal(created.status, 201);
    assert.equal(created.body.goal.reminder, null, 'the POST response carries reminder null');
    const changed = await request(base).patch(`/api/goals/${w.id}`).set('Cookie', cookies.a).send({ dailyTarget: 6 });
    assert.equal(changed.status, 200);
    assert.deepEqual(changed.body.goal.reminder, { time: '07:30', weekdays: ['MON', 'FRI'] }, 'the PATCH response carries W\'s reminder');
    // ADR 0096: GET /api/calendar is built in #155; this step stays red until #155 is merged into this branch.
    const calendar = await request(base).get(`/api/calendar?month=${day(0).slice(0, 7)}`).set('Cookie', cookies.a);
    assert.equal(calendar.status, 200, 'GET /api/calendar (Issue #155) must exist');
    const dayD = calendar.body.days.find(entry => entry.date === day(0));
    assert.ok(dayD.goals.length > 0, 'day D lists A\'s goals');
    for (const goal of dayD.goals) assert.equal(Object.hasOwn(goal, 'reminder'), false, `calendar goal ${goal.goalId} has no reminder field`);
  } finally {
    recorder.restore();
    server.close();
  }
  assert.deepEqual(recorder.calls, [], 'no outbound call while storing and reading');
  const child = spawn(process.execPath, [fileURLToPath(new URL('./goal-process.js', import.meta.url))], { env: process.env, stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
  try {
    const [{ port: restartedPort }] = await Promise.race([once(child, 'message'), once(child, 'exit').then(() => { throw new Error('App exited before startup'); })]);
    assert.deepEqual((await listed(w.id, `http://127.0.0.1:${restartedPort}`)).reminder, { time: '07:30', weekdays: ['MON', 'FRI'] });
  } finally { child.kill('SIGTERM'); await once(child, 'exit'); }
});

test('TC-168: saving again replaces the reminder, and two saves at once leave one row', async () => {
  assert.equal((await put(w.id, { time: '07:30', weekdays: ['MON'] })).status, 200);
  const replaced = await put(w.id, { time: '21:15', weekdays: ['SUN', 'TUE'] });
  assert.equal(replaced.status, 200);
  assert.deepEqual(replaced.body.reminder, { time: '21:15', weekdays: ['TUE', 'SUN'] });
  assert.deepEqual(await rows(), [{ goalId: w.id, time: '21:15', weekdays: ['TUE', 'SUN'] }]);
  const both = await Promise.all([put(w.id, { time: '06:00', weekdays: ['WED'] }), put(w.id, { time: '06:05', weekdays: ['THU'] })]);
  assert.deepEqual(both.map(res => res.status), [200, 200]);
  const after = await rows();
  assert.equal(after.length, 1, 'one reminder per goal');
  assert.ok([JSON.stringify({ goalId: w.id, time: '06:00', weekdays: ['WED'] }), JSON.stringify({ goalId: w.id, time: '06:05', weekdays: ['THU'] })].includes(JSON.stringify(after[0])));
  assert.deepEqual((await listed(w.id)).reminder, { time: after[0].time, weekdays: after[0].weekdays });
});

test('TC-169: removing a reminder gives 204, also on an ended goal and when there is none', async () => {
  assert.equal((await put(w.id, { time: '07:30', weekdays: ['MON'] })).status, 200);
  await db.goalReminder.create({ data: { goalId: e.id, time: '22:00', weekdays: ['SAT'] } });
  for (const id of [w.id, w.id, e.id, e.id]) {
    const res = await remove(id);
    assert.equal(res.status, 204, `DELETE ${id}`);
    assert.equal(res.text, '');
  }
  assert.deepEqual(await rows(), []);
  assert.equal((await listed(w.id)).reminder, null);
});

test('TC-170: bad times and weekday lists get 400 with the contract message and change nothing; boundaries pass', async () => {
  assert.equal((await put(w.id, { time: '08:00', weekdays: ['MON'] })).status, 200);
  const before = await rows();
  const timeMessage = 'Enter a time from 00:00 to 23:59.';
  const dayMessage = 'Choose at least one weekday, each only once.';
  const refuse = async (body, message) => {
    const res = await put(w.id, body);
    assert.equal(res.status, 400, JSON.stringify(body));
    assert.deepEqual(res.body, { error: { code: 'VALIDATION_ERROR', message } }, JSON.stringify(body));
  };
  for (const time of ['24:00', '7:30', '07:60', undefined, 730, ' 07:30', '07:30:00']) await refuse({ time, weekdays: ['MON'] }, timeMessage);
  for (const weekdays of [[], ['MONDAY'], ['MON', 'MON'], 'MON', undefined, ['mon'], [1]]) await refuse({ time: '07:30', weekdays }, dayMessage);
  await refuse({ time: '24:00', weekdays: [] }, timeMessage);
  await refuse({}, timeMessage);
  assert.deepEqual(await rows(), before, 'a refused request changes nothing');
  const all = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  for (const time of ['00:00', '23:59']) {
    for (const weekdays of [['SUN'], [...all].reverse()]) {
      const res = await put(w.id, { time, weekdays, extra: 'ignored', goalId: e.id });
      assert.equal(res.status, 200, `${time} ${weekdays}`);
      assert.deepEqual(res.body, { reminder: { time, weekdays: weekdays.length === 7 ? all : ['SUN'] } });
    }
  }
  assert.deepEqual(await rows(), [{ goalId: w.id, time: '23:59', weekdays: all }], 'other body fields are ignored');
});

test('TC-171: setting on an ended goal gets 409 GOAL_ENDED; a goal ending today is accepted', async () => {
  const steps = await db.template.create({ data: { name: 'Steps', unit: 'k', minValue: 0, maxValue: 30, createdBy: manager.id } });
  const endsToday = await makeGoal({ template: steps, start: day(-5), end: day(0) });
  await db.goalReminder.create({ data: { goalId: e.id, time: '22:00', weekdays: ['SAT'] } });
  const ended = await put(e.id, { time: '07:30', weekdays: ['MON'] });
  assert.equal(ended.status, 409);
  assert.deepEqual(ended.body, { error: { code: 'GOAL_ENDED', message: 'This goal has ended and cannot be changed.' } });
  // Section 4 order: validation (order 4, 5) before ended (order 6).
  assert.equal((await put(e.id, { time: '24:00', weekdays: ['MON'] })).status, 400);
  assert.deepEqual(await rows(), [{ goalId: e.id, time: '22:00', weekdays: ['SAT'] }], 'the ended goal keeps its reminder');
  assert.deepEqual((await listed(e.id)).reminder, { time: '22:00', weekdays: ['SAT'] }, 'an ended goal still shows its reminder');
  const ok = await put(endsToday.id, { time: '07:30', weekdays: ['MON'] });
  assert.equal(ok.status, 200);
});

test('TC-172: anonymous 401, Manager 403, another Participant and an unknown id 404; nothing changes; TC-08 lists both routes', async () => {
  assert.equal((await put(w.id, { time: '07:30', weekdays: ['MON'] })).status, 200);
  const before = await rows();
  const expectError = (res, status, code) => {
    assert.equal(res.status, status);
    assert.equal(res.body.error.code, code);
  };
  const body = { time: '09:00', weekdays: ['TUE'] };
  expectError(await put(w.id, body, null), 401, 'UNAUTHENTICATED');
  expectError(await remove(w.id, null), 401, 'UNAUTHENTICATED');
  expectError(await put(w.id, body, cookies.manager), 403, 'FORBIDDEN');
  expectError(await remove(w.id, cookies.manager), 403, 'FORBIDDEN');
  for (const [id, cookie] of [[w.id, cookies.b], [2147483000, cookies.a], ['abc', cookies.a]]) {
    const refusedPut = await put(id, body, cookie);
    expectError(refusedPut, 404, 'GOAL_NOT_FOUND');
    assert.equal(refusedPut.body.error.message, 'Goal not found.');
    expectError(await remove(id, cookie), 404, 'GOAL_NOT_FOUND');
  }
  // Order 3 before order 4: a bad body on another Participant's goal is 404, not 400.
  expectError(await put(w.id, { time: 'x' }, cookies.b), 404, 'GOAL_NOT_FOUND');
  assert.deepEqual(await rows(), before, 'refused requests change nothing');
  for (const method of ['put', 'delete']) {
    const route = protectedRoutes.find(entry => entry.method === method && entry.path === '/api/goals/:id/reminder');
    assert.ok(route, `TC-08 lists ${method} /api/goals/:id/reminder`);
    assert.deepEqual(route.roles, ['PARTICIPANT']);
  }
});

test('ADR 0095: deleting a goal row deletes its reminder', async () => {
  await db.goalReminder.create({ data: { goalId: e.id, time: '22:00', weekdays: ['SAT'] } });
  await db.goal.delete({ where: { id: e.id } });
  assert.deepEqual(await rows(), []);
});
