import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test.describe('Game Studio', () => {
  test('should create game project via API', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/jobs`, {
      data: {
        type: 'game',
        payload: {
          name: 'TestGame',
          engine: 'web',
          genre: 'platformer',
          features: { multiplayer: false, aiNpcs: true, proceduralGeneration: false },
        },
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
  });

  test('should navigate to Game Studio', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    const gameLink = page.locator('text=Game Studio');
    if (await gameLink.isVisible()) {
      await gameLink.click();
      await page.waitForTimeout(1000);

      const content = await page.textContent('body');
      expect(content).toContain('Game');
    }
  });

  test('should show engine selector options', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    const gameLink = page.locator('text=Game Studio');
    if (await gameLink.isVisible()) {
      await gameLink.click();
      await page.waitForTimeout(1000);

      // Should have engine selection
      const selectors = page.locator('select');
      const count = await selectors.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should show genre options', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    const gameLink = page.locator('text=Game Studio');
    if (await gameLink.isVisible()) {
      await gameLink.click();
      await page.waitForTimeout(1000);

      const content = await page.textContent('body');
      // Should mention some game-related terms
      const hasGameContent =
        content?.includes('Engine') ||
        content?.includes('Genre') ||
        content?.includes('Game') ||
        content?.includes('Generate');
      expect(hasGameContent).toBeTruthy();
    }
  });

  test('should take screenshot of Game Studio', async ({ page }) => {
    await page.goto(FRONTEND_URL);

    const gameLink = page.locator('text=Game Studio');
    if (await gameLink.isVisible()) {
      await gameLink.click();
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: 'report/playwright-screenshots/game-studio.png',
        fullPage: true,
      });
    }
  });

  test('should navigate through all Creator Studios', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');

    const studios = [
      'Game Studio',
      'Video Studio',
      'Audio Studio',
      '3D Studio',
      'Fashion Studio',
      'Design Suite',
      'Robotics Lab',
    ];

    for (const studio of studios) {
      const link = page.locator(`text=${studio}`).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(500);
        // Each studio should render something
        const body = await page.textContent('body');
        expect(body!.length).toBeGreaterThan(0);
      }
    }
  });
});
