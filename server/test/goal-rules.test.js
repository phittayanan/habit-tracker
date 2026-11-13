import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseGoalCreate, targetWithinMaximum, targetAboveMinimum, hasActiveGoal, bangkokToday, goalState } from '../src/services/goal-rules.js';
const valid = { templateId: 1, dailyTarget: 24, startDate: '2026-11-10', endDate: '2026-11-12' };
test('Goal unit rules: positive exact decimals, real dates and end-date order', () => {
  for (const dailyTarget of [0.01, 0.29, 1, 24, 99999999.99]) assert.equal(parseGoalCreate({ ...valid, dailyTarget }).ok, true);
  for (const dailyTarget of [0, -1, 0.001, 1e-7, 100000000, Infinity, NaN]) assert.equal(parseGoalCreate({ ...valid, dailyTarget }).code, 'VALIDATION_ERROR');
  for (const startDate of ['2026-2-01', '2026-02-30', '0000-01-01', '2026-13-01', '2026-04-31']) assert.equal(parseGoalCreate({ ...valid, startDate }).ok, false);
  assert.equal(parseGoalCreate({ ...valid, startDate: '2024-02-29' }).ok, true);
  assert.equal(parseGoalCreate({ ...valid, endDate: valid.startDate }).ok, true);
  assert.equal(parseGoalCreate({ ...valid, endDate: '2026-11-09' }).ok, false);
  assert.equal(parseGoalCreate().ok, false);
  assert.deepEqual(parseGoalCreate({ ...valid, userId: 99 }).data, valid);
});
test('TC-78 unit: the target must be above the template minimum (Issue #74, ADR 0054)', () => {
  assert.equal(targetAboveMinimum(10, 10), false); assert.equal(targetAboveMinimum(5, 10), false); assert.equal(targetAboveMinimum(0.01, 10), false);
  assert.equal(targetAboveMinimum(10.01, 10), true); assert.equal(targetAboveMinimum(0.01, 0), true);
});
test('Goal unit BR-05/BR-06 and target maximum: ended, future, exact boundary', () => {
  assert.equal(targetWithinMaximum(24, 24), true); assert.equal(targetWithinMaximum(24.01, 24), false);
  assert.equal(hasActiveGoal([], '2026-11-10'), false);
  assert.equal(hasActiveGoal(['2026-11-09'], '2026-11-10'), false);
  assert.equal(hasActiveGoal(['2026-11-10'], '2026-11-10'), true);
  assert.equal(hasActiveGoal(['2026-11-20'], '2026-11-10'), true);
  assert.equal(goalState('2026-11-10', '2026-11-11'), 'ENDED');
  assert.match(bangkokToday(), /^\d{4}-\d{2}-\d{2}$/);
});
