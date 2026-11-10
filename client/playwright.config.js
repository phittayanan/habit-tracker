import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test',
  workers: 1,
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR || '/tmp/habit-auth-playwright',
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:33132', browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
  projects: [375, 1280].map(width => ({ name: `${width}px`, use: { viewport: { width, height: 900 } } })),
  webServer: {
    command: 'node test/serve.js',
    url: 'http://127.0.0.1:33132/api/health',
    reuseExistingServer: false,
  },
});
