"""
Script Engine — execute user-provided scripts in sandboxed environments.
Supports Python code execution with capability enforcement.
"""

from __future__ import annotations
import ast
import time
import traceback
from dataclasses import dataclass, field
from typing import Any, Dict, Optional

from .sandbox import Sandbox, SandboxPolicy, Capability


@dataclass
class ScriptResult:
    success: bool
    output: Any = None
    error: Optional[str] = None
    duration_ms: float = 0.0
    violations: int = 0
    sandbox_stats: Dict[str, Any] = field(default_factory=dict)


class ScriptEngine:
    """Execute scripts within sandboxed capability boundaries."""

    # Dangerous AST node types that are always blocked
    BLOCKED_NODES = {
        ast.Import, ast.ImportFrom,  # controlled via capabilities
    }

    BLOCKED_BUILTINS = {
        "exec", "eval", "compile", "__import__",
        "open", "input", "breakpoint",
    }

    def __init__(self, default_policy: Optional[SandboxPolicy] = None):
        self.default_policy = default_policy or SandboxPolicy(
            name="default",
            capabilities=Capability.SYSTEM_INFO,
            max_cpu_seconds=10.0,
        )

    def validate_ast(self, source: str, policy: SandboxPolicy) -> Optional[str]:
        """Static analysis: reject dangerous patterns before execution."""
        try:
            tree = ast.parse(source)
        except SyntaxError as e:
            return f"Syntax error: {e}"

        for node in ast.walk(tree):
            if type(node) in self.BLOCKED_NODES:
                if not policy.allows(Capability.PLUGIN_LOAD):
                    return f"Import statements require PLUGIN_LOAD capability (line {getattr(node, 'lineno', '?')})"

            # Check for eval/exec calls
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id in ("eval", "exec"):
                    if not policy.allow_eval:
                        return f"eval/exec blocked by policy (line {node.lineno})"

        return None  # Valid

    def execute(
        self, source: str, policy: Optional[SandboxPolicy] = None,
        globals_extra: Optional[Dict[str, Any]] = None
    ) -> ScriptResult:
        """Execute a script string within a sandbox."""
        policy = policy or self.default_policy

        # AST validation
        validation_error = self.validate_ast(source, policy)
        if validation_error:
            return ScriptResult(success=False, error=validation_error)

        sandbox = Sandbox(policy)

        # Build restricted globals
        safe_globals: Dict[str, Any] = {"__builtins__": {}}
        # Allow safe builtins
        import builtins
        for name in dir(builtins):
            if name not in self.BLOCKED_BUILTINS and not name.startswith("_"):
                safe_globals["__builtins__"][name] = getattr(builtins, name)

        # Inject sandbox reference and safe utilities
        safe_globals["__sandbox__"] = sandbox
        safe_globals["__result__"] = None

        if globals_extra:
            safe_globals.update(globals_extra)

        start = time.perf_counter()
        try:
            with sandbox:
                compiled = compile(source, f"<sandbox:{policy.name}>", "exec")
                exec(compiled, safe_globals)

            duration_ms = (time.perf_counter() - start) * 1000
            return ScriptResult(
                success=sandbox.is_clean,
                output=safe_globals.get("__result__"),
                duration_ms=round(duration_ms, 2),
                violations=sandbox.violation_count,
                sandbox_stats=sandbox.stats(),
            )

        except Exception as e:
            duration_ms = (time.perf_counter() - start) * 1000
            sandbox.exit()
            return ScriptResult(
                success=False,
                error=f"{type(e).__name__}: {e}",
                duration_ms=round(duration_ms, 2),
                violations=sandbox.violation_count,
                sandbox_stats=sandbox.stats(),
            )

    def execute_safe(self, source: str, **kwargs) -> ScriptResult:
        """Execute with the most restrictive read-only policy."""
        policy = SandboxPolicy(
            name="safe-exec",
            capabilities=Capability.READ_ONLY(),
            max_cpu_seconds=5.0,
            max_memory_mb=128,
            allow_eval=False,
        )
        return self.execute(source, policy=policy, **kwargs)
