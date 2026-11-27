// F-05 Template retire (Issue #152; ADR 0017, ADR 0078, ADR 0079): TC-14, TC-15, TC-19, TC-140, TC-142.
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
let app, manager, a, cookies, sleep, steps, sleepGoal;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const day = n => new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const error = (code, message) => ({ error: { code, message } });
const alreadyRetired = error('TEMPLATE_RETIRED', 'This template is already retired.');
const noNewGoal = error('TEMPLATE_RETIRED', 'This template is retired and cannot be used for a new goal.');
const noEdit = error('TEMPLATE_RETIRED', 'This template is retired and cannot be edited.');

const send = (method, path, cookie, body) => {
  const req = request(app)[method](path);
  if (cookie) req.set('Cookie', cookie);
  return body === undefined ? req : req.send(body);
};
const retire = (id, cookie = cookies.manager) => send('post', `/api/templates/${id}/retire`, cookie);
const goal = (templateId, changes = {}) => send('post', '/api/goals', cookies.a, { templateId, dailyTarget: 5, startDate: day(0), endDate: day(30), ...changes });
const template = data => db.template.create({ data: { createdBy: manager.id, unit: 'glasses', minValue: 0, maxValue: 24, ...data } });
const stored = async id => {
  const row = await db.template.findUniqueOrThrow({ where: { id } });
  return { name: row.name, unit: row.unit, minValue: Number(row.minValue), maxValue: Number(row.maxValue), state: row.state, kind: row.kind };
};
const retiredDirectly = id => db.template.update({ where: { id }, data: { state: 'RETIRED' } });

before(async () => db.$connect());
beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  [manager, a] = await Promise.all([['MANAGER', 'retire-manager'], ['PARTICIPANT', 'retire-participant-a']].map(([role, username]) => db.user.create({ data: {
    username, displayName: username, role, passwordHash: 'unused-generated-session-fixture',
  } })));
  cookies = {};
  for (const [key, user] of Object.entries({ manager, a })) {
    const id = randomBytes(32).toString('base64url');
    await db.session.create({ data: { id, userId: user.id, createdAt: new Date(), expiresAt: new Date(Date.now() + 3600000) } });
    cookies[key] = `sid=${id}`;
  }
  app = createApp({ db });
  sleep = await template({ name: 'Sleep', unit: 'hours' });
  steps = await template({ name: 'Steps', unit: 'steps', maxValue: 30000 });
  const created = await goal(sleep.id, { dailyTarget: 8 });
  assert.equal(created.status, 201);
  sleepGoal = created.body.goal;
});
after(async () => db.$disconnect());

async function launch() {
  const child = spawn(process.execPath, [fileURLToPath(new URL('./goal-process.js', import.meta.url))], {
    env: process.env, stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
  });
  const [{ port }] = await Promise.race([once(child, 'message'), once(child, 'exit').then(() => { throw new Error('App exited before startup'); })]);
  return { url: `http://127.0.0.1:${port}`, stop: async () => { child.kill('SIGTERM'); await once(child, 'exit'); } };
}

test('TC-14: a Manager retires a used and an unused template; both stay retired after a restart and a Participant sees neither', async () => {
  const first = await launch();
  try {
    for (const row of [sleep, steps]) {
      const response = await request(first.url).post(`/api/templates/${row.id}/retire`).set('Cookie', cookies.manager);
      assert.equal(response.status, 200, row.name);
      assert.deepEqual(response.body, { template: { id: row.id, name: row.name, unit: row.unit, minValue: 0, maxValue: Number(row.maxValue), state: 'RETIRED', kind: 'COUNT' } });
    }
  } finally { await first.stop(); }
  const restarted = await launch();
  try {
    const participant = await request(restarted.url).get('/api/templates').set('Cookie', cookies.a).expect(200);
    assert.deepEqual(participant.body.templates, []);
    const managers = await request(restarted.url).get('/api/templates').set('Cookie', cookies.manager).expect(200);
    assert.deepEqual(managers.body.templates.map(row => [row.name, row.state]), [['Sleep', 'RETIRED'], ['Steps', 'RETIRED']]);
  } finally { await restarted.stop(); }
});

