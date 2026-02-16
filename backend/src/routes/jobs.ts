import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { jobQueue } from '../workers/queue';

export const jobsRouter = Router();

// List all jobs
jobsRouter.get('/', async (req: Request, res: Response) => {
  const { status, type, limit = '50' } = req.query;
  let jobs = jobQueue.listJobs(status as string | undefined);

  if (type) jobs = jobs.filter((j: any) => j.type === type);
  jobs = jobs.slice(0, parseInt(limit as string));

  res.json({ jobs, total: jobs.length });
});

// Create job
jobsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { type, payload = {}, priority = 'normal' } = req.body;
    if (!type) return res.status(400).json({ error: 'Job type is required' });

    const job = await jobQueue.add(type, { ...payload, priority });

    logger.info(`Job created: ${type} (${job.id})`);
    res.status(201).json(job);
  } catch (error) {
    logger.error('Failed to create job', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Get job status
jobsRouter.get('/:id', async (req: Request, res: Response) => {
  const job = jobQueue.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// Cancel job
jobsRouter.delete('/:id', async (req: Request, res: Response) => {
  const job = jobQueue.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  (job as any).status = 'cancelled';
  (job as any).completedAt = new Date();
  res.json(job);
});

// Get job types
jobsRouter.get('/types/list', (_req: Request, res: Response) => {
  res.json({
    types: [
      { id: 'sdxl', name: 'SDXL Image', description: 'Generate high-quality images' },
      { id: 'video_render', name: 'Video Render', description: 'Render video' },
      { id: 'training', name: 'Model Training', description: 'Train AI models' },
      { id: 'inference', name: 'Inference', description: 'Run predictions' },
      { id: 'export', name: 'Export', description: 'Export assets' },
      { id: 'build', name: 'Build', description: 'Build project' }
    ]
  });
});
