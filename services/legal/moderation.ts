/**
 * Phase 21 — Legal / Safety / Moderation
 * Consent flows, content moderation (NSFW/copyright), audit logs, retention policy.
 */

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'face-upload' | 'voice-upload' | 'data-processing' | 'ai-training' | 'content-generation';
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  ipAddress?: string;
  details: string;
}

export interface ModerationCheck {
  id: string;
  contentType: 'image' | 'video' | 'audio' | 'text' | 'code';
  contentId: string;
  flags: ModerationFlag[];
  result: 'approved' | 'flagged' | 'blocked';
  checkedAt: Date;
  reviewedBy?: string;
}

export interface ModerationFlag {
  type: 'nsfw' | 'copyright' | 'violence' | 'hate-speech' | 'pii' | 'malware' | 'spam';
  confidence: number;
  details: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  actor: string;
  action: string;
  resource: string;
  details: string;
  ip?: string;
}

export class LegalModerationSystem {
  private consents: Map<string, ConsentRecord[]> = new Map(); // userId → consents
  private moderationChecks: Map<string, ModerationCheck> = new Map();
  private auditLog: AuditLogEntry[] = [];
  private retentionDays: number = 90;
  private blockedContentCount: number = 0;

  // Consent management
  grantConsent(userId: string, type: ConsentRecord['consentType'], details: string = ''): string {
    const id = `consent-${Date.now()}`;
    const record: ConsentRecord = { id, userId, consentType: type, granted: true, grantedAt: new Date(), details };
    const userConsents = this.consents.get(userId) || [];
    userConsents.push(record);
    this.consents.set(userId, userConsents);
    this.addAuditLog('system', `Consent granted: ${type}`, `user:${userId}`, details);
    return id;
  }

  revokeConsent(userId: string, type: ConsentRecord['consentType']): boolean {
    const userConsents = this.consents.get(userId);
    if (!userConsents) return false;
    const consent = userConsents.find(c => c.consentType === type && c.granted);
    if (!consent) return false;
    consent.granted = false;
    consent.revokedAt = new Date();
    this.addAuditLog('system', `Consent revoked: ${type}`, `user:${userId}`, '');
    return true;
  }

  hasConsent(userId: string, type: ConsentRecord['consentType']): boolean {
    const userConsents = this.consents.get(userId) || [];
    return userConsents.some(c => c.consentType === type && c.granted);
  }

  // Content moderation
  moderateContent(contentType: ModerationCheck['contentType'], contentId: string): ModerationCheck {
    const id = `mod-${Date.now()}`;
    const flags: ModerationFlag[] = [];

    // Simulated moderation checks
    const nsfwScore = Math.random();
    if (nsfwScore > 0.85) flags.push({ type: 'nsfw', confidence: nsfwScore, details: 'Potentially explicit content' });

    const copyrightScore = Math.random();
    if (copyrightScore > 0.9) flags.push({ type: 'copyright', confidence: copyrightScore, details: 'Potential copyright match' });

    const result: ModerationCheck['result'] = flags.some(f => f.confidence > 0.9) ? 'blocked' : flags.length > 0 ? 'flagged' : 'approved';
    if (result === 'blocked') this.blockedContentCount++;

    const check: ModerationCheck = { id, contentType, contentId, flags, result, checkedAt: new Date() };
    this.moderationChecks.set(id, check);
    this.addAuditLog('moderation', `Content ${result}: ${contentType}`, contentId, flags.map(f => f.type).join(', '));
    return check;
  }

  // Audit logging
  addAuditLog(actor: string, action: string, resource: string, details: string): void {
    this.auditLog.push({ id: `audit-${Date.now()}`, timestamp: new Date(), actor, action, resource, details });
  }

  // Retention: clean old audit logs
  enforceRetention(): number {
    const cutoff = Date.now() - this.retentionDays * 24 * 60 * 60 * 1000;
    const before = this.auditLog.length;
    this.auditLog = this.auditLog.filter(entry => entry.timestamp.getTime() > cutoff);
    return before - this.auditLog.length;
  }

  getStatus() {
    return {
      totalConsents: Array.from(this.consents.values()).reduce((s, c) => s + c.length, 0),
      activeConsents: Array.from(this.consents.values()).reduce((s, c) => s + c.filter(x => x.granted).length, 0),
      moderationChecks: this.moderationChecks.size,
      blockedContent: this.blockedContentCount,
      auditLogSize: this.auditLog.length,
      retentionDays: this.retentionDays,
    };
  }
}

export const legalModerationSystem = new LegalModerationSystem();
