import { z } from "zod";

// ─── Request / Response schemas ───────────────────────────────────────────────

export const AuthRequestSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  action: z.string().min(1, "action is required"),
  resource: z.record(z.string()).optional(),
});

export const AgentContextSchema = z.object({
  /** LLM confidence score — 0.0 to 1.0 */
  confidence: z.number().min(0).max(1),
  /** User the agent is acting on behalf of */
  actingFor: z.string().optional(),
  /** Requested agent scope */
  scope: z.string().optional(),
});

export const AgentAuthRequestSchema = z.object({
  actor: z.string().min(1, "actor is required"),
  action: z.string().min(1, "action is required"),
  resource: z.record(z.string()).optional(),
  context: AgentContextSchema,
});

export const MintTokenRequestSchema = z.object({
  scope: z.string().min(1),
  actingFor: z.string().optional(),
  ttlSeconds: z.number().int().positive().optional(),
});

export const DelegateScopeRequestSchema = z.object({
  delegator: z.string().min(1, "delegator is required"),
  delegatee: z.string().min(1, "delegatee is required"),
  scopedTo: z.array(z.string().min(1)).optional(),
  ttlSeconds: z.number().int().positive().optional(),
  confidence: z.number().min(0).max(1).optional(),
  actingFor: z.string().optional(),
  tenantId: z.string().optional(),
});

// ─── Decision types ───────────────────────────────────────────────────────────

export interface AuthDecision {
  allowed: boolean;
  reason: string;
  traceId: string;
}

export interface AgentAuthDecision {
  allowed: boolean;
  reason: string;
  traceId: string;
  downgradedScope: string | undefined;
  requiresHumanReview: boolean;
  confidenceUsed: number;
}

export interface MintTokenResult {
  token: string;
  tokenId: string;
  expiresAt: Date;
}

export interface DelegateScopeRequest {
  /** Agent delegating the scope */
  delegator: string;
  /** Agent receiving the constrained sub-scope */
  delegatee: string;
  /** Actions to grant (must be subset of policy's can_delegate.scoped_to) */
  scopedTo?: string[];
  /** Token TTL in seconds — capped by the policy's max_ttl_seconds */
  ttlSeconds?: number;
  /** Delegator's confidence score — checked against require_confidence_above */
  confidence?: number;
  /** User the delegated agent acts on behalf of */
  actingFor?: string;
  tenantId?: string;
}

export interface DelegateScopeResult {
  token: string;
  tokenId: string;
  expiresAt: Date;
  delegator: string;
  delegatee: string;
  grantedScopes: string[];
  traceId: string;
}

export interface RevokeTokenResult {
  success: boolean;
}

// ─── Typed Input types ───────────────────────────────────────────────────────

export type AuthRequest = z.infer<typeof AuthRequestSchema>;
export type AgentAuthRequest = z.infer<typeof AgentAuthRequestSchema>;
export type AgentContext = z.infer<typeof AgentContextSchema>;
export type MintTokenRequest = z.infer<typeof MintTokenRequestSchema>;

// ─── Client config ────────────────────────────────────────────────────────────

export interface ClientConfig {
  /** Base URL of the Auth Permission Engine (defaults to LELU_BASE_URL env var, else http://localhost:8080) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 5000) */
  timeoutMs?: number;
  /** Optional bearer token for authenticating with the engine */
  apiKey?: string;
}

// ─── Error type ───────────────────────────────────────────────────────────────

export class AuthEngineError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AuthEngineError";
  }
}
