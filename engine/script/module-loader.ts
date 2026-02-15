/**
 * Engine Alto — Module Loader
 * Loads, caches, and resolves modules with hot-reload support.
 */

export interface LoadedModule {
  id: string;
  path: string;
  exports: any;
  dependencies: string[];
  loadedAt: Date;
  size: number;
  hotReloadable: boolean;
}

export class ModuleLoader {
  private modules: Map<string, LoadedModule> = new Map();
  private resolveOrder: string[] = [];

  load(path: string, source: string, dependencies: string[] = []): string {
    const id = `module-${path.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const moduleObj = { exports: {} };

    try {
      const fn = new Function('module', 'exports', source);
      fn(moduleObj, moduleObj.exports);
    } catch { /* load error */ }

    this.modules.set(id, {
      id, path, exports: moduleObj.exports, dependencies,
      loadedAt: new Date(), size: source.length, hotReloadable: true,
    });
    this.resolveOrder.push(id);
    return id;
  }

  resolve(moduleId: string): any {
    const mod = this.modules.get(moduleId);
    return mod ? mod.exports : null;
  }

  reload(moduleId: string, newSource: string): boolean {
    const mod = this.modules.get(moduleId);
    if (!mod || !mod.hotReloadable) return false;

    const moduleObj = { exports: {} };
    try {
      const fn = new Function('module', 'exports', newSource);
      fn(moduleObj, moduleObj.exports);
      mod.exports = moduleObj.exports;
      mod.loadedAt = new Date();
      mod.size = newSource.length;
      return true;
    } catch { return false; }
  }

  unload(moduleId: string): boolean { return this.modules.delete(moduleId); }

  getStatus() {
    return {
      loaded: this.modules.size,
      totalSize: Array.from(this.modules.values()).reduce((s, m) => s + m.size, 0),
      resolveOrder: this.resolveOrder.length,
    };
  }
}

export const moduleLoader = new ModuleLoader();