test('TC-15: no new goal on a retired template; the existing goal still takes entries, a target change and shows its template', async () => {
  assert.equal((await retire(sleep.id)).status, 200);
  assert.equal((await retire(steps.id)).status, 200);
  const refused = await goal(steps.id);
  assert.equal(refused.status, 409, JSON.stringify(refused.body));
  assert.deepEqual(refused.body, noNewGoal);
  assert.equal(await db.goal.count({ where: { templateId: steps.id } }), 0);
  const entry = await send('post', `/api/goals/${sleepGoal.id}/entries`, cookies.a, { entryDate: day(0), value: 8 });
  assert.equal(entry.status, 201, JSON.stringify(entry.body));
  const listed = await send('get', '/api/goals', cookies.a);
  assert.equal(listed.status, 200);
  assert.equal(listed.body.goals.length, 1);
  assert.equal(listed.body.goals[0].template.name, 'Sleep');
  assert.equal(listed.body.goals[0].template.unit, 'hours');
  assert.deepEqual(listed.body.goals[0].progress, { daysMet: 1, daysSoFar: 1 });
  const changed = await send('patch', `/api/goals/${sleepGoal.id}`, cookies.a, { dailyTarget: 7 });
  assert.equal(changed.status, 200, JSON.stringify(changed.body));
  assert.equal(changed.body.goal.dailyTarget, 7);
});

test('TC-15 order: the retired refusal comes after every validation row and before the other rule rows', async () => {
  await retiredDirectly(sleep.id);
  await retiredDirectly(steps.id);
  const walk = await template({ name: 'Walk', unit: 'minutes', maxValue: 600, minValue: 10, kind: 'TIME', state: 'RETIRED' });
  for (const [id, changes] of [[steps.id, { endDate: day(-1) }], [steps.id, { dailyTarget: 5.555 }], [walk.id, { dailyTarget: 20.5 }]]) {
    const response = await goal(id, changes);
    assert.equal(response.status, 400, JSON.stringify(changes));
    assert.equal(response.body.error.code, 'VALIDATION_ERROR', JSON.stringify(changes));
  }
  // Above the maximum, not above the minimum, and a second goal on a template that already has an active one.
  for (const [id, changes] of [[steps.id, { dailyTarget: 40000 }], [walk.id, { dailyTarget: 10 }], [sleep.id, {}]]) {
    const response = await goal(id, changes);
    assert.equal(response.status, 409, JSON.stringify(changes));
    assert.deepEqual(response.body, noNewGoal);
  }
  assert.equal(await db.goal.count(), 1);
});

test('TC-19: a Participant and an anonymous caller cannot retire, also for an unknown id, and the template stays active', async () => {
  const forbidden = error('FORBIDDEN', 'You do not have permission to do this.');
  for (const id of [sleep.id, 99999]) {
    const response = await retire(id, cookies.a);
    assert.equal(response.status, 403, String(id));
    assert.deepEqual(response.body, forbidden);
  }
  const anonymous = await retire(sleep.id, null);
  assert.equal(anonymous.status, 401);
  assert.deepEqual(anonymous.body, error('UNAUTHENTICATED', 'Please log in.'));
  const foreign = await retire(sleep.id).set('Origin', 'https://evil.example');
  assert.equal(foreign.status, 403);
  assert.equal(foreign.body.error.code, 'ORIGIN_NOT_ALLOWED');
  assert.equal((await stored(sleep.id)).state, 'ACTIVE');
});

test('TC-08: POST /api/templates/:id/retire is listed as a protected Manager route', () => {
  assert.deepEqual(protectedRoutes.find(route => route.method === 'post' && route.path === '/api/templates/:id/retire'),
    { method: 'post', path: '/api/templates/:id/retire', requestPath: '/api/templates/1/retire', roles: ['MANAGER'] });
});

