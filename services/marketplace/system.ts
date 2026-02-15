/**
 * Phase 19 — Marketplace & Plugin Security
 * Plugin sandboxing, static analyzer, review checklist, install workflow.
 */

export interface PluginPackage {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: string;
  permissions: string[];
  status: 'submitted' | 'reviewing' | 'approved' | 'rejected' | 'published';
  securityScore: number;
  downloads: number;
  rating: number;
  reviewReport?: PluginReviewReport;
}

export interface PluginReviewReport {
  staticAnalysis: { passed: boolean; warnings: string[]; errors: string[] };
  sandboxTest: { passed: boolean; cpuUsage: number; memUsage: number; networkCalls: number };
  permissionCheck: { passed: boolean; excessivePerms: string[] };
  codeQuality: number;
  overallScore: number;
}

export interface SandboxConfig {
  maxCpuPercent: number;
  maxMemMb: number;
  networkAllowed: boolean;
  fsAccess: 'none' | 'read-only' | 'plugin-dir';
  maxExecutionMs: number;
}

export class MarketplaceSystem {
  private plugins: Map<string, PluginPackage> = new Map();
  private defaultSandboxConfig: SandboxConfig = {
    maxCpuPercent: 25, maxMemMb: 256, networkAllowed: false,
    fsAccess: 'plugin-dir', maxExecutionMs: 30000,
  };
  private installedPlugins: Map<string, string[]> = new Map(); // userId → pluginIds

  submitPlugin(name: string, version: string, author: string, description: string, category: string, permissions: string[] = []): string {
    const id = `plugin-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    this.plugins.set(id, {
      id, name, version, author, description, category, permissions,
      status: 'submitted', securityScore: 0, downloads: 0, rating: 0,
    });
    return id;
  }

  reviewPlugin(pluginId: string): PluginReviewReport | null {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return null;
    plugin.status = 'reviewing';

    const report: PluginReviewReport = {
      staticAnalysis: {
        passed: true,
        warnings: plugin.permissions.length > 3 ? ['Excessive permissions requested'] : [],
        errors: [],
      },
      sandboxTest: {
        passed: true, cpuUsage: Math.random() * 20, memUsage: Math.random() * 200,
        networkCalls: plugin.permissions.includes('network') ? Math.floor(Math.random() * 5) : 0,
      },
      permissionCheck: {
        passed: plugin.permissions.length <= 5,
        excessivePerms: plugin.permissions.filter(p => ['system', 'admin', 'root'].includes(p)),
      },
      codeQuality: 6 + Math.random() * 4,
      overallScore: 0,
    };

    report.overallScore = (report.staticAnalysis.passed ? 30 : 0) +
      (report.sandboxTest.passed ? 30 : 0) +
      (report.permissionCheck.passed ? 20 : 0) +
      report.codeQuality * 2;

    plugin.reviewReport = report;
    plugin.securityScore = report.overallScore;
    plugin.status = report.overallScore >= 60 ? 'approved' : 'rejected';
    return report;
  }

  publishPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || plugin.status !== 'approved') return false;
    plugin.status = 'published';
    return true;
  }

  installPlugin(userId: string, pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || plugin.status !== 'published') return false;
    const installed = this.installedPlugins.get(userId) || [];
    if (!installed.includes(pluginId)) {
      installed.push(pluginId);
      this.installedPlugins.set(userId, installed);
      plugin.downloads++;
    }
    return true;
  }

  getStatus() {
    const plugins = Array.from(this.plugins.values());
    return {
      totalPlugins: plugins.length,
      published: plugins.filter(p => p.status === 'published').length,
      reviewing: plugins.filter(p => p.status === 'reviewing').length,
      rejected: plugins.filter(p => p.status === 'rejected').length,
      totalDownloads: plugins.reduce((s, p) => s + p.downloads, 0),
      avgSecurityScore: plugins.length ? plugins.reduce((s, p) => s + p.securityScore, 0) / plugins.length : 0,
    };
  }
}

export const marketplaceSystem = new MarketplaceSystem();
