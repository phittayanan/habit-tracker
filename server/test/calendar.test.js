// F-11 GET /api/calendar (Issue #155): TC-120, TC-121 and the TC-08 route listing.
// Issue #156 fills the day state by the F-12 rule; TC-122, TC-123 (API) and TC-124 are at the end.
import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp, protectedRoutes } from '../src/app.js';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate disposable test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const day = n => new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const asDate = text => new Date(`${text}T00:00:00Z`);
const monthOf = text => text.slice(0, 7);
const previousMonth = month => { const [y, m] = month.split('-').map(Number); return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`; };
const nextMonth = month => { const [y, m] = month.split('-').map(Number); return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`; };
const daysIn = month => { const [y, m] = month.split('-').map(Number); return new Date(Date.UTC(y, m, 0)).getUTCDate(); };
let app, a, b, manager, cookies, water, sleep, w, s, x, bGoal;

async function makeGoal(user, template, start, end, target) {
  const goal = await db.goal.create({ data: { participantId: user.id, templateId: template.id, dailyTarget: target, startDate: asDate(start), endDate: asDate(end) } });
  await db.goalTarget.create({ data: { goalId: goal.id, effectiveFrom: asDate(start), dailyTarget: target } });
  return goal;
}
const entry = (goal, date, value, createdAt) => db.entry.create({ data: { goalId: goal.id, entryDate: asDate(date), value, createdAt } });
const get = (query, cookie = cookies.a) => request(app).get(`/api/calendar${query}`).set('Cookie', cookie);
const dayOf = (body, date) => body.days.find(item => item.date === date);

before(async () => db.$connect());
beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  [a, b, manager] = await Promise.all(['PARTICIPANT', 'PARTICIPANT', 'MANAGER'].map((role, i) => db.user.create({ data: {
    username: `calendar-user-${i}`, displayName: `Calendar User ${i}`, role, passwordHash: 'unused-generated-session-fixture',
  } })));
  cookies = {};
  for (const [key, user] of Object.entries({ a, b, manager })) {
    const id = randomBytes(32).toString('base64url');
    await db.session.create({ data: { id, userId: user.id, createdAt: new Date(), expiresAt: new Date(Date.now() + 3600000) } });
    cookies[key] = `sid=${id}`;
  }
  water = await db.template.create({ data: { name: 'Water', unit: 'glasses', kind: 'COUNT', minValue: 1, maxValue: 12, createdBy: manager.id } });
  sleep = await db.template.create({ data: { name: 'Sleep', unit: 'minutes', kind: 'TIME', minValue: 0, maxValue: 720, createdBy: manager.id } });
  const reading = await db.template.create({ data: { name: 'Reading', unit: 'pages', kind: 'COUNT', minValue: 0, maxValue: 100, createdBy: manager.id } });
  w = await makeGoal(a, water, day(-30), day(30), 8);
  s = await makeGoal(a, sleep, day(-30), day(30), 420);
  x = await makeGoal(a, reading, day(-10), day(-3), 20);
  bGoal = await makeGoal(b, water, day(-30), day(30), 6);
  const t = Date.now();
  await entry(w, day(0), 3, new Date(t - 3000));
  await entry(w, day(0), 2, new Date(t - 1000));
  await entry(s, day(0), 430, new Date(t - 2000));
  await entry(w, day(-1), 8, new Date(t - 5000));
  await entry(x, day(-5), 20.5, new Date(t - 6000));
  await entry(bGoal, day(0), 4, new Date(t - 4000));
  app = createApp({ db });
});
after(async () => db.$disconnect());

