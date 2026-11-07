import { z } from 'zod';

const decimalLimit = 99999999.99;
const nameMessage = 'Name must be 1 to 100 characters.';
const unitMessage = 'Unit must be 1 to 30 characters.';
const minMessage = 'Minimum must be a number with at most 2 decimal places.';
const maxMessage = 'Maximum must be a number with at most 2 decimal places.';
const fieldOrder = ['name', 'unit', 'minValue', 'maxValue'];

export function minimumBelowMaximum(minValue, maxValue) {
  return minValue < maxValue;
}

function acceptableDecimal(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > decimalLimit) return false;
  const match = value.toString().toLowerCase().match(/^(-?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/);
  if (!match) return false;
  const places = (match[3] || '').length - (match[4] ? Number(match[4]) : 0);
  return places <= 2;
}

const decimal = message => z.number({ error: message }).refine(acceptableDecimal, { error: message });
const text = (message, max) => z.string({ error: message }).trim().min(1, { error: message }).max(max, { error: message });
const createBody = z.object({
  name: text(nameMessage, 100),
  unit: text(unitMessage, 30),
  minValue: decimal(minMessage),
  maxValue: decimal(maxMessage),
});

export function parseTemplateCreate(body) {
  const parsed = createBody.safeParse(body ?? {});
  if (!parsed.success) {
    const issue = [...parsed.error.issues].sort((left, right) => fieldOrder.indexOf(String(left.path[0])) - fieldOrder.indexOf(String(right.path[0])))[0];
    return { ok: false, status: 400, code: 'VALIDATION_ERROR', message: issue.message };
  }
  if (!minimumBelowMaximum(parsed.data.minValue, parsed.data.maxValue)) {
    return { ok: false, status: 400, code: 'MIN_NOT_BELOW_MAX', message: 'Minimum must be below maximum.' };
  }
  return { ok: true, data: parsed.data };
}

export function toTemplate(row) {
  return {
    id: row.id,
    name: row.name,
    unit: row.unit,
    minValue: Number(row.minValue.toString()),
    maxValue: Number(row.maxValue.toString()),
    state: row.state,
  };
}

export async function listTemplates(db, user) {
  const rows = await db.template.findMany({
    where: user.role === 'PARTICIPANT' ? { state: 'ACTIVE' } : {},
    orderBy: { name: 'asc' },
  });
  return rows.map(toTemplate);
}

export async function createTemplate(db, user, data) {
  try {
    const row = await db.template.create({ data: {
      name: data.name, unit: data.unit, createdBy: user.id,
      minValue: data.minValue.toFixed(2), maxValue: data.maxValue.toFixed(2),
    } });
    return { ok: true, template: toTemplate(row) };
  } catch (error) {
    if (error.code === 'P2002') {
      return { ok: false, status: 409, code: 'TEMPLATE_NAME_EXISTS', message: 'A template with this name already exists.' };
    }
    throw error;
  }
}
