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

const editBody = z.object({
  name: text(nameMessage, 100).optional(),
  unit: text(unitMessage, 30).optional(),
  minValue: decimal(minMessage).optional(),
  maxValue: decimal(maxMessage).optional(),
});
const emptyEditMessage = 'Change at least one of name, unit, minimum or maximum.';
const largestId = 2147483647;

export function mergedRangeAllowed(stored, sent) {
  return minimumBelowMaximum(sent.minValue ?? stored.minValue, sent.maxValue ?? stored.maxValue);
}

export function parseTemplateEdit(idText, body) {
  const fail = message => ({ ok: false, status: 400, code: 'VALIDATION_ERROR', message });
  if (!/^[1-9]\d*$/.test(idText)) return fail('Template id must be a positive whole number.');
  const parsed = editBody.safeParse(body ?? {});
  if (!parsed.success) {
    const issue = [...parsed.error.issues].sort((left, right) => fieldOrder.indexOf(String(left.path[0])) - fieldOrder.indexOf(String(right.path[0])))[0];
    return fail(issue.path.length ? issue.message : emptyEditMessage);
  }
  const data = Object.fromEntries(fieldOrder.filter(field => parsed.data[field] !== undefined).map(field => [field, parsed.data[field]]));
  if (Object.keys(data).length === 0) return fail(emptyEditMessage);
  return { ok: true, id: Number(idText), data };
}

const nameExists = { ok: false, status: 409, code: 'TEMPLATE_NAME_EXISTS', message: 'A template with this name already exists.' };
const notFound = { ok: false, status: 404, code: 'TEMPLATE_NOT_FOUND', message: 'Template not found.' };

// F-04 OP-04.4: lock the template row first, as goal creation (F-07) does, so a goal
// cannot be created between the in-use check and the update.
export async function editTemplate(db, id, data) {
  if (id > largestId) return notFound;
  try {
    return await db.$transaction(async tx => {
      const [row] = await tx.$queryRaw`SELECT id, min_value AS "minValue", max_value AS "maxValue" FROM "Template" WHERE id = ${id} FOR UPDATE`;
      if (!row) return notFound;
      if (await tx.goal.count({ where: { templateId: id } }) > 0) {
        return { ok: false, status: 409, code: 'TEMPLATE_IN_USE', message: 'This template is used by a goal and cannot be edited.' };
      }
      if (!mergedRangeAllowed({ minValue: Number(row.minValue), maxValue: Number(row.maxValue) }, data)) {
        return { ok: false, status: 400, code: 'MIN_NOT_BELOW_MAX', message: 'Minimum must be below maximum.' };
      }
      const changes = { ...data };
      if (changes.minValue !== undefined) changes.minValue = changes.minValue.toFixed(2);
      if (changes.maxValue !== undefined) changes.maxValue = changes.maxValue.toFixed(2);
      return { ok: true, template: toTemplate(await tx.template.update({ where: { id }, data: changes })) };
    });
  } catch (error) {
    if (error.code === 'P2002') return nameExists;
    throw error;
  }
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
    if (error.code === 'P2002') return nameExists;
    throw error;
  }
}
