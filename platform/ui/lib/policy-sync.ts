/**
 * policy-sync.ts — compile platform policies to engine YAML and push via PUT /v1/policy.
 *
 * The platform's Postgres stores policy rules for the UI editor. The engine
 * evaluates only the YAML policy loaded into its evaluator. This module is the
 * bridge: after every dashboard create/update/delete it compiles the active
 * rules and pushes them to the engine so decisions match what the user sees.
 */

import { listPolicies, type PolicyRule } from "./policies";

const ENGINE_URL = (process.env.ENGINE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const ENGINE_ADMIN_KEY = process.env.ENGINE_ADMIN_KEY ?? "";

export type SyncResult =
  | { ok: true; digest: string }
  | { ok: false; error: string; status?: number };

/**
 * Compiles all active policies for userId into engine YAML and pushes them.
 * Call this after every create, update, or delete on the policies table.
 */
export async function pushPolicyToEngine(userId: string): Promise<SyncResult> {
  if (!ENGINE_URL) return { ok: false, error: "ENGINE_URL not configured" };

  const policies = await listPolicies(userId);
  const active = policies.filter((p) => p.isActive);
  const allRules: PolicyRule[] = active.flatMap((p) => p.rules ?? []);

  const yaml = compileToEngineYaml(allRules);

  // Fetch the current digest for optimistic concurrency (If-Match).
  let currentDigest = "";
  try {
    const getRes = await fetch(`${ENGINE_URL}/v1/policy`, {
      headers: engineHeaders(),
      signal: AbortSignal.timeout(4_000),
    });
    if (getRes.ok) {
      const body = (await getRes.json()) as { digest?: string };
      currentDigest = body.digest ?? "";
    }
  } catch {
    // Engine unreachable — attempt the PUT anyway (no If-Match); it will
    // succeed on a fresh engine with an empty digest.
  }

  return doPut(yaml, currentDigest);
}

async function doPut(yaml: string, ifMatch: string, retry = false): Promise<SyncResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-yaml",
    ...engineHeaders(),
  };
  if (ifMatch !== "") headers["If-Match"] = ifMatch;

  let res: Response;
  try {
    res = await fetch(`${ENGINE_URL}/v1/policy`, {
      method: "PUT",
      headers,
      body: yaml,
      signal: AbortSignal.timeout(8_000),
    });
  } catch (err) {
    return { ok: false, error: `Engine unreachable: ${String(err)}` };
  }

  if (res.status === 412 && !retry) {
    // Optimistic conflict — refetch digest and retry once.
    try {
      const getRes = await fetch(`${ENGINE_URL}/v1/policy`, {
        headers: engineHeaders(),
        signal: AbortSignal.timeout(4_000),
      });
      if (getRes.ok) {
        const body = (await getRes.json()) as { digest?: string };
        return doPut(yaml, body.digest ?? "", true);
      }
    } catch {
      /* fall through to error */
    }
    return { ok: false, error: "Policy digest conflict; retry failed", status: 412 };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || res.statusText, status: res.status };
  }

  const data = (await res.json()) as { digest?: string };
  return { ok: true, digest: data.digest ?? "" };
}

/**
 * Serialises platform PolicyRule[] into the engine's YAML rules block.
 * The engine evaluates rules in order; first match wins.
 */
function compileToEngineYaml(rules: PolicyRule[]): string {
  const lines: string[] = ['version: "1"', "rules:"];

  if (rules.length === 0) {
    // Emit an explicit empty list so the engine clears any prior rules.
    lines.push("  []");
  } else {
    for (const rule of rules) {
      const safeId = rule.id.replace(/"/g, '\\"');
      const safePattern = rule.pattern.replace(/"/g, '\\"');
      const safeReason = (rule.reason ?? "").replace(/"/g, '\\"');
      lines.push(`  - id: "${safeId}"`);
      lines.push(`    match: "${safePattern}"`);
      lines.push(`    decision: ${rule.decision}`);
      if (safeReason) lines.push(`    reason: "${safeReason}"`);
    }
  }

  return lines.join("\n") + "\n";
}

function engineHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  if (ENGINE_ADMIN_KEY) h["Authorization"] = `Bearer ${ENGINE_ADMIN_KEY}`;
  return h;
}
