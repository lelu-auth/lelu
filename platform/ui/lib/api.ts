// Platform API client — runs server-side (Node.js) inside Next.js RSC / API routes.

const PLATFORM_URL = process.env.PLATFORM_URL ?? "http://localhost:9090";
const API_KEY = process.env.PLATFORM_API_KEY ?? "change-me-in-production";
const ENGINE_URL = process.env.PRISM_ENGINE_URL ?? "http://localhost:8082";
const ENGINE_API_KEY = process.env.PRISM_API_KEY ?? "prism-dev-key";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
};

const engineHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${ENGINE_API_KEY}`,
};

export interface AuditEvent {
  id: number;
  trace_id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource?: Record<string, string>;
  confidence_score: number;
  decision: "allowed" | "denied" | "human_review";
  reason?: string;
  downgraded_scope?: string;
  latency_ms: number;
  engine_version?: string;
  policy_version?: string;
  created_at: string;
}

export interface AuditListResponse {
  events: AuditEvent[];
  count: number;
}

export interface TraceResponse {
  trace_id: string;
  events: AuditEvent[];
}

export interface Policy {
  id: string;
  name: string;
  content: string;
  version: string;
  hmac_sha256: string;
  created_at: string;
  updated_at: string;
}

export interface ShadowSummaryBucket {
  minute: string;
  allow: number;
  review: number;
  deny: number;
}

export interface ShadowSummaryResponse {
  mode: "enforce" | "shadow";
  window_minutes: number;
  generated_at: string;
  totals: {
    allow: number;
    review: number;
    deny: number;
  };
  buckets: ShadowSummaryBucket[];
}

export interface ComplianceControlSummary {
  id: string;
  title: string;
  event_count: number;
  sample_trace_ids: string[];
}

export interface ComplianceExportResponse {
  framework: string;
  tenant_id: string;
  generated_at: string;
  from?: string;
  to?: string;
  total_events: number;
  controls: ComplianceControlSummary[];
  evidence: {
    checksum_sha256: string;
    signature?: string;
    signed: boolean;
    signer?: string;
    algorithm: string;
  };
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export async function listAuditEvents(params?: {
  actor?: string;
  action?: string;
  decision?: string;
  from?: string;
  to?: string;
  limit?: number;
}): Promise<AuditEvent[]> {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined)) as Record<string, string>
  ).toString();
  const res = await fetch(`${PLATFORM_URL}/api/v1/audit${qs ? `?${qs}` : ""}`, {
    headers,
    next: { revalidate: 10 },
  });
  if (!res.ok) throw new Error(`Audit fetch failed: ${res.status}`);
  const body = await res.json();
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.events)) return body.events;
  return [];
}

export async function getTrace(traceId: string): Promise<TraceResponse> {
  const res = await fetch(`${PLATFORM_URL}/api/v1/audit/trace/${traceId}`, {
    headers,
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Trace fetch failed: ${res.status}`);
  return res.json();
}

// ─── Policies ─────────────────────────────────────────────────────────────────

export async function listPolicies(): Promise<Policy[]> {
  const res = await fetch(`${PLATFORM_URL}/api/v1/policies`, {
    headers,
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`Policy fetch failed: ${res.status}`);
  const body = await res.json();
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.policies)) return body.policies;
  return [];
}

export async function getShadowSummary(windowMinutes = 60): Promise<ShadowSummaryResponse | null> {
  try {
    const res = await fetch(`${ENGINE_URL}/v1/shadow/summary?window_minutes=${windowMinutes}`, {
      headers: engineHeaders,
      next: { revalidate: 15 },
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

export async function getComplianceExport(framework: "owasp_genai" | "nist_ai_rmf" | "all" = "all"): Promise<ComplianceExportResponse | null> {
  try {
    const res = await fetch(`${PLATFORM_URL}/api/v1/compliance/export?framework=${framework}`, {
      headers,
      next: { revalidate: 30 },
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

// ─── Simulator ─────────────────────────────────────────────────────────────────

export interface SimulatorTrace {
  id: string;
  kind: "human" | "agent";
  user_id?: string;
  actor?: string;
  action: string;
  confidence_signal?: {
    provider: string;
    token_logprobs: number[];
  };
}

export interface SimulatorItem {
  id: string;
  kind: string;
  changed: boolean;
  before: { outcome: string; reason: string };
  after: { outcome: string; reason: string };
}

export interface SimulatorReplayResponse {
  summary: {
    total: number;
    changed: number;
    unchanged: number;
    allow_to_deny: number;
    allow_to_review: number;
    deny_to_allow: number;
    review_to_allow: number;
    review_to_deny: number;
    deny_to_review: number;
  };
  items: SimulatorItem[];
}

export async function simulatorReplay(
  proposedPolicyYaml: string,
  traces: SimulatorTrace[],
): Promise<SimulatorReplayResponse> {
  const res = await fetch(`${ENGINE_URL}/v1/simulator/replay`, {
    method: "POST",
    headers: engineHeaders,
    body: JSON.stringify({
      proposed_policy_yaml: proposedPolicyYaml,
      traces,
    }),
  });
  if (!res.ok) throw new Error(`Simulator replay failed: ${res.status}`);
  return res.json();
}

// ─── Policy CRUD ───────────────────────────────────────────────────────────────

export async function createOrUpdatePolicy(name: string, content: string): Promise<Policy> {
  const res = await fetch(`${PLATFORM_URL}/api/v1/policies`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name, content }),
  });
  if (!res.ok) throw new Error(`Policy save failed: ${res.status}`);
  return res.json();
}
