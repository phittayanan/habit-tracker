import { defineConfig } from '@playwright/test';

// test/serve.js reads the same variable; each worktree that runs browser tests sets its own (ADR 0098).
const origin = `http://127.0.0.1:${Number(process.env.TEST_SERVER_PORT || 33132)}`;

export default defineConfig({
  testDir: './test',
  workers: 1,
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || '/tmp/habit-auth-playwright',
  reporter: 'list',
  use: { baseURL: origin, browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
  projects: [375, 1280].map(width => ({ name: `${width}px`, use: { viewport: { width, height: 900 } } })),
  webServer: {
    command: 'node test/serve.js',
    url: `${origin}/api/health`,
    reuseExistingServer: false,
  },
});
