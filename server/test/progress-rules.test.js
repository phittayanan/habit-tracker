// Run in its own process with the zone set to UTC: the calculation must not use the machine zone.
process.env.TZ = 'UTC';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeProgress } from '../src/services/progress-rules.js';

const entries = [
  { entryDate: '2026-11-01', value: 30 },
  { entryDate: '2026-11-02', value: 29.9 },
  { entryDate: '2026-11-04', value: 45 },
];

test('TC-31: met, missed and empty days; today counts even without an entry', () => {
  assert.deepEqual(computeProgress({ startDate: '2026-11-01', endDate: '2026-11-30', dailyTarget: 30 }, entries, '2026-11-10'), { daysMet: 2, daysSoFar: 10 });
});

test('TC-31: a goal that has not started is 0 of 0; the first day counts on its start date', () => {
  assert.deepEqual(computeProgress({ startDate: '2026-11-20', endDate: '2026-11-30', dailyTarget: 30 }, [], '2026-11-10'), { daysMet: 0, daysSoFar: 0 });
  assert.deepEqual(computeProgress({ startDate: '2026-11-10', endDate: '2026-11-30', dailyTarget: 30 }, [], '2026-11-10'), { daysMet: 0, daysSoFar: 1 });
  assert.deepEqual(computeProgress({ startDate: '2026-11-10', endDate: '2026-11-30', dailyTarget: 30 }, [{ entryDate: '2026-11-10', value: 30 }], '2026-11-10'), { daysMet: 1, daysSoFar: 1 });
});

test('TC-31: an Ended goal counts start to end and does not grow after that', () => {
  const goal = { startDate: '2026-11-01', endDate: '2026-11-05', dailyTarget: 30 };
  assert.deepEqual(computeProgress(goal, entries, '2026-11-10'), { daysMet: 2, daysSoFar: 5 });
  assert.deepEqual(computeProgress(goal, entries, '2026-12-31'), { daysMet: 2, daysSoFar: 5 });
  assert.deepEqual(computeProgress(goal, entries, '2026-11-05'), { daysMet: 2, daysSoFar: 5 });
});

test('TC-31: only entries inside the counted days are used; a decimal target is compared exactly', () => {
  const goal = { startDate: '2026-11-01', endDate: '2026-11-30', dailyTarget: 7.5 };
  const rows = [{ entryDate: '2026-11-02', value: 7.5 }, { entryDate: '2026-11-03', value: 7.49 }, { entryDate: '2026-12-01', value: 99 }, { entryDate: '2026-10-31', value: 99 }];
  assert.deepEqual(computeProgress(goal, rows, '2026-11-05'), { daysMet: 1, daysSoFar: 5 });
});
