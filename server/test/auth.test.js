import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import bcrypt from 'bcryptjs';
import express from 'express';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp, protectedRoutes } from '../src/app.js';
import { requireSession, requireRole } from '../src/middleware/auth.js';

// An explicitly separate, disposable database is required; never fall back to DATABASE_URL.
if (!process.env.TEST_DATABASE_URL) throw new Error('Set TEST_DATABASE_URL to a disposable PostgreSQL database.');
if (process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Test and application databases must differ.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
const password = randomBytes(24).toString('base64url');
let app;
let calls;
let participant;
before(async () => { await db.$connect(); });
beforeEach(async () => {
  await db.session.deleteMany();
  await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  for (const [username, displayName, role] of [
    ['manager1', 'Manager One', 'MANAGER'],
    ['participant1', 'Participant One', 'PARTICIPANT'],
    ['participant2', 'Participant Two', 'PARTICIPANT'],
  ]) await db.user.create({ data: { username, displayName, role, passwordHash } });
  participant = await db.user.findUnique({ where: { username: 'participant1' } });
  calls = [];
  app = createApp({ db, registerTestRoutes(router) {
    router.post('/api/test/manager/:id', requireSession(db), requireRole('MANAGER'), express.json(),
      (req, res, next) => { calls.push('validate'); if (!req.body?.name) return res.status(400).end(); next(); },
      (req, res, next) => { calls.push('exists'); if (req.params.id !== '1') return res.status(404).end(); next(); },
      (req, res) => { calls.push('handler'); res.status(204).end(); });
  } });
});
after(async () => { await db.$disconnect(); });
const error = (code, message) => ({ error: { code, message } });
const unauthenticated = error('UNAUTHENTICATED', 'Please log in.');
const login = (username = 'participant1', cookie) => {
  const req = request(app).post('/api/auth/login').send({ username, password });
  return cookie ? req.set('Cookie', cookie) : req;
};
const cookieOf = response => response.headers['set-cookie'][0].split(';')[0];
const sessionOf = cookie => decodeURIComponent(cookie.slice(4));
const publicUser = user => ({ id: user.id, username: user.username, displayName: user.displayName, role: user.role });

test('TC-01 / TC-46: login persists fixed eight-hour session and flags, then me works', async () => {
  const result = await login();
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { user: publicUser(participant) });
  const cookie = cookieOf(result);
  assert.match(cookie, /^sid=[A-Za-z0-9_-]{43}$/);
  for (const flag of ['HttpOnly', 'SameSite=Lax', 'Path=/', 'Max-Age=28800']) assert.ok(result.headers['set-cookie'][0].includes(flag));
  assert.ok(!result.headers['set-cookie'][0].includes('Secure'));
  const session = await db.session.findUniqueOrThrow({ where: { id: sessionOf(cookie) } });
  assert.equal(session.userId, participant.id);
  assert.equal(session.expiresAt - session.createdAt, 8 * 3600_000);
  assert.equal(await db.session.count(), 1);
  const me = await request(app).get('/api/auth/me').set('Cookie', cookie);
  assert.equal(me.status, 200);
  assert.deepEqual(me.body, result.body);
});

test('TC-02: unknown username and wrong password have identical errors and no session', async () => {
  const responses = [];
  for (const input of [{ username: 'nobody', password }, { username: 'participant1', password: randomBytes(24).toString('hex') }]) {
    const response = await request(app).post('/api/auth/login').send(input);
    assert.equal(response.status, 401);
    assert.equal(response.headers['set-cookie'], undefined);
    responses.push(response.body);
  }
  assert.deepEqual(responses[0], error('INVALID_CREDENTIALS', 'Username or password is incorrect.'));
  assert.deepEqual(responses[1], responses[0]);
  assert.equal(await db.session.count(), 0);
});

test('TC-03: logout deletes session and clears cookie; replay and anonymous logout fail', async () => {
  const cookie = cookieOf(await login());
  const response = await request(app).post('/api/auth/logout').set('Cookie', cookie);
  assert.equal(response.status, 204);
  assert.match(response.headers['set-cookie'][0], /sid=;/);
  assert.match(response.headers['set-cookie'][0], /Max-Age=0/);
  assert.equal(await db.session.count(), 0);
  const replay = await request(app).get('/api/auth/me').set('Cookie', cookie);
  assert.equal(replay.status, 401);
  assert.deepEqual(replay.body, unauthenticated);
  assert.equal((await request(app).post('/api/auth/logout')).status, 401);
});

