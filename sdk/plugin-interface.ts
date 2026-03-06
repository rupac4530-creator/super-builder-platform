/**
 * SuperBuilder Plugin Interface
 * Implement this interface to create a plugin.
 */

export interface PluginContext {
  api: {
    get(endpoint: string): Promise<any>;
    post(endpoint: string, body: any): Promise<any>;
  };
  logger: {
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
  };
  storage: {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
  };
  config: Record<string, any>;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  execute(input: any): Promise<any>;
}

export interface Route {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  handler(req: any, res: any): Promise<void>;
}

export interface Component {
  id: string;
  name: string;
  type: 'page' | 'widget' | 'panel';
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  main: string;
  capabilities: string[];
  config?: Record<string, { type: string; description: string; required?: boolean }>;
}

export interface SuperBuilderPlugin {
  name: string;
  version: string;
  description: string;
  onLoad(context: PluginContext): Promise<void>;
  onUnload(): Promise<void>;
  getTools?(): Tool[];
  getRoutes?(): Route[];
  getComponents?(): Component[];
}
