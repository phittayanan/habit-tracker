import { computeProgress } from './progress-rules.js';
import { bangkokToday, goalState, targetWithinMaximum, hasActiveGoal } from './goal-rules.js';
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
  const rows = await db.goal.findMany({ where: { participantId: user.id }, include: { template: true }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  const entries = rows.length ? await db.entry.findMany({ where: { goalId: { in: rows.map(row => row.id) } }, select: { goalId: true, entryDate: true, value: true } }) : [];
  return rows.map(row => {
    const goal = toGoal(row, today);
    const own = entries.filter(entry => entry.goalId === row.id).map(entry => ({ entryDate: dateText(entry.entryDate), value: Number(entry.value) }));
    return { ...goal, progress: computeProgress(goal, own, today) };
  });
}
export async function createGoal(db, user, data) {
  return db.$transaction(async tx => {
    // This lock serializes both same-user creates and future F-04 template edits.
    // Read the current range only after acquiring the lock, in the same transaction.
    const [template] = await tx.$queryRaw`SELECT id, name, unit, min_value AS "minValue", max_value AS "maxValue" FROM "Template" WHERE id = ${data.templateId} FOR UPDATE`;
    if (!template) return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'Choose an existing template.' };
    if (!targetWithinMaximum(data.dailyTarget, Number(template.maxValue))) return { ok: false, status: 400, code: 'TARGET_ABOVE_TEMPLATE_MAX', message: 'Daily target must not exceed the template maximum.' };
    // Compute today after waiting for the lock, so a Bangkok midnight during a wait
    // cannot leave an ended goal blocking a new one.
    const today = bangkokToday();
    const existing = await tx.goal.findMany({ where: { participantId: user.id, templateId: data.templateId, endDate: { gte: dateValue(today) } }, select: { endDate: true } });
    if (hasActiveGoal(existing.map(row => dateText(row.endDate)), today)) return { ok: false, status: 409, code: 'ACTIVE_GOAL_EXISTS', message: 'You already have an active goal for this template.' };
    const row = await tx.goal.create({ data: { participantId: user.id, templateId: data.templateId, dailyTarget: data.dailyTarget.toFixed(2), startDate: dateValue(data.startDate), endDate: dateValue(data.endDate) } });
    return { ok: true, goal: toGoal({ ...row, template }, today) };
  });
}
