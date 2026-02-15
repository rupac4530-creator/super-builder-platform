import { logger } from '../utils/logger';

// ─── JOB_QUEUE Toggle ───────────────────────────────────────────────
// Set JOB_QUEUE=redis in .env to use Redis/BullMQ (requires Redis running).
// Default: 'memory' — lightweight in-process queue for dev/testing.
const QUEUE_BACKEND = (process.env.JOB_QUEUE || 'memory').toLowerCase();

if (QUEUE_BACKEND === 'redis') {
  logger.warn(
    '⚠️  JOB_QUEUE=redis selected but BullMQ adapter is not yet implemented. ' +
    'Falling back to in-memory queue. Install bull/bullmq and implement RedisQueue for production.'
  );
}

// In-memory job queue (used when Redis/BullMQ is not available or not configured)
interface QueueJob {
  id: string;
  type: string;
  data: any;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  result?: any;
  error?: string;
  progress: number;
  attempts: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
}

type JobProcessor = (job: QueueJob) => Promise<any>;

class InMemoryQueue {
  private jobs: Map<string, QueueJob> = new Map();
  private processors: Map<string, JobProcessor> = new Map();
  private processing = false;

  async add(type: string, data: any): Promise<QueueJob> {
    const job: QueueJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      status: 'waiting',
      progress: 0,
      attempts: 0,
      createdAt: new Date()
    };

    this.jobs.set(job.id, job);
    logger.info(`📥 Job queued: ${type} (${job.id})`);

    // Process immediately if not busy
    this.processNext();

    return job;
  }

  registerProcessor(type: string, processor: JobProcessor) {
    this.processors.set(type, processor);
    logger.info(`🔧 Processor registered: ${type}`);
  }

  private async processNext() {
    if (this.processing) return;

    const waiting = Array.from(this.jobs.values()).find(j => j.status === 'waiting');
    if (!waiting) return;

    this.processing = true;
    waiting.status = 'active';
    waiting.processedAt = new Date();
    waiting.attempts++;

    const processor = this.processors.get(waiting.type);
    if (!processor) {
      // Default processor — simulate work
      await this.simulateWork(waiting);
    } else {
      try {
        waiting.result = await processor(waiting);
        waiting.status = 'completed';
        waiting.completedAt = new Date();
        logger.info(`✅ Job completed: ${waiting.type} (${waiting.id})`);
      } catch (error: any) {
        waiting.status = 'failed';
        waiting.error = error.message;
        logger.error(`❌ Job failed: ${waiting.type} (${waiting.id}): ${error.message}`);
      }
    }

    this.processing = false;
    this.processNext();
  }

  private simulateWork(job: QueueJob): Promise<void> {
    return new Promise(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          job.progress = 100;
          job.status = 'completed';
          job.completedAt = new Date();
          job.result = { success: true };
          resolve();
        }
        job.progress = Math.min(Math.round(progress), 100);
      }, 500);
    });
  }

  getJob(id: string): QueueJob | undefined {
    return this.jobs.get(id);
  }

  listJobs(status?: string): QueueJob[] {
    const jobs = Array.from(this.jobs.values());
    return status ? jobs.filter(j => j.status === status) : jobs;
  }

  getStats() {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      waiting: jobs.filter(j => j.status === 'waiting').length,
      active: jobs.filter(j => j.status === 'active').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length
    };
  }
}

// Singleton
export const jobQueue = new InMemoryQueue();

// Register default processors
jobQueue.registerProcessor('training', async (job) => {
  logger.info(`🧠 Training job processing: ${JSON.stringify(job.data)}`);
  return { model: 'trained', accuracy: 0.95 };
});

jobQueue.registerProcessor('inference', async (job) => {
  logger.info(`⚡ Inference job processing: ${JSON.stringify(job.data)}`);
  return { predictions: [{ label: 'class_0', confidence: 0.95 }] };
});

jobQueue.registerProcessor('export', async (job) => {
  logger.info(`📦 Export job processing: ${JSON.stringify(job.data)}`);
  return { file: `export_${Date.now()}.zip`, size: '5MB' };
});

jobQueue.registerProcessor('video_render', async (job) => {
  logger.info(`🎬 Video render job processing`);
  return { file: `render_${Date.now()}.mp4`, duration: '10s' };
});

jobQueue.registerProcessor('build', async (job) => {
  logger.info(`🏗️ Build job processing`);
  return { output: 'dist/', artifacts: ['bundle.js', 'index.html'] };
});
