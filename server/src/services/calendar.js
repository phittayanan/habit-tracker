// F-11 GET /api/calendar (ADR 0072). One read per month; nothing is stored.
// `state` is the F-12 day state (day-state-rules.js).
import { bangkokToday } from './goal-rules.js';
import { targetOn } from './progress-rules.js';
import { dayState } from './day-state-rules.js';

const dateText = value => value.toISOString().slice(0, 10);
const dateValue = text => new Date(`${text}T00:00:00Z`);
// Values and targets have at most 2 decimal places, so whole hundredths add and compare exactly.
const hundredths = number => Math.round(number * 100);

export function parseMonth(query) {
  const month = query.month;
  if (month === undefined) return { ok: true, month: null };
  if (typeof month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month.startsWith('0000')) {
    return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'Month must be YYYY-MM.' };
  }
  return { ok: true, month };
}

export function daysOfMonth(month) {
  const [year, number] = month.split('-').map(Number);
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`);
}

// Pure: build the response from the goals (with their template and target versions) and the month's entries.
export function buildCalendar(month, today, goals, entries) {
  const byGoalDay = new Map();
  for (const entry of entries) {
    const key = `${entry.goalId} ${entry.entryDate}`;
    if (!byGoalDay.has(key)) byGoalDay.set(key, []);
    byGoalDay.get(key).push(entry);
  }
  const days = daysOfMonth(month).map(date => {
    if (date > today) return { date, state: null, goals: [] };
    const active = goals.filter(goal => goal.startDate <= date && date <= goal.endDate);
    const cards = active.map(goal => {
      // Newest saved first (F-08 OP-08.10).
      const own = [...(byGoalDay.get(`${goal.id} ${date}`) || [])].sort((x, y) => y.createdAt - x.createdAt || y.id - x.id);
      const total = own.reduce((sum, entry) => sum + hundredths(entry.value), 0);
      const target = targetOn(goal, date);
      return {
        goalId: goal.id, name: goal.template.name, unit: goal.template.unit, kind: goal.template.kind,
        target, total: total / 100, met: total >= hundredths(target),
        minValue: goal.template.minValue, maxValue: goal.template.maxValue,
        entries: own.map(entry => ({ id: entry.id, value: entry.value })),
      };
    });
    const state = dayState(cards.map(card => ({ target: card.target, values: card.entries.map(entry => entry.value) })), false);
    return { date, state, goals: cards };
  });
  return { month, today, days };
}

export async function readCalendar(db, user, requested, now = new Date()) {
  const today = bangkokToday(now);
  const month = requested || today.slice(0, 7);
  const days = daysOfMonth(month);
  const first = days[0];
  const last = days.at(-1);
  // The caller's goals that overlap the month, oldest first, so cards keep one order.
  const rows = await db.goal.findMany({
    where: { participantId: user.id, startDate: { lte: dateValue(last) }, endDate: { gte: dateValue(first) } },
    include: { template: true, targets: true }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
  const entries = rows.length ? await db.entry.findMany({
    where: { goalId: { in: rows.map(row => row.id) }, entryDate: { gte: dateValue(first), lte: dateValue(last) } },
  }) : [];
  const goals = rows.map(row => ({
    id: row.id, startDate: dateText(row.startDate), endDate: dateText(row.endDate), dailyTarget: Number(row.dailyTarget),
    targets: row.targets.map(version => ({ effectiveFrom: dateText(version.effectiveFrom), dailyTarget: Number(version.dailyTarget) })),
    template: { name: row.template.name, unit: row.template.unit, kind: row.template.kind,
      minValue: Number(row.template.minValue), maxValue: Number(row.template.maxValue) },
  }));
  return buildCalendar(month, today, goals, entries.map(row => ({
    id: row.id, goalId: row.goalId, entryDate: dateText(row.entryDate), value: Number(row.value), createdAt: row.createdAt.getTime(),
  })));
}
