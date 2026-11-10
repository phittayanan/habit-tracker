import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../server/node_modules/@prisma/client/default.js';
import bcrypt from '../../server/node_modules/bcryptjs/index.js';
import { randomBytes } from 'node:crypto';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
const password = randomBytes(24).toString('base64url');
test.beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany();
  await db.template.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  for (const [username, displayName, role] of [
    ['manager1', 'Manager One', 'MANAGER'],
    ['participant1', 'Participant One', 'PARTICIPANT'],
  ]) await db.user.create({ data: { username, displayName, role, passwordHash } });
});
test.afterAll(() => db.$disconnect());

async function logIn(page, username) {
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(username === 'manager1' ? /\/templates$/ : /\/goals$/);
}

function range(min, max) {
  return `${min}\u2013${max}`;
}

test('TC-11: manager template page shows every state, New and Edit, and no Retire control', async ({ page }) => {
  await logIn(page, 'manager1');
  await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
  await expect(page.getByText('No templates yet')).toBeVisible();
  await expect(page.getByRole('link', { name: 'New', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retire' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Retire' })).toHaveCount(0);
  const manager = await db.user.findUniqueOrThrow({ where: { username: 'manager1' } });
  await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 7, maxValue: 9, createdBy: manager.id } });
  await db.template.create({ data: {
    name: 'Steps', unit: 'steps', minValue: 0, maxValue: 10000, state: 'RETIRED', createdBy: manager.id,
  } });
  await page.reload();
  const table = page.getByRole('table');
  await expect(table).toBeVisible();
  await expect(table.getByRole('columnheader')).toHaveText(['Name', 'Unit', 'Range', 'State', 'Edit']);
  const rows = table.getByRole('row');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(1)).toContainText('Sleep');
  await expect(rows.nth(1)).toContainText('hours');
  await expect(rows.nth(1)).toContainText(range(7, 9));
  await expect(rows.nth(1)).toContainText('Active');
  await expect(rows.nth(2)).toContainText('Steps');
  await expect(rows.nth(2)).toContainText('Retired');
  await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'New', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retire' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Retire' })).toHaveCount(0);
  await expect(page.getByText('Retired')).toBeVisible();
});

test('TC-70: the new template form shows the API message and keeps the typed values', async ({ page }) => {
  await logIn(page, 'manager1');
  await page.getByRole('link', { name: 'New', exact: true }).click();
  await expect(page).toHaveURL(/\/templates\/new$/);
  await page.getByLabel('Name', { exact: true }).fill('Stretching');
  await page.getByLabel('Unit', { exact: true }).fill('minutes');
  await page.getByLabel('Minimum', { exact: true }).fill('10');
  await page.getByLabel('Maximum', { exact: true }).fill('5');
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/api/templates', async route => {
    if (route.request().method() === 'POST') await held;
    await route.continue();
  });
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await expect(page.getByRole('status')).toHaveText('Saving…');
  release();
  await expect(page.getByRole('alert')).toHaveText('Minimum must be below maximum.');
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Stretching');
  await expect(page.getByLabel('Unit', { exact: true })).toHaveValue('minutes');
  await expect(page.getByLabel('Minimum', { exact: true })).toHaveValue('10');
  await expect(page.getByLabel('Maximum', { exact: true })).toHaveValue('5');
  await page.getByLabel('Minimum', { exact: true }).fill('0');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByRole('table')).toContainText('Stretching');
  await expect(page.getByRole('table')).toContainText(range(0, 5));
});

test('TC-16: participant template page is read-only and hides an empty New button', async ({ page }) => {
  const manager = await db.user.findUniqueOrThrow({ where: { username: 'manager1' } });
  await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, createdBy: manager.id } });
  await db.template.create({ data: { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 500, createdBy: manager.id } });
  await db.template.create({ data: {
    name: 'Steps', unit: 'steps', minValue: 0, maxValue: 30000, state: 'RETIRED', createdBy: manager.id,
  } });
  await logIn(page, 'participant1');
  await page.getByRole('link', { name: 'Templates', exact: true }).click();
  await expect(page).toHaveURL(/\/templates$/);
  const table = page.getByRole('table');
  await expect(table.getByRole('columnheader')).toHaveText(['Name', 'Unit', 'Range']);
  await expect(table.getByRole('row').nth(1)).toContainText('Reading');
  await expect(table.getByRole('row').nth(1)).toContainText(range(0, 500));
  await expect(table.getByRole('row').nth(2)).toContainText('Sleep');
  await expect(table.getByRole('row').nth(2)).toContainText(range(0, 24));
  await expect(page.getByText('Steps')).toHaveCount(0);
  await expect(page.getByText('Active')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'New', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'New', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Edit', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Retire' })).toHaveCount(0);
  await db.entry.deleteMany(); await db.goal.deleteMany();
  await db.template.deleteMany();
  await page.reload();
  await expect(page.getByText('No templates yet')).toBeVisible();
  await expect(page.getByRole('link', { name: 'New', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'New', exact: true })).toHaveCount(0);
});

