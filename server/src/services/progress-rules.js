// Progress is computed from the goal and its entries every time; nothing is stored (ADR 0009).
// Dates are Asia/Bangkok dates as YYYY-MM-DD text, so they compare as strings.
const dayNumber = text => Math.round(Date.parse(`${text}T00:00:00Z`) / 86400000);

// F-14 (ADR 0075 point 4): a day uses the version with the latest effective date on or before it;
// with none, the goal's dailyTarget. goal.targets is [{ effectiveFrom, dailyTarget }] in any order.
export function targetOn(goal, day) {
  let found;
  for (const version of goal.targets || []) {
    if (version.effectiveFrom <= day && (!found || version.effectiveFrom > found.effectiveFrom)) found = version;
  }
  return found ? found.dailyTarget : goal.dailyTarget;
}

export function computeProgress(goal, entries, today) {
  const lastDay = today < goal.endDate ? today : goal.endDate;
  if (lastDay < goal.startDate) return { daysMet: 0, daysSoFar: 0 };
  // A day is met by the total of its entries (BR-07, ADR 0061). Values and target have at most 2 decimal places,
  // so adding whole hundredths is exact (0.7 + 0.1 meets 0.8; a binary floating point sum would miss it).
  const hundredths = number => Math.round(number * 100);
  const totals = new Map();
  for (const entry of entries) {
    if (entry.entryDate >= goal.startDate && entry.entryDate <= lastDay) totals.set(entry.entryDate, (totals.get(entry.entryDate) || 0) + hundredths(entry.value));
  }
  const daysMet = [...totals].filter(([day, total]) => total >= hundredths(targetOn(goal, day))).length;
  return { daysMet, daysSoFar: dayNumber(lastDay) - dayNumber(goal.startDate) + 1 };
}
