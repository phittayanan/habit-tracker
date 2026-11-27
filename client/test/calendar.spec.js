// F-11 month calendar and day box (Issue #155): TC-36, TC-110 to TC-116, TC-130, and TC-47/TC-48 on the calendar,
// at 375 px and 1280 px (playwright.config.js projects). The day state, colour and sign come in #156 (ADR 0097).
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
const previousMonthOf = text => { const [y, m] = text.split('-').map(Number); return m === 1 ? `${y - 1}-12-01` : `${y}-${String(m - 1).padStart(2, '0')}-01`; };
let manager, a, c, w, s, x;
async function makeGoal(user, name, unit, kind, min, max, target, start, end) {
  const template = await db.template.create({ data: { name, unit, kind, minValue: min, maxValue: max, createdBy: manager.id } });
  const goal = await db.goal.create({ data: { participantId: user.id, templateId: template.id, dailyTarget: target, startDate: asDate(start), endDate: asDate(end) } });
  await db.goalTarget.create({ data: { goalId: goal.id, effectiveFrom: asDate(start), dailyTarget: target } });
  return goal;
}
const entry = (goal, date, value, createdAt = new Date()) => db.entry.create({ data: { goalId: goal.id, entryDate: asDate(date), value, createdAt } });
const values = async (goal, date) => (await db.entry.findMany({ where: { goalId: goal.id, entryDate: asDate(date) }, orderBy: { id: 'asc' } })).map(row => Number(row.value));
test.beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  manager = await db.user.create({ data: { username: 'manager1', displayName: 'Manager One', role: 'MANAGER', passwordHash } });
  a = await db.user.create({ data: { username: 'participant1', displayName: 'Participant One', role: 'PARTICIPANT', passwordHash } });
  c = await db.user.create({ data: { username: 'participant3', displayName: 'Participant Three', role: 'PARTICIPANT', passwordHash } });
  w = await makeGoal(a, 'Water', 'glasses', 'COUNT', 1, 12, 8, day(-30), day(30));
  s = await makeGoal(a, 'Sleep', 'minutes', 'TIME', 0, 720, 420, day(-30), day(30));
  x = await makeGoal(a, 'Reading', 'pages', 'COUNT', 0, 100, 20, day(-10), day(-3));
});
test.afterAll(() => db.$disconnect());
const phone = () => test.info().project.name === '375px';
async function login(page, username = 'participant1') {
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/calendar$/);
  await expect(page.getByRole('heading', { name: monthTitle(today()), exact: true })).toBeVisible();
}
const title = page => page.locator('.month-title');
async function goToMonth(page, date) {
  for (let i = 0; i < 3; i++) {
    const shown = await title(page).textContent();
    if (shown === monthTitle(date)) break;
    await page.getByRole('button', { name: 'Previous month', exact: true }).click();
    await expect(title(page)).not.toHaveText(shown);
  }
  await expect(title(page)).toHaveText(monthTitle(date));
}
const dayButton = (page, date) => page.getByRole('button', { name: label(date), exact: true });
const box = (page, date) => page.getByRole(phone() ? 'dialog' : 'region', { name: heading(date), exact: true });
async function openDay(page, date) {
  await goToMonth(page, date);
  await dayButton(page, date).click();
  await expect(box(page, date)).toBeVisible();
  return box(page, date);
}
const card = (scope, name) => scope.getByRole('listitem').filter({ has: scope.page().getByRole('heading', { name, exact: true }) });
const goalNames = scope => scope.locator('.goal-card h3');
const fits = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

