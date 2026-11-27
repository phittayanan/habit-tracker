// F-17 stored reminder on the goals page (Issue #158): TC-173 to TC-175, at 375 px and 1280 px (playwright.config.js projects).
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
let a, manager, w, e;
async function makeGoal(name, unit, start, end) {
  const template = await db.template.create({ data: { name, unit, minValue: 1, maxValue: 12, createdBy: manager.id } });
  const goal = await db.goal.create({ data: { participantId: a.id, templateId: template.id, dailyTarget: 8, startDate: asDate(start), endDate: asDate(end) } });
  await db.goalTarget.create({ data: { goalId: goal.id, effectiveFrom: asDate(start), dailyTarget: 8 } });
  return goal;
}
test.beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  manager = await db.user.create({ data: { username: 'manager1', displayName: 'Manager One', role: 'MANAGER', passwordHash } });
  a = await db.user.create({ data: { username: 'participant1', displayName: 'Participant One', role: 'PARTICIPANT', passwordHash } });
  w = await makeGoal('Water', 'glasses', day(-5), day(5));
  e = await makeGoal('Sleep', 'hours', day(-20), day(-1));
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
const stored = async goalId => {
  const row = await db.goalReminder.findUnique({ where: { goalId } });
  return row && { time: row.time, weekdays: row.weekdays };
};

