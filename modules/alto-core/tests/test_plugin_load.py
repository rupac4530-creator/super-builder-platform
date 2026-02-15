"""
Engine Alto — Plugin Manager Unit Tests
"""

import asyncio
import os
import sys
import pytest

# Ensure alto_core is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from alto_core.plugin_manager import PluginManager


@pytest.fixture
def plugins_dir():
    return os.path.join(os.path.dirname(__file__), "..", "plugins")


def test_discover_plugins(plugins_dir):
    """Discovers .py files in the plugins directory."""
    mgr = PluginManager(plugins_dir=plugins_dir)
    found = mgr.discover()
    assert "sample_plugin" in found


def test_load_plugin(plugins_dir):
    """Plugin loads and registers without error."""
    mgr = PluginManager(plugins_dir=plugins_dir)
    success = mgr.load("sample_plugin")
    assert success is True
    assert mgr.loaded_count == 1

    info = mgr.get_plugin("sample_plugin")
    assert info is not None
    assert info.loaded is True
    assert "demo" in info.capabilities


def test_load_all(plugins_dir):
    """load_all discovers and loads all plugins."""
    mgr = PluginManager(plugins_dir=plugins_dir)
    results = mgr.load_all()
    assert "sample_plugin" in results
    assert results["sample_plugin"] is True


def test_unload_plugin(plugins_dir):
    """Plugin can be unloaded cleanly."""
    mgr = PluginManager(plugins_dir=plugins_dir)
    mgr.load("sample_plugin")
    assert mgr.loaded_count == 1

    mgr.unload("sample_plugin")
    info = mgr.get_plugin("sample_plugin")
    assert info.loaded is False


def test_load_nonexistent(plugins_dir):
    """Loading a nonexistent plugin returns False."""
    mgr = PluginManager(plugins_dir=plugins_dir)
    success = mgr.load("nonexistent_plugin")
    assert success is False


@pytest.mark.asyncio
async def test_hook_registration_and_emit(plugins_dir):
    """Plugins can register and fire hooks."""
    mgr = PluginManager(plugins_dir=plugins_dir)
    mgr.load("sample_plugin")

    results = await mgr.emit_hook("on_startup", phase="test")
    assert len(results) > 0
    assert results[0]["plugin"] == "sample_plugin"
    assert results[0]["status"] == "ready"


@pytest.mark.asyncio
async def test_hook_error_isolation(plugins_dir):
    """Hook errors are caught and don't crash the system."""
    mgr = PluginManager(plugins_dir=plugins_dir)

    def bad_hook(**kwargs):
        raise RuntimeError("hook failure")

    mgr.register_hook("test_hook", bad_hook, plugin_name="bad")

    # Should not raise
    results = await mgr.emit_hook("test_hook")
    assert len(results) == 0  # Error caught, no result returned


def test_list_plugins(plugins_dir):
    """list_plugins returns all loaded plugins."""
    mgr = PluginManager(plugins_dir=plugins_dir)
    mgr.load_all()
    plugins = mgr.list_plugins()
    assert len(plugins) >= 1
    assert any(p.name == "sample_plugin" for p in plugins)
