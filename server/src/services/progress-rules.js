// Progress is computed from the goal and its entries every time; nothing is stored (ADR 0009).
// Dates are Asia/Bangkok dates as YYYY-MM-DD text, so they compare as strings.
const dayNumber = text => Math.round(Date.parse(`${text}T00:00:00Z`) / 86400000);

export function computeProgress(goal, entries, today) {
  const lastDay = today < goal.endDate ? today : goal.endDate;
  if (lastDay < goal.startDate) return { daysMet: 0, daysSoFar: 0 };
  const met = new Set();
  for (const entry of entries) {
    if (entry.entryDate >= goal.startDate && entry.entryDate <= lastDay && entry.value >= goal.dailyTarget) met.add(entry.entryDate);
  }
  return { daysMet: met.size, daysSoFar: dayNumber(lastDay) - dayNumber(goal.startDate) + 1 };
}
