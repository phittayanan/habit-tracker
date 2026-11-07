import test from 'node:test';
import assert from 'node:assert/strict';
import { isSessionValid, cookieOptions } from '../src/services/session.js';

test('TC-63: expiry is exclusive and the clock is passed in', () => {
  const session = { expiresAt: new Date('2026-11-10T09:00:00Z') };
  assert.equal(isSessionValid(session, new Date('2026-11-10T08:59:59Z')), true);
  assert.equal(isSessionValid(session, new Date('2026-11-10T09:00:00Z')), false);
});

test('TC-46: cookie flags depend only on production', () => {
  for (const environment of ['production', 'test']) {
    assert.deepEqual(cookieOptions(environment), {
      httpOnly: true, sameSite: 'lax', path: '/', maxAge: 28_800_000,
      secure: environment === 'production',
    });
  }
});
