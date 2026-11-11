import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

// Needs no real database: the readiness route only asks the database client to run SELECT 1.
// Spec: docs/sprints/sprint-1/F-02-roles.md section 5 and docs/system-sds.md section 4.4
// (`GET /api/ready` is 200 when the database answers and 503 when it does not).
const appWith = queryRaw => createApp({ db: { $queryRaw: queryRaw }, serveClient: false });

test('GET /api/ready returns 503 NOT_READY when the database cannot be reached', async () => {
  const app = appWith(async () => { throw new Error('connect ECONNREFUSED secret-host:5432'); });
  const res = await request(app).get('/api/ready');
  assert.equal(res.status, 503);
  assert.equal(res.body.error.code, 'NOT_READY');
  assert.equal(JSON.stringify(res.body).includes('secret-host'), false, 'the database error text must not reach the client');
});

test('GET /api/ready returns 200 ready when the database answers', async () => {
  const res = await request(appWith(async () => [{ '?column?': 1 }])).get('/api/ready');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: 'ready' });
});

test('GET /api/health does not touch the database', async () => {
  const res = await request(appWith(async () => { throw new Error('must not be called'); })).get('/api/health');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: 'ok' });
});
