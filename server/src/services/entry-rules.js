import { z } from 'zod';
import { bangkokToday } from './goal-rules.js';

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

const valueSchema = z.object({ value: z.number().refine(validValue) });

const invalid = { ok: false, status: 400, code: 'VALIDATION_ERROR', message: 'Enter a valid date (YYYY-MM-DD) and a number with at most 2 decimal places.' };

export function parseEntryCreate(body) {
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) return invalid;
  return { ok: true, data: parsed.data };
}

// F-13 edit: only the value is read; other fields are ignored (ADR 0080). Same message as F-08 (F-13 section 4, row 5).
export function parseEntryValue(body) {
  const parsed = valueSchema.safeParse(body ?? {});
  if (!parsed.success) return invalid;
  return { ok: true, value: parsed.data.value };
}

// Values have at most 2 decimal places, so whole hundredths add exactly (0.1 + 0.2 is 30 hundredths, not 0.30000000000000004).
const hundredths = number => Math.round(number * 100);
const shown = count => String(count / 100);

// Rule order is the contract order (F-08 section 4): future, outside the goal, out of range, then the day total.
// `dayTotal` is the stored total of this goal on this date, read under the goal-row lock.
export function checkEntryRules({ entryDate, value }, goal, template, now = new Date(), dayTotal = 0) {
  const today = bangkokToday(now);
  if (entryDate > today) return { status: 400, code: 'ENTRY_DATE_IN_FUTURE', message: 'The date cannot be after today.' };
  if (entryDate < goal.startDate || entryDate > goal.endDate) return { status: 400, code: 'ENTRY_DATE_OUTSIDE_GOAL', message: 'The date must be inside the goal start and end dates.' };
  if (value < template.minValue || value > template.maxValue) return { status: 400, code: 'VALUE_OUT_OF_RANGE', message: `The value must be between ${template.minValue} and ${template.maxValue}.` };
  const max = hundredths(template.maxValue);
  const stored = hundredths(dayTotal);
  if (stored + hundredths(value) > max) {
    const left = max - stored;
    const when = entryDate === today ? 'today' : entryDate;
    const message = left > 0 ? `Only ${shown(left)} ${template.unit} left for ${when}.`
      : `${when[0].toUpperCase()}${when.slice(1)} is full (${shown(max)} ${template.unit}).`;
    return { status: 409, code: 'DAILY_TOTAL_ABOVE_MAX', message };
  }
  return null;
}

// F-13 section 4, rows 7 and 8: after an edit or delete, the day total is not above the maximum (BR-04, ADR 0083).
// `others` is the stored total of the day's other entries, read under the goal-row lock; `value` is the edited
// value, or 0 for a delete (`deleting` then always gives the "would be above" message).
export function checkChangedDayTotal({ entryDate, value = 0, deleting = false }, template, others, now = new Date()) {
  const max = hundredths(template.maxValue);
  const rest = hundredths(others);
  if (rest + hundredths(value) <= max) return null;
  const when = entryDate === bangkokToday(now) ? 'today' : entryDate;
  const left = max - rest;
  const message = !deleting && left > 0 ? `Only ${shown(left)} ${template.unit} left for ${when}.`
    : `${when[0].toUpperCase()}${when.slice(1)} would be above ${shown(max)} ${template.unit}. Change other entries first.`;
  return { status: 409, code: 'DAILY_TOTAL_ABOVE_MAX', message };
}
