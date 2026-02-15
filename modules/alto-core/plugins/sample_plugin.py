"""
Engine Alto — Sample Plugin
Demonstrates the plugin API: registers a hook and schedules periodic jobs.
"""

CAPABILITIES = ["demo", "logging"]


async def heartbeat_job(message: str = "Alto pulse"):
    """A simple periodic job that logs a heartbeat."""
    import asyncio
    await asyncio.sleep(0.5)  # Simulate work
    return f"plugin-run: {message} at {__import__('time').time():.0f}"


def on_startup(**kwargs):
    """Hook callback triggered on system startup."""
    print(f"  [sample_plugin] on_startup hook fired! kwargs={kwargs}")
    return {"plugin": "sample_plugin", "status": "ready"}


def register(core):
    """
    Called by PluginManager when this plugin is loaded.

    Args:
        core: PluginManager instance — use to register hooks.
    """
    print(f"  [sample_plugin] Registering with core...")
    core.register_hook("on_startup", on_startup, plugin_name="sample_plugin")
    print(f"  [sample_plugin] Registered 'on_startup' hook")
    print(f"  [sample_plugin] Registration complete ✅")
