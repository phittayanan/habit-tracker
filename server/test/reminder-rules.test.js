// F-17 stored reminder (Issue #158): TC-170 unit part, the body rules of PUT /api/goals/:id/reminder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseReminder } from '../src/services/reminder-rules.js';

const timeError = { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'Enter a time from 00:00 to 23:59.' };
const dayError = { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'Choose at least one weekday, each only once.' };

test('TC-170 (unit): times outside HH:MM 00:00 to 23:59 are refused with the time message', () => {
  for (const time of ['24:00', '7:30', '07:60', '', '0730', '07:3', '-1:00', '07:30 ', 730, null, undefined, ['07:30']]) {
    assert.deepEqual(parseReminder({ time, weekdays: ['MON'] }), timeError, String(time));
  }
  for (const time of ['00:00', '23:59', '07:30', '12:00']) assert.equal(parseReminder({ time, weekdays: ['MON'] }).ok, true, time);
});

test('TC-170 (unit): weekday lists that are empty, not lists, unknown or repeated are refused with the weekday message', () => {
  for (const weekdays of [[], 'MON', ['MONDAY'], ['mon'], ['MON', 'MON'], [1], [null], undefined, null, { 0: 'MON' }]) {
    assert.deepEqual(parseReminder({ time: '07:30', weekdays }), dayError, JSON.stringify(weekdays));
  }
});

test('TC-170 (unit): the time message wins when both are wrong; weekdays come back Monday first; other fields are dropped', () => {
  assert.deepEqual(parseReminder({ time: '24:00', weekdays: [] }), timeError);
  assert.deepEqual(parseReminder({}), timeError);
  assert.deepEqual(parseReminder(undefined), timeError);
  assert.deepEqual(parseReminder({ time: '07:30', weekdays: ['SUN', 'FRI', 'MON'], extra: 1 }), { ok: true, data: { time: '07:30', weekdays: ['MON', 'FRI', 'SUN'] } });
  assert.deepEqual(parseReminder({ time: '23:59', weekdays: ['SUN', 'SAT', 'FRI', 'THU', 'WED', 'TUE', 'MON'] }).data.weekdays, ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);
});
