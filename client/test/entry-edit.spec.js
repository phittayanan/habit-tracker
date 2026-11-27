// F-13 entry edit and delete (Issue #154; contract docs/sprints/sprint-2/F-13-entry-edit-delete.md): TC-149 to TC-151,
// at 375 px and 1280 px (playwright.config.js projects). The calendar colour of AC-13.9 waits for F-12 (#156).
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
const format = (text, options) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...options }).format(asDate(text));
const label = text => format(text, { day: 'numeric', month: 'long' });
const heading = text => format(text, { weekday: 'short', day: 'numeric', month: 'long' }).replace(',', '');
const monthTitle = text => format(`${text.slice(0, 7)}-01`, { month: 'long', year: 'numeric' });
let manager, a, w, s;
async function makeGoal(name, unit, kind, min, max, target) {
  const template = await db.template.create({ data: { name, unit, kind, minValue: min, maxValue: max, createdBy: manager.id } });
  const goal = await db.goal.create({ data: { participantId: a.id, templateId: template.id, dailyTarget: target, startDate: asDate(day(-10)), endDate: asDate(day(10)) } });
  await db.goalTarget.create({ data: { goalId: goal.id, effectiveFrom: asDate(day(-10)), dailyTarget: target } });
  return goal;
}
const values = async (goal, date) => (await db.entry.findMany({ where: { goalId: goal.id, entryDate: asDate(date) }, orderBy: { id: 'asc' } })).map(row => Number(row.value));
test.beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  manager = await db.user.create({ data: { username: 'manager1', displayName: 'Manager One', role: 'MANAGER', passwordHash } });
  a = await db.user.create({ data: { username: 'participant1', displayName: 'Participant One', role: 'PARTICIPANT', passwordHash } });
  w = await makeGoal('Water', 'glasses', 'COUNT', 1, 12, 8);
  s = await makeGoal('Sleep', 'minutes', 'TIME', 0, 720, 420);
  const t = Date.now();
  await db.entry.create({ data: { goalId: w.id, entryDate: asDate(day(-1)), value: 3, createdAt: new Date(t - 2000) } });
  await db.entry.create({ data: { goalId: w.id, entryDate: asDate(day(-1)), value: 5, createdAt: new Date(t - 1000) } });
  await db.entry.create({ data: { goalId: s.id, entryDate: asDate(day(-1)), value: 45, createdAt: new Date(t - 1000) } });
});
test.afterAll(() => db.$disconnect());
const phone = () => test.info().project.name === '375px';
const fits = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
async function login(page) {
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill('participant1');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/calendar$/);
}
async function goalsPage(page) {
  await login(page);
  await page.getByRole('link', { name: 'Goals', exact: true }).click();
  await expect(page).toHaveURL(/\/goals$/);
  return page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Water', exact: true }) });
}
async function openDay(page, date) {
  for (let i = 0; i < 3 && await page.locator('.month-title').textContent() !== monthTitle(date); i++) {
    const shown = await page.locator('.month-title').textContent();
    await page.getByRole('button', { name: 'Previous month', exact: true }).click();
    await expect(page.locator('.month-title')).not.toHaveText(shown);
  }
  await page.getByRole('button', { name: label(date), exact: true }).click();
  const box = page.getByRole(phone() ? 'dialog' : 'region', { name: heading(date), exact: true });
  await expect(box).toBeVisible();
  return box;
}
const card = (scope, name) => scope.getByRole('listitem').filter({ has: scope.page().getByRole('heading', { name, exact: true }) });
const ask = (page, text) => page.getByRole('alertdialog', { name: text, exact: true });

