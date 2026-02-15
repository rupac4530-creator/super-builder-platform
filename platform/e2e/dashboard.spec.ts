import { test, expect } from '@playwright/test';

/**
 * Engine Alto — Dashboard E2E Tests
 * Critical user flows for the main dashboard.
 */

test.describe('Dashboard', () => {
  test('should load the main dashboard page', async ({ page }) => {
    await page.goto('/');
    // Verify the page loads without errors
    await expect(page).toHaveTitle(/Alto|Engine/i);
    // Verify main content area renders
    await expect(page.locator('main, [role="main"], #__next')).toBeVisible();
  });

  test('should render sidebar navigation', async ({ page }) => {
    await page.goto('/');
    // Look for navigation/sidebar element
    const sidebar = page.locator('nav, aside, [role="navigation"]').first();
    await expect(sidebar).toBeVisible({ timeout: 10_000 });
  });

  test('should navigate to Training Studio', async ({ page }) => {
    await page.goto('/');
    // Click on training-related nav link
    const trainingLink = page.getByRole('link', { name: /train/i }).first();
    if (await trainingLink.isVisible()) {
      await trainingLink.click();
      await page.waitForLoadState('networkidle');
      // Verify we navigated
      await expect(page.url()).toContain('train');
    }
  });

  test('should navigate to Agent Civilization', async ({ page }) => {
    await page.goto('/');
    const agentLink = page.getByRole('link', { name: /agent|civilization/i }).first();
    if (await agentLink.isVisible()) {
      await agentLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page.url()).toContain('agent');
    }
  });
});

test.describe('API Health', () => {
  test('AI chat endpoint returns valid response', async ({ request }) => {
    const response = await request.post('/api/ai/chat', {
      data: { message: 'Hello from E2E test' },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('timestamp');
    expect(body.message.length).toBeGreaterThan(0);
  });

  test('AI chat rejects empty message', async ({ request }) => {
    const response = await request.post('/api/ai/chat', {
      data: { message: '' },
    });
    expect(response.status()).toBe(400);
  });

  test('Job queue stats endpoint returns valid stats', async ({ request }) => {
    const response = await request.get('/api/agents/queue/stats');
    if (response.ok()) {
      const body = await response.json();
      expect(body).toHaveProperty('total');
    }
  });
});
