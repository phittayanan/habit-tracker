// F-12 day colours and the F-15 Calendar / List switch (Issue #156): TC-40, TC-49, TC-117, TC-125,
// and TC-47/TC-48 on the List, at 375 px and 1280 px (playwright.config.js projects). ADR 0101 to ADR 0105.
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
const monthTitle = text => format(`${text.slice(0, 7)}-01`, { month: 'long', year: 'numeric' });
// "Thu 27 Nov": English three-letter weekday and month (F-15 section 2).
const shortDate = text => {
  const part = options => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(asDate(text));
  return `${part({ weekday: 'short' })} ${Number(text.slice(8))} ${part({ month: 'short' })}`;
};
const monthBefore = text => { const [y, m] = text.split('-').map(Number); return m === 1 ? `${y - 1}-12-01` : `${y}-${String(m - 1).padStart(2, '0')}-01`; };
let manager, a, c, templates;

async function makeGoal(user, key, target, start, end = day(30)) {
  const goal = await db.goal.create({ data: { participantId: user.id, templateId: templates[key].id, dailyTarget: target, startDate: asDate(start), endDate: asDate(end) } });
  await db.goalTarget.create({ data: { goalId: goal.id, effectiveFrom: asDate(start), dailyTarget: target } });
  return goal;
}
// Water then Sleep, so the cards and List rows keep that order.
async function twoGoals(user, start) {
  const w = await makeGoal(user, 'water', 8, start);
  const s = await makeGoal(user, 'sleep', 420, start);
  return { w, s };
}
const entry = (goal, date, value, createdAt = new Date()) => db.entry.create({ data: { goalId: goal.id, entryDate: asDate(date), value, createdAt } });
test.beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = (username, role) => db.user.create({ data: { username, displayName: username, role, passwordHash } });
  manager = await user('manager1', 'MANAGER');
  a = await user('participant1', 'PARTICIPANT');
  c = await user('participant3', 'PARTICIPANT');
  templates = {
    water: await db.template.create({ data: { name: 'Water', unit: 'glasses', kind: 'COUNT', minValue: 1, maxValue: 12, createdBy: manager.id } }),
    sleep: await db.template.create({ data: { name: 'Sleep', unit: 'minutes', kind: 'TIME', minValue: 0, maxValue: 720, createdBy: manager.id } }),
  };
});
test.afterAll(() => db.$disconnect());

const phone = () => test.info().project.name === '375px';
async function login(page, username = 'participant3') {
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/calendar$/);
  await expect(page.locator('.month-title')).toHaveText(monthTitle(today()));
}
async function goToMonth(page, date) {
  const title = page.locator('.month-title');
  for (let i = 0; i < 24 && (await title.textContent()) !== monthTitle(date); i++) {
    const shown = await title.textContent();
    const back = Date.parse(`1 ${shown}`) > Date.parse(`1 ${monthTitle(date)}`);
    await page.getByRole('button', { name: back ? 'Previous month' : 'Next month', exact: true }).click();
    await expect(title).not.toHaveText(shown);
  }
  await expect(title).toHaveText(monthTitle(date));
}
const dayButton = (page, date, words) => page.getByRole('button', { name: words ? `${label(date)}, ${words}` : label(date), exact: true });
const switchButton = (page, name) => page.getByRole('group', { name: 'View', exact: true }).getByRole('button', { name, exact: true });
const list = page => page.locator('.day-list');
const dayBlock = (page, date) => list(page).locator(`section[data-date="${date}"]`);
const fits = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const background = locator => locator.evaluate(el => getComputedStyle(el).backgroundColor);
const border = locator => locator.evaluate(el => { const s = getComputedStyle(el); return `${s.borderTopWidth} ${s.borderTopColor}`; });
const COLOURS = {
  ALL_MET: 'rgb(207, 232, 212)', SOME_MET: 'rgb(246, 231, 168)', NONE_MET: 'rgb(243, 196, 196)', NOTHING: 'rgb(230, 230, 230)',
};

