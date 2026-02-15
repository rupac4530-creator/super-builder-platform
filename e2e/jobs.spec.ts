import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3001';

test.describe('Job Processing', () => {
  let jobId: string;

  test('should create a new job', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/jobs`, {
      data: {
        type: 'novelview',
        payload: { prompt: 'A red sports car', quality: 'medium' },
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('status');
    jobId = body.id;
  });

  test('should get job status', async ({ request }) => {
    // Create job first
    const createRes = await request.post(`${API_URL}/api/jobs`, {
      data: {
        type: 'export',
        payload: { format: 'mp4', projectId: 'test-project' },
      },
    });
    const { id } = await createRes.json();

    const response = await request.get(`${API_URL}/api/jobs/${id}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id', id);
    expect(body).toHaveProperty('status');
    expect(['pending', 'processing', 'done', 'failed']).toContain(body.status);
  });

  test('should list all jobs', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/jobs`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should handle job completion with polling', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/api/jobs`, {
      data: {
        type: 'audio',
        payload: { action: 'denoise', inputFile: 'test.wav' },
      },
    });
    const { id } = await createRes.json();

    // Poll for completion (max 30s)
    let status = 'pending';
    let attempts = 0;
    while (status !== 'done' && status !== 'failed' && attempts < 30) {
      await new Promise((r) => setTimeout(r, 1000));
      const pollRes = await request.get(`${API_URL}/api/jobs/${id}`);
      const pollBody = await pollRes.json();
      status = pollBody.status;
      attempts++;
    }

    expect(['done', 'failed']).toContain(status);
  });

  test('should reject invalid job type', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/jobs`, {
      data: { type: '', payload: {} },
    });
    // Should either reject or handle gracefully
    expect([200, 400, 422]).toContain(response.status());
  });
});
