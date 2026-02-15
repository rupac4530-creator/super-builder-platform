/**
 * Engine Alto — RBAC (Role-Based Access Control)
 * Organizations, roles, permissions, API keys, and audit logging.
 */
export type Role = 'owner' | 'admin' | 'editor' | 'viewer' | 'billing';
export type Permission = 'project:create' | 'project:read' | 'project:update' | 'project:delete' |
  'model:train' | 'model:deploy' | 'model:delete' |
  'ai:chat' | 'ai:generate' | 'ai:vision' |
  'media:create' | 'media:export' |
  'team:invite' | 'team:remove' | 'team:manage-roles' |
  'billing:view' | 'billing:manage' | 'org:settings';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ['project:create', 'project:read', 'project:update', 'project:delete', 'model:train', 'model:deploy', 'model:delete', 'ai:chat', 'ai:generate', 'ai:vision', 'media:create', 'media:export', 'team:invite', 'team:remove', 'team:manage-roles', 'billing:view', 'billing:manage', 'org:settings'],
  admin: ['project:create', 'project:read', 'project:update', 'project:delete', 'model:train', 'model:deploy', 'ai:chat', 'ai:generate', 'ai:vision', 'media:create', 'media:export', 'team:invite', 'team:remove', 'billing:view'],
  editor: ['project:create', 'project:read', 'project:update', 'model:train', 'ai:chat', 'ai:generate', 'ai:vision', 'media:create', 'media:export'],
  viewer: ['project:read', 'ai:chat'],
  billing: ['billing:view', 'billing:manage'],
};

export interface User { id: string; email: string; orgId: string; role: Role; apiKeys: string[]; createdAt: string; }
export interface Org { id: string; name: string; plan: 'free' | 'pro' | 'enterprise'; memberCount: number; }

export class RBACService {
  private users: Map<string, User> = new Map();
  private orgs: Map<string, Org> = new Map();
  private auditLog: { timestamp: string; userId: string; action: string; resource: string; allowed: boolean }[] = [];

  createOrg(name: string, plan: 'free' | 'pro' | 'enterprise' = 'free'): Org {
    const org: Org = { id: `org_${Date.now()}`, name, plan, memberCount: 0 };
    this.orgs.set(org.id, org);
    return org;
  }

  addUser(email: string, orgId: string, role: Role = 'viewer'): User {
    const org = this.orgs.get(orgId);
    if (!org) throw new Error('Org not found');
    const user: User = { id: `user_${Date.now()}`, email, orgId, role, apiKeys: [], createdAt: new Date().toISOString() };
    this.users.set(user.id, user);
    org.memberCount++;
    return user;
  }

  checkPermission(userId: string, permission: Permission): boolean {
    const user = this.users.get(userId);
    if (!user) { this.log(userId, 'check', permission, false); return false; }
    const allowed = ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
    this.log(userId, 'check', permission, allowed);
    return allowed;
  }

  generateAPIKey(userId: string): string {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    const key = `alto_${Buffer.from(Math.random().toString()).toString('base64').slice(0, 32)}`;
    user.apiKeys.push(key);
    return key;
  }

  setRole(userId: string, role: Role): void {
    const user = this.users.get(userId);
    if (user) user.role = role;
  }

  getAuditLog(orgId?: string, limit = 100) {
    let logs = this.auditLog;
    if (orgId) {
      const orgUsers = new Set(Array.from(this.users.values()).filter(u => u.orgId === orgId).map(u => u.id));
      logs = logs.filter(l => orgUsers.has(l.userId));
    }
    return logs.slice(-limit);
  }

  private log(userId: string, action: string, resource: string, allowed: boolean) {
    this.auditLog.push({ timestamp: new Date().toISOString(), userId, action, resource, allowed });
    if (this.auditLog.length > 10000) this.auditLog = this.auditLog.slice(-5000);
  }
}

export const rbacService = new RBACService();
export default rbacService;
