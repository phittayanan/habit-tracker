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
let app, a, b, manager, template, cookies;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const day = n => new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const body = (changes = {}) => ({ templateId: template.id, dailyTarget: 20, startDate: day(0), endDate: day(30), ...changes });
const post = (data = body(), cookie = cookies.a) => request(app).post('/api/goals').set('Cookie', cookie).send(data);
before(async () => db.$connect());
beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  [a, b, manager] = await Promise.all(['PARTICIPANT', 'PARTICIPANT', 'MANAGER'].map((role, i) => db.user.create({ data: {
    username: `goal-user-${i}`, displayName: `Goal User ${i}`, role, passwordHash: 'unused-generated-session-fixture',
  } })));
  cookies = {};
  for (const [key, user] of Object.entries({ a, b, manager })) {
    const id = randomBytes(32).toString('base64url');
    await db.session.create({ data: { id, userId: user.id, createdAt: new Date(), expiresAt: new Date(Date.now() + 3600000) } });
    cookies[key] = `sid=${id}`;
  }
  template = await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, createdBy: manager.id } });
  app = createApp({ db });
});
after(async () => db.$disconnect());

test('TC-20: exact shape, stripped ownership, real process restart, own-only newest list', async () => {
  const created = await post(body({ participantId: b.id, userId: b.id }));
  assert.equal(created.status, 201);
  const goal = created.body.goal;
  assert.deepEqual(goal, { id: goal.id, templateId: template.id, dailyTarget: 20, startDate: day(0), endDate: day(30), state: 'ACTIVE',
    template: { id: template.id, name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24 } });
  assert.equal((await db.goal.findUniqueOrThrow({ where: { id: goal.id } })).participantId, a.id);
  await post(body(), cookies.b).expect(201);
  const ended = await post(body({ startDate: day(-5), endDate: day(-1) }));
  // An existing active goal blocks even a backdated new goal: BR-05 checks existing rows.
  assert.equal(ended.status, 409);
  const other = await db.template.create({ data: { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 100, createdBy: manager.id } });
  const second = await post(body({ templateId: other.id, dailyTarget: 5 }));
  assert.equal(second.status, 201);
  const launch = async () => {
    const child = spawn(process.execPath, [fileURLToPath(new URL('./goal-process.js', import.meta.url))], {
      env: process.env, stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
    });
    const [{ port }] = await Promise.race([once(child, 'message'), once(child, 'exit').then(() => { throw new Error('App exited before startup'); })]);
    return { child, url: `http://127.0.0.1:${port}` };
  };
  const first = await launch();
  try { await request(first.url).get('/api/goals').set('Cookie', cookies.a).expect(200); }
  finally { first.child.kill('SIGTERM'); await once(first.child, 'exit'); }
  const restarted = await launch();
  try {
    const listed = await request(restarted.url).get('/api/goals').set('Cookie', cookies.a).expect(200);
    assert.deepEqual(listed.body.goals.map(g => g.id), [second.body.goal.id, goal.id]);
    assert.deepEqual(listed.body.goals[1], { ...goal, progress: { daysMet: 0, daysSoFar: 1 } }); // F-09 adds progress to the list
  } finally { restarted.child.kill('SIGTERM'); await once(restarted.child, 'exit'); }
});

test('TC-21: active and future-start duplicates; concurrent same-user creation stores exactly one', async () => {
  const future = body({ startDate: day(10), endDate: day(20) });
  const responses = await Promise.all([post(future), post(future)]);
  assert.deepEqual(responses.map(r => r.status).sort(), [201, 409]);
  assert.equal(responses.find(r => r.status === 409).body.error.code, 'ACTIVE_GOAL_EXISTS');
  assert.equal(await db.goal.count(), 1);
  const again = await post(); assert.equal(again.status, 409); assert.equal(again.body.error.code, 'ACTIVE_GOAL_EXISTS');
});

test('TC-22: Bangkok date and goal state boundaries, independent of process timezone', async () => {
  const { goalState, bangkokToday } = await import('../src/services/goal-rules.js');
  for (const [date, expected] of [['2026-11-09', 'ACTIVE'], ['2026-11-10', 'ACTIVE'], ['2026-11-12', 'ACTIVE'], ['2026-11-13', 'ENDED']]) {
    assert.equal(goalState('2026-11-12', date), expected);
  }
  assert.equal(bangkokToday(new Date('2026-11-10T16:59:59Z')), '2026-11-10');
  assert.equal(bangkokToday(new Date('2026-11-10T17:00:00Z')), '2026-11-11');
});

