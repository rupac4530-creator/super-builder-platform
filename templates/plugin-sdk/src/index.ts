/**
 * Super Builder Plugin SDK
 *
 * Build extensions for the Super Builder Platform.
 * Plugins run inside a sandboxed environment (vm2 + WASM)
 * with fine-grained permissions.
 *
 * @example
 * ```ts
 * import { definePlugin, PluginContext } from 'superbuilder-plugin-sdk';
 *
 * export default definePlugin({
 *   name: 'my-cool-filter',
 *   version: '1.0.0',
 *   type: 'filter',
 *   permissions: ['read:canvas', 'write:canvas'],
 *
 *   async activate(ctx: PluginContext) {
 *     ctx.registerFilter('vintage', async (frame) => {
 *       // Apply vintage effect
 *       return applySepia(frame, 0.6);
 *     });
 *   },
 *
 *   async deactivate(ctx: PluginContext) {
 *     ctx.log('Plugin deactivated');
 *   },
 * });
 * ```
 */

// ── Plugin Types ─────────────────────────────────────────────

export type PluginType =
  | 'filter'       // Image/video filters and effects
  | 'exporter'     // Export to custom formats
  | 'importer'     // Import from custom sources
  | 'ai-agent'     // AI agent plugin
  | 'template'     // Project template
  | 'tool'         // Canvas/editor tool
  | 'integration'  // Third-party integration
  | 'theme';       // UI theme

export type Permission =
  | 'read:canvas'
  | 'write:canvas'
  | 'read:project'
  | 'write:project'
  | 'read:assets'
  | 'write:assets'
  | 'network:http'
  | 'storage:local'
  | 'ai:invoke'
  | 'ui:panel'
  | 'ui:toolbar';

// ── Plugin Definition ────────────────────────────────────────

export interface PluginManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  type: PluginType;
  permissions: Permission[];
  icon?: string;
  homepage?: string;
  minPlatformVersion?: string;
}

export interface PluginContext {
  /** Plugin metadata */
  manifest: PluginManifest;

  /** Structured logging */
  log: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, data?: Record<string, unknown>) => void;

  /** Register a filter effect */
  registerFilter: (name: string, handler: FilterHandler) => void;

  /** Register an exporter */
  registerExporter: (format: string, handler: ExporterHandler) => void;

  /** Register a canvas tool */
  registerTool: (name: string, handler: ToolHandler) => void;

  /** Register a UI panel */
  registerPanel: (config: PanelConfig) => void;

  /** Access project data (requires read:project) */
  getProjectData: () => Promise<ProjectData>;

  /** Access assets (requires read:assets) */
  listAssets: () => Promise<AssetInfo[]>;

  /** Invoke AI model (requires ai:invoke) */
  invokeAI: (prompt: string, options?: AIOptions) => Promise<string>;

  /** Local storage for plugin data (requires storage:local) */
  storage: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };

  /** HTTP requests (requires network:http) */
  fetch: (url: string, options?: RequestInit) => Promise<Response>;
}

// ── Handler Types ────────────────────────────────────────────

export interface FrameData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  format: 'rgba' | 'rgb';
}

export type FilterHandler = (
  frame: FrameData,
  params?: Record<string, number | string | boolean>
) => Promise<FrameData>;

export interface ExportResult {
  data: Buffer | Uint8Array;
  mimeType: string;
  extension: string;
}

export type ExporterHandler = (
  projectData: ProjectData,
  options?: Record<string, unknown>
) => Promise<ExportResult>;

export interface ToolConfig {
  cursor?: string;
  shortcut?: string;
}

export type ToolHandler = {
  onPointerDown?: (x: number, y: number, ctx: PluginContext) => void;
  onPointerMove?: (x: number, y: number, ctx: PluginContext) => void;
  onPointerUp?: (x: number, y: number, ctx: PluginContext) => void;
  config?: ToolConfig;
};

export interface PanelConfig {
  id: string;
  title: string;
  position: 'left' | 'right' | 'bottom';
  render: () => string; // HTML content
  width?: number;
  height?: number;
}

// ── Data Types ───────────────────────────────────────────────

export interface ProjectData {
  id: string;
  name: string;
  type: string;
  files: { path: string; content: string }[];
  metadata: Record<string, unknown>;
}

export interface AssetInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  metadata: Record<string, unknown>;
}

export interface AIOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// ── Plugin Definition Helper ─────────────────────────────────

export interface PluginDefinition extends PluginManifest {
  activate: (ctx: PluginContext) => Promise<void>;
  deactivate?: (ctx: PluginContext) => Promise<void>;
}

/**
 * Define a Super Builder plugin.
 *
 * @param definition - Plugin definition with manifest and lifecycle hooks
 * @returns The plugin definition (for type checking)
 */
export function definePlugin(definition: PluginDefinition): PluginDefinition {
  // Validation
  if (!definition.name) throw new Error('Plugin name is required');
  if (!definition.version) throw new Error('Plugin version is required');
  if (!definition.type) throw new Error('Plugin type is required');
  if (!definition.permissions) definition.permissions = [];
  if (!definition.activate) throw new Error('Plugin activate function is required');

  return definition;
}

// ── Plugin Lifecycle ─────────────────────────────────────────

export enum PluginState {
  Inactive = 'inactive',
  Activating = 'activating',
  Active = 'active',
  Deactivating = 'deactivating',
  Error = 'error',
}

export interface PluginInstance {
  definition: PluginDefinition;
  state: PluginState;
  error?: Error;
  activatedAt?: Date;
}
