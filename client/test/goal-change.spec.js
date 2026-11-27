// F-14 goal change on the goals page (Issue #153): TC-158 and TC-159, at 375 px and 1280 px (playwright.config.js projects).
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
const asDate = text => new Date(`${text}T00:00:00Z`);
let a, manager, w, ended, future;
async function makeGoal(name, unit, max, target, start, end, kind = 'COUNT') {
  const template = await db.template.create({ data: { name, unit, kind, minValue: 1, maxValue: max, createdBy: manager.id } });
  const goal = await db.goal.create({ data: { participantId: a.id, templateId: template.id, dailyTarget: target, startDate: asDate(start), endDate: asDate(end) } });
  await db.goalTarget.create({ data: { goalId: goal.id, effectiveFrom: asDate(start), dailyTarget: target } });
  return goal;
}
test.beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  manager = await db.user.create({ data: { username: 'manager1', displayName: 'Manager One', role: 'MANAGER', passwordHash } });
  a = await db.user.create({ data: { username: 'participant1', displayName: 'Participant One', role: 'PARTICIPANT', passwordHash } });
  w = await makeGoal('Water', 'glasses', 12, 8, day(-10), day(10));
  for (const n of [-2, 0]) await db.entry.create({ data: { goalId: w.id, entryDate: asDate(day(n)), value: 7 } });
  ended = await makeGoal('Sleep', 'hours', 24, 8, day(-20), day(-1));
  future = await makeGoal('Reading', 'pages', 100, 20, day(3), day(20));
});
test.afterAll(() => db.$disconnect());
async function login(page) {
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill('participant1');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/goals$/);
}
const card = (page, name) => page.getByRole('listitem').filter({ has: page.getByRole('heading', { name, exact: true }) });
const fits = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

test('TC-158: change W to 13 (refused, value kept), then 6; no button on an ended goal', async ({ page }) => {
  await login(page);
  const water = card(page, 'Water');
  await expect(water.getByText('0 of 11 days met', { exact: true })).toBeVisible();
  await expect(card(page, 'Sleep').getByRole('button', { name: 'Change target' })).toHaveCount(0);
  await expect(card(page, 'Reading').getByRole('button', { name: 'Change target' })).toHaveCount(1);
  await water.getByRole('button', { name: 'Change target', exact: true }).click();
  const box = water.getByLabel('New daily target (glasses)', { exact: true });
  await expect(box).toHaveValue('8');
  await expect(water.getByText('Applies from today. Earlier days keep their target.', { exact: true })).toBeVisible();
  await box.fill('13');
  await water.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(water.getByRole('alert')).toHaveText('Daily target must not exceed the template maximum.');
  await expect(box).toHaveValue('13');
  await expect(box).toHaveAttribute('aria-invalid', 'true');
  await expect(box).toHaveAccessibleDescription(/Daily target must not exceed the template maximum\./);
  await expect(water.getByRole('button', { name: 'Change target', exact: true })).toHaveAccessibleDescription('Water');
  await expect(water.getByText('Daily target: 8 glasses', { exact: true })).toBeVisible();
  // Save is disabled while the request is in flight.
  let release;
  await page.route(`**/api/goals/${w.id}`, async route => { await new Promise(resolve => { release = resolve; }); await route.continue(); });
  await box.fill('6');
  await water.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(water.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  release();
  await expect(water.getByText('Daily target: 6 glasses', { exact: true })).toBeVisible();
  await expect(water.getByText('1 of 11 days met', { exact: true })).toBeVisible();
  await expect(box).toHaveCount(0);
  await page.unroute(`**/api/goals/${w.id}`);
  // A goal that has not started says from which date the target applies.
  const reading = card(page, 'Reading');
  await reading.getByRole('button', { name: 'Change target', exact: true }).click();
  await expect(reading.getByText(`Applies from ${day(3)}.`, { exact: true })).toBeVisible();
  await reading.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(reading.getByLabel('New daily target (pages)', { exact: true })).toHaveCount(0);
  await expect(reading.getByText('Daily target: 20 pages', { exact: true })).toBeVisible();
  expect(await fits(page)).toBe(true);
  expect(Number((await db.goal.findUniqueOrThrow({ where: { id: w.id } })).dailyTarget)).toBe(6);
});

test('TC-158 (TIME, ADR 0093): a Time target is typed in minutes with the "= 7 h" hint; a fraction shows the API message', async ({ page }) => {
  const time = await makeGoal('Sleep time', 'minutes', 720, 480, day(-5), day(5), 'TIME');
  await login(page);
  const sleep = card(page, 'Sleep time');
  await expect(sleep.getByText('Daily target: 8 h', { exact: true })).toBeVisible();
  await sleep.getByRole('button', { name: 'Change target', exact: true }).click();
  const box = sleep.getByLabel('New daily target (minutes)', { exact: true });
  await expect(box).toHaveValue('480');
  await expect(sleep.getByText('= 8 h', { exact: true })).toBeVisible();
  await box.fill('420');
  await expect(sleep.getByText('= 7 h', { exact: true })).toBeVisible();
  await box.fill('420.5');
  await sleep.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(sleep.getByRole('alert')).toHaveText('Target must be whole minutes.');
  await expect(box).toHaveValue('420.5');
  await box.fill('430');
  await expect(sleep.getByText('= 7 h 10 min', { exact: true })).toBeVisible();
  await sleep.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(sleep.getByText('Daily target: 7 h 10 min', { exact: true })).toBeVisible();
  expect(await fits(page)).toBe(true);
  expect(Number((await db.goal.findUniqueOrThrow({ where: { id: time.id } })).dailyTarget)).toBe(430);
});

test('TC-159: keyboard alone opens, cancels, opens again and saves a change, with no horizontal scroll', async ({ page }) => {
  await login(page);
  const water = card(page, 'Water');
  const open = water.getByRole('button', { name: 'Change target', exact: true });
  const tabTo = async locator => {
    for (let i = 0; i < 60; i++) { if (await locator.evaluate(el => el === document.activeElement)) return; await page.keyboard.press('Tab'); }
    throw new Error('not reachable by Tab');
  };
  await page.evaluate(() => document.activeElement?.blur());
  await tabTo(open);
  await page.keyboard.press('Enter');
  const box = water.getByLabel('New daily target (glasses)', { exact: true });
  await expect(box).toBeFocused();
  expect(await fits(page)).toBe(true);
  await tabTo(water.getByRole('button', { name: 'Cancel', exact: true }));
  await page.keyboard.press('Enter');
  await expect(box).toHaveCount(0);
  await expect(open).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(box).toBeFocused();
  // Every control of the open box is reached by Tab in order: number box, Save, Cancel.
  await page.keyboard.press('Shift+Tab'); await expect(open).toBeFocused();
  await page.keyboard.press('Tab'); await expect(box).toBeFocused();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type('6');
  await page.keyboard.press('Tab'); await expect(water.getByRole('button', { name: 'Save', exact: true })).toBeFocused();
  await page.keyboard.press('Tab'); await expect(water.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab'); await expect(water.getByRole('button', { name: 'Save', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(water.getByText('Daily target: 6 glasses', { exact: true })).toBeVisible();
  await expect(water.getByText('1 of 11 days met', { exact: true })).toBeVisible();
  await expect(open).toBeFocused();
  expect(await fits(page)).toBe(true);
});