test('TC-04: both roles expose only the contracted identity, never hash or session ID', async () => {
  for (const username of ['manager1', 'participant1']) {
    const result = await login(username);
    const cookie = cookieOf(result);
    const user = await db.user.findUniqueOrThrow({ where: { username } });
    const me = await request(app).get('/api/auth/me').set('Cookie', cookie);
    assert.equal(me.status, 200);
    for (const body of [result.body, me.body]) {
      assert.deepEqual(body, { user: publicUser(user) });
      assert.ok(!JSON.stringify(body).includes(sessionOf(cookie)));
      assert.ok(!JSON.stringify(body).includes(user.passwordHash));
    }
  }
});

test('TC-05: missing, unknown, deleted and malformed cookies are unauthenticated', async () => {
  const cookie = cookieOf(await login());
  await db.session.deleteMany();
  for (const input of ['', 'sid=abc', cookie, 'sid=%ZZ']) {
    const response = await request(app).get('/api/auth/me').set('Cookie', input);
    assert.equal(response.status, 401);
    assert.deepEqual(response.body, unauthenticated);
  }
});

test('TC-06: activity never extends expiry; expired rows are removed on access', async () => {
  const cookie = cookieOf(await login());
  const id = sessionOf(cookie);
  const original = await db.session.findUniqueOrThrow({ where: { id } });
  await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200);
  assert.equal((await db.session.findUniqueOrThrow({ where: { id } })).expiresAt.getTime(), original.expiresAt.getTime());
  await db.session.update({ where: { id }, data: {
    createdAt: new Date(original.createdAt - 8 * 3600_000), expiresAt: new Date(original.expiresAt - 8 * 3600_000),
  } });
  const response = await request(app).get('/api/auth/me').set('Cookie', cookie);
  assert.equal(response.status, 401);
  assert.deepEqual(response.body, unauthenticated);
  assert.equal(await db.session.count(), 0);
});

test('TC-62: invalid and non-JSON inputs get the same validation error without side effects', async () => {
  for (const input of [{}, { username: 'participant1' }, { username: 'participant1', password: 123 },
    { username: 'participant1', password: '' }, { username: '   ', password }, { username: 123, password },
    null, [], '{bad json', 'username=participant1']) {
    const req = request(app).post('/api/auth/login');
    const response = typeof input === 'string'
      ? await req.set('Content-Type', input.startsWith('{') ? 'application/json' : 'application/x-www-form-urlencoded').send(input)
      : await req.set('Content-Type', 'application/json').send(input === null ? 'null' : input);
    assert.equal(response.status, 400);
    assert.deepEqual(response.body, error('VALIDATION_ERROR', 'Enter your username and password.'));
    assert.equal(response.headers['set-cookie'], undefined);
  }
  assert.equal(await db.session.count(), 0);
});

test('TC-64: Origin runs before body/session checks and compares host including port', async () => {
  const cookie = cookieOf(await login());
  for (const origin of ['https://evil.example', 'not a URL', 'null', 'https://app.example:8443']) {
    for (const path of ['/api/auth/login', '/api/auth/logout']) {
      const response = await request(app).post(path).set('Host', 'app.example').set('Origin', origin)
        .set('X-Forwarded-Proto', 'https').set('Cookie', cookie).set('Content-Type', 'application/json').send('{bad');
      assert.equal(response.status, 403);
      assert.deepEqual(response.body, error('ORIGIN_NOT_ALLOWED', 'This request is not allowed from another site.'));
      assert.equal(response.headers['set-cookie'], undefined);
    }
  }
  assert.equal(await db.session.count(), 1);
  await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200);
  for (const origin of [undefined, 'https://app.example', 'http://app.example']) {
    const req = request(app).post('/api/auth/login').set('Host', 'app.example').set('X-Forwarded-Proto', 'https').send({ username: 'participant1', password });
    if (origin) req.set('Origin', origin);
    await req.expect(200);
  }
});

test('TC-08: one table covers every implemented protected route and the test-only Manager route', async () => {
  const routes = [...protectedRoutes, { method: 'post', path: '/api/test/manager/1', roles: ['MANAGER'] }];
  assert.deepEqual(protectedRoutes.map(route => `${route.method} ${route.path}`).sort(), ['get /api/auth/me', 'post /api/auth/logout']);
  const cookie = cookieOf(await login());
  for (const route of routes) {
    const anonymous = await request(app)[route.method](route.path).send({ name: 'valid' });
    assert.equal(anonymous.status, 401);
    assert.deepEqual(anonymous.body, unauthenticated);
    if (route.roles?.length === 1) {
      const forbidden = await request(app)[route.method](route.path).set('Cookie', cookie).send({ name: 'valid' });
      assert.equal(forbidden.status, 403);
      assert.deepEqual(forbidden.body, error('FORBIDDEN', 'You do not have permission to do this.'));
    }
  }
  assert.deepEqual(calls, []);
  assert.equal(await db.session.count(), 1);
});