test('TC-47 / TC-48: template screens fit both widths and the keyboard completes create and review', async ({ page }) => {
  await logIn(page, 'manager1');
  await expect(page.getByText('No templates yet')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Templates', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Log out' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'New', exact: true })).toBeFocused();
  expect(await page.getByRole('link', { name: 'New', exact: true }).evaluate(el => getComputedStyle(el).outlineWidth)).toBe('3px');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/templates\/new$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByLabel('Name', { exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Log out' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Name', { exact: true })).toBeFocused();
  await page.keyboard.type('Keyboard');
  for (const [label, value] of [['Unit', 'minutes'], ['Minimum', '1'], ['Maximum', '3']]) {
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(label, { exact: true })).toBeFocused();
    await page.keyboard.type(value);
  }
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByRole('table')).toContainText('Keyboard');
  let editFocused = false;
  for (let step = 0; step < 8 && !editFocused; step += 1) {
    await page.keyboard.press('Tab');
    editFocused = await page.getByRole('button', { name: 'Edit', exact: true }).evaluate(el => el === document.activeElement);
  }
  expect(editFocused).toBe(true);
  expect(await page.getByRole('button', { name: 'Edit', exact: true }).evaluate(el => getComputedStyle(el).outlineWidth)).toBe('3px');
  for (const control of await page.locator('button, nav a, main a, main input').all()) {
    expect(await control.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole('button', { name: 'Log out' }).click();
  await logIn(page, 'participant1');
  await page.goto('/templates');
  await expect(page.getByRole('table')).toContainText('Keyboard');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Goals', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Templates', exact: true })).toBeFocused();
  await expect(page.getByText('Active')).toHaveCount(0);
  await expect(page.getByRole('cell', { name: 'Active' })).toHaveCount(0);
});

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const addDays = n => new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

async function editRow(page, name) {
  await page.getByRole('row').filter({ has: page.getByRole('cell', { name, exact: true }) }).getByRole('button', { name: 'Edit', exact: true }).click();
}

test('TC-73: Edit opens the filled form, a valid change shows in the table, a used template shows the API message', async ({ page, playwright }) => {
  const manager = await db.user.findUniqueOrThrow({ where: { username: 'manager1' } });
  const reading = await db.template.create({ data: { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 500, createdBy: manager.id } });
  const sleep = await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, createdBy: manager.id } });
  const participant = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:33132' });
  try {
    expect((await participant.post('/api/auth/login', { data: { username: 'participant1', password } })).status()).toBe(200);
    expect((await participant.post('/api/goals', { data: { templateId: sleep.id, dailyTarget: 8, startDate: today(), endDate: addDays(30) } })).status()).toBe(201);
  } finally { await participant.dispose(); }
  await logIn(page, 'manager1');
  await editRow(page, 'Reading');
  await expect(page).toHaveURL(new RegExp(`/templates/${reading.id}/edit$`));
  await expect(page.getByRole('heading', { name: 'Edit template' })).toBeVisible();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Reading');
  await expect(page.getByLabel('Unit', { exact: true })).toHaveValue('pages');
  await expect(page.getByLabel('Minimum', { exact: true })).toHaveValue('0');
  await expect(page.getByLabel('Maximum', { exact: true })).toHaveValue('500');
  await page.getByLabel('Maximum', { exact: true }).fill('300');
  const sent = page.waitForRequest(req => req.method() === 'PATCH' && req.url().endsWith(`/api/templates/${reading.id}`));
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  expect((await sent).postDataJSON()).toEqual({ maxValue: 300 });
  await expect(page).toHaveURL(/\/templates$/);
  const readingRow = page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Reading', exact: true }) });
  await expect(readingRow).toContainText(range(0, 300));
  await editRow(page, 'Sleep');
  await expect(page).toHaveURL(new RegExp(`/templates/${sleep.id}/edit$`));
  await expect(page.getByLabel('Maximum', { exact: true })).toHaveValue('24');
  await page.getByLabel('Maximum', { exact: true }).fill('12');
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route(`**/api/templates/${sleep.id}`, async route => { await held; await route.continue(); });
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await expect(page.getByRole('status')).toHaveText('Saving…');
  release();
  await expect(page.getByRole('alert')).toHaveText('This template is used by a goal and cannot be edited.');
  await expect(page.getByLabel('Maximum', { exact: true })).toHaveValue('12');
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Sleep');
  await expect(page).toHaveURL(new RegExp(`/templates/${sleep.id}/edit$`));
  expect(Number((await db.template.findUniqueOrThrow({ where: { id: sleep.id } })).maxValue)).toBe(24);
  await page.getByRole('link', { name: 'Cancel', exact: true }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Sleep', exact: true }) })).toContainText(range(0, 24));
});

