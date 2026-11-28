// F-17 stored reminder (Issue #158): body rules of PUT /api/goals/:id/reminder, contract section 4 orders 4 and 5.
export const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const TIME = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const invalid = message => ({ ok: false, status: 400, code: 'VALIDATION_ERROR', message });
// Only time and weekdays are read; other body fields are ignored. The time message wins when both are wrong.
export function parseReminder(body) {
  const { time, weekdays } = body && typeof body === 'object' ? body : {};
  if (typeof time !== 'string' || !TIME.test(time)) return invalid('Enter a time from 00:00 to 23:59.');
  if (!Array.isArray(weekdays) || weekdays.length === 0 || !weekdays.every(code => WEEKDAYS.includes(code)) || new Set(weekdays).size !== weekdays.length) {
    return invalid('Choose at least one weekday, each only once.');
  }
  return { ok: true, data: { time, weekdays: WEEKDAYS.filter(code => weekdays.includes(code)) } };
}
// Stored and returned Monday first (OP-17.2).
export const toReminder = row => (row ? { time: row.time, weekdays: WEEKDAYS.filter(code => row.weekdays.includes(code)) } : null);
