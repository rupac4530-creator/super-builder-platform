/**
 * Engine Alto — Job System
 * High-performance task scheduler with priority queues, worker pools,
 * dependency graphs, and load balancing.
 */

export type JobPriority = 'critical' | 'high' | 'normal' | 'low' | 'background';
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying';

export interface Job {
  id: string;
  name: string;
  priority: JobPriority;
  status: JobStatus;
  dependencies: string[];
  execute: () => Promise<any>;
  result?: any;
  error?: string;
  retries: number;
  maxRetries: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  workerId?: string;
  tags: string[];
}

export interface Worker {
  id: string;
  status: 'idle' | 'busy' | 'draining';
  currentJob?: string;
  completedJobs: number;
  failedJobs: number;
  capabilities: string[];
}

const PRIORITY_WEIGHTS: Record<JobPriority, number> = {
  critical: 100, high: 75, normal: 50, low: 25, background: 10,
};

export class JobSystem {
  private jobs: Map<string, Job> = new Map();
  private workers: Map<string, Worker> = new Map();
  private queue: string[] = [];
  private maxWorkers: number;
  private running: boolean = false;
  private processedTotal: number = 0;

  constructor(maxWorkers: number = 8) {
    this.maxWorkers = maxWorkers;
    for (let i = 0; i < maxWorkers; i++) {
      this.workers.set(`worker-${i}`, {
        id: `worker-${i}`, status: 'idle', completedJobs: 0, failedJobs: 0,
        capabilities: ['general', 'compute', 'io'],
      });
    }
  }

  submit(name: string, execute: () => Promise<any>, options: Partial<{
    priority: JobPriority; dependencies: string[]; maxRetries: number; tags: string[];
  }> = {}): string {
    const id = `JOB-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const job: Job = {
      id, name, execute,
      priority: options.priority || 'normal',
      status: 'queued',
      dependencies: options.dependencies || [],
      retries: 0,
      maxRetries: options.maxRetries ?? 3,
      createdAt: new Date(),
      tags: options.tags || [],
      result: undefined,
      error: undefined,
    };
    this.jobs.set(id, job);
    this.queue.push(id);
    this.sortQueue();
    this.processNext();
    return id;
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      const ja = this.jobs.get(a)!;
      const jb = this.jobs.get(b)!;
      return PRIORITY_WEIGHTS[jb.priority] - PRIORITY_WEIGHTS[ja.priority];
    });
  }

  private async processNext(): Promise<void> {
    if (!this.running) return;

    const idleWorker = Array.from(this.workers.values()).find(w => w.status === 'idle');
    if (!idleWorker) return;

    const readyJobId = this.queue.find(id => {
      const job = this.jobs.get(id)!;
      return job.dependencies.every(depId => {
        const dep = this.jobs.get(depId);
        return dep && dep.status === 'completed';
      });
    });

    if (!readyJobId) return;

    this.queue = this.queue.filter(id => id !== readyJobId);
    const job = this.jobs.get(readyJobId)!;
    idleWorker.status = 'busy';
    idleWorker.currentJob = readyJobId;
    job.status = 'running';
    job.startedAt = new Date();
    job.workerId = idleWorker.id;

    try {
      job.result = await job.execute();
      job.status = 'completed';
      job.completedAt = new Date();
      idleWorker.completedJobs++;
    } catch (err: any) {
      job.retries++;
      if (job.retries < job.maxRetries) {
        job.status = 'retrying';
        this.queue.unshift(readyJobId);
      } else {
        job.status = 'failed';
        job.error = err.message;
        idleWorker.failedJobs++;
      }
    }

    idleWorker.status = 'idle';
    idleWorker.currentJob = undefined;
    this.processedTotal++;
    this.processNext();
  }

  start(): void { this.running = true; this.processNext(); }
  stop(): void { this.running = false; }

  cancel(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'running') return false;
    job.status = 'cancelled';
    this.queue = this.queue.filter(id => id !== jobId);
    return true;
  }

  getJob(id: string): Job | undefined { return this.jobs.get(id); }

  getStatus() {
    const jobs = Array.from(this.jobs.values());
    return {
      totalJobs: jobs.length,
      queued: jobs.filter(j => j.status === 'queued').length,
      running: jobs.filter(j => j.status === 'running').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      workers: Array.from(this.workers.values()).map(w => ({
        id: w.id, status: w.status, completed: w.completedJobs, failed: w.failedJobs,
      })),
      processedTotal: this.processedTotal,
      isRunning: this.running,
    };
  }
}

export const jobSystem = new JobSystem();
