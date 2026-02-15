"""
Engine Alto — CI/CD Orchestrator & Deployment Pipeline (Phase 11-12)
Automated build, test, deploy pipeline with rollback support.
"""

from __future__ import annotations
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional


class PipelineStage(Enum):
    LINT = "lint"
    BUILD = "build"
    TEST = "test"
    SECURITY_SCAN = "security_scan"
    PACKAGE = "package"
    DEPLOY_STAGING = "deploy_staging"
    INTEGRATION_TEST = "integration_test"
    DEPLOY_PRODUCTION = "deploy_production"
    ROLLBACK = "rollback"


class StageStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class StageResult:
    stage: PipelineStage
    status: StageStatus = StageStatus.PENDING
    duration_ms: float = 0.0
    output: str = ""
    error: Optional[str] = None
    started_at: Optional[float] = None
    completed_at: Optional[float] = None


@dataclass
class PipelineRun:
    id: str = field(default_factory=lambda: f"run-{uuid.uuid4().hex[:8]}")
    commit_sha: str = ""
    branch: str = "main"
    trigger: str = "push"
    stages: List[StageResult] = field(default_factory=list)
    created_at: float = field(default_factory=time.time)
    completed_at: Optional[float] = None

    @property
    def passed(self) -> bool:
        return all(s.status in (StageStatus.PASSED, StageStatus.SKIPPED) for s in self.stages)

    @property
    def duration_ms(self) -> float:
        return sum(s.duration_ms for s in self.stages)

    @property
    def current_stage(self) -> Optional[str]:
        for s in self.stages:
            if s.status == StageStatus.RUNNING:
                return s.stage.value
        return None


class DeploymentTarget:
    def __init__(self, name: str, url: str, env: str = "staging"):
        self.name = name
        self.url = url
        self.env = env
        self.current_version: Optional[str] = None
        self.previous_version: Optional[str] = None
        self.deployed_at: Optional[float] = None

    def deploy(self, version: str) -> None:
        self.previous_version = self.current_version
        self.current_version = version
        self.deployed_at = time.time()

    def rollback(self) -> bool:
        if self.previous_version:
            self.current_version = self.previous_version
            self.previous_version = None
            self.deployed_at = time.time()
            return True
        return False


class CICDOrchestrator:
    """Orchestrates build, test, and deploy pipelines."""

    DEFAULT_STAGES = [
        PipelineStage.LINT, PipelineStage.BUILD, PipelineStage.TEST,
        PipelineStage.SECURITY_SCAN, PipelineStage.PACKAGE,
    ]

    def __init__(self):
        self._runs: List[PipelineRun] = []
        self._targets: Dict[str, DeploymentTarget] = {}
        self._stage_handlers: Dict[PipelineStage, Callable] = {}

    def register_target(self, name: str, url: str, env: str = "staging") -> DeploymentTarget:
        target = DeploymentTarget(name=name, url=url, env=env)
        self._targets[name] = target
        return target

    def register_stage_handler(self, stage: PipelineStage, handler: Callable) -> None:
        self._stage_handlers[stage] = handler

    def create_run(self, commit_sha: str, branch: str = "main",
                   trigger: str = "push", stages: Optional[List[PipelineStage]] = None) -> PipelineRun:
        run = PipelineRun(commit_sha=commit_sha, branch=branch, trigger=trigger)
        for stage in (stages or self.DEFAULT_STAGES):
            run.stages.append(StageResult(stage=stage))
        self._runs.append(run)
        return run

    def execute_run(self, run: PipelineRun) -> bool:
        for stage_result in run.stages:
            stage_result.status = StageStatus.RUNNING
            stage_result.started_at = time.time()

            handler = self._stage_handlers.get(stage_result.stage)
            try:
                if handler:
                    output = handler(run, stage_result)
                    stage_result.output = str(output) if output else "OK"
                else:
                    stage_result.output = f"[mock] {stage_result.stage.value} passed"

                stage_result.status = StageStatus.PASSED
            except Exception as e:
                stage_result.status = StageStatus.FAILED
                stage_result.error = str(e)
                stage_result.completed_at = time.time()
                stage_result.duration_ms = (stage_result.completed_at - stage_result.started_at) * 1000
                run.completed_at = time.time()
                return False

            stage_result.completed_at = time.time()
            stage_result.duration_ms = (stage_result.completed_at - stage_result.started_at) * 1000

        run.completed_at = time.time()
        return True

    def deploy(self, target_name: str, version: str) -> bool:
        target = self._targets.get(target_name)
        if target:
            target.deploy(version)
            return True
        return False

    def rollback(self, target_name: str) -> bool:
        target = self._targets.get(target_name)
        if target:
            return target.rollback()
        return False

    def stats(self) -> Dict[str, Any]:
        return {
            "total_runs": len(self._runs),
            "passed": sum(1 for r in self._runs if r.passed),
            "failed": sum(1 for r in self._runs if not r.passed),
            "targets": {n: {"version": t.current_version, "env": t.env} for n, t in self._targets.items()},
        }
