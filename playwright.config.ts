import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests',
  use: { baseURL: process.env.TEST_URL || 'http://127.0.0.1:4173', channel: 'chrome', trace: 'retain-on-failure' },
  reporter: 'list',
  webServer: process.env.TEST_URL ? undefined : { command: 'npm run preview', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
})
