import Database from 'better-sqlite3';
import { homedir } from 'os';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import type { AuditEvent, Policy } from './types.js';

// ─── Local Storage with SQLite ────────────────────────────────────────────────

/**
 * LocalStorage provides SQLite-based local storage for audit logs and policies.
 * Automatically creates ~/.lelu/lelu.db on first use.
 */
export class LocalStorage {
  private db: Database.Database;
  private dbPath: string;

  constructor(dbPath?: string) {
    // Default to ~/.lelu/lelu.db
    if (!dbPath) {
      const leluDir = join(homedir(), '.lelu');
      if (!existsSync(leluDir)) {
        mkdirSync(leluDir, { recursive: true });
      }
      dbPath = join(leluDir, 'lelu.db');
    }

    this.dbPath = dbPath;
    this.db = new Database(dbPath);
    this.initialize();
  }

  private initialize(): void {
    // Create tables if they don't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id TEXT NOT NULL DEFAULT 'default',
        trace_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        resource TEXT,
        confidence_score REAL,
        decision TEXT NOT NULL,
        reason TEXT,
        downgraded_scope TEXT,
        latency_ms REAL,
        engine_version TEXT,
        policy_version TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_audit_tenant_trace ON audit_events(tenant_id, trace_id);
      CREATE INDEX IF NOT EXISTS idx_audit_tenant_actor ON audit_events(tenant_id, actor, timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_tenant_ts ON audit_events(tenant_id, timestamp DESC);

      CREATE TABLE IF NOT EXISTS policies (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'default',
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        version TEXT NOT NULL DEFAULT '1.0',
        hmac_sha256 TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, name)
      );
    `);
  }

  // ─── Audit Events ─────────────────────────────────────────────────────────

  insertAuditEvent(event: Omit<AuditEvent, 'id'>): void {
    const stmt = this.db.prepare(`
      INSERT INTO audit_events (
        tenant_id, trace_id, timestamp, actor, action, resource,
        confidence_score, decision, reason, downgraded_scope,
        latency_ms, engine_version, policy_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      event.tenantId || 'default',
      event.traceId,
      event.timestamp,
      event.actor,
      event.action,
      event.resource ? JSON.stringify(event.resource) : null,
      event.confidenceScore ?? null,
      event.decision,
      event.reason ?? null,
      event.downgradedScope ?? null,
      event.latencyMs ?? null,
      event.engineVersion ?? null,
      event.policyVersion ?? null
    );
  }

  listAuditEvents(params: {
    tenantId?: string;
    limit?: number;
    cursor?: number;
    actor?: string;
  }): { events: AuditEvent[]; count: number; nextCursor: number } {
    const tenantId = params.tenantId || 'default';
    const limit = params.limit || 20;
    const cursor = params.cursor || 0;

    let query = `
      SELECT * FROM audit_events
      WHERE tenant_id = ? AND id > ?
    `;
    const queryParams: any[] = [tenantId, cursor];

    if (params.actor) {
      query += ` AND actor = ?`;
      queryParams.push(params.actor);
    }

    query += ` ORDER BY timestamp DESC LIMIT ?`;
    queryParams.push(limit);

    const stmt = this.db.prepare(query);
    const rows = stmt.all(...queryParams) as any[];

    const events: AuditEvent[] = rows.map((row) => ({
      id: row.id,
      tenantId: row.tenant_id,
      traceId: row.trace_id,
      timestamp: row.timestamp,
      actor: row.actor,
      action: row.action,
      resource: row.resource ? JSON.parse(row.resource) : undefined,
      confidenceScore: row.confidence_score,
      decision: row.decision,
      reason: row.reason,
      downgradedScope: row.downgraded_scope,
      latencyMs: row.latency_ms,
      engineVersion: row.engine_version,
      policyVersion: row.policy_version,
      createdAt: row.created_at,
    }));

    const nextCursor = events.length > 0 ? (events[events.length - 1]?.id || cursor) : cursor;
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM audit_events WHERE tenant_id = ?');
    const countResult = countStmt.get(tenantId) as { count: number };

    return {
      events,
      count: countResult.count,
      nextCursor,
    };
  }

  // ─── Policies ─────────────────────────────────────────────────────────────

  listPolicies(tenantId: string = 'default'): Policy[] {
    const stmt = this.db.prepare('SELECT * FROM policies WHERE tenant_id = ? ORDER BY name');
    const rows = stmt.all(tenantId) as any[];

    return rows.map((row) => ({
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      content: row.content,
      version: row.version,
      hmacSha256: row.hmac_sha256,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  getPolicy(name: string, tenantId: string = 'default'): Policy | null {
    const stmt = this.db.prepare('SELECT * FROM policies WHERE tenant_id = ? AND name = ?');
    const row = stmt.get(tenantId, name) as any;

    if (!row) return null;

    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      content: row.content,
      version: row.version,
      hmacSha256: row.hmac_sha256,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  upsertPolicy(policy: {
    name: string;
    content: string;
    version?: string;
    tenantId?: string;
  }): void {
    const tenantId = policy.tenantId || 'default';
    const version = policy.version || '1.0';
    const hmacSha256 = this.generateHmac(policy.content);
    const id = this.generateId();

    const stmt = this.db.prepare(`
      INSERT INTO policies (id, tenant_id, name, content, version, hmac_sha256, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(tenant_id, name) DO UPDATE SET
        content = excluded.content,
        version = excluded.version,
        hmac_sha256 = excluded.hmac_sha256,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(id, tenantId, policy.name, policy.content, version, hmacSha256);
  }

  deletePolicy(name: string, tenantId: string = 'default'): boolean {
    const stmt = this.db.prepare('DELETE FROM policies WHERE tenant_id = ? AND name = ?');
    const result = stmt.run(tenantId, name);
    return result.changes > 0;
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  private generateHmac(content: string): string {
    // Simple hash for demo - in production use crypto.createHmac
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  close(): void {
    this.db.close();
  }

  getDbPath(): string {
    return this.dbPath;
  }
}