test('TC-36: calendar first after login, Monday first, panel for today; a day lists exactly its active goals', async ({ page }) => {
  test.skip(phone(), 'TC-36 runs at 1280 px; the phone box is TC-111');
  const t = Date.now();
  await entry(w, day(0), 3, new Date(t - 2000));
  await entry(w, day(0), 2, new Date(t - 1000));
  await login(page);
  await expect(page.getByRole('columnheader')).toHaveText(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const panel = box(page, day(0));
  await expect(panel).toBeVisible();
  await expect(panel.getByText('Today', { exact: true })).toBeVisible();
  await expect(goalNames(panel)).toHaveText(['Water', 'Sleep']);
  await expect(card(panel, 'Water').getByText('5 / 8 glasses', { exact: true })).toBeVisible();
  // F-13 (#154): the entries are a list with Edit and Delete; same values, same order.
  await expect(card(panel, 'Water').locator('.entry-value')).toHaveText(['2', '3']);
  await expect(card(panel, 'Sleep').getByText('0 min / 7 h', { exact: true })).toBeVisible();
  await expect(card(panel, 'Water').getByText('✓ met', { exact: true })).toHaveCount(0);
  await expect(dayButton(page, day(0))).toHaveAttribute('aria-current', 'date');
  // Choosing another day changes the panel, with no pop-up (AC-11.5).
  const five = await openDay(page, day(-5));
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(goalNames(five).filter({ hasText: /./ })).toHaveText(['Water', 'Sleep', 'Reading']);
  const one = await openDay(page, day(-1));
  await expect(goalNames(one)).toHaveText(['Water', 'Sleep']);
  expect(await fits(page)).toBe(true);
});

test('TC-110: ‹ shows earlier months; › stops at the current month', async ({ page }) => {
  await login(page);
  const back = page.getByRole('button', { name: 'Previous month', exact: true });
  const next = page.getByRole('button', { name: 'Next month', exact: true });
  await expect(next).toBeDisabled();
  const one = previousMonthOf(today());
  const two = previousMonthOf(one);
  await back.click(); await expect(title(page)).toHaveText(monthTitle(one));
  await expect(next).toBeEnabled();
  await back.click(); await expect(title(page)).toHaveText(monthTitle(two));
  await next.click(); await expect(title(page)).toHaveText(monthTitle(one));
  await next.click(); await expect(title(page)).toHaveText(monthTitle(today()));
  await expect(next).toBeDisabled();
  // The List step of TC-110 runs in #156 (ADR 0097).
});

test('TC-111: a future day cannot be opened; today and yesterday open the box', async ({ page }) => {
  test.skip(!phone(), 'phone width');
  await login(page);
  if (day(1).slice(0, 7) === today().slice(0, 7)) {
    const future = page.getByRole('button', { name: `${label(day(1))}, future`, exact: true });
    await expect(future).toBeDisabled();
    await future.click({ force: true });
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const todayBox = await openDay(page, day(0));
  await expect(todayBox).toHaveAttribute('aria-modal', 'true');
  await todayBox.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(dayButton(page, day(0))).toBeFocused();
  // A tap outside with nothing unsaved closes at once (AC-11.5).
  await openDay(page, day(-1));
  await page.mouse.click(5, 5);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(dayButton(page, day(-1))).toBeFocused();
});

test('TC-112: a day with no active goal says "No goals on this day."', async ({ page }) => {
  await makeGoal(c, 'Walk', 'steps', 'COUNT', 1, 20000, 5000, day(-2), day(10));
  await login(page, 'participant3');
  const first = previousMonthOf(today());
  const opened = await openDay(page, first);
  await expect(opened.getByText('No goals on this day.', { exact: true })).toBeVisible();
});

test('TC-113: count − / + stops at +0 and at what fits; Done saves one entry', async ({ page }) => {
  await entry(w, day(0), 10);
  await login(page);
  const opened = await openDay(page, day(0));
  const water = card(opened, 'Water');
  await water.getByRole('button', { name: '+ Check in Water', exact: true }).click();
  const less = water.getByRole('button', { name: 'One less', exact: true });
  const more = water.getByRole('button', { name: 'One more', exact: true });
  const done = water.getByRole('button', { name: 'Done', exact: true });
  await expect(done).toBeDisabled(); await expect(less).toBeDisabled();
  await expect(water.getByText('+0', { exact: true })).toBeVisible();
  await more.click(); await more.click();
  await expect(more).toBeDisabled();
  await expect(water.getByText('+2', { exact: true })).toBeVisible();
  await expect(water.getByText('total 12 / 8', { exact: true })).toBeVisible();
  await less.click(); await expect(water.getByText('+1', { exact: true })).toBeVisible();
  await more.click();
  await done.click();
  await expect(water.getByText('12 / 8 glasses', { exact: true })).toBeVisible();
  await expect(water.getByText('✓ met', { exact: true })).toBeVisible();
  await expect(water.locator('.entry-value')).toHaveText(['2', '10']);
  expect(await values(w, day(0))).toEqual([10, 2]);
  // Nothing fits any more: no Check in, and the card says so.
  await expect(water.getByRole('button', { name: '+ Check in Water', exact: true })).toHaveCount(0);
  await expect(water.getByText('Today is full (12 glasses).', { exact: true })).toBeVisible();
  // The "+ Check in" button is gone, so focus goes to the card's "is full" text, not to the page.
  await expect(water.getByText('Today is full (12 glasses).', { exact: true })).toBeFocused();
});

test('TC-114: time bar moves by 15 minutes with the arrow keys, never past what fits; Check in saves whole minutes', async ({ page }) => {
  await entry(s, day(0), 400);
  await login(page);
  const opened = await openDay(page, day(0));
  const sleep = card(opened, 'Sleep');
  await sleep.getByRole('button', { name: '+ Check in Sleep', exact: true }).click();
  const bar = sleep.getByRole('slider');
  const save = sleep.getByRole('button', { name: 'Check in', exact: true });
  await expect(save).toBeDisabled();
  await expect(bar).toHaveAttribute('aria-valuetext', '+0 min');
  await bar.focus();
  await page.keyboard.press('End');
  await expect(bar).toHaveAttribute('aria-valuetext', '+5 h 20 min');
  await page.keyboard.press('ArrowRight');
  await expect(bar).toHaveAttribute('aria-valuetext', '+5 h 20 min');
  await page.keyboard.press('Home');
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  await expect(bar).toHaveAttribute('aria-valuetext', '+45 min');
  await expect(sleep.getByText('total 7 h 25 min', { exact: true })).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(bar).toHaveAttribute('aria-valuetext', '+30 min');
  await page.keyboard.press('ArrowRight');
  await save.click();
  await expect(sleep.getByText('7 h 25 min / 7 h', { exact: true })).toBeVisible();
  expect(await values(s, day(0))).toEqual([400, 45]);
});

test('TC-114: a pointer click on the bar sets the amount in 15-minute steps', async ({ page }) => {
  await login(page);
  const opened = await openDay(page, day(0));
  const sleep = card(opened, 'Sleep');
  await sleep.getByRole('button', { name: '+ Check in Sleep', exact: true }).click();
  const bar = sleep.getByRole('slider');
  const size = await bar.boundingBox();
  // 720 minutes in 48 segments; the middle of segment 4 (index 3) is 1 h.
  await bar.click({ position: { x: size.width * (3.5 / 48), y: size.height / 2 } });
  await expect(bar).toHaveAttribute('aria-valuetext', '+1 h');
});

test('TC-115: the typed row saves an exact amount; a rejected save shows the API message and keeps it', async ({ page }) => {
  await login(page);
  const opened = await openDay(page, day(-1));
  const water = card(opened, 'Water');
  await water.getByRole('button', { name: '+ Check in Water', exact: true }).click();
  await water.getByLabel('Other amount', { exact: true }).fill('2.5');
  await water.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(water.getByText('2.5 / 8 glasses', { exact: true })).toBeVisible();
  const sleep = card(opened, 'Sleep');
  await sleep.getByRole('button', { name: '+ Check in Sleep', exact: true }).click();
  await sleep.getByLabel('Hours', { exact: true }).fill('7');
  await sleep.getByLabel('Minutes', { exact: true }).fill('10');
  await sleep.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(sleep.getByText('7 h 10 min / 7 h', { exact: true })).toBeVisible();
  await water.getByRole('button', { name: '+ Check in Water', exact: true }).click();
  await water.getByLabel('Other amount', { exact: true }).fill('20');
  await water.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(water.getByRole('alert')).toHaveText('The value must be between 1 and 12.');
  await expect(water.getByLabel('Other amount', { exact: true })).toHaveValue('20');
  expect(await values(w, day(-1))).toEqual([2.5]);
  expect(await values(s, day(-1))).toEqual([430]);
  // Minutes outside 0 to 59 are not sent; the typed values stay. Water still holds an unsaved 20, so opening Sleep asks first.
  await sleep.getByRole('button', { name: '+ Check in Sleep', exact: true }).click();
  await page.getByRole('alertdialog', { name: 'Discard 20 glasses?', exact: true }).getByRole('button', { name: 'Discard', exact: true }).click();
  await sleep.getByLabel('Hours', { exact: true }).fill('1');
  await sleep.getByLabel('Minutes', { exact: true }).fill('75');
  await sleep.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(sleep.getByRole('alert')).toHaveText('Minutes must be 0 to 59.');
  await expect(sleep.getByLabel('Minutes', { exact: true })).toHaveValue('75');
  await sleep.getByLabel('Minutes', { exact: true }).fill('7.5');
  await sleep.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(sleep.getByRole('alert')).toHaveText('Minutes must be 0 to 59.');
  expect(await values(s, day(-1))).toEqual([430]);
});

test('TC-116: closing with an unsaved amount asks first; with nothing unsaved it closes at once', async ({ page }) => {
  test.skip(!phone(), 'phone width');
  await login(page);
  let opened = await openDay(page, day(0));
  const water = card(opened, 'Water');
  await water.getByRole('button', { name: '+ Check in Water', exact: true }).click();
  for (let i = 0; i < 3; i++) await water.getByRole('button', { name: 'One more', exact: true }).click();
  await page.keyboard.press('Escape');
  const ask = page.getByRole('alertdialog', { name: 'Discard +3 glasses?', exact: true });
  await expect(ask).toBeVisible();
  await ask.getByRole('button', { name: 'Keep editing', exact: true }).click();
  await expect(ask).toHaveCount(0);
  await expect(water.getByText('+3', { exact: true })).toBeVisible();
  // A tap outside the box.
  await page.mouse.click(5, 5);
  await expect(ask).toBeVisible();
  await ask.getByRole('button', { name: 'Discard', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(dayButton(page, day(0))).toBeFocused();
  expect(await values(w, day(0))).toEqual([]);
  opened = await openDay(page, day(0));
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(dayButton(page, day(0))).toBeFocused();
});

test('TC-116 (desktop): choosing another day with an unsaved amount asks first', async ({ page }) => {
  test.skip(phone(), 'desktop width');
  await login(page);
  const panel = box(page, day(0));
  await card(panel, 'Water').getByRole('button', { name: '+ Check in Water', exact: true }).click();
  await card(panel, 'Water').getByRole('button', { name: 'One more', exact: true }).click();
  await goToMonth(page, day(-1));
  await dayButton(page, day(-1)).click();
  const ask = page.getByRole('alertdialog', { name: 'Discard +1 glasses?', exact: true });
  await expect(ask).toBeVisible();
  await ask.getByRole('button', { name: 'Keep editing', exact: true }).click();
  await expect(box(page, day(0))).toBeVisible();
  await dayButton(page, day(-1)).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Discard', exact: true }).click();
  await expect(box(page, day(-1))).toBeVisible();
});

test('TC-130: menu Calendar, Goals, Templates; Goals opens the Sprint 1 goals page; Manager is refused', async ({ page }) => {
  await entry(w, day(0), 3);
  await login(page);
  await expect(page.getByRole('navigation', { name: 'Role menu' }).getByRole('link')).toHaveText(['Calendar', 'Goals', 'Templates']);
  await expect(page.getByRole('link', { name: 'Calendar', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('link', { name: 'Goals', exact: true }).click();
  await expect(page).toHaveURL(/\/goals$/);
  const water = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Water', exact: true }) });
  await expect(water.getByText(/^\d+ of \d+ days met$/)).toBeVisible();
  await expect(water.getByText('Day total: 3 glasses', { exact: true })).toBeVisible();
  await expect(water.getByLabel('Value (glasses)', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Calendar', exact: true }).click();
  await expect(page).toHaveURL(/\/calendar$/);
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  await page.getByLabel('Username', { exact: true }).fill('manager1');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByRole('link', { name: 'Calendar', exact: true })).toHaveCount(0);
  await page.goto('/calendar');
  await expect(page.getByText('This page is not available for your role.', { exact: true })).toBeVisible();
});

test('TC-47/TC-48: no horizontal scroll; open a day, check in by counter and typed row, and close, keyboard only', async ({ page }) => {
  await login(page);
  expect(await fits(page)).toBe(true);
  const target = dayButton(page, day(0));
  for (let i = 0; i < 80 && !(await target.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(target).toBeFocused();
  await page.keyboard.press('Enter');
  const opened = box(page, day(0));
  await expect(opened).toBeVisible();
  expect(await fits(page)).toBe(true);
  const water = card(opened, 'Water');
  const open = water.getByRole('button', { name: '+ Check in Water', exact: true });
  for (let i = 0; i < 20 && !(await open.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(open).toBeFocused();
  await page.keyboard.press('Enter');
  const more = water.getByRole('button', { name: 'One more', exact: true });
  await expect(more).toBeFocused();
  await page.keyboard.press('Enter'); await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(water.getByRole('button', { name: 'Done', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(water.getByText('2 / 8 glasses', { exact: true })).toBeVisible();
  await expect(open).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(more).toBeFocused();
  for (let i = 0; i < 6 && !(await water.getByLabel('Other amount', { exact: true }).evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(water.getByLabel('Other amount', { exact: true })).toBeFocused();
  await page.keyboard.type('1.5');
  await expect(water.getByLabel('Other amount', { exact: true })).toHaveValue('1.5');
  await page.keyboard.press('Enter');
  await expect(water.getByText('3.5 / 8 glasses', { exact: true })).toBeVisible();
  expect(await values(w, day(0))).toEqual([2, 1.5]);
  expect(await fits(page)).toBe(true);
  if (phone()) {
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(target).toBeFocused();
  }
});

const tabTo = async (page, locator, max = 30) => {
  for (let i = 0; i < max && !(await locator.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(locator).toBeFocused();
};

test('TC-47/TC-48: time bar, Check in and the Exact row, keyboard only', async ({ page }) => {
  await login(page);
  await tabTo(page, dayButton(page, day(0)), 80);
  await page.keyboard.press('Enter');
  const opened = box(page, day(0));
  const sleep = card(opened, 'Sleep');
  const open = sleep.getByRole('button', { name: '+ Check in Sleep', exact: true });
  await tabTo(page, open);
  await page.keyboard.press('Enter');
  const bar = sleep.getByRole('slider');
  await expect(bar).toBeFocused();
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  await expect(bar).toHaveAttribute('aria-valuetext', '+30 min');
  await tabTo(page, sleep.getByRole('button', { name: 'Check in', exact: true }), 5);
  await page.keyboard.press('Enter');
  await expect(sleep.getByText('30 min / 7 h', { exact: true })).toBeVisible();
  await expect(open).toBeFocused();
  await page.keyboard.press('Enter');
  await tabTo(page, sleep.getByLabel('Hours', { exact: true }), 6);
  await page.keyboard.type('6');
  await page.keyboard.press('Tab');
  await expect(sleep.getByLabel('Minutes', { exact: true })).toBeFocused();
  await page.keyboard.type('15');
  await page.keyboard.press('Enter');
  await expect(sleep.getByText('6 h 45 min / 7 h', { exact: true })).toBeVisible();
  expect(await values(s, day(0))).toEqual([30, 375]);
  expect(await fits(page)).toBe(true);
});

test('TC-47/TC-48 with TC-116: Keep editing and Discard by keyboard; focus stays in the box', async ({ page }) => {
  test.skip(!phone(), 'phone width');
  await login(page);
  await tabTo(page, dayButton(page, day(0)), 80);
  await page.keyboard.press('Enter');
  const opened = box(page, day(0));
  const close = opened.getByRole('button', { name: 'Close', exact: true });
  await expect(close).toBeFocused();
  // Shift+Tab from the first control wraps to the last one inside the box.
  await page.keyboard.press('Shift+Tab');
  expect(await opened.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  const water = card(opened, 'Water');
  await tabTo(page, water.getByRole('button', { name: '+ Check in Water', exact: true }));
  await page.keyboard.press('Enter');
  const more = water.getByRole('button', { name: 'One more', exact: true });
  await expect(more).toBeFocused();
  await page.keyboard.press('Enter'); await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  const ask = page.getByRole('alertdialog', { name: 'Discard +2 glasses?', exact: true });
  await expect(ask.getByRole('button', { name: 'Keep editing', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(ask).toHaveCount(0);
  await expect(more).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(ask).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(ask.getByRole('button', { name: 'Discard', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(dayButton(page, day(0))).toBeFocused();
  expect(await values(w, day(0))).toEqual([]);
});
