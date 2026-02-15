# alto-core — Engine Kernel

## Overview

The core runtime module for Engine Alto. Provides:

- **JobQueue** — Priority-based async job queue
- **WorkerPool** — Configurable pool of async workers  
- **PluginManager** — Dynamic plugin discovery, loading, and hook system
- **Logger** — Structured logging (JSON or human-readable)

## API Reference

### JobQueue

```python
from alto_core import JobQueue

queue = JobQueue()

# Enqueue a job (async)
job = await queue.enqueue(my_func, name="build", priority=5, arg1="val")

# Get job status
job = queue.get_job(job.id)

# Cancel a waiting job
queue.cancel_job(job.id)

# Get queue metrics
metrics = queue.get_metrics()
# → {"queued": 5, "running": 1, "succeeded": 3, "failed": 0, "cancelled": 1}

# List jobs by status
completed = queue.list_jobs(JobStatus.COMPLETED)
```

### WorkerPool

```python
from alto_core import WorkerPool

pool = WorkerPool(queue, num_workers=4)
await pool.start()    # Start processing jobs
await pool.stop()     # Graceful shutdown
```

### PluginManager

```python
from alto_core import PluginManager

mgr = PluginManager(plugins_dir="./plugins")
mgr.load_all()                              # Discover and load all
mgr.load("sample_plugin")                   # Load one
await mgr.emit_hook("on_startup", phase=1)  # Fire hooks
mgr.unload("sample_plugin")                 # Clean unload
```

### Writing a Plugin

Create `plugins/my_plugin.py`:

```python
CAPABILITIES = ["my_feature"]

def register(core):
    core.register_hook("on_startup", on_start, plugin_name="my_plugin")

def on_start(**kwargs):
    return {"ready": True}
```

## Running

```bash
# Install
pip install -e ".[test]"

# Run CLI demo
python cli_demo.py --workers 2 --duration 8

# Run tests
pytest tests/ -v
```

## Architecture

```
JobQueue (priority PQ)
    ↓ dequeue
WorkerPool (N async workers)
    ↓ execute
Job.func(**kwargs)
    ↓ result/error
Metrics & Audit
```