test('TC-49: every coloured day has its sign, its words and its colour; a null day has neither; legend', async ({ page }) => {
  // Goals start on D-4, so D-5 has no goal.
  const { w, s } = await twoGoals(c, day(-4));
  await entry(w, day(0), 8); await entry(s, day(0), 100);
  await entry(w, day(-1), 8); await entry(s, day(-1), 420);
  await entry(w, day(-2), 3);
  // D-3 has nothing; D-4 has W met only.
  await entry(w, day(-4), 8);
  await login(page);
  const rows = [
    [day(0), 'some goals met', '½', 'SOME_MET'],
    [day(-1), 'all goals met', '✓', 'ALL_MET'],
    [day(-2), 'no goal met', '✗', 'NONE_MET'],
    [day(-3), 'nothing recorded', '–', 'NOTHING'],
    [day(-4), 'some goals met', '½', 'SOME_MET'],
  ];
  for (const [date, words, sign, state] of rows) {
    await goToMonth(page, date);
    const button = dayButton(page, date, words);
    await expect(button).toBeVisible();
    await expect(button.locator('.day-sign')).toHaveText(sign);
    expect(await background(button), `${date} ${state}`).toBe(COLOURS[state]);
  }
  await goToMonth(page, day(-5));
  const empty = dayButton(page, day(-5));
  await expect(empty).toHaveText(String(Number(day(-5).slice(8))));
  await expect(empty.locator('.day-sign')).toHaveCount(0);
  expect(await background(empty)).toBe('rgb(255, 255, 255)');
  await expect(page.getByText('✓ all met, ½ some, ✗ none, – nothing', { exact: true })).toBeVisible();
  await goToMonth(page, day(0));
  if (day(1).slice(0, 7) === day(0).slice(0, 7)) {
    const future = page.getByRole('button', { name: `${label(day(1))}, future`, exact: true });
    await expect(future.locator('.day-sign')).toHaveCount(0);
  }
  expect(await fits(page)).toBe(true);
});

