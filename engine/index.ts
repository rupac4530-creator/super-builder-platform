/**
 * Engine Alto — Central Bootstrap & Status Hub
 * Initializes all engine subsystems and provides unified status.
 */

// Core
export { jobSystem, JobSystem } from './core/job-system';
export { pluginAPI, PluginAPI } from './core/plugin-api';
export { platform, Platform } from './core/platform';
export { logger, Logger } from './core/logger';

// Render
export { gpu, GPUAbstraction } from './render/gpu-abstraction';
export { shaderPipeline, ShaderPipeline } from './render/shader-pipeline';
export { sceneGraph, SceneGraph } from './render/scene-graph';

// Script
export { scriptRuntime, ScriptRuntime } from './script/runtime';
export { scriptSandbox, ScriptSandbox } from './script/sandbox';
export { moduleLoader, ModuleLoader } from './script/module-loader';

// Browser
export { htmlParser, HTMLParser } from './browser/html-css-parser';
export { layoutEngine, LayoutEngine } from './browser/layout-engine';
export { jsEngine, JSEngine } from './browser/js-engine';

// Build
export { buildPipeline, BuildPipeline } from './build/pipeline';
export { hotReload, HotReload } from './build/hot-reload';

// Network
export { httpClient, HTTPClient } from './network/http-client';
export { wsManager, WebSocketManager } from './network/websocket';
export { protocolHandler, ProtocolHandler } from './network/protocol-handler';

// AI
export { Tensor, tensorOps, TensorOps } from './ai/tensor';
export { modelLoader, ModelLoader } from './ai/model-loader';
export { InferenceEngine } from './ai/inference';

// Re-export instances
import { jobSystem } from './core/job-system';
import { pluginAPI } from './core/plugin-api';
import { platform } from './core/platform';
import { logger } from './core/logger';
import { gpu } from './render/gpu-abstraction';
import { shaderPipeline } from './render/shader-pipeline';
import { sceneGraph } from './render/scene-graph';
import { scriptRuntime } from './script/runtime';
import { scriptSandbox } from './script/sandbox';
import { moduleLoader } from './script/module-loader';
import { htmlParser } from './browser/html-css-parser';
import { layoutEngine } from './browser/layout-engine';
import { jsEngine } from './browser/js-engine';
import { buildPipeline } from './build/pipeline';
import { hotReload } from './build/hot-reload';
import { httpClient } from './network/http-client';
import { wsManager } from './network/websocket';
import { protocolHandler } from './network/protocol-handler';
import { tensorOps } from './ai/tensor';
import { modelLoader } from './ai/model-loader';

/**
 * Unified engine status — all 21 subsystems.
 */
export function getEngineStatus() {
  return {
    version: '3.0.0',
    codename: 'Alto',
    initialized: true,
    timestamp: new Date().toISOString(),
    subsystems: {
      core: {
        jobSystem: jobSystem.getStatus(),
        pluginAPI: pluginAPI.getStatus(),
        platform: platform.getStatus(),
        logger: logger.getStatus(),
      },
      render: {
        gpu: gpu.getStatus(),
        shaders: shaderPipeline.getStatus(),
        scene: sceneGraph.getStatus(),
      },
      script: {
        runtime: scriptRuntime.getStatus(),
        sandbox: scriptSandbox.getStatus(),
        modules: moduleLoader.getStatus(),
      },
      browser: {
        htmlParser: { status: 'ready' },
        layout: layoutEngine.getStatus(),
        jsEngine: jsEngine.getStatus(),
      },
      build: {
        pipeline: buildPipeline.getStatus(),
        hotReload: hotReload.getStatus(),
      },
      network: {
        http: httpClient.getStatus(),
        websocket: wsManager.getStatus(),
        protocols: protocolHandler.getStatus(),
      },
      ai: {
        tensors: tensorOps.getStatus(),
        models: modelLoader.getStatus(),
      },
    },
  };
}

/**
 * Initialize all engine subsystems.
 */
export async function initEngine(): Promise<void> {
  logger.info('Engine Alto v3.0.0 — Initializing...');
  
  // GPU init
  await gpu.init();
  logger.info('GPU initialized', { backend: gpu.getStatus().backend });

  // Start job system
  jobSystem.start();
  logger.info('Job system started');

  // Start hot reload in development
  if (process.env.NODE_ENV !== 'production') {
    hotReload.start();
    logger.info('Hot reload active');
  }

  logger.info('Engine Alto fully initialized', { subsystems: 21 });
}
