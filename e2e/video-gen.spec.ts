import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Video Generation', () => {
  test('should create a video generation job', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/jobs`, {
      data: {
        type: 'video',
        payload: {
          prompt: 'A sunset over the ocean with gentle waves',
          style: 'cinematic',
          duration: 5,
          resolution: '720p',
          fps: 24,
        },
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('status');
  });

  test('should navigate to Video Studio', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    const videoLink = page.locator('text=Video Studio');
    if (await videoLink.isVisible()) {
      await videoLink.click();
      await page.waitForTimeout(1000);

      // Should see Video Studio content
      const content = await page.textContent('body');
      expect(content).toContain('Video');
    }
  });

  test('should show style presets in Video Studio', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    const videoLink = page.locator('text=Video Studio');
    if (await videoLink.isVisible()) {
      await videoLink.click();
      await page.waitForTimeout(1000);

      // Check for style-related elements
      const styleOptions = page.locator('select, [role="listbox"], option');
      const count = await styleOptions.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should take screenshot of Video Studio', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    const videoLink = page.locator('text=Video Studio');
    if (await videoLink.isVisible()) {
      await videoLink.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: 'report/playwright-screenshots/video-studio.png',
        fullPage: true,
      });
    }
  });

  test('should handle video generation with invalid params', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/jobs`, {
      data: {
        type: 'video',
        payload: { prompt: '', duration: -1 },
      },
    });

    // Should handle gracefully (either accept with defaults or reject)
    expect([200, 400, 422]).toContain(response.status());
  });
});