test('TC-66: session then role, before validation/existence; client roles cannot override', async () => {
  const cookie = cookieOf(await login());
  await request(app).post('/api/test/manager/1').send({}).expect(401);
  for (const [id, body, header] of [['1', {}, false], ['99999', { name: 'valid' }, false],
    ['1', { name: 'valid', role: 'MANAGER' }, false], ['1', { name: 'valid' }, true]]) {
    const req = request(app).post(`/api/test/manager/${id}?role=MANAGER`).set('Cookie', cookie).send(body);
    if (header) req.set('X-Role', 'MANAGER');
    const response = await req;
    assert.equal(response.status, 403);
    assert.deepEqual(response.body, error('FORBIDDEN', 'You do not have permission to do this.'));
  }
  assert.deepEqual(calls, []);
  assert.equal(await db.session.count(), 1);
  // Role is loaded afresh, so changing the row affects the next request on the same cookie.
  await db.user.update({ where: { id: participant.id }, data: { role: 'MANAGER' } });
  await request(app).post('/api/test/manager/1').set('Cookie', cookie).send({ name: 'valid' }).expect(204);
  assert.deepEqual(calls, ['validate', 'exists', 'handler']);
});

test('OP-01.4 / OP-07.7: login replaces incoming session, trims username and strips extra fields', async () => {
  const old = cookieOf(await login());
  const response = await request(app).post('/api/auth/login').set('Cookie', old)
    .send({ username: ' participant1 ', password, role: 'MANAGER' });
  assert.equal(response.status, 200);
  assert.equal(response.body.user.role, 'PARTICIPANT');
  assert.notEqual(cookieOf(response), old);
  assert.equal(await db.session.count(), 1);
  await request(app).get('/api/auth/me').set('Cookie', old).expect(401);
});

test('OP-02.5: unknown API paths return standard 404 regardless of session', async () => {
  for (const cookie of ['', cookieOf(await login())]) {
    const response = await request(app).get('/api/missing').set('Cookie', cookie);
    assert.equal(response.status, 404);
    assert.deepEqual(response.body, error('NOT_FOUND', 'Not found.'));
  }
  // The production app never registers test fixtures.
  await request(createApp({ db })).post('/api/test/manager/1').send({ name: 'valid' }).expect(404);
});

test('TC-44 / TC-45: seed is idempotent, uses current env hashes, fails atomically without passwords; tracked files contain no seed values', async () => {
  const managerPassword = randomBytes(24).toString('base64url');
  const participantPassword = randomBytes(24).toString('base64url');
  const env = { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL,
    SEED_MANAGER_PASSWORD: managerPassword, SEED_PARTICIPANT_PASSWORD: participantPassword };
  for (let run = 0; run < 2; run++) execFileSync('npm', ['run', 'prisma:seed'], { env, stdio: 'pipe' });
  assert.equal(await db.user.count(), 3);
  for (const user of await db.user.findMany()) {
    const plain = user.role === 'MANAGER' ? managerPassword : participantPassword;
    assert.match(user.passwordHash, /^\$2[aby]\$10\$/);
    assert.ok(await bcrypt.compare(plain, user.passwordHash));
    assert.notEqual(plain, user.passwordHash);
  }
  for (const plain of [managerPassword, participantPassword]) {
    const scan = spawnSync('git', ['grep', '-l', '-F', '-e', plain, '--', '.'], { encoding: 'utf8' });
    assert.equal(scan.status, 1, 'Tracked files must not contain environment seed values');
  }
  await db.session.deleteMany();
  await db.user.deleteMany();
  for (const missing of ['SEED_MANAGER_PASSWORD', 'SEED_PARTICIPANT_PASSWORD']) {
    const missingEnv = { ...env };
    delete missingEnv[missing];
    const result = spawnSync(process.execPath, ['prisma/seed.js'], { env: missingEnv, encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.equal(await db.user.count(), 0);
    assert.ok(!result.stderr.includes(managerPassword));
    assert.ok(!result.stderr.includes(participantPassword));
  }
});
