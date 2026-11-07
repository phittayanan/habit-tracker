import assert from 'node:assert/strict';
import request from 'supertest';

export const createAuditedApp = build => build();

// Existing TC-08 behavior, extracted so an intentionally uncovered route can test it.
export async function assertProtectedRouteCoverage(app, routes, cookie) {
  for (const route of routes) {
    const path = route.requestPath || route.path;
    const anonymous = await request(app)[route.method](path).send({ name: 'valid' });
    assert.equal(anonymous.status, 401, `${route.method} ${path}: expected 401`);
    assert.deepEqual(anonymous.body, { error: { code: 'UNAUTHENTICATED', message: 'Please log in.' } });
    if (route.roles?.length === 1) {
      const forbidden = await request(app)[route.method](path).set('Cookie', cookie).send({ name: 'valid' });
      assert.equal(forbidden.status, 403);
      assert.deepEqual(forbidden.body, { error: { code: 'FORBIDDEN', message: 'You do not have permission to do this.' } });
    }
  }
}
