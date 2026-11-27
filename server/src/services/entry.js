import { checkEntryRules, parseEntryCreate } from './entry-rules.js';

const dateText = value => value.toISOString().slice(0, 10);
const notFound = { ok: false, status: 404, code: 'GOAL_NOT_FOUND', message: 'Goal not found.' };

export const toEntry = row => ({ id: row.id, goalId: row.goalId, entryDate: dateText(row.entryDate), value: Number(row.value) });

// The same answer for an unknown goal and another Participant's goal (SDS S-7).
async function ownGoal(db, user, goalId) {
  if (!/^\d{1,10}$/.test(goalId) || Number(goalId) > 2147483647) return null;
  return db.goal.findFirst({ where: { id: Number(goalId), participantId: user.id }, include: { template: true } });
}

export async function listEntries(db, user, goalId) {
  const goal = await ownGoal(db, user, goalId);
  if (!goal) return notFound;
  const rows = await db.entry.findMany({ where: { goalId: goal.id }, orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }] });
  return { ok: true, entries: rows.map(toEntry) };
}

export async function createEntry(db, user, goalId, body, now = new Date()) {
  const goal = await ownGoal(db, user, goalId);
  if (!goal) return notFound;
  const parsed = parseEntryCreate(body);
  if (!parsed.ok) return parsed;
  const data = parsed.data;
  const period = { startDate: dateText(goal.startDate), endDate: dateText(goal.endDate) };
  // The template cannot change while a goal uses it (BR-08), so its range is safe to read before the lock.
  const template = { minValue: Number(goal.template.minValue), maxValue: Number(goal.template.maxValue), unit: goal.template.unit };
  const early = checkEntryRules(data, period, template, now);
  if (early) return { ok: false, ...early };
  return db.$transaction(async tx => {
    // The goal-row lock makes same-goal requests check the day total one after another (BR-04, F-08 section 8).
    await tx.$queryRaw`SELECT id FROM "Goal" WHERE id = ${goal.id} FOR UPDATE`;
    // Summed in the database as decimals, read after the lock so entries committed meanwhile count.
    const [{ total }] = await tx.$queryRaw`SELECT COALESCE(SUM(value), 0)::text AS total FROM "Entry" WHERE goal_id = ${goal.id} AND entry_date = ${data.entryDate}::date`;
    const failure = checkEntryRules(data, period, template, now, Number(total));
    if (failure) return { ok: false, ...failure };
    const row = await tx.entry.create({ data: { goalId: goal.id, entryDate: new Date(`${data.entryDate}T00:00:00Z`), value: data.value.toFixed(2) } });
    return { ok: true, entry: toEntry(row) };
  });
}
