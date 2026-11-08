// Run in its own process: the zone is set to UTC so a rule that used the machine zone would fail TC-27.
process.env.TZ = 'UTC';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEntryCreate, checkEntryRules, defaultEntryDate } from '../src/services/entry-rules.js';

const goal = { startDate: '2026-11-01', endDate: '2026-11-30' };
const template = { minValue: 0, maxValue: 24 };
const at = iso => new Date(iso);
const check = (entryDate, value, now) => checkEntryRules({ entryDate, value }, goal, template, now);

test('TC-27: today is the Asia/Bangkok date, whatever the process time zone', () => {
  assert.equal(new Date('2026-11-10T17:00:00Z').getHours(), 17, 'the process zone is UTC');
  const before = at('2026-11-10T16:59:59Z');
  assert.equal(defaultEntryDate(before), '2026-11-10');
  assert.equal(check('2026-11-11', 5, before).code, 'ENTRY_DATE_IN_FUTURE');
  const after = at('2026-11-10T17:00:00Z');
  assert.equal(defaultEntryDate(after), '2026-11-11');
  assert.equal(check('2026-11-11', 5, after), null);
});

test('TC-24 / TC-25 / TC-26: future wins over outside-goal; goal ends are inclusive', () => {
  const now = at('2026-11-10T05:00:00Z');
  const short = { startDate: '2026-11-01', endDate: '2026-11-15' };
  assert.equal(check('2026-11-11', 5, now).code, 'ENTRY_DATE_IN_FUTURE');
  assert.equal(checkEntryRules({ entryDate: '2026-11-20', value: 5 }, short, template, now).code, 'ENTRY_DATE_IN_FUTURE');
  assert.equal(check('2026-10-31', 5, now).code, 'ENTRY_DATE_OUTSIDE_GOAL');
  assert.equal(checkEntryRules({ entryDate: '2026-11-10', value: 5 }, { startDate: '2026-11-01', endDate: '2026-11-09' }, template, now).code, 'ENTRY_DATE_OUTSIDE_GOAL');
  assert.equal(check('2026-11-01', 5, now), null);
  assert.equal(check('2026-11-10', 5, now), null);
});

test('TC-28: value limits are inclusive', () => {
  const now = at('2026-11-10T05:00:00Z');
  assert.equal(check('2026-11-05', -0.5, now).code, 'VALUE_OUT_OF_RANGE');
  assert.equal(check('2026-11-05', 24.5, now).code, 'VALUE_OUT_OF_RANGE');
  assert.equal(check('2026-11-05', 0, now), null);
  assert.equal(check('2026-11-05', 24, now), null);
});

test('TC-56: parse accepts only a real date and a number within Decimal(10, 2)', () => {
  for (const body of [undefined, null, {}, { value: 1 }, { entryDate: '2026-11-05' }, { entryDate: '11/05/2026', value: 1 },
    { entryDate: '2026-02-30', value: 1 }, { entryDate: '2026-11-05', value: 'abc' }, { entryDate: '2026-11-05', value: '7' },
    { entryDate: '2026-11-05', value: 7.555 }, { entryDate: '2026-11-05', value: 24.555 }, { entryDate: '2026-11-05', value: 1e-7 },
    { entryDate: '2026-11-05', value: 100000000 }, { entryDate: '2026-11-05', value: -100000000 }]) {
    assert.equal(parseEntryCreate(body).ok, false, JSON.stringify(body));
    assert.equal(parseEntryCreate(body).code, 'VALIDATION_ERROR');
  }
  assert.deepEqual(parseEntryCreate({ entryDate: '2026-11-05', value: 7.5, goalId: 9, participantId: 3 }), { ok: true, data: { entryDate: '2026-11-05', value: 7.5 } });
  assert.equal(parseEntryCreate({ entryDate: '2026-11-05', value: -0.5 }).ok, true);
  assert.equal(parseEntryCreate({ entryDate: '2026-11-05', value: 99999999.99 }).ok, true);
});