test('TC-173: set 07:30 Mon and Fri, reload, refused save keeps the values, change, then remove', async ({ page }) => {
  await login(page);
  const water = card(page, 'Water');
  await expect(water.getByText('No reminder', { exact: true })).toBeVisible();
  await expect(water.getByRole('button', { name: 'Remove reminder', exact: true })).toHaveCount(0);
  await water.getByRole('button', { name: 'Set reminder', exact: true }).click();
  await expect(water.getByText('The app only stores this. It sends nothing.', { exact: true })).toBeVisible();
  const days = water.getByRole('group', { name: 'Weekdays', exact: true });
  await expect(days.getByRole('checkbox')).toHaveCount(7);
  expect(await days.getByRole('checkbox').evaluateAll(boxes => boxes.map(box => box.labels[0].textContent))).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  await water.getByLabel('Reminder time', { exact: true }).fill('07:30');
  await days.getByRole('checkbox', { name: 'Mon', exact: true }).check();
  await days.getByRole('checkbox', { name: 'Fri', exact: true }).check();
  // Save is disabled while the request is in flight.
  let release;
  await page.route(`**/api/goals/${w.id}/reminder`, async route => { await new Promise(resolve => { release = resolve; }); await route.continue(); });
  await water.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(water.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  release();
  await expect(water.getByText('Reminder: 07:30 on Mon, Fri', { exact: true })).toBeVisible();
  await expect(water.getByLabel('Reminder time', { exact: true })).toHaveCount(0);
  await page.unroute(`**/api/goals/${w.id}/reminder`);
  expect(await stored(w.id)).toEqual({ time: '07:30', weekdays: ['MON', 'FRI'] });
  await page.reload();
  await expect(water.getByText('Reminder: 07:30 on Mon, Fri', { exact: true })).toBeVisible();
  // Change: the box opens with the stored values; with no day chosen the API message shows and the typed values stay.
  await water.getByRole('button', { name: 'Change reminder', exact: true }).click();
  const time = water.getByLabel('Reminder time', { exact: true });
  await expect(time).toHaveValue('07:30');
  await expect(days.getByRole('checkbox', { name: 'Mon', exact: true })).toBeChecked();
  await expect(days.getByRole('checkbox', { name: 'Fri', exact: true })).toBeChecked();
  await time.fill('21:05');
  await days.getByRole('checkbox', { name: 'Mon', exact: true }).uncheck();
  await days.getByRole('checkbox', { name: 'Fri', exact: true }).uncheck();
  await water.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(water.getByRole('alert')).toHaveText('Choose at least one weekday, each only once.');
  await expect(time).toHaveValue('21:05');
  await expect(days.getByRole('checkbox', { checked: true })).toHaveCount(0);
  await expect(water.getByText('Reminder: 07:30 on Mon, Fri', { exact: true })).toBeVisible();
  expect(await stored(w.id)).toEqual({ time: '07:30', weekdays: ['MON', 'FRI'] });
  await days.getByRole('checkbox', { name: 'Sun', exact: true }).check();
  await days.getByRole('checkbox', { name: 'Wed', exact: true }).check();
  await water.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(water.getByText('Reminder: 21:05 on Wed, Sun', { exact: true })).toBeVisible();
  // Remove happens at once, with no question.
  await water.getByRole('button', { name: 'Remove reminder', exact: true }).click();
  await expect(water.getByText('No reminder', { exact: true })).toBeVisible();
  await expect(water.getByRole('button', { name: 'Set reminder', exact: true })).toBeVisible();
  expect(await stored(w.id)).toBeNull();
  expect(await fits(page)).toBe(true);
});

test('TC-174: an ended goal shows its reminder with Remove only', async ({ page }) => {
  await db.goalReminder.create({ data: { goalId: e.id, time: '22:00', weekdays: ['SAT', 'SUN'] } });
  await login(page);
  const sleep = card(page, 'Sleep');
  await expect(sleep.getByText('Reminder: 22:00 on Sat, Sun', { exact: true })).toBeVisible();
  await expect(sleep.getByRole('button', { name: 'Set reminder', exact: true })).toHaveCount(0);
  await expect(sleep.getByRole('button', { name: 'Change reminder', exact: true })).toHaveCount(0);
  await sleep.getByRole('button', { name: 'Remove reminder', exact: true }).click();
  await expect(sleep.getByText('No reminder', { exact: true })).toBeVisible();
  await expect(sleep.getByRole('button', { name: /reminder/ })).toHaveCount(0);
  expect(await stored(e.id)).toBeNull();
});

test('TC-175: keyboard alone sets and removes a reminder, with no horizontal scroll', async ({ page }) => {
  await login(page);
  const water = card(page, 'Water');
  const open = water.getByRole('button', { name: 'Set reminder', exact: true });
  const tabTo = async locator => {
    for (let i = 0; i < 80; i++) { if (await locator.evaluate(el => el === document.activeElement)) return; await page.keyboard.press('Tab'); }
    throw new Error('not reachable by Tab');
  };
  await page.evaluate(() => document.activeElement?.blur());
  await tabTo(open);
  await expect(open).toHaveAccessibleDescription('Water');
  await page.keyboard.press('Enter');
  const time = water.getByLabel('Reminder time', { exact: true });
  await expect(time).toBeFocused();
  expect(await fits(page)).toBe(true);
  // Cancel closes the box and returns focus to the button.
  await tabTo(water.getByRole('button', { name: 'Cancel', exact: true }));
  await page.keyboard.press('Enter');
  await expect(time).toHaveCount(0);
  await expect(open).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(time).toBeFocused();
  await page.keyboard.type('06:45');
  // Tab order: time box, Mon to Sun, Save, Cancel. Space checks a box.
  for (const name of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
    await page.keyboard.press('Tab');
    await expect(water.getByRole('checkbox', { name, exact: true })).toBeFocused();
    if (name === 'Tue' || name === 'Thu') await page.keyboard.press('Space');
  }
  await page.keyboard.press('Tab'); await expect(water.getByRole('button', { name: 'Save', exact: true })).toBeFocused();
  await page.keyboard.press('Tab'); await expect(water.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Enter');
  await expect(water.getByText('Reminder: 06:45 on Tue, Thu', { exact: true })).toBeVisible();
  const change = water.getByRole('button', { name: 'Change reminder', exact: true });
  await expect(change).toBeFocused();
  const removeButton = water.getByRole('button', { name: 'Remove reminder', exact: true });
  await tabTo(removeButton);
  await expect(removeButton).toHaveAccessibleDescription('Water');
  await page.keyboard.press('Enter');
  await expect(water.getByText('No reminder', { exact: true })).toBeVisible();
  await expect(open).toBeFocused();
  expect(await fits(page)).toBe(true);
  expect(await stored(w.id)).toBeNull();
});
