/**
 * Engine Alto — Artifact E2E Tests
 * Validates artifact vault API and storage health.
 */

import { test, expect, type APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

test.describe('Artifact Vault API', () => {
  let api: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    api = await playwright.request.newContext({ baseURL: BASE_URL });
  });

  test('GET /api/artifacts/list returns artifact inventory', async () => {
    const res = await api.get('/api/artifacts/list');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('artifactRoot');
    expect(body).toHaveProperty('totalFiles');
    expect(body).toHaveProperty('totalSizeMB');
    expect(body).toHaveProperty('totalSizeGB');
    expect(body).toHaveProperty('byType');
    expect(typeof body.totalFiles).toBe('number');
  });

  test('GET /api/artifacts/stats returns storage health', async () => {
    const res = await api.get('/api/artifacts/stats');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('targetGB');
    expect(body).toHaveProperty('currentGB');
    expect(body).toHaveProperty('progressPercent');
    expect(body).toHaveProperty('targetReached');
    expect(body).toHaveProperty('directories');
    expect(typeof body.progressPercent).toBe('number');
  });

  test('GET /api/artifacts/search returns filtered results', async () => {
    const res = await api.get('/api/artifacts/search?type=model');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('results');
    expect(body).toHaveProperty('total');
    expect(Array.isArray(body.results)).toBeTruthy();
  });

  test('artifact directories exist on disk', async () => {
    const res = await api.get('/api/artifacts/stats');
    if (res.ok()) {
      const body = await res.json();
      const dirs = body.directories;
      // At minimum, these directories should exist (even if empty)
      expect(dirs).toHaveProperty('models');
      expect(dirs).toHaveProperty('datasets');
      expect(dirs).toHaveProperty('renders');
      expect(dirs).toHaveProperty('exports');
    }
  });
});
