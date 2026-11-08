import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../server/node_modules/@prisma/client/default.js';
import bcrypt from '../../server/node_modules/bcryptjs/index.js';
import { randomBytes } from 'node:crypto';
if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
const password = randomBytes(24).toString('base64url');
let template;
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
test.beforeEach(async () => {
  await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  const manager = await db.user.create({ data: { username: 'manager1', displayName: 'Manager One', role: 'MANAGER', passwordHash } });
  await db.user.create({ data: { username: 'participant1', displayName: 'Participant One', role: 'PARTICIPANT', passwordHash } });
  template = await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, createdBy: manager.id } });
  await db.template.create({ data: { name: 'Retired', unit: 'units', minValue: 0, maxValue: 20, createdBy: manager.id, state: 'RETIRED' } });
});
test.afterAll(() => db.$disconnect());
async function login(page, username = 'participant1') {
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(username === 'manager1' ? /\/templates$/ : /\/goals$/);
}
const newGoal = page => page.getByRole('link', { name: '+ New goal', exact: true });
async function fill(page, target = '20') {
  await page.getByLabel('Template', { exact: true }).selectOption(String(template.id));
  await page.getByLabel('Daily target', { exact: true }).fill(target);
  await page.getByLabel('End date', { exact: true }).fill(today());
}

test('TC-60: real goal creation, duplicate message and retained values, disabled loading Save', async ({ page }) => {
  await login(page);
  await expect(page.getByText('No goals yet', { exact: true })).toBeVisible();
  await newGoal(page).click();
  await expect(page.getByLabel('Start date', { exact: true })).toHaveValue(today());
  await expect(page.getByLabel('Template', { exact: true }).getByRole('option')).toHaveText(['Choose a template', 'Sleep']);
  await fill(page);
  await expect(page.getByText('hours', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL(/\/goals$/);
  await expect(page.getByRole('listitem')).toContainText(['Sleep', '20', 'hours', 'Active']);
  await newGoal(page).click(); await fill(page, '21');
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/api/goals', async route => { if (route.request().method() === 'POST') await held; await route.continue(); });
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await expect(page.getByRole('status')).toHaveText('Saving…'); release();
  await expect(page.getByRole('alert')).toHaveText('You already have an active goal for this template.');
  await expect(page.getByLabel('Template', { exact: true })).toHaveValue(String(template.id));
  await expect(page.getByLabel('Daily target', { exact: true })).toHaveValue('21');
  await expect(page.getByLabel('Start date', { exact: true })).toHaveValue(today());
  await expect(page.getByLabel('End date', { exact: true })).toHaveValue(today());
  expect(await db.goal.count()).toBe(1);
});

test('TC-47 / TC-48: goals screens fit and keyboard alone opens, submits and cancels form', async ({ page }) => {
  await login(page);
  await expect(newGoal(page)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // Start keyboard traversal from the document, independent of login focus restoration.
  await page.goto('/goals'); await expect(newGoal(page)).toBeVisible();
  for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
  await expect(newGoal(page)).toBeFocused(); await page.keyboard.press('Enter');
  const select = page.getByLabel('Template', { exact: true });
  await expect(select).toBeFocused();
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('s'); await page.keyboard.press('Enter');
  await expect(select).toHaveValue(String(template.id));
  await page.keyboard.press('Tab'); await expect(page.getByLabel('Daily target', { exact: true })).toBeFocused();
  await page.keyboard.type('12');
  // Native date segment traversal differs by platform; use the current start day and
  // traverse every native segment until End date, then fill it through keyboard.
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Start date', { exact: true })).toBeFocused();
  let reachedEnd = false;
  for (let i = 0; i < 6 && !reachedEnd; i++) { await page.keyboard.press('Tab'); reachedEnd = await page.getByLabel('End date', { exact: true }).evaluate(el => el === document.activeElement); }
  expect(reachedEnd).toBe(true);
  const [year, month, day] = today().split('-');
  await page.keyboard.type(month); await page.keyboard.press('ArrowRight');
  await page.keyboard.type(day); await page.keyboard.press('ArrowRight'); await page.keyboard.type(year);
  for (let i = 0; i < 5; i++) { if (await page.getByRole('button', { name: 'Save', exact: true }).evaluate(el => el === document.activeElement)) break; await page.keyboard.press('Tab'); }
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const control of await page.locator('main input, main select, main button, main a').all()) expect(await control.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  await page.keyboard.press('Enter'); await expect(page).toHaveURL(/\/goals$/);
  await expect(page.getByRole('listitem')).toContainText('Sleep');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await newGoal(page).focus(); await page.keyboard.press('Enter'); await expect(select).toBeFocused();
  await page.keyboard.press('Shift+Tab'); await expect(page.getByRole('button', { name: 'Log out' })).toBeFocused();
  // Reach Cancel through the form's actual tab order.
  for (let i = 0; i < 15; i++) { await page.keyboard.press('Tab'); if (await page.getByRole('link', { name: 'Cancel' }).evaluate(el => el === document.activeElement)) break; }
  await expect(page.getByRole('link', { name: 'Cancel' })).toBeFocused(); await page.keyboard.press('Enter'); await expect(page).toHaveURL(/\/goals$/);
});

test('Goal screens: Bangkok default in a different browser zone, role restriction and expired session', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await login(page); await page.goto('/goals/new');
  await expect(page.getByLabel('Start date', { exact: true })).toHaveValue(today());
  await db.session.deleteMany();
  await fill(page); await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await login(page, 'manager1'); await page.goto('/goals/new');
  await expect(page.getByText('This page is not available for your role.')).toBeVisible();
  await expect(page.getByLabel('Template', { exact: true })).toHaveCount(0);
});
