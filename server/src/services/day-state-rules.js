// F-12 day state (ADR 0045, 0046, 0070; contract docs/sprints/sprint-2/F-12-day-colours.md section 3).
// Values and targets have at most 2 decimal places, so whole hundredths add and compare exactly.
const hundredths = number => Math.round(number * 100);

// goals: the goals counted on one day, each as { target, values } (that day's target and entry values).
export function dayState(goals, afterToday) {
  if (afterToday || goals.length === 0) return null;
  const met = goals.filter(goal => goal.values.reduce((sum, value) => sum + hundredths(value), 0) >= hundredths(goal.target));
  if (met.length === goals.length) return 'ALL_MET';
  if (met.length > 0) return 'SOME_MET';
  // An entry of 0 counts as recorded (OP-12.2).
  return goals.some(goal => goal.values.length > 0) ? 'NONE_MET' : 'NOTHING';
}
