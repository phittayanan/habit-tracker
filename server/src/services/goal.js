import { computeProgress } from './progress-rules.js';
import { bangkokToday, goalState, targetWithinMaximum, targetAboveMinimum, hasActiveGoal, parseTargetChange, effectiveFrom } from './goal-rules.js';
const dateText = value => value.toISOString().slice(0, 10);
const dateValue = text => new Date(`${text}T00:00:00Z`);
export function toGoal(row, today) {
  return {
    id: row.id, templateId: row.templateId, dailyTarget: Number(row.dailyTarget),
    startDate: dateText(row.startDate), endDate: dateText(row.endDate), state: goalState(dateText(row.endDate), today),
    template: { id: row.template.id, name: row.template.name, unit: row.template.unit,
      minValue: Number(row.template.minValue), maxValue: Number(row.template.maxValue) },
  };
}
export async function listGoals(db, user, now = new Date()) {
  const today = bangkokToday(now);
  const rows = await db.goal.findMany({ where: { participantId: user.id }, include: { template: true, targets: true }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  const entries = rows.length ? await db.entry.findMany({ where: { goalId: { in: rows.map(row => row.id) } }, select: { goalId: true, entryDate: true, value: true } }) : [];
  return rows.map(row => {
    const goal = toGoal(row, today);
    const own = entries.filter(entry => entry.goalId === row.id).map(entry => ({ entryDate: dateText(entry.entryDate), value: Number(entry.value) }));
    // Each day is judged against its own target version (F-14, ADR 0075); the response keeps its shape.
    const targets = row.targets.map(version => ({ effectiveFrom: dateText(version.effectiveFrom), dailyTarget: Number(version.dailyTarget) }));
    return { ...goal, progress: computeProgress({ ...goal, targets }, own, today) };
  });
}
export async function createGoal(db, user, data) {
  return db.$transaction(async tx => {
    // This lock serializes both same-user creates and future F-04 template edits.
    // Read the current range only after acquiring the lock, in the same transaction.
    const [template] = await tx.$queryRaw`SELECT id, name, unit, min_value AS "minValue", max_value AS "maxValue" FROM "Template" WHERE id = ${data.templateId} FOR UPDATE`;
    if (!template) return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'Choose an existing template.' };
    if (!targetWithinMaximum(data.dailyTarget, Number(template.maxValue))) return { ok: false, status: 400, code: 'TARGET_ABOVE_TEMPLATE_MAX', message: 'Daily target must not exceed the template maximum.' };
    if (!targetAboveMinimum(data.dailyTarget, Number(template.minValue))) return { ok: false, status: 400, code: 'TARGET_NOT_ABOVE_TEMPLATE_MIN', message: 'Daily target must be above the template minimum.' };
    // Compute today after waiting for the lock, so a Bangkok midnight during a wait
    // cannot leave an ended goal blocking a new one.
    const today = bangkokToday();
    const existing = await tx.goal.findMany({ where: { participantId: user.id, templateId: data.templateId, endDate: { gte: dateValue(today) } }, select: { endDate: true } });
    if (hasActiveGoal(existing.map(row => dateText(row.endDate)), today)) return { ok: false, status: 409, code: 'ACTIVE_GOAL_EXISTS', message: 'You already have an active goal for this template.' };
    const row = await tx.goal.create({ data: { participantId: user.id, templateId: data.templateId, dailyTarget: data.dailyTarget.toFixed(2), startDate: dateValue(data.startDate), endDate: dateValue(data.endDate) } });
    // F-14 (AC-14.8): the first target version, in the same transaction.
    await tx.goalTarget.create({ data: { goalId: row.id, effectiveFrom: row.startDate, dailyTarget: row.dailyTarget } });
    return { ok: true, goal: toGoal({ ...row, template }, today) };
  });
}

const goalNotFound = { ok: false, status: 404, code: 'GOAL_NOT_FOUND', message: 'Goal not found.' };
// F-14 PATCH /api/goals/:id. Checks in contract section 4 order: goal (404), body (400), ended (409), range (400).
export async function changeTarget(db, user, goalId, body) {
  return db.$transaction(async tx => {
    // The goal-row lock serializes changes of one goal (and entry saves, F-08 section 8).
    const [locked] = await tx.$queryRaw`SELECT id FROM "Goal" WHERE id = ${goalId} AND participant_id = ${user.id} FOR UPDATE`;
    if (!locked) return goalNotFound;
    const parsed = parseTargetChange(body);
    if (!parsed.ok) return parsed;
    const target = parsed.data.dailyTarget;
    const row = await tx.goal.findUniqueOrThrow({ where: { id: goalId }, include: { template: true } });
    // Today is read after the lock, as goal creation does, so a wait across Bangkok midnight uses the new day.
    const today = bangkokToday();
    const startDate = dateText(row.startDate);
    if (goalState(dateText(row.endDate), today) === 'ENDED') return { ok: false, status: 409, code: 'GOAL_ENDED', message: 'This goal has ended and cannot be changed.' };
    // A goal on a retired template can still change its target (ADR 0017); BR-08 keeps a used template's range fixed.
    if (!targetWithinMaximum(target, Number(row.template.maxValue))) return { ok: false, status: 400, code: 'TARGET_ABOVE_TEMPLATE_MAX', message: 'Daily target must not exceed the template maximum.' };
    if (!targetAboveMinimum(target, Number(row.template.minValue))) return { ok: false, status: 400, code: 'TARGET_NOT_ABOVE_TEMPLATE_MIN', message: 'Daily target must be above the template minimum.' };
    // Sending the current target writes nothing (OP-14.3).
    if (Math.round(target * 100) === Math.round(Number(row.dailyTarget) * 100)) return { ok: true, goal: toGoal(row, today) };
    const from = effectiveFrom(startDate, today);
    // A goal created while the app was rolled back has no version: keep its old target for earlier days (AC-14.8).
    const baseline = await tx.goalTarget.findFirst({ where: { goalId, effectiveFrom: { lte: row.startDate } } });
    if (!baseline && from !== startDate) await tx.goalTarget.create({ data: { goalId, effectiveFrom: row.startDate, dailyTarget: row.dailyTarget } });
    // ADR 0077: one version per goal and date; a second change that day replaces it.
    await tx.goalTarget.upsert({ where: { goalId_effectiveFrom: { goalId, effectiveFrom: dateValue(from) } },
      create: { goalId, effectiveFrom: dateValue(from), dailyTarget: target.toFixed(2) }, update: { dailyTarget: target.toFixed(2) } });
    // ADR 0075: daily_target always holds the latest target.
    const updated = await tx.goal.update({ where: { id: goalId }, data: { dailyTarget: target.toFixed(2) }, include: { template: true } });
    return { ok: true, goal: toGoal(updated, today) };
  });
}
