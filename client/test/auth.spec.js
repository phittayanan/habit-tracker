import { test, expect } from '@playwright/test';
import { PrismaClient } from '../../server/node_modules/@prisma/client/default.js';
import bcrypt from '../../server/node_modules/bcryptjs/index.js';
import { randomBytes } from 'node:crypto';

if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) throw new Error('Separate test database required.');
const db = new PrismaClient({ datasources: { db: { url: process.env.TEST_DATABASE_URL } } });
const password = randomBytes(24).toString('base64url');
test.beforeEach(async () => {
  await db.goal.deleteMany();
  await db.template.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
  const passwordHash = await bcrypt.hash(password, 10);
  for (const [username, displayName, role] of [
    ['manager1', 'Manager One', 'MANAGER'], ['participant1', 'Participant One', 'PARTICIPANT'],
    ['participant2', 'Participant Two', 'PARTICIPANT'],
  ]) await db.user.create({ data: { username, displayName, role, passwordHash } });
});
test.afterAll(() => db.$disconnect());

async function logIn(page, username = 'participant1') {
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(username === 'manager1' ? /\/templates$/ : /\/goals$/);
}

test('TC-65: rejected login retains username, clears password; login and logout destinations', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username', { exact: true }).fill('participant1');
  await page.getByLabel('Password', { exact: true }).fill(randomBytes(24).toString('hex'));
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Username or password is incorrect.');
  await expect(page.getByLabel('Username', { exact: true })).toHaveValue('participant1');
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
  await logIn(page);
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await logIn(page, 'manager1');
});

test('TC-07: shared bar shows database identity and exact role menus on test-only page', async ({ page }) => {
  for (const [username, displayName, menu] of [
    ['manager1', 'Manager One', ['Templates']], ['participant1', 'Participant One', ['Goals', 'Templates']],
  ]) {
    await logIn(page, username);
    await page.goto('/test/protected');
    await expect(page.getByRole('banner')).toContainText(displayName);
    await expect(page.getByRole('navigation').getByRole('link')).toHaveText(menu);
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
    await page.getByRole('button', { name: 'Log out' }).click();
  }
});

test('TC-67: missing and deleted session redirect on next real API call', async ({ page }) => {
  for (const path of ['/test/protected', '/templates/new', '/goals']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
  await logIn(page);
  await page.goto('/test/protected');
  await expect(page.getByRole('banner')).toContainText('Participant One');
  await db.session.deleteMany();
  const me = page.waitForResponse(response => response.url().endsWith('/api/auth/me') && response.status() === 401);
  await page.reload();
  await me;
  await expect(page).toHaveURL(/\/login$/);
});

test('wrong-role addresses preserve bar and exact message', async ({ page }) => {
  await logIn(page);
  for (const path of ['/templates/new', '/templates/123/edit']) {
    await page.goto(path);
    await expect(page.getByRole('main')).toHaveText('This page is not available for your role.');
    await expect(page.getByRole('banner')).toContainText('Participant One');
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  }
  await page.getByRole('button', { name: 'Log out' }).click();
  await logIn(page, 'manager1');
  await page.goto('/goals');
  await expect(page.getByRole('main')).toHaveText('This page is not available for your role.');
});

test('approved loading, validation and generic error states', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Enter your username and password.');
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/api/auth/login', async route => {
    await held;
    await route.fulfill({ status: 500, json: { error: { message: 'private server detail' } } });
  });
  await page.getByLabel('Username', { exact: true }).fill('participant1');
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeDisabled();
  await expect(page.getByRole('status')).toHaveText('Logging in…');
  release();
  await expect(page.getByRole('alert')).toHaveText('Something went wrong. Please try again.');
  await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');
});

test('TC-47 / TC-48: approved width, no overflow, keyboard-only form/menu/logout', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'password');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Username', { exact: true })).toBeFocused();
  await page.keyboard.type('participant1');
  await page.keyboard.press('Tab');
  await page.keyboard.type(password);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeFocused();
  expect(await page.locator('form').evaluate(el => el.getBoundingClientRect().width)).toBeLessThanOrEqual(352);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/goals$/);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Goals', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Templates', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/templates$/);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Log out' })).toBeFocused();
  for (const path of ['/templates', '/templates/new']) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const control of await page.locator('button, nav a').all()) {
      expect(await control.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    }
  }
  await page.getByRole('button', { name: 'Log out' }).focus();
  expect(await page.getByRole('button', { name: 'Log out' }).evaluate(el => getComputedStyle(el).outlineWidth)).toBe('3px');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
