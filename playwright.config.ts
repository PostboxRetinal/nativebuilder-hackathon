import { defineConfig } from '@playwright/test'

// E2E runs against the LIVE app: real Supabase auth + research Edge Function
// + Speechmatics. It requires a real test user (email/password) in the
// projects Supabase instance, provided via env. Without credentials the spec
// self-skips, so CI never breaks for lack of a live environment.
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'bun dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
