const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev --prefix frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'npm start --prefix backend',
      url: 'http://localhost:5000/api/sectors',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: '.\\.venv\\Scripts\\uvicorn app:app --port 8000',
      cwd: './ai-service',
      url: 'http://localhost:8000/',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
  ],
});
