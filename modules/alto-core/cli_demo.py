"""
Engine Alto — CLI Demo
Phase 1: Demonstrates the job queue, worker pool, and plugin system.

Usage: python cli_demo.py [--workers N] [--duration N]
"""

import asyncio
import argparse
import sys
import os

# Add parent to path so alto_core is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from alto_core import JobQueue, WorkerPool, PluginManager, logger


async def example_task(task_name: str = "default", delay: float = 1.0):
    """An example async task."""
    await asyncio.sleep(delay)
    return f"Task '{task_name}' completed after {delay}s"


async def main(num_workers: int = 2, duration: float = 8.0):
    print("=" * 55)
    print("⚡ Engine Alto — Phase 1 CLI Demo")
    print("=" * 55)
    print()

    # 1. Initialize components
    queue = JobQueue()
    pool = WorkerPool(queue, num_workers=num_workers)

    plugins_dir = os.path.join(os.path.dirname(__file__), "plugins")
    plugin_mgr = PluginManager(plugins_dir=plugins_dir)

    # 2. Load plugins
    print("--- Loading Plugins ---")
    results = plugin_mgr.load_all()
    for name, success in results.items():
        status = "✅" if success else "❌"
        print(f"  {status} {name}")
    print()

    # 3. Fire startup hooks
    print("--- Firing Startup Hooks ---")
    hook_results = await plugin_mgr.emit_hook("on_startup", phase="demo")
    for r in hook_results:
        print(f"  Hook result: {r}")
    print()

    # 4. Start worker pool
    print(f"--- Starting {num_workers} Workers ---")
    await pool.start()
    print()

    # 5. Enqueue jobs
    print("--- Enqueuing Jobs ---")

    # Import the plugin's heartbeat job
    from plugins.sample_plugin import heartbeat_job

    await queue.enqueue(example_task, name="Build UI", priority=5, task_name="build-ui", delay=1.0)
    await queue.enqueue(example_task, name="Train Model", priority=10, task_name="train-model", delay=1.5)
    await queue.enqueue(example_task, name="Run Tests", priority=3, task_name="run-tests", delay=0.8)
    await queue.enqueue(heartbeat_job, name="Plugin Heartbeat", priority=1, message="Alto alive")
    await queue.enqueue(example_task, name="Deploy Preview", priority=7, task_name="deploy", delay=0.5)
    print()

    # 6. Run for specified duration
    print(f"--- Running for {duration}s ---")
    await asyncio.sleep(duration)

    # 7. Print metrics
    print()
    print("--- Final Metrics ---")
    metrics = queue.get_metrics()
    for key, value in metrics.items():
        print(f"  {key}: {value}")
    print()

    # 8. Print job results
    print("--- Job Results ---")
    for job in queue.list_jobs():
        status_icon = {
            "completed": "✅",
            "failed": "❌",
            "waiting": "⏳",
            "active": "⚙️",
            "cancelled": "🚫",
        }.get(job.status.value, "❓")

        duration_str = f" ({job.duration:.2f}s)" if job.duration else ""
        result_str = f" → {job.result}" if job.result else ""
        error_str = f" ⚠️ {job.error}" if job.error else ""
        print(f"  {status_icon} {job.name}{duration_str}{result_str}{error_str}")

    print()

    # 9. Shutdown
    print("--- Shutting Down ---")
    await pool.stop()
    plugin_mgr.unload("sample_plugin")
    print()

    print("✅ Phase 1 CLI Demo Complete")
    print(f"   Plugins loaded: {plugin_mgr.loaded_count}")
    print(f"   Jobs succeeded: {metrics['succeeded']}")
    print(f"   Jobs failed: {metrics['failed']}")
    print()
    print("ALTO READY")

    return metrics["failed"] == 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Engine Alto CLI Demo")
    parser.add_argument("--workers", type=int, default=2, help="Number of workers")
    parser.add_argument("--duration", type=float, default=8.0, help="Run duration in seconds")
    args = parser.parse_args()

    success = asyncio.run(main(num_workers=args.workers, duration=args.duration))
    sys.exit(0 if success else 1)
