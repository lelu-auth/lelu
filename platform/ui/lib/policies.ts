import { randomBytes } from "crypto";
import { db, ensureSchema } from "./db";

export interface PolicyRule {
  id: string;
  pattern: string;       // substring matched against tool name (case-insensitive)
  decision: "allow" | "deny" | "human_review";
  reason: string;
}

export interface Policy {
  id: string;
  userId: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function rowToPolicy(r: Record<string, unknown>): Policy {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    name: r.name as string,
    description: r.description as string,
    rules: r.rules as PolicyRule[],
    isActive: r.is_active as boolean,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export async function listPolicies(userId: string): Promise<Policy[]> {
  await ensureSchema();
  const sql = db();
  const rows = await sql`
    SELECT id, user_id, name, description, rules, is_active, created_at, updated_at
    FROM lelu_policies
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return rows.map(rowToPolicy);
}

export async function getPolicy(id: string, userId: string): Promise<Policy | null> {
  await ensureSchema();
  const sql = db();
  const rows = await sql`
    SELECT id, user_id, name, description, rules, is_active, created_at, updated_at
    FROM lelu_policies
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return rows.length ? rowToPolicy(rows[0]) : null;
}

export async function createPolicy(
  userId: string,
  name: string,
  description: string,
  rules: PolicyRule[],
): Promise<Policy> {
  await ensureSchema();
  const sql = db();
  const id = randomBytes(12).toString("hex");
  await sql`
    INSERT INTO lelu_policies (id, user_id, name, description, rules, is_active)
    VALUES (${id}, ${userId}, ${name}, ${description}, ${JSON.stringify(rules)}, TRUE)
  `;
  const rows = await sql`SELECT * FROM lelu_policies WHERE id = ${id}`;
  return rowToPolicy(rows[0]);
}

export async function updatePolicy(
  id: string,
  userId: string,
  patch: { name?: string; description?: string; rules?: PolicyRule[]; isActive?: boolean },
): Promise<Policy | null> {
  const sql = db();
  const name: string | null = patch.name ?? null;
  const description: string | null = patch.description ?? null;
  const rules: string | null = patch.rules !== undefined ? JSON.stringify(patch.rules) : null;
  const isActive: boolean | null = patch.isActive ?? null;

  await sql`
    UPDATE lelu_policies
    SET
      name        = COALESCE(${name}, name),
      description = COALESCE(${description}, description),
      rules       = COALESCE(${rules}::jsonb, rules),
      is_active   = COALESCE(${isActive}, is_active),
      updated_at  = NOW()
    WHERE id = ${id} AND user_id = ${userId}
  `;
  return getPolicy(id, userId);
}

export async function deletePolicy(id: string, userId: string): Promise<void> {
  const sql = db();
  await sql`DELETE FROM lelu_policies WHERE id = ${id} AND user_id = ${userId}`;
}

export async function getActivePoliciesForUser(userId: string): Promise<Policy[]> {
  await ensureSchema();
  const sql = db();
  const rows = await sql`
    SELECT id, user_id, name, description, rules, is_active, created_at, updated_at
    FROM lelu_policies
    WHERE user_id = ${userId} AND is_active = TRUE
    ORDER BY created_at ASC
  `;
  return rows.map(rowToPolicy);
}

// Evaluate a tool name against a list of policies (first matching rule wins)
export function evaluateWithPolicies(
  tool: string,
  policies: Policy[],
): { decision: "allow" | "deny" | "human_review"; reason: string; rule: string; policyName: string } | null {
  for (const policy of policies) {
    for (const rule of policy.rules) {
      try {
        if (new RegExp(rule.pattern, "i").test(tool)) {
          return {
            decision: rule.decision,
            reason: rule.reason,
            rule: `policy:${policy.name}:${rule.id}`,
            policyName: policy.name,
          };
        }
      } catch {
        // Invalid regex — skip rule
      }
    }
  }
  return null;
}
