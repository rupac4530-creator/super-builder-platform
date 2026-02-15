"""
Engine Alto — Asyncio Job Queue & Worker Pool
Phase 1: Core scheduling, concurrency management, and job lifecycle.
"""

import asyncio
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Coroutine, Dict, List, Optional
from .logger import logger


class JobStatus(Enum):
    WAITING = "waiting"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class Job:
    """Represents a unit of work in the Engine Alto job system."""
    id: str = field(default_factory=lambda: f"job_{uuid.uuid4().hex[:12]}")
    name: str = ""
    func: Optional[Callable[..., Coroutine]] = None
    kwargs: Dict[str, Any] = field(default_factory=dict)
    priority: int = 0  # Higher = more important
    status: JobStatus = JobStatus.WAITING
    result: Any = None
    error: Optional[str] = None
    progress: float = 0.0
    created_at: float = field(default_factory=time.time)
    started_at: Optional[float] = None
    completed_at: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def duration(self) -> Optional[float]:
        if self.started_at and self.completed_at:
            return self.completed_at - self.started_at
        return None


class JobQueue:
    """
    Priority-based async job queue.
    Jobs are ordered by priority (descending), then by creation time (ascending).
    """

    def __init__(self):
        self._queue: asyncio.PriorityQueue = asyncio.PriorityQueue()
        self._jobs: Dict[str, Job] = {}
        self._metrics = {
            "queued": 0,
            "running": 0,
            "succeeded": 0,
            "failed": 0,
            "cancelled": 0,
        }

    async def enqueue(
        self,
        func: Callable[..., Coroutine],
        name: str = "",
        priority: int = 0,
        metadata: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> Job:
        """Add a job to the queue. Higher priority jobs run first."""
        job = Job(
            name=name or func.__name__,
            func=func,
            kwargs=kwargs,
            priority=priority,
            metadata=metadata or {},
        )
        self._jobs[job.id] = job
        # PriorityQueue sorts ascending, so negate priority for descending order
        await self._queue.put((-priority, job.created_at, job.id))
        self._metrics["queued"] += 1
        logger.info(f"📥 Job enqueued: {job.name} ({job.id}) priority={priority}")
        return job

    async def dequeue(self) -> Optional[Job]:
        """Get the next job from the queue."""
        try:
            _, _, job_id = await self._queue.get()
            job = self._jobs.get(job_id)
            if job and job.status == JobStatus.WAITING:
                return job
            return None
        except asyncio.CancelledError:
            return None

    def get_job(self, job_id: str) -> Optional[Job]:
        return self._jobs.get(job_id)

    def cancel_job(self, job_id: str) -> bool:
        job = self._jobs.get(job_id)
        if job and job.status == JobStatus.WAITING:
            job.status = JobStatus.CANCELLED
            self._metrics["cancelled"] += 1
            logger.info(f"🚫 Job cancelled: {job.name} ({job.id})")
            return True
        return False

    def get_metrics(self) -> Dict[str, int]:
        return dict(self._metrics)

    def list_jobs(self, status: Optional[JobStatus] = None) -> List[Job]:
        if status:
            return [j for j in self._jobs.values() if j.status == status]
        return list(self._jobs.values())

    @property
    def pending_count(self) -> int:
        return self._queue.qsize()

    def _mark_running(self, job: Job):
        job.status = JobStatus.ACTIVE
        job.started_at = time.time()
        self._metrics["running"] += 1

    def _mark_completed(self, job: Job, result: Any):
        job.status = JobStatus.COMPLETED
        job.result = result
        job.completed_at = time.time()
        job.progress = 100.0
        self._metrics["running"] -= 1
        self._metrics["succeeded"] += 1

    def _mark_failed(self, job: Job, error: str):
        job.status = JobStatus.FAILED
        job.error = error
        job.completed_at = time.time()
        self._metrics["running"] -= 1
        self._metrics["failed"] += 1


class WorkerPool:
    """
    Pool of async workers that consume jobs from a JobQueue.
    Handles graceful shutdown, error isolation, and metrics.
    """

    def __init__(self, queue: JobQueue, num_workers: int = 4):
        self.queue = queue
        self.num_workers = num_workers
        self._workers: List[asyncio.Task] = []
        self._running = False

    async def start(self):
        """Start all workers."""
        if self._running:
            logger.warning("WorkerPool already running")
            return

        self._running = True
        logger.info(f"🚀 Starting WorkerPool with {self.num_workers} workers")

        for i in range(self.num_workers):
            worker = asyncio.create_task(self._worker_loop(i))
            self._workers.append(worker)

    async def stop(self):
        """Gracefully stop all workers."""
        logger.info("🛑 Stopping WorkerPool...")
        self._running = False

        for worker in self._workers:
            worker.cancel()

        await asyncio.gather(*self._workers, return_exceptions=True)
        self._workers.clear()
        logger.info("WorkerPool stopped")

    async def _worker_loop(self, worker_id: int):
        """Main loop for each worker — pull job, execute, report."""
        logger.info(f"  Worker-{worker_id} started")

        while self._running:
            try:
                job = await asyncio.wait_for(
                    self.queue.dequeue(), timeout=1.0
                )
            except asyncio.TimeoutError:
                continue
            except asyncio.CancelledError:
                break

            if job is None:
                continue

            self.queue._mark_running(job)
            logger.info(f"⚙️  Worker-{worker_id} executing: {job.name} ({job.id})")

            try:
                result = await job.func(**job.kwargs)
                self.queue._mark_completed(job, result)
                logger.info(
                    f"✅ Worker-{worker_id} completed: {job.name} "
                    f"({job.id}) in {job.duration:.2f}s"
                )
            except Exception as e:
                self.queue._mark_failed(job, str(e))
                logger.error(
                    f"❌ Worker-{worker_id} failed: {job.name} "
                    f"({job.id}): {e}"
                )

        logger.info(f"  Worker-{worker_id} stopped")

    @property
    def is_running(self) -> bool:
        return self._running