test('TC-120: the current month has the section 7 shape, one item per day, entries newest first', async () => {
  const res = await get('');
  assert.equal(res.status, 200);
  assert.equal(res.body.month, monthOf(day(0)));
  assert.equal(res.body.today, day(0));
  assert.equal(res.body.days.length, daysIn(monthOf(day(0))));
  assert.deepEqual(res.body.days.map(item => item.date), [...res.body.days.map(item => item.date)].sort());
  assert.equal(res.body.days[0].date, `${monthOf(day(0))}-01`);
  for (const item of res.body.days) {
    if (item.goals.length === 0) assert.equal(item.state, null, item.date);
    else assert.ok(['ALL_MET', 'SOME_MET', 'NONE_MET', 'NOTHING'].includes(item.state), item.date);
  }
  assert.deepEqual(dayOf(res.body, day(0)), { date: day(0), state: 'SOME_MET', goals: [
    { goalId: w.id, name: 'Water', unit: 'glasses', kind: 'COUNT', target: 8, total: 5, met: false, minValue: 1, maxValue: 12,
      entries: [{ id: res.body.days.find(i => i.date === day(0)).goals[0].entries[0].id, value: 2 }, { id: res.body.days.find(i => i.date === day(0)).goals[0].entries[1].id, value: 3 }] },
    { goalId: s.id, name: 'Sleep', unit: 'minutes', kind: 'TIME', target: 420, total: 430, met: true, minValue: 0, maxValue: 720,
      entries: [{ id: res.body.days.find(i => i.date === day(0)).goals[1].entries[0].id, value: 430 }] },
  ] });
  const ids = dayOf(res.body, day(0)).goals[0].entries.map(e => e.id);
  const stored = await db.entry.findMany({ where: { goalId: w.id, entryDate: asDate(day(0)) }, orderBy: { createdAt: 'desc' } });
  assert.deepEqual(ids, stored.map(row => row.id), 'newest saved first');
  // A future day in this month lists no goal.
  const future = res.body.days.find(item => item.date > day(0));
  if (future) assert.deepEqual(future.goals, []);
});

test('TC-120: a day lists exactly the goals active that day; equal-to-target is met; exact decimals', async () => {
  for (const [date, names] of [[day(-1), ['Water', 'Sleep']], [day(-3), ['Water', 'Sleep', 'Reading']], [day(-5), ['Water', 'Sleep', 'Reading']], [day(-11), ['Water', 'Sleep']]]) {
    const res = await get(`?month=${monthOf(date)}`).expect(200);
    assert.deepEqual(dayOf(res.body, date).goals.map(g => g.name).sort(), [...names].sort(), date);
  }
  const yesterday = dayOf((await get(`?month=${monthOf(day(-1))}`)).body, day(-1)).goals.find(g => g.name === 'Water');
  assert.equal(yesterday.total, 8); assert.equal(yesterday.met, true);
  const reading = dayOf((await get(`?month=${monthOf(day(-5))}`)).body, day(-5)).goals.find(g => g.name === 'Reading');
  assert.equal(reading.total, 20.5); assert.equal(reading.met, true);
  assert.deepEqual(reading.entries.map(e => e.value), [20.5]);
  // A day before every goal: no goals.
  const early = await get(`?month=${monthOf(day(-31))}`).expect(200);
  assert.deepEqual(dayOf(early.body, day(-31)).goals, []);
});

test('TC-120: the target of a day is the version valid that day (F-14)', async () => {
  await db.goalTarget.create({ data: { goalId: w.id, effectiveFrom: asDate(day(0)), dailyTarget: 5 } });
  await db.goal.update({ where: { id: w.id }, data: { dailyTarget: 5 } });
  const now = dayOf((await get(`?month=${monthOf(day(0))}`)).body, day(0)).goals.find(g => g.name === 'Water');
  assert.equal(now.target, 5); assert.equal(now.met, true);
  const before = dayOf((await get(`?month=${monthOf(day(-1))}`)).body, day(-1)).goals.find(g => g.name === 'Water');
  assert.equal(before.target, 8);
});

test('TC-120: the previous month, a month after this one, and bad months', async () => {
  const prev = await get(`?month=${previousMonth(monthOf(day(0)))}`).expect(200);
  assert.equal(prev.body.month, previousMonth(monthOf(day(0))));
  assert.equal(prev.body.days.length, daysIn(prev.body.month));
  const later = await get(`?month=${nextMonth(monthOf(day(0)))}`).expect(200);
  assert.ok(later.body.days.every(item => item.state === null && item.goals.length === 0));
  for (const bad of ['2026-13', 'abc', '2026-1', '2026-00', '202611', '2026-11-01', '']) {
    const res = await get(`?month=${bad}`);
    assert.equal(res.status, 400, bad); assert.equal(res.body.error.code, 'VALIDATION_ERROR', bad);
  }
  const twice = await get('?month=2026-10&month=2026-11');
  assert.equal(twice.status, 400); assert.equal(twice.body.error.code, 'VALIDATION_ERROR');
});