test('TC-53 / TC-08: validation, auth/role precedence and both endpoint permissions', async () => {
  for (const changes of [
    { templateId: undefined }, { templateId: 'abc' }, { templateId: 1.5 }, { templateId: 2147483648 }, { templateId: 999999 },
    { dailyTarget: undefined }, { dailyTarget: 'abc' }, { dailyTarget: 0 }, { dailyTarget: -1 }, { dailyTarget: 10.555 }, { dailyTarget: 100000000 },
    { dailyTarget: 1e-7 }, { startDate: undefined }, { endDate: undefined }, { startDate: '11/10/2026' },
    { startDate: '2026-02-30' }, { endDate: '2026-13-01' }, { endDate: day(-1) },
  ]) {
    const response = await post(body(changes));
    assert.equal(response.status, 400, JSON.stringify(changes)); assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  }
  for (const method of ['get', 'post']) {
    const anonymous = await request(app)[method]('/api/goals').send({});
    assert.equal(anonymous.status, 401); assert.equal(anonymous.body.error.code, 'UNAUTHENTICATED');
    const wrongRole = await request(app)[method]('/api/goals').set('Cookie', cookies.manager).send({});
    assert.equal(wrongRole.status, 403); assert.equal(wrongRole.body.error.code, 'FORBIDDEN');
  }
  await request(app).post('/api/goals').set('Cookie', cookies.a).set('Content-Type', 'application/json').send('{').expect(400);
  assert.equal(await db.goal.count(), 0);
});

test('TC-54: max equality, Decimal boundary and validation/range/duplicate precedence', async () => {
  await post(body({ dailyTarget: 24, endDate: day(0) })).expect(201);
  for (const [changes, code] of [
    [{ dailyTarget: 24.5 }, 'TARGET_ABOVE_TEMPLATE_MAX'], [{ dailyTarget: 30.555 }, 'VALIDATION_ERROR'],
    [{ dailyTarget: 25, startDate: undefined }, 'VALIDATION_ERROR'],
    [{ templateId: 999999, dailyTarget: 25 }, 'VALIDATION_ERROR'],
  ]) { const r = await post(body(changes)); assert.equal(r.status, 400); assert.equal(r.body.error.code, code); }
  assert.equal(await db.goal.count(), 1);
  await db.template.update({ where: { id: template.id }, data: { maxValue: '99999999.99' } });
  await post(body({ dailyTarget: 99999999.99 }), cookies.b).expect(201);
});

test('TC-55: ended allows new, different template and different owner; one-day/past goals accepted', async () => {
  const ended = await post(body({ startDate: day(-10), endDate: day(-1) }));
  assert.equal(ended.status, 201); assert.equal(ended.body.goal.state, 'ENDED');
  await post(body(), cookies.b).expect(201);
  await post(body({ participantId: b.id })).expect(201);
  const t2 = await db.template.create({ data: { name: 'Walk', unit: 'steps', minValue: 10, maxValue: 100, createdBy: manager.id } });
  const r = await post(body({ templateId: t2.id, dailyTarget: 0.01, startDate: day(0), endDate: day(0), userId: b.id }));
  assert.equal(r.status, 201); assert.equal(r.body.goal.state, 'ACTIVE');
  assert.equal(await db.goal.count({ where: { participantId: a.id } }), 3);
});

test('TC-74: creation waits for real template lock, then validates committed maximum', async () => {
  let locked, release;
  const ready = new Promise(resolve => { locked = resolve; });
  const held = new Promise(resolve => { release = resolve; });
  const transaction = db.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "Template" WHERE id = ${template.id} FOR UPDATE`;
    locked(); await held;
    await tx.template.update({ where: { id: template.id }, data: { maxValue: 10 } });
  }, { timeout: 10000 });
  await ready;
  let finished = false;
  const pending = post().then(r => { finished = true; return r; });
  try { await new Promise(resolve => setTimeout(resolve, 500)); assert.equal(finished, false); }
  finally { release(); await transaction; }
  const result = await pending;
  assert.equal(result.status, 400); assert.equal(result.body.error.code, 'TARGET_ABOVE_TEMPLATE_MAX');
  assert.equal(await db.goal.count(), 0);
});

test('Goal migration enforces target/date constraints and has no stored state', async () => {
  const columns = await db.$queryRaw`SELECT column_name::text AS name FROM information_schema.columns WHERE table_name = 'Goal' ORDER BY column_name`;
  assert.deepEqual(columns.map(r => r.name), ['created_at','daily_target','end_date','id','participant_id','start_date','template_id']);
  for (const data of [{ dailyTarget: 0, startDate: new Date(`${day(0)}T00:00:00Z`), endDate: new Date(`${day(1)}T00:00:00Z`) },
    { dailyTarget: 1, startDate: new Date(`${day(1)}T00:00:00Z`), endDate: new Date(`${day(0)}T00:00:00Z`) }]) {
    await assert.rejects(db.goal.create({ data: { participantId: a.id, templateId: template.id, ...data } }));
  }
  assert.equal(await db.goal.count(), 0);
});
