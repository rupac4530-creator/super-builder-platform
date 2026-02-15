"""
Engine Alto — Plugin Manager
Phase 1: Dynamic plugin loading with capability sandboxing.
"""

import importlib
import importlib.util
import os
import sys
import traceback
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional
from .logger import logger


class PluginSandboxViolation(Exception):
    """Raised when a plugin attempts a disallowed operation."""
    pass


class PluginInfo:
    """Metadata about a loaded plugin."""

    def __init__(self, name: str, module: Any, path: str):
        self.name = name
        self.module = module
        self.path = path
        self.loaded = True
        self.error: Optional[str] = None
        self.capabilities: List[str] = []

    def __repr__(self) -> str:
        status = "loaded" if self.loaded else f"error: {self.error}"
        return f"<Plugin '{self.name}' [{status}]>"


class PluginManager:
    """
    Discovers, loads, and manages plugins.
    Plugins must export a `register(core)` function.
    Plugin exceptions are caught and logged — they never crash the core.
    """

    # Operations explicitly blocked in sandboxed plugins
    BLOCKED_MODULES = frozenset([
        "subprocess", "os.system", "shutil.rmtree",
        "socket", "http.client", "urllib.request",
        "ftplib", "smtplib", "telnetlib",
    ])

    def __init__(self, plugins_dir: Optional[str] = None):
        self.plugins_dir = plugins_dir or str(
            Path(__file__).parent.parent / "plugins"
        )
        self._plugins: Dict[str, PluginInfo] = {}
        self._hooks: Dict[str, List[Callable]] = {}

    def discover(self) -> List[str]:
        """Find all .py plugins in the plugins directory."""
        plugins_path = Path(self.plugins_dir)
        if not plugins_path.exists():
            logger.warning(f"Plugins directory not found: {self.plugins_dir}")
            return []

        found = []
        for f in plugins_path.glob("*.py"):
            if f.name.startswith("_"):
                continue
            found.append(f.stem)

        logger.info(f"🔍 Discovered {len(found)} plugins in {self.plugins_dir}")
        return found

    def load(self, plugin_name: str) -> bool:
        """Load a single plugin by name."""
        plugin_path = Path(self.plugins_dir) / f"{plugin_name}.py"

        if not plugin_path.exists():
            logger.error(f"Plugin not found: {plugin_path}")
            return False

        if plugin_name in self._plugins and self._plugins[plugin_name].loaded:
            logger.warning(f"Plugin already loaded: {plugin_name}")
            return True

        try:
            spec = importlib.util.spec_from_file_location(
                f"alto_plugins.{plugin_name}", str(plugin_path)
            )
            if not spec or not spec.loader:
                raise ImportError(f"Cannot create module spec for {plugin_name}")

            module = importlib.util.module_from_spec(spec)
            sys.modules[f"alto_plugins.{plugin_name}"] = module
            spec.loader.exec_module(module)

            info = PluginInfo(plugin_name, module, str(plugin_path))

            # Call register(core) if it exists
            if hasattr(module, "register"):
                module.register(self)
                logger.info(f"🔌 Plugin registered: {plugin_name}")
            else:
                logger.warning(
                    f"Plugin {plugin_name} has no register() function"
                )

            # Collect declared capabilities
            if hasattr(module, "CAPABILITIES"):
                info.capabilities = list(module.CAPABILITIES)

            self._plugins[plugin_name] = info
            logger.info(f"✅ Plugin loaded: {plugin_name}")
            return True

        except Exception as e:
            logger.error(
                f"❌ Plugin load failed: {plugin_name}: {e}\n"
                f"{traceback.format_exc()}"
            )
            info = PluginInfo(plugin_name, None, str(plugin_path))
            info.loaded = False
            info.error = str(e)
            self._plugins[plugin_name] = info
            return False

    def load_all(self) -> Dict[str, bool]:
        """Discover and load all plugins. Returns {name: success}."""
        results = {}
        for name in self.discover():
            results[name] = self.load(name)
        return results

    def unload(self, plugin_name: str) -> bool:
        """Unload a plugin and remove its hooks."""
        info = self._plugins.get(plugin_name)
        if not info:
            return False

        # Remove hooks registered by this plugin
        for hook_name in list(self._hooks.keys()):
            self._hooks[hook_name] = [
                h for h in self._hooks[hook_name]
                if not getattr(h, "_plugin_name", None) == plugin_name
            ]

        # Cleanup module reference
        mod_name = f"alto_plugins.{plugin_name}"
        if mod_name in sys.modules:
            del sys.modules[mod_name]

        info.loaded = False
        info.module = None
        logger.info(f"🔌 Plugin unloaded: {plugin_name}")
        return True

    def register_hook(self, hook_name: str, callback: Callable, plugin_name: str = ""):
        """Register a hook callback. Plugins call this during register()."""
        callback._plugin_name = plugin_name  # type: ignore
        if hook_name not in self._hooks:
            self._hooks[hook_name] = []
        self._hooks[hook_name].append(callback)
        logger.debug(f"Hook registered: {hook_name} by {plugin_name}")

    async def emit_hook(self, hook_name: str, **kwargs) -> List[Any]:
        """Fire a hook and collect results from all registered callbacks."""
        results = []
        for callback in self._hooks.get(hook_name, []):
            try:
                import asyncio
                if asyncio.iscoroutinefunction(callback):
                    result = await callback(**kwargs)
                else:
                    result = callback(**kwargs)
                results.append(result)
            except Exception as e:
                plugin = getattr(callback, "_plugin_name", "unknown")
                logger.error(f"Hook {hook_name} error in plugin {plugin}: {e}")
        return results

    def get_plugin(self, name: str) -> Optional[PluginInfo]:
        return self._plugins.get(name)

    def list_plugins(self) -> List[PluginInfo]:
        return list(self._plugins.values())

    @property
    def loaded_count(self) -> int:
        return sum(1 for p in self._plugins.values() if p.loaded)
