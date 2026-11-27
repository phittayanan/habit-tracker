// F-05 Template retire in the browser (Issue #152; ADR 0078, ADR 0079): TC-141 and TC-143.
import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../server/node_modules/@prisma/client/default.js';
import bcrypt from '../../server/node_modules/bcryptjs/index.js';
import { randomBytes } from 'node:crypto';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
const password = randomBytes(24).toString('base64url');
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
let sleep;
test.beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany();
  await db.session.deleteMany(); await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  const manager = await db.user.create({ data: { username: 'manager1', displayName: 'Manager One', role: 'MANAGER', passwordHash } });
  const participant = await db.user.create({ data: { username: 'participant1', displayName: 'Participant One', role: 'PARTICIPANT', passwordHash } });
  sleep = await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, createdBy: manager.id } });
  const date = new Date(`${today()}T00:00:00Z`);
  await db.goal.create({ data: { participantId: participant.id, templateId: sleep.id, dailyTarget: 8, startDate: date, endDate: date } });
});
test.afterAll(() => db.$disconnect());

async function logIn(page, username) {
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  if (username === 'manager1') { await expect(page).toHaveURL(/\/templates$/); return; }
  // ADR 0073 point 4: a Participant lands on /calendar and opens the goals page from the menu.
  await expect(page).toHaveURL(/\/calendar$/);
  await page.getByRole('link', { name: 'Goals', exact: true }).click();
  await expect(page).toHaveURL(/\/goals$/);
}
const noSideScroll = async page => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
const sleepRow = page => page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Sleep', exact: true }) });
const state = async () => (await db.template.findUniqueOrThrow({ where: { id: sleep.id } })).state;
const question = 'Retire "Sleep"? New goals cannot use it. This cannot be undone.';

test('TC-141: Retire asks first, Cancel changes nothing, then the row shows Retired and the Participant loses the choice', async ({ page }) => {
  await logIn(page, 'manager1');
  await sleepRow(page).getByRole('button', { name: 'Retire', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText(question);
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(sleepRow(page).getByRole('cell', { name: 'Active', exact: true })).toBeVisible();
  expect(await state()).toBe('ACTIVE');

  await sleepRow(page).getByRole('button', { name: 'Retire', exact: true }).click();
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route(`**/api/templates/${sleep.id}/retire`, async route => { await held; await route.continue(); });
  const confirm = dialog.getByRole('button', { name: 'Retire', exact: true });
  await confirm.click();
  await expect(confirm).toBeDisabled();
  release();
  await expect(dialog).toHaveCount(0);
  await expect(sleepRow(page).getByRole('cell', { name: 'Retired', exact: true })).toBeVisible();
  await expect(sleepRow(page).getByRole('button')).toHaveCount(0);
  expect(await state()).toBe('RETIRED');

  await page.getByRole('button', { name: 'Log out' }).click();
  await logIn(page, 'participant1');
  await expect(page.getByRole('heading', { name: 'Sleep', exact: true })).toBeVisible();
  await page.getByRole('link', { name: '+ New goal', exact: true }).click();
  await expect(page.getByLabel('Template', { exact: true })).toBeFocused();
  await expect(page.getByLabel('Template', { exact: true }).locator('option')).toHaveText(['Choose a template']);
  await page.goto('/templates');
  await expect(page.getByText('No templates yet')).toBeVisible();
});

test('TC-141 (rejected requests): an already retired template and an old goal form show the API message', async ({ page }) => {
  await logIn(page, 'manager1');
  await sleepRow(page).getByRole('button', { name: 'Retire', exact: true }).click();
  await db.template.update({ where: { id: sleep.id }, data: { state: 'RETIRED' } });
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Retire', exact: true }).click();
  await expect(dialog.getByRole('alert')).toHaveText('This template is already retired.');
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();

  await db.template.update({ where: { id: sleep.id }, data: { state: 'ACTIVE' } });
  await db.goal.deleteMany();
  await page.getByRole('button', { name: 'Log out' }).click();
  await logIn(page, 'participant1');
  await page.goto('/goals/new');
  await page.getByLabel('Template', { exact: true }).selectOption(String(sleep.id));
  await page.getByLabel('Daily target', { exact: true }).fill('8');
  await page.getByLabel('End date', { exact: true }).fill(today());
  await db.template.update({ where: { id: sleep.id }, data: { state: 'RETIRED' } });
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('This template is retired and cannot be used for a new goal.');
  await expect(page.getByLabel('Daily target', { exact: true })).toHaveValue('8');
  await expect(page.getByLabel('Template', { exact: true })).toHaveValue(String(sleep.id));
});

test('TC-143: keyboard alone retires with no horizontal scroll; focus moves into the dialog and back', async ({ page }) => {
  await logIn(page, 'manager1');
  const button = sleepRow(page).getByRole('button', { name: 'Retire', exact: true });
  await expect(button).toBeVisible();
  await noSideScroll(page);
  let focused = false;
  for (let step = 0; step < 8 && !focused; step += 1) {
    await page.keyboard.press('Tab');
    focused = await button.evaluate(el => el === document.activeElement);
  }
  expect(focused).toBe(true);
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  const cancel = dialog.getByRole('button', { name: 'Cancel', exact: true });
  const confirm = dialog.getByRole('button', { name: 'Retire', exact: true });
  await expect(cancel).toBeFocused();
  expect(await cancel.evaluate(el => getComputedStyle(el).outlineWidth)).toBe('3px');
  for (const control of [cancel, confirm]) expect(await control.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  await noSideScroll(page);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(button).toBeFocused();
  expect(await state()).toBe('ACTIVE');
  await page.keyboard.press('Enter');
  await expect(cancel).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(confirm).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dialog).toHaveCount(0);
  // ADR 0095: the row's button is gone, so focus goes to the row's "Retired" cell.
  const retiredCell = sleepRow(page).getByRole('cell', { name: 'Retired', exact: true });
  await expect(retiredCell).toBeFocused();
  expect(await retiredCell.evaluate(el => getComputedStyle(el).outlineWidth)).toBe('3px');
  await expect(retiredCell).toHaveAttribute('tabindex', '-1');
  await noSideScroll(page);
});
