"""
Engine Alto — Structured Logger
Thread-safe, JSON-capable logging with context injection.
"""

import logging
import json
import sys
from datetime import datetime, timezone
from typing import Optional


class AltoFormatter(logging.Formatter):
    """JSON-structured log formatter for production; human-readable for dev."""

    def __init__(self, json_mode: bool = False):
        super().__init__()
        self.json_mode = json_mode

    def format(self, record: logging.LogRecord) -> str:
        if self.json_mode:
            log_entry = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "level": record.levelname,
                "module": record.module,
                "function": record.funcName,
                "line": record.lineno,
                "message": record.getMessage(),
            }
            if record.exc_info and record.exc_info[1]:
                log_entry["exception"] = str(record.exc_info[1])
            return json.dumps(log_entry)
        else:
            ts = datetime.now().strftime("%H:%M:%S")
            level_icons = {
                "DEBUG": "🔍",
                "INFO": "ℹ️ ",
                "WARNING": "⚠️ ",
                "ERROR": "❌",
                "CRITICAL": "🔥",
            }
            icon = level_icons.get(record.levelname, "  ")
            return f"{ts} {icon} [{record.levelname:8s}] {record.module}: {record.getMessage()}"


def setup_logging(
    level: int = logging.INFO,
    json_mode: bool = False,
    name: str = "alto",
) -> logging.Logger:
    """Configure and return the alto logger."""
    _logger = logging.getLogger(name)
    _logger.setLevel(level)

    if not _logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(AltoFormatter(json_mode=json_mode))
        _logger.addHandler(handler)

    return _logger


# Default logger instance
logger = setup_logging()
