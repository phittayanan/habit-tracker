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

test('TC-87: several entries on one day are added exactly before the comparison, and the day counts once', () => {
  const first = { startDate: '2026-11-01', endDate: '2026-11-30', dailyTarget: 30 };
  const rows = [
    { entryDate: '2026-11-01', value: 10 }, { entryDate: '2026-11-01', value: 20 },
    { entryDate: '2026-11-02', value: 10 }, { entryDate: '2026-11-02', value: 19.99 },
    { entryDate: '2026-11-03', value: 30 }, { entryDate: '2026-11-03', value: 5 },
  ];
  assert.deepEqual(computeProgress(first, rows, '2026-11-10'), { daysMet: 2, daysSoFar: 10 });
  const second = { startDate: '2026-11-01', endDate: '2026-11-30', dailyTarget: 0.8 };
  assert.equal(0.7 + 0.1 >= 0.8, false, 'a binary floating point sum would miss the target');
  assert.deepEqual(computeProgress(second, [{ entryDate: '2026-11-01', value: 0.7 }, { entryDate: '2026-11-01', value: 0.1 }], '2026-11-10'), { daysMet: 1, daysSoFar: 10 });
});

// F-14 (Issue #153, ADR 0075): each day is judged against the target version valid that day.
test('TC-39: days before a change keep the old target; the change day and later use the new one', async () => {
  const { targetOn } = await import('../src/services/progress-rules.js');
  // D = 2026-11-20; W: target 8 from D-10, changed to 6 on D; 7 entered on D-2 and on D.
  const goal = { startDate: '2026-11-10', endDate: '2026-11-30', dailyTarget: 6,
    targets: [{ effectiveFrom: '2026-11-20', dailyTarget: 6 }, { effectiveFrom: '2026-11-10', dailyTarget: 8 }] };
  const rows = [{ entryDate: '2026-11-18', value: 7 }, { entryDate: '2026-11-20', value: 7 }];
  assert.equal(targetOn(goal, '2026-11-18'), 8);
  assert.equal(targetOn(goal, '2026-11-19'), 8);
  assert.equal(targetOn(goal, '2026-11-20'), 6);
  assert.equal(targetOn(goal, '2026-11-25'), 6);
  assert.deepEqual(computeProgress(goal, rows, '2026-11-20'), { daysMet: 1, daysSoFar: 11 }, 'D-2 not met, D met');
  // Without the versions every day would use the latest target (6) and both days would be met.
  assert.deepEqual(computeProgress({ ...goal, targets: undefined }, rows, '2026-11-20'), { daysMet: 2, daysSoFar: 11 });
});

test('TC-39: with no version on or before a day, the day uses dailyTarget (ADR 0075 point 4)', async () => {
  const { targetOn } = await import('../src/services/progress-rules.js');
  const goal = { startDate: '2026-11-10', endDate: '2026-11-30', dailyTarget: 6, targets: [{ effectiveFrom: '2026-11-20', dailyTarget: 6 }] };
  assert.equal(targetOn(goal, '2026-11-12'), 6);
  assert.equal(targetOn({ ...goal, targets: [] }, '2026-11-12'), 6);
  // Decimal versions compare exactly, as the single target does.
  const decimal = { startDate: '2026-11-01', endDate: '2026-11-30', dailyTarget: 7.5, targets: [{ effectiveFrom: '2026-11-01', dailyTarget: 0.8 }, { effectiveFrom: '2026-11-03', dailyTarget: 7.5 }] };
  assert.deepEqual(computeProgress(decimal, [{ entryDate: '2026-11-02', value: 0.7 }, { entryDate: '2026-11-02', value: 0.1 }, { entryDate: '2026-11-03', value: 7.49 }], '2026-11-03'), { daysMet: 1, daysSoFar: 3 });
});
