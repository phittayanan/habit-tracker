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
let manager, a, b;
test.beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany(); await db.session.deleteMany(); await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  manager = await db.user.create({ data: { username: 'manager1', displayName: 'Manager One', role: 'MANAGER', passwordHash } });
  a = await db.user.create({ data: { username: 'participant1', displayName: 'Participant One', role: 'PARTICIPANT', passwordHash } });
  b = await db.user.create({ data: { username: 'participant2', displayName: 'Participant Two', role: 'PARTICIPANT', passwordHash } });
});
test.afterAll(() => db.$disconnect());
async function login(page, username) {
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(username === 'manager1' ? /\/templates$/ : /\/goals$/);
}
const logout = async page => { await page.getByRole('button', { name: 'Log out' }).click(); await expect(page).toHaveURL(/\/login$/); };

test('TC-32: the goals page shows "2 of 10 days met" for the seeded goal', async ({ page }) => {
  const template = await db.template.create({ data: { name: 'Stretching', unit: 'minutes', minValue: 0, maxValue: 120, createdBy: manager.id } });
  const goal = await db.goal.create({ data: { participantId: a.id, templateId: template.id, dailyTarget: 30, startDate: asDate(day(-9)), endDate: asDate(day(20)) } });
  for (const [n, value] of [[-9, 30], [-8, 29.9], [-6, 45]]) await db.entry.create({ data: { goalId: goal.id, entryDate: asDate(day(n)), value } });
  await login(page, 'participant1');
  await expect(page.getByText('2 of 10 days met', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('TC-35 (browser part): each Participant sees only own goals, entries and progress', async ({ page }) => {
  const template = await db.template.create({ data: { name: 'Sleep', unit: 'hours', minValue: 0, maxValue: 24, createdBy: manager.id } });
  const other = await db.template.create({ data: { name: 'Reading', unit: 'pages', minValue: 0, maxValue: 100, createdBy: manager.id } });
  const ga = await db.goal.create({ data: { participantId: a.id, templateId: template.id, dailyTarget: 8, startDate: asDate(day(-1)), endDate: asDate(day(5)) } });
  const gb = await db.goal.create({ data: { participantId: b.id, templateId: other.id, dailyTarget: 10, startDate: asDate(day(-1)), endDate: asDate(day(5)) } });
  await db.entry.create({ data: { goalId: ga.id, entryDate: asDate(day(-1)), value: 8 } });
  await db.entry.create({ data: { goalId: gb.id, entryDate: asDate(day(0)), value: 12.5 } });
  await login(page, 'participant1');
  await expect(page.getByRole('heading', { name: 'Sleep' })).toBeVisible();
  await expect(page.getByText('1 of 2 days met', { exact: true })).toBeVisible();
  await expect(page.getByText('Reading')).toHaveCount(0);
  await expect(page.getByText('12.5')).toHaveCount(0);
  await logout(page);
  await login(page, 'participant2');
  await expect(page.getByRole('heading', { name: 'Reading' })).toBeVisible();
  await expect(page.getByText('1 of 2 days met', { exact: true })).toBeVisible();
  await expect(page.getByText('Sleep')).toHaveCount(0);
});

test('TC-59: Manager creates a template, Participant sets a goal, records a day and reads progress', async ({ page, request }) => {
  await login(page, 'manager1');
  await page.goto('/templates/new');
  await page.getByLabel('Name', { exact: true }).fill('Sleep');
  await page.getByLabel('Unit', { exact: true }).fill('hours');
  await page.getByLabel('Minimum', { exact: true }).fill('0');
  await page.getByLabel('Maximum', { exact: true }).fill('24');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByText('Sleep').first()).toBeVisible();
  await logout(page);

  await login(page, 'participant1');
  await page.goto('/goals/new');
  await page.getByLabel('Template', { exact: true }).selectOption({ label: 'Sleep' });
  await page.getByLabel('Daily target', { exact: true }).fill('8');
  await page.getByLabel('End date', { exact: true }).fill(today());
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL(/\/goals$/);
  await expect(page.getByText('0 of 1 days met', { exact: true })).toBeVisible();

  await page.getByLabel('Value (hours)', { exact: true }).fill('8');
  await page.getByRole('button', { name: 'Save entry', exact: true }).click();
  await expect(page.getByText('1 of 1 days met', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('1 of 1 days met', { exact: true })).toBeVisible();

  // A new session reads the saved result from the database (the app restart itself is covered by the server test AC-09.6).
  await logout(page);
  await login(page, 'participant1');
  await expect(page.getByText('1 of 1 days met', { exact: true })).toBeVisible();
  await expect(page.getByText(`${today()}: 8 hours`, { exact: true })).toBeVisible();

  const anonymous = await request.get('/api/goals');
  expect(anonymous.status()).toBe(401);
  expect((await anonymous.json()).error.code).toBe('UNAUTHENTICATED');
  await logout(page);
  await login(page, 'manager1');
  const asManager = await page.evaluate(async () => { const r = await fetch('/api/goals'); return [r.status, (await r.json()).error.code]; });
  expect(asManager).toEqual([403, 'FORBIDDEN']);
});
