/**
 * SuperBuilder Integration Adapter — Base Interface
 * 
 * Every integration adapter must implement this interface.
 * Adapters are modular, pluggable, and can be enabled/disabled at runtime.
 */

export interface IntegrationConfig {
    enabled: boolean;
    name: string;
    version: string;
    category: IntegrationCategory;
    license: string;
    description: string;
    homepage: string;
    repository: string;
    dockerImage?: string;
    requiresGPU: boolean;
    ports?: number[];
    envVars?: Record<string, string>;
}

export type IntegrationCategory =
    | 'agent-orchestration'
    | 'model-runtime'
    | 'vector-db'
    | 'generative-media'
    | '3d-nerf'
    | 'robotics'
    | 'mlops'
    | 'serving'
    | 'observability'
    | 'dev-tools'
    | 'game-engine';

export type IntegrationStatus = 'installed' | 'running' | 'stopped' | 'error' | 'not-installed';

export interface IntegrationHealth {
    status: IntegrationStatus;
    message: string;
    uptime?: number;
    lastCheck: string;
    metrics?: Record<string, number | string>;
}

export interface BaseAdapter {
    config: IntegrationConfig;

    /** Install/setup the integration (pull docker image, install deps, etc.) */
    install(): Promise<{ success: boolean; message: string }>;

    /** Start the integration service */
    start(): Promise<{ success: boolean; message: string }>;

    /** Stop the integration service */
    stop(): Promise<{ success: boolean; message: string }>;

    /** Health check */
    health(): Promise<IntegrationHealth>;

    /** Get current status */
    getStatus(): IntegrationStatus;

    /** Uninstall/cleanup */
    uninstall(): Promise<{ success: boolean; message: string }>;
}

/**
 * Abstract base class with default implementations
 */
export abstract class AbstractAdapter implements BaseAdapter {
    config: IntegrationConfig;
    protected _status: IntegrationStatus = 'not-installed';

    constructor(config: IntegrationConfig) {
        this.config = config;
    }

    abstract install(): Promise<{ success: boolean; message: string }>;
    abstract start(): Promise<{ success: boolean; message: string }>;
    abstract stop(): Promise<{ success: boolean; message: string }>;

    async health(): Promise<IntegrationHealth> {
        return {
            status: this._status,
            message: `${this.config.name} is ${this._status}`,
            lastCheck: new Date().toISOString(),
        };
    }

    getStatus(): IntegrationStatus {
        return this._status;
    }

    async uninstall(): Promise<{ success: boolean; message: string }> {
        this._status = 'not-installed';
        return { success: true, message: `${this.config.name} uninstalled` };
    }
}
