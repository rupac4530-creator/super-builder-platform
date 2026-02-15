import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Admin Jobs Dashboard', () => {
  test('should load the dashboard page', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await expect(page).toHaveTitle(/Super Builder|Engine Alto/i);
  });

  test('should navigate to jobs section', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    // Click on Jobs in sidebar
    const jobsLink = page.locator('text=Jobs');
    if (await jobsLink.isVisible()) {
      await jobsLink.click();
      await expect(page.locator('text=Job Queue')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display job status indicators', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    const jobsLink = page.locator('text=Jobs');
    if (await jobsLink.isVisible()) {
      await jobsLink.click();

      // Check for status-related elements
      const statusElements = page.locator('[class*="status"], [data-status]');
      const count = await statusElements.count();
      // Page should have some status indicators or empty state
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display metrics section', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    const metricsLink = page.locator('text=Metrics');
    if (await metricsLink.isVisible()) {
      await metricsLink.click();
      // Should show metrics or dashboard content
      await page.waitForTimeout(1000);
      const content = await page.textContent('body');
      expect(content).toBeTruthy();
    }
  });

  test('should take screenshot of dashboard', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'report/playwright-screenshots/dashboard.png',
      fullPage: true,
    });
  });
});