test('TC-121: B sees only own goals; Manager 403; anonymous 401; TC-08 lists the route', async () => {
  const res = await get('', cookies.b).expect(200);
  const goals = res.body.days.flatMap(item => item.goals);
  assert.ok(goals.length > 0);
  assert.ok(goals.every(g => g.goalId === bGoal.id));
  const mine = dayOf(res.body, day(0)).goals[0];
  assert.equal(mine.total, 4); assert.equal(mine.target, 6);
  const asManager = await get('', cookies.manager);
  assert.equal(asManager.status, 403); assert.equal(asManager.body.error.code, 'FORBIDDEN');
  const anonymous = await request(app).get('/api/calendar');
  assert.equal(anonymous.status, 401); assert.equal(anonymous.body.error.code, 'UNAUTHENTICATED');
  // Session (401) and role (403) come before validation (400).
  assert.equal((await request(app).get('/api/calendar?month=abc')).status, 401);
  assert.equal((await get('?month=abc', cookies.manager)).status, 403);
  assert.deepEqual(protectedRoutes.find(route => route.path === '/api/calendar'), { method: 'get', path: '/api/calendar', roles: ['PARTICIPANT'] });
});

// F-12 section 10: on these days the Participant has only W and S.
const stateOf = async date => dayOf((await get(`?month=${monthOf(date)}`).expect(200)).body, date).state;
const save = (goal, date, value) => request(app).post(`/api/goals/${goal.id}/entries`).set('Cookie', cookies.a).send({ entryDate: date, value }).expect(201);

test('TC-123 (API): a past day is judged against the target valid on that day', async () => {
  await db.entry.deleteMany();
  await db.goalTarget.create({ data: { goalId: w.id, effectiveFrom: asDate(day(0)), dailyTarget: 6 } });
  await db.goal.update({ where: { id: w.id }, data: { dailyTarget: 6 } });
  for (const date of [day(-2), day(0)]) {
    await entry(w, date, 7, new Date());
    await entry(s, date, 420, new Date());
  }
  assert.equal(await stateOf(day(-2)), 'SOME_MET');
  assert.equal(await stateOf(day(0)), 'ALL_MET');
});

test('TC-124: today is live, from NOTHING to SOME_MET to ALL_MET as entries are saved', async () => {
  await db.entry.deleteMany();
  assert.equal(await stateOf(day(0)), 'NOTHING');
  await save(s, day(0), 420);
  assert.equal(await stateOf(day(0)), 'SOME_MET');
  await save(w, day(0), 8);
  assert.equal(await stateOf(day(0)), 'ALL_MET');
});

test('TC-122: editing or deleting an entry changes the day state (after F-13)', async () => {
  await db.entry.deleteMany();
  const kept = await entry(w, day(-1), 8, new Date());
  await entry(s, day(-1), 420, new Date());
  const url = `/api/goals/${w.id}/entries/${kept.id}`;
  const waterOf = async () => dayOf((await get(`?month=${monthOf(day(-1))}`).expect(200)).body, day(-1)).goals.find(g => g.goalId === w.id);
  assert.equal(await stateOf(day(-1)), 'ALL_MET');
  await request(app).patch(url).set('Cookie', cookies.a).send({ value: 5 }).expect(200);
  assert.equal(await stateOf(day(-1)), 'SOME_MET');
  assert.equal((await waterOf()).total, 5);
  const removed = await request(app).delete(url).set('Cookie', cookies.a);
  assert.ok(removed.status === 200 || removed.status === 204, String(removed.status));
  assert.equal(await stateOf(day(-1)), 'SOME_MET');
  assert.deepEqual((await waterOf()).entries, []);
});
