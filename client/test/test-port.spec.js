// Issue #181, ADR 0098: the browser tests take their port from TEST_SERVER_PORT, so two worktrees can run them at once.
import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const clientDir = fileURLToPath(new URL('..', import.meta.url));

// Loads the config in a fresh process, because it reads the environment once, when it is imported.
function configFor(port) {
  const env = { ...process.env, TEST_SERVER_PORT: port };
  if (port === undefined) delete env.TEST_SERVER_PORT;
  const script = "const { default: c } = await import('./playwright.config.js'); console.log(JSON.stringify({ baseURL: c.use.baseURL, health: c.webServer.url }));";
  return JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: clientDir, env, encoding: 'utf8' }));
}

test('the Playwright config takes its port from TEST_SERVER_PORT, 33132 by default', () => {
  expect(configFor(undefined)).toEqual({ baseURL: 'http://127.0.0.1:33132', health: 'http://127.0.0.1:33132/api/health' });
  expect(configFor('33155')).toEqual({ baseURL: 'http://127.0.0.1:33155', health: 'http://127.0.0.1:33155/api/health' });
});

test('no browser spec fixes a server port of its own', () => {
  const fixed = readdirSync(new URL('.', import.meta.url))
    .filter(name => name.endsWith('.spec.js') && name !== 'test-port.spec.js')
    .flatMap(name => readFileSync(new URL(name, import.meta.url), 'utf8').split(/\r?\n/)
      .map((line, index) => ({ at: `${name}:${index + 1}`, line }))
      .filter(({ line }) => /127\.0\.0\.1:\d|localhost:\d|Port\s*=\s*\d/.test(line))
      .map(({ at }) => at));
  expect(fixed).toEqual([]);
});
