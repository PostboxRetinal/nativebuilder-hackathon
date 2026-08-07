import { test, expect } from '@playwright/test'

// Live-env E2E: login -> new conversation -> type a query -> submit -> wait for
// the researching bubble -> assert one assistant bubble with source cards.
//
// Requires E2E_TEST_EMAIL / E2E_TEST_PASSWORD (a real user in the project
// Supabase). Without them the suite self-skips so CI can run green in a
// non-live environment.
const EMAIL = process.env.E2E_TEST_EMAIL
const PASSWORD = process.env.E2E_TEST_PASSWORD

test.skip(!EMAIL || !PASSWORD, 'E2E_TEST_EMAIL / E2E_TEST_PASSWORD not set')

test.describe('research loop', () => {
  test('logs in, submits a query, and renders one researched answer with sources', async ({
    page,
  }) => {
    // 1. Auth
    await page.goto('/')
    await page.getByLabel('Email').fill(EMAIL!)
    await page.getByLabel('Password').fill(PASSWORD!)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByText('New Chat')).toBeVisible({ timeout: 30_000 })

    // 2. New conversation
    await page.getByRole('button', { name: 'New Chat' }).click()
    await expect(page.getByPlaceholder('Type a message...')).toBeVisible()

    // 3. Submit a query via the text input
    await page.getByPlaceholder('Type a message...').fill('selenium vs playwright 2026')
    await page.getByRole('button', { name: 'Send' }).click()

    // 4. Researching placeholder appears during the pipeline
    await expect(page.getByText(/Researching/)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Researching/)).toBeHidden({ timeout: 120_000 })

    // 5. Exactly one assistant answer bubble for the query
    const assistant = page.locator('[data-testid="message-assistant"]')
    await expect(assistant).toHaveCount(1, { timeout: 30_000 })

    // 6. It carries at least one source citation
    const citations = page.locator('[data-testid="source-citation"]')
    await expect(citations.first()).toBeVisible({ timeout: 15_000 })
    await expect(citations.count()).resolves.toBeGreaterThan(0)
  })
})
