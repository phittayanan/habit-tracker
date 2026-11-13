import { z } from 'zod';

export function bangkokToday(instant = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant);
}
export const goalState = (endDate, today) => today <= endDate ? 'ACTIVE' : 'ENDED';
export const targetWithinMaximum = (target, maximum) => target <= maximum;
export const targetAboveMinimum = (target, minimum) => target > minimum;
export const hasActiveGoal = (endDates, today) => endDates.some(end => goalState(end, today) === 'ACTIVE');

function validTarget(value) {
  if (value <= 0 || value > 99999999.99) return false;
  const [coefficient, exponent = '0'] = value.toString().toLowerCase().split('e');
  return (coefficient.split('.')[1]?.length || 0) - Number(exponent) <= 2;
}
function calendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
const date = z.string().refine(calendarDate, 'Use a valid date in YYYY-MM-DD format.');
const schema = z.object({
  templateId: z.number().int().positive().max(2147483647),
  dailyTarget: z.number().refine(validTarget, 'Daily target must be above 0, at most 99,999,999.99, with at most 2 decimal places.'),
  startDate: date,
  endDate: date,
});
export function parseGoalCreate(body) {
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'Choose a template, a valid daily target and valid start and end dates.' };
  if (parsed.data.endDate < parsed.data.startDate) return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'End date must be on or after start date.' };
  return { ok: true, data: parsed.data };
}