test('TC-49: today keeps its colour with an outline; the chosen day keeps its colour with a thick border (ADR 0105)', async ({ page }) => {
  const { w, s } = await twoGoals(c, day(-4));
  await entry(w, day(0), 8); await entry(s, day(0), 420);
  await login(page);
  const now = dayButton(page, day(0), 'all goals met');
  expect(await background(now)).toBe(COLOURS.ALL_MET);
  expect(await now.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await goToMonth(page, day(-1));
  const past = dayButton(page, day(-1), 'nothing recorded');
  await past.click();
  if (phone()) await page.keyboard.press('Escape');
  else {
    await expect(past).toHaveClass(/chosen/);
    expect(await background(past)).toBe(COLOURS.NOTHING);
    expect(await border(past)).toBe('3px rgb(34, 34, 34)');
  }
});

test('TC-49: a day with no counted goal shows no sign chip in the day box', async ({ page }) => {
  await twoGoals(c, day(-1));
  await login(page);
  await goToMonth(page, day(-2));
  await dayButton(page, day(-2)).click();
  await expect(page.getByText('No goals on this day.', { exact: true })).toBeVisible();
  await expect(page.locator('.state-chip')).toHaveCount(0);
});

test('TC-117: a save turns the sign and the calendar colour from some to all met without a reload', async ({ page }) => {
  const { w } = await twoGoals(c, day(-4));
  await entry(w, day(0), 8);
  await login(page);
  await page.evaluate(() => { window.notReloaded = true; });
  await expect(dayButton(page, day(0), 'some goals met')).toBeVisible();
  if (phone()) await dayButton(page, day(0), 'some goals met').click();
  const box = page.locator(phone() ? '.day-box' : '.day-panel');
  await expect(box.locator('.state-chip')).toHaveText('½ Some goals met');
  const sleep = box.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Sleep', exact: true }) });
  await sleep.getByRole('button', { name: '+ Check in Sleep', exact: true }).click();
  await sleep.getByLabel('Hours', { exact: true }).fill('7');
  await sleep.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(sleep.getByText('7 h / 7 h', { exact: true })).toBeVisible();
  await expect(sleep.getByText('✓ met', { exact: true })).toBeVisible();
  await expect(box.locator('.state-chip')).toHaveText('✓ All goals met');
  if (phone()) await box.getByRole('button', { name: 'Close', exact: true }).click();
  const after = dayButton(page, day(0), 'all goals met');
  await expect(after.locator('.day-sign')).toHaveText('✓');
  expect(await background(after)).toBe(COLOURS.ALL_MET);
  expect(await page.evaluate(() => window.notReloaded)).toBe(true);
});

test('TC-40: Calendar is selected after login; List and the arrows keep the month; "+ New goal" is beside the switch', async ({ page }) => {
  await twoGoals(c, day(-70));
  await login(page);
  await expect(switchButton(page, 'Calendar')).toHaveAttribute('aria-pressed', 'true');
  await expect(switchButton(page, 'List')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('table.month')).toBeVisible();
  await expect(list(page)).toHaveCount(0);
  await switchButton(page, 'List').click();
  await expect(switchButton(page, 'List')).toHaveAttribute('aria-pressed', 'true');
  await expect(switchButton(page, 'Calendar')).toHaveAttribute('aria-pressed', 'false');
  await expect(list(page)).toBeVisible();
  await expect(page.locator('table.month')).toHaveCount(0);
  await expect(page.locator('.legend')).toHaveCount(0);
  const earlier = monthBefore(day(0));
  await page.getByRole('button', { name: 'Previous month', exact: true }).click();
  await expect(page.locator('.month-title')).toHaveText(monthTitle(earlier));
  const last = new Date(Date.parse(`${day(0).slice(0, 7)}-01T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
  await expect(list(page).getByRole('heading', { level: 3 }).first()).toHaveText(`${shortDate(last)} · – nothing`);
  await switchButton(page, 'Calendar').click();
  await expect(page.locator('table.month')).toBeVisible();
  await expect(page.locator('.month-title')).toHaveText(monthTitle(earlier));
  await expect(dayButton(page, last, 'nothing recorded')).toBeVisible();
  await page.getByRole('link', { name: '+ New goal', exact: true }).click();
  await expect(page).toHaveURL(/\/goals\/new$/);
  await expect(page.getByRole('heading', { name: 'New goal', exact: true })).toBeVisible();
});

test('TC-125: the List is grouped by day, newest first, with "No entries" days', async ({ page }) => {
  const { w, s } = await twoGoals(c, day(-2));
  const t = Date.now();
  await entry(w, day(0), 3, new Date(t - 3000));
  await entry(w, day(0), 2, new Date(t - 1000));
  await entry(s, day(0), 430, new Date(t - 2000));
  await entry(w, day(-2), 3, new Date(t - 5000));
  // Another Participant's records never show (AC-15.6).
  const other = await makeGoal(a, 'water', 6, day(-10));
  await entry(other, day(-1), 5);
  await login(page);
  await switchButton(page, 'List').click();
  const expected = [
    [day(0), '½ some met', ['Water 5 / 8 glasses (2 · 3)', 'Sleep 7 h 10 min / 7 h ✓ (7 h 10 min)']],
    [day(-1), '– nothing', []],
    [day(-2), '✗ none met', ['Water 3 / 8 glasses (3)', 'Sleep 0 min / 7 h']],
  ];
  for (const [date, words, rows] of expected) {
    await goToMonth(page, date);
    await expect(dayBlock(page, date).getByRole('heading', { level: 3 })).toHaveText(`${shortDate(date)} · ${words}`);
    await expect(dayBlock(page, date).getByRole('listitem')).toHaveText(rows);
    await expect(dayBlock(page, date).getByText('No entries', { exact: true })).toHaveCount(rows.length ? 0 : 1);
    // Newest first, only days with a goal, none after today.
    const shown = await list(page).locator('section[data-date]').evaluateAll(items => items.map(item => item.dataset.date));
    expect(shown).toEqual(expected.map(item => item[0]).filter(item => item.slice(0, 7) === date.slice(0, 7)));
  }
  // A List day is not clickable (OP-15.3).
  await expect(list(page).getByRole('button')).toHaveCount(0);
  await expect(list(page).getByRole('link')).toHaveCount(0);
});

test('TC-125: a month with no goal on any day says "No goals in this month."', async ({ page }) => {
  await twoGoals(c, day(0));
  await login(page);
  await switchButton(page, 'List').click();
  await page.getByRole('button', { name: 'Previous month', exact: true }).click();
  await expect(list(page).getByText('No goals in this month.', { exact: true })).toBeVisible();
  await expect(list(page).getByRole('heading', { level: 3 })).toHaveCount(0);
});

test('F-15 section 4: when the month read fails, the List shows the API message and the switch still works', async ({ page }) => {
  await twoGoals(c, day(-2));
  await login(page);
  await switchButton(page, 'List').click();
  await page.route('**/api/calendar?month=*', route => route.fulfill({ status: 400, contentType: 'application/json',
    body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Synthetic read failure.' } }) }));
  await page.getByRole('button', { name: 'Previous month', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Synthetic read failure.');
  await switchButton(page, 'Calendar').click();
  await expect(page.locator('table.month')).toBeVisible();
  await switchButton(page, 'List').click();
  await expect(list(page)).toBeVisible();
});

test('ADR 0102: on desktop the panel stays with the List, and a save there updates the List', async ({ page }) => {
  test.skip(phone(), 'desktop width');
  await twoGoals(c, day(-2));
  await login(page);
  await switchButton(page, 'List').click();
  const panel = page.locator('.day-panel');
  await expect(panel).toBeVisible();
  await expect(dayBlock(page, day(0)).getByText('No entries', { exact: true })).toBeVisible();
  const water = panel.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Water', exact: true }) });
  await water.getByRole('button', { name: '+ Check in Water', exact: true }).click();
  await water.getByRole('button', { name: 'One more', exact: true }).click();
  await water.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(dayBlock(page, day(0)).getByRole('listitem')).toHaveText(['Water 1 / 8 glasses (1)', 'Sleep 0 min / 7 h']);
  await expect(dayBlock(page, day(0)).getByRole('heading', { level: 3 })).toHaveText(`${shortDate(day(0))} · ✗ none met`);
});

test('TC-47/TC-48: the switch, the arrows and the List fit the screen and work with the keyboard alone', async ({ page }) => {
  const { w, s } = await twoGoals(c, day(-70));
  await entry(w, day(0), 8); await entry(s, day(0), 430);
  await login(page);
  expect(await fits(page)).toBe(true);
  const tabTo = async (locator, key = 'Tab') => {
    for (let i = 0; i < 60 && !(await locator.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press(key);
    await expect(locator).toBeFocused();
  };
  await tabTo(switchButton(page, 'List'));
  await page.keyboard.press('Enter');
  await expect(switchButton(page, 'List')).toHaveAttribute('aria-pressed', 'true');
  await expect(switchButton(page, 'List')).toBeFocused();
  await expect(dayBlock(page, day(0))).toBeVisible();
  expect(await fits(page)).toBe(true);
  await tabTo(page.getByRole('button', { name: 'Previous month', exact: true }));
  await page.keyboard.press('Enter');
  await expect(page.locator('.month-title')).toHaveText(monthTitle(monthBefore(day(0))));
  expect(await fits(page)).toBe(true);
  const next = page.getByRole('button', { name: 'Next month', exact: true });
  await tabTo(next);
  await page.keyboard.press('Enter');
  await expect(page.locator('.month-title')).toHaveText(monthTitle(day(0)));
  await tabTo(switchButton(page, 'Calendar'), 'Shift+Tab');
  await page.keyboard.press('Space');
  await expect(switchButton(page, 'Calendar')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('table.month')).toBeVisible();
  expect(await fits(page)).toBe(true);
});
