import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate disposable test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
let app, a, b, manager, template, other, cookies, ga, gb;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const day = n => new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const asDate = text => new Date(`${text}T00:00:00Z`);
const goalFor = (user, tpl) => db.goal.create({ data: { participantId: user.id, templateId: tpl.id, dailyTarget: 10, startDate: asDate(day(-5)), endDate: asDate(day(20)) } });
const snapshot = async () => JSON.stringify([await db.goal.findMany({ orderBy: { id: 'asc' } }), await db.entry.findMany({ orderBy: { id: 'asc' } })]);
before(async () => db.$connect());
beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  [a, b, manager] = await Promise.all(['PARTICIPANT', 'PARTICIPANT', 'MANAGER'].map((role, i) => db.user.create({ data: {
    username: `privacy-user-${i}`, displayName: `Privacy User ${i}`, role, passwordHash: 'unused-generated-session-fixture',
  } })));
  cookies = {};
  for (const [key, user] of Object.entries({ a, b, manager })) {
    const id = randomBytes(32).toString('base64url');
    await db.session.create({ data: { id, userId: user.id, createdAt: new Date(), expiresAt: new Date(Date.now() + 3600000) } });
    cookies[key] = `sid=${id}`;
  }
  template = await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, createdBy: manager.id } });
  other = await db.template.create({ data: { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 100, createdBy: manager.id } });
  ga = await goalFor(a, template); gb = await goalFor(b, template);
  await db.entry.create({ data: { goalId: ga.id, entryDate: asDate(day(-1)), value: 8 } });
  app = createApp({ db });
});
after(async () => db.$disconnect());

test('TC-33: Participant B cannot read or change A; A id in a goal body is stripped', async () => {
  const mine = await request(app).get('/api/goals').set('Cookie', cookies.b).expect(200);
  assert.deepEqual(mine.body.goals.map(g => g.id), [gb.id]);
  const before = await snapshot();
  for (const r of [await request(app).get(`/api/goals/${ga.id}/entries`).set('Cookie', cookies.b),
    await request(app).post(`/api/goals/${ga.id}/entries`).set('Cookie', cookies.b).send({ entryDate: day(0), value: 5 })]) {
    assert.equal(r.status, 404); assert.equal(r.body.error.code, 'GOAL_NOT_FOUND');
  }
  assert.equal(await snapshot(), before, 'nothing stored or changed');
  const created = await request(app).post('/api/goals').set('Cookie', cookies.b).send({ templateId: other.id, dailyTarget: 5, startDate: day(0), endDate: day(10), participantId: a.id, userId: a.id });
  assert.equal(created.status, 201);
  const row = await db.goal.findUniqueOrThrow({ where: { id: created.body.goal.id } });
  assert.equal(row.participantId, b.id);
  assert.equal(await db.goal.count({ where: { participantId: a.id } }), 1);
  assert.equal((await request(app).get('/api/goals').set('Cookie', cookies.a).expect(200)).body.goals.length, 1);
});

test('TC-34: Manager 403 and anonymous 401 on every goal and entry endpoint, nothing stored', async () => {
  const before = await snapshot();
  const calls = [['get', '/api/goals', undefined], ['post', '/api/goals', { templateId: other.id, dailyTarget: 5, startDate: day(0), endDate: day(10) }],
    ['get', `/api/goals/${ga.id}/entries`, undefined], ['post', `/api/goals/${ga.id}/entries`, { entryDate: day(0), value: 5 }]];
  for (const [method, path, body] of calls) {
    const anon = await request(app)[method](path).send(body);
    assert.equal(anon.status, 401, `${method} ${path}`); assert.equal(anon.body.error.code, 'UNAUTHENTICATED');
    const mgr = await request(app)[method](path).set('Cookie', cookies.manager).send(body);
    assert.equal(mgr.status, 403, `${method} ${path}`); assert.equal(mgr.body.error.code, 'FORBIDDEN');
    assert.equal(JSON.stringify(mgr.body).includes(String(a.username)), false);
  }
  assert.equal(await snapshot(), before);
});

test('TC-35 (API part): each Participant lists only own goals with own progress', async () => {
  await db.entry.create({ data: { goalId: gb.id, entryDate: asDate(day(-2)), value: 10 } });
  const ra = (await request(app).get('/api/goals').set('Cookie', cookies.a).expect(200)).body.goals;
  const rb = (await request(app).get('/api/goals').set('Cookie', cookies.b).expect(200)).body.goals;
  assert.deepEqual(ra.map(g => [g.id, g.progress.daysMet]), [[ga.id, 0]]);
  assert.deepEqual(rb.map(g => [g.id, g.progress.daysMet]), [[gb.id, 1]]);
});

test('TC-57: another user\'s goal and an unknown goal give the same status and body', async () => {
  const other1 = await request(app).get(`/api/goals/${ga.id}/entries`).set('Cookie', cookies.b);
  const unknown = await request(app).get('/api/goals/99999/entries').set('Cookie', cookies.b);
  assert.equal(other1.status, 404);
  assert.equal(unknown.status, other1.status);
  assert.deepEqual(unknown.body, other1.body);
  const p1 = await request(app).post(`/api/goals/${ga.id}/entries`).set('Cookie', cookies.b).send({ entryDate: day(0), value: 5 });
  const p2 = await request(app).post('/api/goals/99999/entries').set('Cookie', cookies.b).send({ entryDate: day(0), value: 5 });
  assert.equal(p1.status, p2.status); assert.deepEqual(p1.body, p2.body);
});
