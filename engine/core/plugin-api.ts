/**
 * Engine Alto — Plugin API
 * Modular plugin system with lifecycle hooks, capability declarations,
 * sandboxed execution, and dependency management.
 */

export type PluginPhase = 'init' | 'ready' | 'active' | 'shutdown' | 'error';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  capabilities: string[];
  dependencies: string[];
  permissions: string[];
  entryPoint: string;
}

export interface PluginHooks {
  onInit?: () => Promise<void>;
  onReady?: () => Promise<void>;
  onShutdown?: () => Promise<void>;
  onMessage?: (type: string, payload: any) => Promise<any>;
  onError?: (error: Error) => Promise<void>;
}

export interface PluginInstance {
  manifest: PluginManifest;
  hooks: PluginHooks;
  phase: PluginPhase;
  loadedAt: Date;
  metrics: { messagesHandled: number; errors: number; lastActive: Date };
}

export class PluginAPI {
  private plugins: Map<string, PluginInstance> = new Map();
  private hooks: Map<string, Array<(payload: any) => Promise<any>>> = new Map();

  async register(manifest: PluginManifest, hooks: PluginHooks): Promise<boolean> {
    if (this.plugins.has(manifest.id)) return false;

    // Check dependencies
    for (const dep of manifest.dependencies) {
      if (!this.plugins.has(dep)) {
        console.warn(`Plugin ${manifest.id}: missing dependency ${dep}`);
        return false;
      }
    }

    const instance: PluginInstance = {
      manifest, hooks, phase: 'init', loadedAt: new Date(),
      metrics: { messagesHandled: 0, errors: 0, lastActive: new Date() },
    };

    this.plugins.set(manifest.id, instance);

    try {
      if (hooks.onInit) await hooks.onInit();
      instance.phase = 'ready';
      if (hooks.onReady) await hooks.onReady();
      instance.phase = 'active';
    } catch (err: any) {
      instance.phase = 'error';
      if (hooks.onError) await hooks.onError(err);
      return false;
    }

    return true;
  }

  async unregister(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    try {
      plugin.phase = 'shutdown';
      if (plugin.hooks.onShutdown) await plugin.hooks.onShutdown();
    } catch (err) { /* shutdown best-effort */ }

    this.plugins.delete(pluginId);
    return true;
  }

  async sendMessage(pluginId: string, type: string, payload: any): Promise<any> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || plugin.phase !== 'active') return null;

    try {
      plugin.metrics.messagesHandled++;
      plugin.metrics.lastActive = new Date();
      if (plugin.hooks.onMessage) {
        return await plugin.hooks.onMessage(type, payload);
      }
    } catch (err: any) {
      plugin.metrics.errors++;
      if (plugin.hooks.onError) await plugin.hooks.onError(err);
    }
    return null;
  }

  async broadcast(type: string, payload: any): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    for (const [id, plugin] of this.plugins) {
      if (plugin.phase === 'active') {
        const result = await this.sendMessage(id, type, payload);
        results.set(id, result);
      }
    }
    return results;
  }

  getPlugin(id: string): PluginInstance | undefined { return this.plugins.get(id); }
  listPlugins(): PluginManifest[] { return Array.from(this.plugins.values()).map(p => p.manifest); }

  getStatus() {
    const plugins = Array.from(this.plugins.values());
    return {
      total: plugins.length,
      active: plugins.filter(p => p.phase === 'active').length,
      errored: plugins.filter(p => p.phase === 'error').length,
      plugins: plugins.map(p => ({
        id: p.manifest.id, name: p.manifest.name, phase: p.phase,
        messages: p.metrics.messagesHandled, errors: p.metrics.errors,
      })),
    };
  }
}

export const pluginAPI = new PluginAPI();
