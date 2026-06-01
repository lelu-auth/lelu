import { db, ensureSchema } from "./db";

export interface AuditEventRow {
  id: number;
  trace_id: string;
  user_id: string | null;
  key_id: string | null;
  actor: string;
  action: string;
  decision: "allowed" | "denied" | "human_review" | "compute";
  reason: string;
  rule: string;
  policy_name: string | null;
  confidence: number;
  latency_ms: number;
  mode: string;
  input_hash: string | null;
  output_hash: string | null;
  policy_digest: string | null;
  created_at: string;
}

export interface LogAuditEventInput {
  traceId: string;
  userId: string | null;
  keyId: string | null;
  actor: string;
  action: string;
  decision: "allowed" | "denied" | "human_review" | "compute";
  reason: string;
  rule: string;
  policyName?: string;
  confidence: number;
  latencyMs: number;
  mode: string;
  inputHash?: string;
  outputHash?: string;
  policyDigest?: string;
}

export async function logAuditEvent(input: LogAuditEventInput): Promise<void> {
  try {
    await ensureSchema();
    const sql = db();
    const userId: string | null = input.userId;
    const keyId: string | null = input.keyId;
    const policyName: string | null = input.policyName ?? null;
    const inputHash: string | null = input.inputHash ?? null;
    const outputHash: string | null = input.outputHash ?? null;
    const policyDigest: string | null = input.policyDigest ?? null;
    await sql`
      INSERT INTO lelu_audit_events
        (trace_id, user_id, key_id, actor, action, decision, reason, rule, policy_name,
         confidence, latency_ms, mode, input_hash, output_hash, policy_digest)
      VALUES
        (${input.traceId}, ${userId}, ${keyId}, ${input.actor}, ${input.action},
         ${input.decision}, ${input.reason}, ${input.rule}, ${policyName},
         ${input.confidence}, ${input.latencyMs}, ${input.mode},
         ${inputHash}, ${outputHash}, ${policyDigest})
    `;
  } catch {
    // Never fail the main request due to audit logging
  }
}

export async function listAuditEvents(opts: {
  userId?: string;
  actor?: string;
  action?: string;
  decision?: string;
  limit?: number;
}): Promise<AuditEventRow[]> {
  await ensureSchema();
  const sql = db();
  const limit = Math.min(opts.limit ?? 100, 500);

  // Build filters dynamically
  const rows = await sql`
    SELECT id, trace_id, user_id, key_id, actor, action, decision, reason, rule,
           policy_name, confidence, latency_ms, mode, input_hash, output_hash, policy_digest, created_at
    FROM lelu_audit_events
    WHERE
      (${opts.userId ?? null}::text IS NULL OR user_id = ${opts.userId ?? null})
      AND (${opts.actor ?? null}::text IS NULL OR actor ILIKE ${'%' + (opts.actor ?? '') + '%'})
      AND (${opts.action ?? null}::text IS NULL OR action ILIKE ${'%' + (opts.action ?? '') + '%'})
      AND (${opts.decision ?? null}::text IS NULL OR decision = ${opts.decision ?? null})
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return rows.map((r: Record<string, unknown>) => ({
    id: r.id as number,
    trace_id: r.trace_id as string,
    user_id: r.user_id as string | null,
    key_id: r.key_id as string | null,
    actor: r.actor as string,
    action: r.action as string,
    decision: r.decision as "allowed" | "denied" | "human_review" | "compute",
    reason: r.reason as string,
    rule: r.rule as string,
    policy_name: r.policy_name as string | null,
    confidence: Number(r.confidence),
    latency_ms: r.latency_ms as number,
    mode: r.mode as string,
    input_hash: (r.input_hash as string | null) ?? null,
    output_hash: (r.output_hash as string | null) ?? null,
    policy_digest: (r.policy_digest as string | null) ?? null,
    created_at: r.created_at as string,
  }));
}

export async function getAuditStats(userId?: string): Promise<{
  total: number;
  allowed: number;
  denied: number;
  human_review: number;
  compute: number;
}> {
  await ensureSchema();
  const sql = db();
  const rows = await sql`
    SELECT decision, COUNT(*)::int AS cnt
    FROM lelu_audit_events
    WHERE (${userId ?? null}::text IS NULL OR user_id = ${userId ?? null})
    GROUP BY decision
  `;
  const stats = { total: 0, allowed: 0, denied: 0, human_review: 0, compute: 0 };
  for (const r of rows) {
    const cnt = r.cnt as number;
    stats.total += cnt;
    if (r.decision === "allowed") stats.allowed = cnt;
    else if (r.decision === "denied") stats.denied = cnt;
    else if (r.decision === "human_review") stats.human_review = cnt;
    else if (r.decision === "compute") stats.compute = cnt;
  }
  return stats;
}
