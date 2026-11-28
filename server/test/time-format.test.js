// F-15 TC-126 (Issue #156): the time format helper (ADR 0065). The helper was written in #168.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatMinutes } from '../../client/src/time-format.js';

test('TC-126: whole minutes show as hours and minutes', () => {
  assert.deepEqual([0, 45, 60, 420, 430, 1439].map(formatMinutes),
    ['0 min', '45 min', '1 h', '7 h', '7 h 10 min', '23 h 59 min']);
});
