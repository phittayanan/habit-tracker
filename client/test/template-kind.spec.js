// Template kind and Time display in the browser (Issue #168; ADR 0064, ADR 0065): TC-119 and TC-131.
import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../server/node_modules/@prisma/client/default.js';
import bcrypt from '../../server/node_modules/bcryptjs/index.js';
import { randomBytes } from 'node:crypto';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
const password = randomBytes(24).toString('base64url');
let manager;
test.beforeEach(async () => {
  await db.entry.deleteMany(); await db.goal.deleteMany(); await db.template.deleteMany();
  await db.session.deleteMany(); await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  manager = await db.user.create({ data: { username: 'manager1', displayName: 'Manager One', role: 'MANAGER', passwordHash } });
  await db.user.create({ data: { username: 'participant1', displayName: 'Participant One', role: 'PARTICIPANT', passwordHash } });
});
test.afterAll(() => db.$disconnect());

async function logIn(page, username) {
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(username === 'manager1' ? /\/templates$/ : /\/goals$/);
}
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const noSideScroll = async page => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

test('TC-119: the Kind choice fills and locks the unit, shows hours and minutes, and the table shows the kind', async ({ page }) => {
  await logIn(page, 'manager1');
  await page.goto('/templates/new');
  const unit = page.getByLabel('Unit', { exact: true });
  await expect(page.getByLabel('Kind', { exact: true })).toHaveValue('COUNT');
  await unit.fill('hours');
  await page.getByLabel('Kind', { exact: true }).selectOption('TIME');
  await expect(unit).toHaveValue('minutes');
  await expect(unit).not.toBeEditable();
  await page.getByLabel('Name', { exact: true }).fill('Sleep');
  await page.getByLabel('Minimum', { exact: true }).fill('0');
  await page.getByLabel('Maximum', { exact: true }).fill('720');
  await expect(page.getByText('= 12 h', { exact: true })).toBeVisible();
  await noSideScroll(page);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL(/\/templates$/);
  const row = page.getByRole('row').filter({ hasText: 'Sleep' });
  await expect(row.getByRole('cell', { name: 'Time', exact: true })).toBeVisible();
  await expect(row).toContainText('0 min – 12 h');
  await noSideScroll(page);
});

test('TC-119: editing an unused template to Time and back saves the kind', async ({ page }) => {
  await db.template.create({ data: { name: 'Rest', unit: 'hours', minValue: 0, maxValue: 120, createdBy: manager.id } });
  await logIn(page, 'manager1');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByLabel('Kind', { exact: true }).selectOption('TIME');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByRole('cell', { name: 'Time', exact: true })).toBeVisible();
  expect((await db.template.findUniqueOrThrow({ where: { name: 'Rest' } })).unit).toBe('minutes');
});

test('TC-131: a Time target and entries are typed in minutes with a hint and shown in hours and minutes', async ({ page }) => {
  const template = await db.template.create({ data: { name: 'Sleep', unit: 'minutes', minValue: 0, maxValue: 720, kind: 'TIME', createdBy: manager.id } });
  await logIn(page, 'participant1');
  await page.goto('/goals/new');
  await page.getByLabel('Template', { exact: true }).selectOption(String(template.id));
  await page.getByLabel('Daily target', { exact: true }).fill('420');
  await expect(page.getByText('= 7 h', { exact: true })).toBeVisible();
  await page.getByLabel('End date', { exact: true }).fill(today());
  await noSideScroll(page);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL(/\/goals$/);
  await expect(page.getByText('Daily target: 7 h', { exact: true })).toBeVisible();
  await page.getByLabel('Value (minutes)', { exact: true }).fill('430');
  await expect(page.getByText('= 7 h 10 min', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save entry', exact: true }).click();
  await expect(page.getByText(`${today()}: 7 h 10 min`, { exact: true })).toBeVisible();
  await expect(page.getByText('Day total: 7 h 10 min', { exact: true })).toBeVisible();
  await noSideScroll(page);
});