test('TC-149: the goals page edits in place, keeps a rejected value, and asks before a delete', async ({ page }) => {
  const water = await goalsPage(page);
  await expect(water.locator('.entry-text')).toHaveText([`${day(-1)}: 5 glasses`, `${day(-1)}: 3 glasses`]);
  await expect(water.getByText('1 of 11 days met', { exact: true })).toBeVisible();
  await water.getByRole('button', { name: `Edit 5 glasses on ${day(-1)}`, exact: true }).click();
  const box = water.getByLabel('New value (glasses)', { exact: true });
  await expect(box).toHaveValue('5');
  await box.fill('20');
  await water.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(water.getByRole('alert')).toHaveText('The value must be between 1 and 12.');
  await expect(box).toHaveValue('20');
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/api/goals/*/entries/*', async route => { await held; await route.continue(); });
  await box.fill('4');
  await water.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(water.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  release();
  await expect(water.locator('.entry-text')).toHaveText([`${day(-1)}: 4 glasses`, `${day(-1)}: 3 glasses`]);
  await expect(water.getByText('Day total: 7 glasses', { exact: true })).toBeVisible();
  await expect(water.getByText('0 of 11 days met', { exact: true })).toBeVisible();
  await expect(water.getByRole('button', { name: `Edit 4 glasses on ${day(-1)}`, exact: true })).toBeFocused();
  await page.unroute('**/api/goals/*/entries/*');

  const del = water.getByRole('button', { name: `Delete 3 glasses on ${day(-1)}`, exact: true });
  await del.click();
  const question = ask(page, `Delete 3 glasses on ${day(-1)}?`);
  await question.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(question).toHaveCount(0);
  expect(await values(w, day(-1))).toEqual([3, 4]);
  await del.click();
  // While the delete runs, both buttons are disabled, focus stays in the question, and Escape does not cancel it.
  let releaseDelete;
  const heldDelete = new Promise(resolve => { releaseDelete = resolve; });
  await page.route('**/api/goals/*/entries/*', async route => { await heldDelete; await route.continue(); });
  await question.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(question.getByRole('button', { name: 'Delete', exact: true })).toBeDisabled();
  await expect(question.getByRole('button', { name: 'Cancel', exact: true })).toBeDisabled();
  expect(await question.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(question).toBeVisible();
  releaseDelete();
  await expect(question).toHaveCount(0);
  await page.unroute('**/api/goals/*/entries/*');
  await expect(water.locator('.entry-text')).toHaveText([`${day(-1)}: 4 glasses`]);
  await page.reload();
  await expect(water.locator('.entry-text')).toHaveText([`${day(-1)}: 4 glasses`]);
  await expect(water.getByText('Day total: 4 glasses', { exact: true })).toBeVisible();
  await expect(water.getByText('0 of 11 days met', { exact: true })).toBeVisible();
  expect(await values(w, day(-1))).toEqual([4]);
  // A Time entry is edited in minutes with the hint (ADR 0065).
  const sleep = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Sleep', exact: true }) });
  await sleep.getByRole('button', { name: `Edit 45 min on ${day(-1)}`, exact: true }).click();
  await sleep.getByLabel('New value (minutes)', { exact: true }).fill('430');
  await expect(sleep.getByText('= 7 h 10 min', { exact: true })).toBeVisible();
  await sleep.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(sleep.locator('.entry-text')).toHaveText([`${day(-1)}: 7 h 10 min`]);
  expect(await fits(page)).toBe(true);
});

test('TC-150: the day box edits and deletes; the card and sign update; an unsaved edit asks before closing', async ({ page }) => {
  await login(page);
  let opened = await openDay(page, day(-1));
  let water = card(opened, 'Water');
  await expect(water.getByText('8 / 8 glasses', { exact: true })).toBeVisible();
  await expect(water.getByText('✓ met', { exact: true })).toBeVisible();
  await expect(water.locator('.entry-value')).toHaveText(['5', '3']);
  await water.getByRole('button', { name: `Edit 5 glasses on ${day(-1)}`, exact: true }).click();
  const box = water.getByLabel('New value (glasses)', { exact: true });
  await expect(box).toHaveValue('5');
  await box.fill('20');
  await water.getByRole('button', { name: 'Save', exact: true }).click();
  const row = water.locator('.entry-row').filter({ has: box });
  await expect(row.getByRole('alert')).toHaveText('The value must be between 1 and 12.');
  await expect(box).toHaveAttribute('aria-invalid', 'true');
  await expect(box).toHaveAccessibleDescription('The value must be between 1 and 12.');
  await expect(box).toHaveValue('20');
  await box.fill('4');
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/api/goals/*/entries/*', async route => { await held; await route.continue(); });
  await water.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(water.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  release();
  await expect(water.getByText('7 / 8 glasses', { exact: true })).toBeVisible();
  await page.unroute('**/api/goals/*/entries/*');
  await expect(water.getByText('✓ met', { exact: true })).toHaveCount(0);
  await expect(water.locator('.entry-value')).toHaveText(['4', '3']);

  const del = water.getByRole('button', { name: `Delete 3 glasses on ${day(-1)}`, exact: true });
  await del.click();
  const question = ask(page, `Delete 3 glasses on ${day(-1)}?`);
  await question.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(question).toHaveCount(0);
  await expect(opened).toBeVisible();
  await del.click();
  await question.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(water.getByText('4 / 8 glasses', { exact: true })).toBeVisible();
  await expect(water.locator('.entry-value')).toHaveText(['4']);
  expect(await values(w, day(-1))).toEqual([4]);

  // A Time entry is edited in hour and minute boxes.
  const sleep = card(opened, 'Sleep');
  await sleep.getByRole('button', { name: `Edit 45 min on ${day(-1)}`, exact: true }).click();
  await expect(sleep.getByLabel('Hours', { exact: true })).toHaveValue('0');
  await expect(sleep.getByLabel('Minutes', { exact: true })).toHaveValue('45');
  await sleep.getByLabel('Hours', { exact: true }).fill('1');
  await sleep.getByLabel('Minutes', { exact: true }).fill('10');
  await sleep.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(sleep.locator('.entry-value')).toHaveText(['1 h 10 min']);
  expect(await values(s, day(-1))).toEqual([70]);

  // An unsaved edit asks before the box closes or another day is chosen (ADR 0067, ADR 0101).
  await water.getByRole('button', { name: `Edit 4 glasses on ${day(-1)}`, exact: true }).click();
  await water.getByLabel('New value (glasses)', { exact: true }).fill('6');
  if (phone()) await page.keyboard.press('Escape');
  else await page.getByRole('button', { name: label(day(-2)), exact: true }).click();
  const discard = ask(page, 'Discard the edit to 6 glasses?');
  await expect(discard).toBeVisible();
  await discard.getByRole('button', { name: 'Keep editing', exact: true }).click();
  await expect(water.getByLabel('New value (glasses)', { exact: true })).toHaveValue('6');
  if (phone()) await page.keyboard.press('Escape');
  else await page.getByRole('button', { name: label(day(-2)), exact: true }).click();
  await discard.getByRole('button', { name: 'Discard', exact: true }).click();
  expect(await values(w, day(-1))).toEqual([4]);
  // The same value typed again is nothing unsaved: it closes at once.
  opened = await openDay(page, day(-1));
  water = card(opened, 'Water');
  await water.getByRole('button', { name: `Edit 4 glasses on ${day(-1)}`, exact: true }).click();
  if (phone()) {
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  } else {
    await page.getByRole('button', { name: label(day(-2)), exact: true }).click();
    await expect(page.getByRole('region', { name: heading(day(-2)), exact: true })).toBeVisible();
  }
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  // A cleared edit box is nothing unsaved either: it closes at once (ADR 0101).
  opened = await openDay(page, day(-1));
  water = card(opened, 'Water');
  await water.getByRole('button', { name: `Edit 4 glasses on ${day(-1)}`, exact: true }).click();
  await water.getByLabel('New value (glasses)', { exact: true }).fill('');
  if (phone()) {
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  } else {
    await page.getByRole('button', { name: label(day(-2)), exact: true }).click();
    await expect(page.getByRole('region', { name: heading(day(-2)), exact: true })).toBeVisible();
  }
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  expect(await values(w, day(-1))).toEqual([4]);
  expect(await fits(page)).toBe(true);
});

test('TC-151: edit and delete by keyboard alone on both screens; focus moves into the dialog and back', async ({ page }) => {
  const water = await goalsPage(page);
  const edit = water.getByRole('button', { name: `Edit 5 glasses on ${day(-1)}`, exact: true });
  await edit.focus();
  await page.keyboard.press('Enter');
  await expect(water.getByLabel('New value (glasses)', { exact: true })).toBeFocused();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('6');
  await page.keyboard.press('Enter');
  await expect(water.locator('.entry-text')).toHaveText([`${day(-1)}: 6 glasses`, `${day(-1)}: 3 glasses`]);
  const del = water.getByRole('button', { name: `Delete 3 glasses on ${day(-1)}`, exact: true });
  await water.getByRole('button', { name: `Edit 3 glasses on ${day(-1)}`, exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(del).toBeFocused();
  await page.keyboard.press('Enter');
  const question = ask(page, `Delete 3 glasses on ${day(-1)}?`);
  await expect(question.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(question).toHaveCount(0);
  await expect(del).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(question.getByRole('button', { name: 'Delete', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(water.locator('.entry-text')).toHaveText([`${day(-1)}: 6 glasses`]);
  expect(await fits(page)).toBe(true);

  // The day box, by keyboard.
  await page.getByRole('link', { name: 'Calendar', exact: true }).click();
  const opened = await openDay(page, day(-1));
  const card1 = card(opened, 'Water');
  const edit2 = card1.getByRole('button', { name: `Edit 6 glasses on ${day(-1)}`, exact: true });
  await edit2.focus();
  await page.keyboard.press('Enter');
  await expect(card1.getByLabel('New value (glasses)', { exact: true })).toBeFocused();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('2');
  await page.keyboard.press('Enter');
  await expect(card1.locator('.entry-value')).toHaveText(['2']);
  await expect(card1.getByRole('button', { name: `Edit 2 glasses on ${day(-1)}`, exact: true })).toBeFocused();
  const del2 = card1.getByRole('button', { name: `Delete 2 glasses on ${day(-1)}`, exact: true });
  await del2.focus();
  await page.keyboard.press('Enter');
  const q2 = ask(page, `Delete 2 glasses on ${day(-1)}?`);
  await expect(q2.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  // Escape closes only the question, not the day box.
  await page.keyboard.press('Escape');
  await expect(q2).toHaveCount(0);
  await expect(opened).toBeVisible();
  await expect(del2).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(card1.locator('.entry-value')).toHaveCount(0);
  expect(await values(w, day(-1))).toEqual([]);
  expect(await fits(page)).toBe(true);
});