test('TC-140: a second retire and an edit are refused; an unknown id is 404 and a bad id is 400; nothing changes', async () => {
  assert.equal((await retire(steps.id)).status, 200);
  const before = [await stored(sleep.id), await stored(steps.id)];
  const again = await retire(steps.id);
  assert.equal(again.status, 409);
  assert.deepEqual(again.body, alreadyRetired);
  // Retired comes before the range rules (unused template) and before TEMPLATE_IN_USE (used template).
  await retiredDirectly(sleep.id);
  before[0] = await stored(sleep.id);
  for (const [id, body] of [[steps.id, { unit: 'km' }], [steps.id, { minValue: 40000 }], [sleep.id, { maxValue: 12 }]]) {
    const response = await send('patch', `/api/templates/${id}`, cookies.manager, body);
    assert.equal(response.status, 409, JSON.stringify(body));
    assert.deepEqual(response.body, noEdit);
  }
  for (const id of [99999, 2147483648]) {
    const response = await retire(id);
    assert.equal(response.status, 404, String(id));
    assert.deepEqual(response.body, error('TEMPLATE_NOT_FOUND', 'Template not found.'));
  }
  for (const id of ['abc', '0', '-1', '1.5', '1e3']) {
    const response = await retire(id);
    assert.equal(response.status, 400, id);
    assert.deepEqual(response.body, error('VALIDATION_ERROR', 'Template id must be a positive whole number.'));
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

// Holds the template row lock, starts the request, checks that it waits, then commits.
async function whileLocked(id, start, change = async () => {}) {
  let release, locked;
  const gate = new Promise(resolve => { release = resolve; });
  const lockTaken = new Promise(resolve => { locked = resolve; });
  const holder = db.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "Template" WHERE id = ${id} FOR UPDATE`;
    await change(tx);
    locked();
    await gate;
  }, { timeout: 20000, maxWait: 20000 });
  await lockTaken;
  let settled = false;
  const pending = start().then(response => { settled = true; return response; });
  const waited = await waitForLockWait();
  const settledWhileLocked = settled;
  release();
  await holder;
  const response = await pending;
  assert.equal(waited, true, 'the request must wait on the template row lock');
  assert.equal(settledWhileLocked, false);
  return response;
}

test('TC-142 (a): a retire waits for the template row lock, then returns 200', async () => {
  const water = await template({ name: 'Water' });
  const response = await whileLocked(water.id, () => retire(water.id));
  assert.equal(response.status, 200, JSON.stringify(response.body));
  assert.equal(response.body.template.state, 'RETIRED');
});

test('TC-142 (a, goal side): a goal creation that waited reads the state after the lock and is refused', async () => {
  const water = await template({ name: 'Water' });
  const response = await whileLocked(water.id, () => goal(water.id), tx => tx.template.update({ where: { id: water.id }, data: { state: 'RETIRED' } }));
  assert.equal(response.status, 409, JSON.stringify(response.body));
  assert.deepEqual(response.body, noNewGoal);
  assert.equal(await db.goal.count({ where: { templateId: water.id } }), 0);
});

test('TC-142 (b): a retire and a new goal sent together give a goal before the retire, or a refusal', async () => {
  for (let round = 0; round < 10; round += 1) {
    const juice = await template({ name: `Juice ${round}` });
    const [retired, created] = await Promise.all([retire(juice.id), goal(juice.id)]);
    assert.equal(retired.status, 200, `round ${round}`);
    const goals = await db.goal.count({ where: { templateId: juice.id } });
    if (created.status === 201) assert.equal(goals, 1, `round ${round}`);
    else {
      assert.equal(created.status, 409, `round ${round}`);
      assert.deepEqual(created.body, noNewGoal);
      assert.equal(goals, 0);
    }
    assert.equal((await stored(juice.id)).state, 'RETIRED');
  }
});

test('TC-142 (c): two retire requests sent together give one 200 and one TEMPLATE_RETIRED', async () => {
  for (let round = 0; round < 10; round += 1) {
    const tea = await template({ name: `Tea ${round}` });
    const responses = await Promise.all([retire(tea.id), retire(tea.id)]);
    assert.deepEqual(responses.map(response => response.status).sort(), [200, 409], `round ${round}`);
    assert.deepEqual(responses.find(response => response.status === 409).body, alreadyRetired);
    assert.equal((await stored(tea.id)).state, 'RETIRED');
  }
});
