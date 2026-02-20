// Platform API client — runs server-side (Node.js) inside Next.js RSC / API routes.

const PLATFORM_URL = process.env.PLATFORM_URL ?? "http://localhost:9090";
const API_KEY = process.env.PLATFORM_API_KEY ?? "change-me-in-production";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
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
  return body.events ?? body;
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
  return body.policies ?? body;
}
