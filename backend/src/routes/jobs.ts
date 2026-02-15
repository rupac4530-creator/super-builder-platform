import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export const jobsRouter = Router();

// In-memory job queue (fallback for BullMQ)
const jobQueue = new Map<string, any>();

// List all jobs
jobsRouter.get('/', async (req: Request, res: Response) => {
  const { status, type, limit = '50' } = req.query;
  let jobs = Array.from(jobQueue.values());
  
  if (status) jobs = jobs.filter(j => j.status === status);
  if (type) jobs = jobs.filter(j => j.type === type);
  
  jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  jobs = jobs.slice(0, parseInt(limit as string));

  res.json({ jobs, total: jobs.length });
});

// Create job
jobsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { type, payload = {}, priority = 'normal' } = req.body;
    if (!type) return res.status(400).json({ error: 'Job type is required' });

    const job = {
      id: uuidv4(),
      type,
      status: 'pending',
      priority,
      payload,
      result: null,
      progress: 0,
      attempts: 0,
      maxAttempts: 3,
      logs: [`[${new Date().toISOString()}] Job created: ${type}`],
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      error: null
    };

    jobQueue.set(job.id, job);

    // Simulate job processing
    processJob(job.id, req.app.get('io'));

    logger.info(`Job created: ${type} (${job.id})`);
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Get job status
jobsRouter.get('/:id', async (req: Request, res: Response) => {
  const job = jobQueue.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// Cancel job
jobsRouter.delete('/:id', async (req: Request, res: Response) => {
  const job = jobQueue.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  job.status = 'cancelled';
  job.completedAt = new Date().toISOString();
  res.json(job);
});

// Get job types
jobsRouter.get('/types/list', (_req: Request, res: Response) => {
  res.json({
    types: [
      { id: 'training', name: 'Model Training', description: 'Train AI models on GPU' },
      { id: 'inference', name: 'Model Inference', description: 'Run predictions' },
      { id: 'video_render', name: 'Video Render', description: 'Render video with effects' },
      { id: 'image_gen', name: 'Image Generation', description: 'Generate images with AI' },
      { id: 'audio_process', name: 'Audio Processing', description: 'Process audio files' },
      { id: 'export', name: 'Asset Export', description: 'Export assets (GLB, MP4, ZIP)' },
      { id: 'build', name: 'Project Build', description: 'Build and compile project' },
      { id: 'deploy', name: 'Deployment', description: 'Deploy project to hosting' }
    ]
  });
});

function processJob(jobId: string, io: any) {
  const job = jobQueue.get(jobId);
  if (!job) return;

  job.status = 'running';
  job.startedAt = new Date().toISOString();
  job.attempts++;

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress > 100) progress = 100;

    job.progress = Math.round(progress);
    job.logs.push(`[${new Date().toISOString()}] Progress: ${job.progress}%`);

    if (io) {
      io.emit('job:progress', { jobId, progress: job.progress });
    }

    if (progress >= 100) {
      clearInterval(interval);
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.result = { success: true, message: `${job.type} completed successfully` };
      if (io) io.emit('job:complete', { jobId });
    }
  }, 1500);
}
