import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../server/node_modules/@prisma/client/default.js';
import bcrypt from '../../server/node_modules/bcryptjs/index.js';
import { randomBytes } from 'node:crypto';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
const password = randomBytes(24).toString('base64url');
test.beforeEach(async () => {
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
