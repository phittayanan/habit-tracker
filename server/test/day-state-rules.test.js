// F-12 day state (Issue #156): TC-37, one unit test per case of contract section 4, and TC-123 (unit).
// No database. Contract: docs/sprints/sprint-2/F-12-day-colours.md (ADR 0070).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayState } from '../src/services/day-state-rules.js';
import { buildCalendar } from '../src/services/calendar.js';

const goal = (target, ...values) => ({ target, values });

const cases = [
  ['one counted goal, total equal to the target', [goal(8, 5, 3)], false, 'ALL_MET'],
  ['one counted goal, total 0.01 below the target', [goal(8, 7.99)], false, 'NONE_MET'],
  ['two counted goals, one met, the other with no entry', [goal(8, 8), goal(420)], false, 'SOME_MET'],
  ['two counted goals, one below target, the other with no entry', [goal(8, 3), goal(420)], false, 'NONE_MET'],
  ['counted goals, no entries', [goal(8), goal(420)], false, 'NOTHING'],
  ['no counted goal', [], false, null],
  ['a day after today, with counted goals', [goal(8), goal(420)], true, null],
  ['today, all counted goals met so far', [goal(8, 8), goal(420, 430)], false, 'ALL_MET'],
];
for (const [name, goals, afterToday, expected] of cases) {
  test(`TC-37: ${name} -> ${expected}`, () => assert.equal(dayState(goals, afterToday), expected));
}

test('TC-37: two counted goals, one met and one recorded below target -> SOME_MET', () => {
  assert.equal(dayState([goal(8, 8), goal(420, 100)], false), 'SOME_MET');
});

test('TC-37: an entry of 0 counts as recorded, so the day is NONE_MET, not NOTHING (OP-12.2)', () => {
  assert.equal(dayState([goal(8, 0), goal(420)], false), 'NONE_MET');
});

test('TC-37: sums are exact to 2 decimal places (0.7 + 0.1 meets 0.8)', () => {
  assert.equal(dayState([goal(0.8, 0.7, 0.1)], false), 'ALL_MET');
});

test('TC-123 (unit): each day is judged against the target valid that day (F-14, BR-12)', () => {
  const template = { name: 'Water', unit: 'glasses', kind: 'COUNT', minValue: 1, maxValue: 12 };
  const water = { id: 1, startDate: '2026-11-01', endDate: '2026-11-30', dailyTarget: 6, template,
    targets: [{ effectiveFrom: '2026-11-01', dailyTarget: 8 }, { effectiveFrom: '2026-11-20', dailyTarget: 6 }] };
  const sleep = { id: 2, startDate: '2026-11-01', endDate: '2026-11-30', dailyTarget: 420, targets: [],
    template: { name: 'Sleep', unit: 'minutes', kind: 'TIME', minValue: 0, maxValue: 720 } };
  const entries = ['2026-11-18', '2026-11-20'].flatMap((entryDate, i) => [
    { id: i * 2 + 1, goalId: 1, entryDate, value: 7, createdAt: 1 },
    { id: i * 2 + 2, goalId: 2, entryDate, value: 420, createdAt: 2 },
  ]);
  const { days } = buildCalendar('2026-11', '2026-11-20', [water, sleep], entries);
  const state = date => days.find(item => item.date === date).state;
  assert.equal(state('2026-11-18'), 'SOME_MET');
  assert.equal(state('2026-11-20'), 'ALL_MET');
  assert.equal(state('2026-11-19'), 'NOTHING');
  assert.equal(state('2026-11-21'), null);
});