test('edit page: a direct visit loads the stored values, an unknown id says so, and a participant cannot open it', async ({ page }) => {
  const manager = await db.user.findUniqueOrThrow({ where: { username: 'manager1' } });
  const walk = await db.template.create({ data: { name: 'Walk', unit: 'steps', minValue: 1.5, maxValue: 100, createdBy: manager.id } });
  await logIn(page, 'manager1');
  await page.goto(`/templates/${walk.id}/edit`);
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Walk');
  await expect(page.getByLabel('Minimum', { exact: true })).toHaveValue('1.5');
  await page.goto('/templates/99999/edit');
  await expect(page.getByRole('alert')).toHaveText('Template not found.');
  await expect(page.getByLabel('Name', { exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Cancel', exact: true }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await page.getByRole('button', { name: 'Log out' }).click();
  await logIn(page, 'participant1');
  await page.goto(`/templates/${walk.id}/edit`);
  await expect(page.getByText('This page is not available for your role.')).toBeVisible();
  await expect(page.getByLabel('Name', { exact: true })).toHaveCount(0);
});

test('TC-47 / TC-48: the edit form fits both widths and the keyboard alone opens, saves and cancels it', async ({ page }) => {
  const manager = await db.user.findUniqueOrThrow({ where: { username: 'manager1' } });
  const reading = await db.template.create({ data: { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 500, createdBy: manager.id } });
  await logIn(page, 'manager1');
  await expect(page.getByRole('table')).toContainText('Reading');
  let editFocused = false;
  for (let step = 0; step < 8 && !editFocused; step += 1) {
    await page.keyboard.press('Tab');
    editFocused = await page.getByRole('button', { name: 'Edit', exact: true }).evaluate(el => el === document.activeElement);
  }
  expect(editFocused).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`/templates/${reading.id}/edit$`));
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Reading');
  await expect(page.getByLabel('Name', { exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const control of await page.locator('button, nav a, main a, main input').all()) {
    expect(await control.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  }
  for (const label of ['Unit', 'Minimum', 'Maximum']) {
    await page.keyboard.press('Tab');
    await expect(page.getByLabel(label, { exact: true })).toBeFocused();
  }
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('400');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeFocused();
  expect(await page.getByRole('button', { name: 'Save', exact: true }).evaluate(el => getComputedStyle(el).outlineWidth)).toBe('3px');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByRole('table')).toContainText(range(0, 400));
  editFocused = false;
  for (let step = 0; step < 8 && !editFocused; step += 1) {
    await page.keyboard.press('Tab');
    editFocused = await page.getByRole('button', { name: 'Edit', exact: true }).evaluate(el => el === document.activeElement);
  }
  expect(editFocused).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Name', { exact: true })).toBeFocused();
  for (let i = 0; i < 5; i += 1) await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Cancel', exact: true })).toBeFocused();
  expect(await page.getByRole('link', { name: 'Cancel', exact: true }).evaluate(el => getComputedStyle(el).outlineWidth)).toBe('3px');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/templates$/);
  expect(Number((await db.template.findUniqueOrThrow({ where: { id: reading.id } })).maxValue)).toBe(400);
});
