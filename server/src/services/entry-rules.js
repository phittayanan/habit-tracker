import { z } from 'zod';
import { bangkokToday } from './goal-rules.js';

// The date shown in the entry form and used as "today" by the rules: the Asia/Bangkok date (BR-02).
export const defaultEntryDate = (instant = new Date()) => bangkokToday(instant);

const LIMIT = 99999999.99;
function validValue(value) {
  if (Math.abs(value) > LIMIT) return false;
  const [coefficient, exponent = '0'] = Math.abs(value).toString().toLowerCase().split('e');
  return (coefficient.split('.')[1]?.length || 0) - Number(exponent) <= 2;
}
function calendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
const schema = z.object({
  entryDate: z.string().refine(calendarDate),
  value: z.number().refine(validValue),
});

export function parseEntryCreate(body) {
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'Enter a valid date (YYYY-MM-DD) and a number with at most 2 decimal places.' };
  return { ok: true, data: parsed.data };
}

// Rule order is the contract order: future, outside the goal, out of range (the unique day is the database's job).
export function checkEntryRules({ entryDate, value }, goal, template, now = new Date()) {
  if (entryDate > bangkokToday(now)) return { status: 400, code: 'ENTRY_DATE_IN_FUTURE', message: 'The date cannot be after today.' };
  if (entryDate < goal.startDate || entryDate > goal.endDate) return { status: 400, code: 'ENTRY_DATE_OUTSIDE_GOAL', message: 'The date must be inside the goal start and end dates.' };
  if (value < template.minValue || value > template.maxValue) return { status: 400, code: 'VALUE_OUT_OF_RANGE', message: `The value must be between ${template.minValue} and ${template.maxValue}.` };
  return null;
}
