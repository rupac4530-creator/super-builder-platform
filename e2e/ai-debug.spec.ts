import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3001';

test.describe('AI Debug Endpoint', () => {
  test('should return mock mode when ENABLE_REAL_AI is not set', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/ai/debug`, {
      data: { code: 'console.log("hello")', error: 'undefined is not a function' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('suggestion');
  });

  test('should return health check', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('should return status with feature modes', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/status`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('features');
    expect(body.features).toHaveProperty('ai');
    expect(body.features).toHaveProperty('audio');
    expect(body.features).toHaveProperty('video');
  });

  test('should handle streaming chat endpoint', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/ai/stream`, {
      data: { message: 'Hello, how are you?', model: 'mock' },
    });

    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('text/event-stream');
  });

  test('should return AI models list', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/models`);
    expect(response.status()).toBe(200);
  });
});
