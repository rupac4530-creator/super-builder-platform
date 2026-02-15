"""
Engine Alto — Core Module
Phase 1: Job system, plugin API, and structured logging.
"""

__version__ = "0.1.0"
__all__ = ["JobQueue", "WorkerPool", "PluginManager", "logger"]

from .job_queue import JobQueue, WorkerPool, Job
from .plugin_manager import PluginManager
from .logger import logger, setup_logging
