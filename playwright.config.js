const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config({ quiet: true });

/**
 * Toolshop uses `data-test` (not `data-testid`). Configuring testIdAttribute lets
 * page.getByTestId('nav-sign-in') resolve to [data-test="nav-sign-in"].
 */
module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Shared public demo account: keep CI serial to reduce cart/order cross-talk.
  // Local runs remain parallel but are capped to avoid saturating the public app.
  workers: process.env.CI ? 1 : 4,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://practicesoftwaretesting.com',
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  // Framework-level assertion budget (not hardcoded sleeps in tests).
  expect: { timeout: 10_000 },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
      },
    },
  ],
});
