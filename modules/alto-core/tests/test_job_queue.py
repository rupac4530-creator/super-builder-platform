"""
Engine Alto — Job Queue Unit Tests
"""

import asyncio
import pytest
from alto_core.job_queue import JobQueue, WorkerPool, Job, JobStatus


@pytest.fixture
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.mark.asyncio
async def test_enqueue_job():
    """Jobs can be enqueued and appear in the queue."""
    queue = JobQueue()

    async def dummy(): return "ok"

    job = await queue.enqueue(dummy, name="test-job", priority=5)
    assert job.id.startswith("job_")
    assert job.name == "test-job"
    assert job.status == JobStatus.WAITING
    assert job.priority == 5
    assert queue.pending_count == 1


@pytest.mark.asyncio
async def test_priority_ordering():
    """Higher-priority jobs are dequeued first."""
    queue = JobQueue()

    async def dummy(): return "ok"

    await queue.enqueue(dummy, name="low", priority=1)
    await queue.enqueue(dummy, name="high", priority=10)
    await queue.enqueue(dummy, name="medium", priority=5)

    job1 = await queue.dequeue()
    job2 = await queue.dequeue()
    job3 = await queue.dequeue()

    assert job1.name == "high"
    assert job2.name == "medium"
    assert job3.name == "low"


@pytest.mark.asyncio
async def test_job_completion():
    """Worker pool processes and completes jobs."""
    queue = JobQueue()
    pool = WorkerPool(queue, num_workers=2)

    results = []

    async def task(value: int):
        await asyncio.sleep(0.1)
        results.append(value)
        return value * 2

    await queue.enqueue(task, name="task-1", value=10)
    await queue.enqueue(task, name="task-2", value=20)

    await pool.start()
    await asyncio.sleep(1.5)  # Let jobs complete
    await pool.stop()

    assert 10 in results
    assert 20 in results

    metrics = queue.get_metrics()
    assert metrics["succeeded"] == 2
    assert metrics["failed"] == 0


@pytest.mark.asyncio
async def test_job_failure():
    """Failed jobs are tracked in metrics."""
    queue = JobQueue()
    pool = WorkerPool(queue, num_workers=1)

    async def failing_task():
        raise ValueError("intentional failure")

    await queue.enqueue(failing_task, name="fail-task")

    await pool.start()
    await asyncio.sleep(1.0)
    await pool.stop()

    metrics = queue.get_metrics()
    assert metrics["failed"] == 1
    assert metrics["succeeded"] == 0

    jobs = queue.list_jobs(JobStatus.FAILED)
    assert len(jobs) == 1
    assert "intentional failure" in jobs[0].error


@pytest.mark.asyncio
async def test_cancel_job():
    """Waiting jobs can be cancelled."""
    queue = JobQueue()

    async def dummy(): return "ok"

    job = await queue.enqueue(dummy, name="cancel-me")
    assert queue.cancel_job(job.id) is True
    assert job.status == JobStatus.CANCELLED

    metrics = queue.get_metrics()
    assert metrics["cancelled"] == 1


@pytest.mark.asyncio
async def test_metrics():
    """Metrics accurately track job states."""
    queue = JobQueue()

    async def fast_task(): return "done"

    pool = WorkerPool(queue, num_workers=1)
    await pool.start()

    for i in range(5):
        await queue.enqueue(fast_task, name=f"task-{i}")

    await asyncio.sleep(2.0)
    await pool.stop()

    metrics = queue.get_metrics()
    assert metrics["succeeded"] == 5
    assert metrics["queued"] == 5
    assert metrics["running"] == 0


@pytest.mark.asyncio
async def test_worker_pool_lifecycle():
    """Worker pool starts and stops cleanly."""
    queue = JobQueue()
    pool = WorkerPool(queue, num_workers=3)

    assert pool.is_running is False
    await pool.start()
    assert pool.is_running is True
    await pool.stop()
    assert pool.is_running is False
