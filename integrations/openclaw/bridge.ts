/**
 * OpenClaw Local Bridge — Windows service for safe local actions
 * 
 * Accepts REST calls from OpenClaw proxy and executes approved local actions.
 * All sensitive/destructive actions require explicit user consent via OS dialog.
 */

export interface BridgePermission {
    action: string;
    description: string;
    level: 'read-only' | 'write' | 'destructive';
    requiresConsent: boolean;
    allowed: boolean;
}

export interface BridgeAction {
    id: string;
    type: 'file-read' | 'file-write' | 'file-delete' | 'shell-exec' | 'browser-open' | 'git-op' | 'screenshot';
    payload: Record<string, unknown>;
    requestedBy: string;
    timestamp: string;
    status: 'pending-consent' | 'approved' | 'denied' | 'executed' | 'failed';
    result?: string;
}

export interface BridgeConfig {
    port: number;
    token: string;
    allowedWorkspaces: string[];
    permissions: BridgePermission[];
    auditLogPath: string;
    maxConcurrent: number;
}

const DEFAULT_PERMISSIONS: BridgePermission[] = [
    { action: 'file-read', description: 'Read files in allowed workspaces', level: 'read-only', requiresConsent: false, allowed: true },
    { action: 'file-write', description: 'Create or modify files', level: 'write', requiresConsent: true, allowed: true },
    { action: 'file-delete', description: 'Delete files', level: 'destructive', requiresConsent: true, allowed: false },
    { action: 'shell-exec', description: 'Execute shell commands', level: 'destructive', requiresConsent: true, allowed: false },
    { action: 'browser-open', description: 'Open URLs in browser', level: 'read-only', requiresConsent: false, allowed: true },
    { action: 'git-op', description: 'Git operations (commit, push, pull)', level: 'write', requiresConsent: true, allowed: true },
    { action: 'screenshot', description: 'Capture screenshots', level: 'read-only', requiresConsent: false, allowed: true },
];

export class LocalBridge {
    private config: BridgeConfig;
    private actionLog: BridgeAction[] = [];

    constructor(config?: Partial<BridgeConfig>) {
        this.config = {
            port: config?.port || 8765,
            token: config?.token || 'generated-local-token',
            allowedWorkspaces: config?.allowedWorkspaces || ['D:\\super-builder-platform'],
            permissions: config?.permissions || DEFAULT_PERMISSIONS,
            auditLogPath: config?.auditLogPath || './logs/bridge-audit.log',
            maxConcurrent: config?.maxConcurrent || 5,
        };
    }

    getConfig(): BridgeConfig { return this.config; }
    getPermissions(): BridgePermission[] { return this.config.permissions; }
    getAuditLog(): BridgeAction[] { return this.actionLog; }

    updatePermission(action: string, allowed: boolean): boolean {
        const perm = this.config.permissions.find(p => p.action === action);
        if (perm) { perm.allowed = allowed; return true; }
        return false;
    }

    requestAction(type: BridgeAction['type'], payload: Record<string, unknown>, requestedBy: string): BridgeAction {
        const permission = this.config.permissions.find(p => p.action === type);
        const action: BridgeAction = {
            id: `ba-${Date.now()}`,
            type, payload, requestedBy,
            timestamp: new Date().toISOString(),
            status: 'pending-consent',
        };

        if (!permission || !permission.allowed) {
            action.status = 'denied';
            action.result = `Action "${type}" is not allowed by current permissions`;
        } else if (permission.requiresConsent) {
            action.status = 'pending-consent';
            action.result = 'Waiting for user consent...';
        } else {
            action.status = 'executed';
            action.result = `Action "${type}" executed successfully (mock)`;
        }

        this.actionLog.push(action);
        return action;
    }

    approveAction(actionId: string): BridgeAction | null {
        const action = this.actionLog.find(a => a.id === actionId);
        if (action && action.status === 'pending-consent') {
            action.status = 'executed';
            action.result = `Action "${action.type}" approved and executed (mock)`;
        }
        return action || null;
    }

    denyAction(actionId: string): BridgeAction | null {
        const action = this.actionLog.find(a => a.id === actionId);
        if (action && action.status === 'pending-consent') {
            action.status = 'denied';
            action.result = 'User denied the action';
        }
        return action || null;
    }

    getStats() {
        return {
            totalActions: this.actionLog.length,
            executed: this.actionLog.filter(a => a.status === 'executed').length,
            denied: this.actionLog.filter(a => a.status === 'denied').length,
            pending: this.actionLog.filter(a => a.status === 'pending-consent').length,
            port: this.config.port,
            workspaces: this.config.allowedWorkspaces,
        };
    }
}
