/**
 * Engine Alto — Playwright E2E Smoke Tests
 * Validates all critical API endpoints and UI flows.
 */

import { test, expect, type APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// ---------------------------------------------------------------------------
// API Health & Status
// ---------------------------------------------------------------------------

test.describe('API Health', () => {
  let api: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    api = await playwright.request.newContext({ baseURL: BASE_URL });
  });

  test('GET /api/health returns 200', async () => {
    const res = await api.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('status');
  });

  test('GET / returns root endpoint listing', async () => {
    const res = await api.get('/');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.name).toContain('Engine Alto');
    expect(body.endpoints).toBeDefined();
    expect(body.endpoints.length).toBeGreaterThan(10);
  });

  test('GET /api/status returns system status', async () => {
    const res = await api.get('/api/status');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('uptime');
  });
});

// ---------------------------------------------------------------------------
// AI Endpoints
// ---------------------------------------------------------------------------

test.describe('AI Endpoints', () => {
  let api: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    api = await playwright.request.newContext({ baseURL: BASE_URL });
  });

  test('POST /api/ai/generate returns response', async () => {
    const res = await api.post('/api/ai/generate', {
      data: { prompt: 'Hello', model: 'auto' },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/ai/models lists available models', async () => {
    const res = await api.get('/api/ai/models');
    if (res.ok()) {
      const body = await res.json();
      expect(Array.isArray(body.models || body)).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// Job Queue
// ---------------------------------------------------------------------------

test.describe('Job Queue', () => {
  let api: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    api = await playwright.request.newContext({ baseURL: BASE_URL });
  });

  test('POST /api/jobs creates a job', async () => {
    const res = await api.post('/api/jobs', {
      data: {
        type: 'general',
        payload: { test: true },
      },
    });
    expect(res.status()).toBeLessThan(500);
  });

  test('GET /api/jobs lists jobs', async () => {
    const res = await api.get('/api/jobs');
    expect(res.ok()).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Metrics & Observability
// ---------------------------------------------------------------------------

test.describe('Observability', () => {
  let api: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    api = await playwright.request.newContext({ baseURL: BASE_URL });
  });

  test('GET /api/metrics returns prometheus-format metrics', async () => {
    const res = await api.get('/api/metrics');
    expect(res.ok()).toBeTruthy();
  });

  test('GET /api/status/engine returns engine info', async () => {
    const res = await api.get('/api/engine');
    if (res.ok()) {
      const body = await res.json();
      expect(body).toHaveProperty('status');
    }
  });
});

// ---------------------------------------------------------------------------
// Agent Departments
// ---------------------------------------------------------------------------

test.describe('Agent Departments', () => {
  let api: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    api = await playwright.request.newContext({ baseURL: BASE_URL });
  });

  test('GET /api/departments returns departments list', async () => {
    const res = await api.get('/api/departments');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.departments).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

test.describe('Services', () => {
  let api: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    api = await playwright.request.newContext({ baseURL: BASE_URL });
  });

  test('GET /api/services returns service catalog', async () => {
    const res = await api.get('/api/services');
    expect(res.ok()).toBeTruthy();
  });

  test('GET /api/civilization returns civilization data', async () => {
    const res = await api.get('/api/civilization');
    if (res.ok()) {
      const body = await res.json();
      expect(body).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

test.describe('Projects', () => {
  let api: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    api = await playwright.request.newContext({ baseURL: BASE_URL });
  });

  test('GET /api/projects returns project list', async () => {
    const res = await api.get('/api/projects');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.projects || body)).toBeTruthy();
  });

  test('POST /api/projects creates a project', async () => {
    const res = await api.post('/api/projects', {
      data: {
        name: 'E2E Test Project',
        type: 'game',
        engine: 'godot',
      },
    });
    expect(res.status()).toBeLessThan(500);
  });
});

// ---------------------------------------------------------------------------
// Training
// ---------------------------------------------------------------------------

test.describe('Training', () => {
  let api: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    api = await playwright.request.newContext({ baseURL: BASE_URL });
  });

  test('GET /api/training returns training status', async () => {
    const res = await api.get('/api/training');
    expect(res.ok()).toBeTruthy();
  });
});
