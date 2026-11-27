import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../server/node_modules/@prisma/client/default.js';
import bcrypt from '../../server/node_modules/bcryptjs/index.js';
import { randomBytes } from 'node:crypto';
if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
test.use({ locale: 'en-US', timezoneId: 'America/Los_Angeles' });
const password = randomBytes(24).toString('base64url');
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const day = n => new Date(Date.parse(`${today()}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
test.beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  const manager = await db.user.create({ data: { username: 'manager1', displayName: 'Manager One', role: 'MANAGER', passwordHash } });
  const participant = await db.user.create({ data: { username: 'participant1', displayName: 'Participant One', role: 'PARTICIPANT', passwordHash } });
  const template = await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, createdBy: manager.id } });
  await db.goal.create({ data: { participantId: participant.id, templateId: template.id, dailyTarget: 8, startDate: new Date(`${day(-9)}T00:00:00Z`), endDate: new Date(`${day(20)}T00:00:00Z`) } });
});
test.afterAll(() => db.$disconnect());
async function login(page) {
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill('participant1');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  // ADR 0073 point 4: a Participant lands on /calendar and opens the goals page from the menu.
  await expect(page).toHaveURL(/\/calendar$/);
  await page.getByRole('link', { name: 'Goals', exact: true }).click();
  await expect(page).toHaveURL(/\/goals$/);
}
const save = page => page.getByRole('button', { name: 'Save entry', exact: true });

test('TC-23 / TC-61: Bangkok default date, saved value with unit, API message and kept value, disabled Save', async ({ page }) => {
  await login(page);
  await expect(page.getByText('No entries yet', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Date', { exact: true })).toHaveValue(today());
  await expect(page.getByLabel('Value (hours)', { exact: true })).toBeVisible();
  await page.getByLabel('Value (hours)', { exact: true }).fill('30');
  await save(page).click();
  await expect(page.getByRole('alert')).toHaveText('The value must be between 0 and 24.');
  await expect(page.getByLabel('Value (hours)', { exact: true })).toHaveValue('30');
  expect(await db.entry.count()).toBe(0);
  await page.getByLabel('Value (hours)', { exact: true }).fill('7.5');
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/api/goals/*/entries', async route => { if (route.request().method() === 'POST') await held; await route.continue(); });
  await save(page).click();
  await expect(save(page)).toBeDisabled();
  release();
  await expect(page.getByText(`${today()}: 7.5 hours`, { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.reload();
  await expect(page.getByText(`${today()}: 7.5 hours`, { exact: true })).toBeVisible();
  expect(await db.entry.count()).toBe(1);
  await page.unroute('**/api/goals/*/entries');
  // Revised, Lab 7 (before: a second entry showed "An entry already exists for this day.").
  await page.getByLabel('Value (hours)', { exact: true }).fill('17');
  await save(page).click();
  await expect(page.getByRole('alert')).toHaveText('Only 16.5 hours left for today.');
  await expect(page.getByLabel('Value (hours)', { exact: true })).toHaveValue('17');
  expect(await db.entry.count()).toBe(1);
});

test('TC-86: several entries of one day are listed newest saved first with the day total, also after a reload', async ({ page }) => {
  await login(page);
  for (const value of ['3', '4.5']) {
    await page.getByLabel('Value (hours)', { exact: true }).fill(value);
    await save(page).click();
    await expect(page.getByText(`${today()}: ${value} hours`, { exact: true })).toBeVisible();
  }
  for (const reload of [false, true]) {
    if (reload) await page.reload();
    // F-13 (#154): the entry text keeps its own element beside Edit and Delete.
    await expect(page.locator('.entry-list .entry-text')).toHaveText([`${today()}: 4.5 hours`, `${today()}: 3 hours`]);
    await expect(page.getByText('Day total: 7.5 hours', { exact: true })).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('TC-27 / AC-08.12: the date box default follows the Asia/Bangkok date at 23:59:59 and 00:00:00, with the browser in Los Angeles', async ({ page }) => {
  for (const [instant, expected] of [['2026-11-10T16:59:59Z', '2026-11-10'], ['2026-11-10T17:00:00Z', '2026-11-11']]) {
    await page.clock.setFixedTime(instant);
    await login(page);
    await expect(page.getByLabel('Date', { exact: true })).toHaveValue(expected);
    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/login$/);
  }
});

test('TC-47 / TC-48: entry form fits the screen and works with the keyboard alone', async ({ page }) => {
  await login(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const control of await page.locator('main .entry-form input, main .entry-form button').all()) {
    expect(await control.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  }
  // Tab into the date box, then through its native segments to the value box.
  await page.getByLabel('Date', { exact: true }).focus();
  const value = page.getByLabel('Value (hours)', { exact: true });
  for (let i = 0; i < 6; i++) { if (await value.evaluate(el => el === document.activeElement)) break; await page.keyboard.press('Tab'); }
  await expect(value).toBeFocused();
  await page.keyboard.type('5');
  await page.keyboard.press('Tab');
  await expect(save(page)).toBeFocused();
  expect(await save(page).evaluate(el => getComputedStyle(el).outlineWidth)).toBe('3px');
  await page.keyboard.press('Enter');
  await expect(page.getByText(`${today()}: 5 hours`, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
