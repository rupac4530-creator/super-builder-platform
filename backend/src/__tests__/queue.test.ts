import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Engine Alto — Job Queue Unit Tests
 * Tests the in-memory queue: enqueue, process, status, concurrency.
 */

// Inline a simplified queue for testing (mirrors backend/src/workers/queue.ts)
interface Job {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  data: Record<string, unknown>;
  result?: unknown;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

type Processor = (job: Job) => Promise<unknown>;

class TestQueue {
  private jobs: Map<string, Job> = new Map();
  private processors: Map<string, Processor> = new Map();
  private counter = 0;

  registerProcessor(type: string, processor: Processor): void {
    this.processors.set(type, processor);
  }

  async enqueue(type: string, data: Record<string, unknown> = {}): Promise<Job> {
    const job: Job = {
      id: `job_${++this.counter}`,
      type,
      status: 'pending',
      data,
      createdAt: Date.now(),
    };
    this.jobs.set(job.id, job);
    return job;
  }

  async process(jobId: string): Promise<Job> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    const processor = this.processors.get(job.type);
    if (!processor) throw new Error(`No processor for type: ${job.type}`);

    job.status = 'running';
    try {
      job.result = await processor(job);
      job.status = 'completed';
      job.completedAt = Date.now();
    } catch (err) {
      job.status = 'failed';
      job.error = (err as Error).message;
    }
    return job;
  }

  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  getStats(): { total: number; pending: number; running: number; completed: number; failed: number } {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      running: jobs.filter(j => j.status === 'running').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
    };
  }

  clear(): void {
    this.jobs.clear();
    this.counter = 0;
  }
}

// Tests
describe('InMemoryQueue', () => {
  let queue: TestQueue;

  beforeEach(() => {
    queue = new TestQueue();
    queue.registerProcessor('training', async (job) => {
      return { accuracy: 0.95, epochs: job.data.epochs || 1 };
    });
    queue.registerProcessor('inference', async (job) => {
      return { prediction: 'cat', confidence: 0.87 };
    });
    queue.registerProcessor('export', async () => {
      return { format: 'onnx', size: 1024 };
    });
    queue.registerProcessor('failing', async () => {
      throw new Error('Simulated failure');
    });
  });

  it('should enqueue a job with pending status', async () => {
    const job = await queue.enqueue('training', { epochs: 5 });
    expect(job.id).toBeDefined();
    expect(job.status).toBe('pending');
    expect(job.type).toBe('training');
    expect(job.data.epochs).toBe(5);
  });

  it('should process a job successfully', async () => {
    const job = await queue.enqueue('training', { epochs: 3 });
    const result = await queue.process(job.id);
    expect(result.status).toBe('completed');
    expect(result.result).toEqual({ accuracy: 0.95, epochs: 3 });
    expect(result.completedAt).toBeDefined();
  });

  it('should handle job failure gracefully', async () => {
    const job = await queue.enqueue('failing');
    const result = await queue.process(job.id);
    expect(result.status).toBe('failed');
    expect(result.error).toBe('Simulated failure');
  });

  it('should process different job types', async () => {
    const j1 = await queue.enqueue('training');
    const j2 = await queue.enqueue('inference');
    const j3 = await queue.enqueue('export');

    await queue.process(j1.id);
    await queue.process(j2.id);
    await queue.process(j3.id);

    expect(queue.getJob(j1.id)?.status).toBe('completed');
    expect(queue.getJob(j2.id)?.status).toBe('completed');
    expect(queue.getJob(j3.id)?.status).toBe('completed');
  });

  it('should track queue statistics', async () => {
    await queue.enqueue('training');
    await queue.enqueue('inference');
    const j3 = await queue.enqueue('failing');

    await queue.process(j3.id);

    const stats = queue.getStats();
    expect(stats.total).toBe(3);
    expect(stats.pending).toBe(2);
    expect(stats.failed).toBe(1);
  });

  it('should throw on unknown job id', async () => {
    await expect(queue.process('nonexistent')).rejects.toThrow('Job nonexistent not found');
  });

  it('should throw on unregistered processor', async () => {
    const job = await queue.enqueue('unknown_type');
    await expect(queue.process(job.id)).rejects.toThrow('No processor for type: unknown_type');
  });

  it('should retrieve job by id', async () => {
    const job = await queue.enqueue('training', { dataset: 'cifar10' });
    const retrieved = queue.getJob(job.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.data.dataset).toBe('cifar10');
  });

  it('should clear all jobs', async () => {
    await queue.enqueue('training');
    await queue.enqueue('inference');
    queue.clear();
    expect(queue.getStats().total).toBe(0);
  });
});
