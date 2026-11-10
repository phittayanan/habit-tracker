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
  const rows = await db.entry.findMany({ where: { goalId: goal.id }, orderBy: { entryDate: 'desc' } });
  return { ok: true, entries: rows.map(toEntry) };
}

export async function createEntry(db, user, goalId, body, now = new Date()) {
  const goal = await ownGoal(db, user, goalId);
  if (!goal) return notFound;
  const parsed = parseEntryCreate(body);
  if (!parsed.ok) return parsed;
  const data = parsed.data;
  const failure = checkEntryRules(data, { startDate: dateText(goal.startDate), endDate: dateText(goal.endDate) },
    { minValue: Number(goal.template.minValue), maxValue: Number(goal.template.maxValue) }, now);
  if (failure) return { ok: false, ...failure };
  try {
    const row = await db.entry.create({ data: { goalId: goal.id, entryDate: new Date(`${data.entryDate}T00:00:00Z`), value: data.value.toFixed(2) } });
    return { ok: true, entry: toEntry(row) };
  } catch (error) {
    // The unique (goal, day) constraint decides when two requests arrive together (BR-04).
    if (error.code === 'P2002') return { ok: false, status: 409, code: 'ENTRY_ALREADY_EXISTS', message: 'An entry already exists for this day.' };
    throw error;
  }
}
