// Auth Permission Engine — TypeScript SDK
// Public API surface

export { PrismClient } from "./client.js";

export type {
  AuthRequest,
  AgentAuthRequest,
  AgentContext,
  MintTokenRequest,
  AuthDecision,
  AgentAuthDecision,
  MintTokenResult,
  RevokeTokenResult,
  ClientConfig,
} from "./types.js";

export {
  AuthEngineError,
  AuthRequestSchema,
  AgentAuthRequestSchema,
  AgentContextSchema,
  MintTokenRequestSchema,
} from "./types.js";

// ─── Convenience factory ──────────────────────────────────────────────────────

import { PrismClient } from "./client.js";
import type { ClientConfig } from "./types.js";

/**
 * Creates a PrismClient with the given configuration.
 * Equivalent to `new PrismClient(config)`.
 *
 * @example
 * ```ts
 * import { createClient } from "auth-permission-engine";
 *
 * const prism = createClient({ baseUrl: "http://localhost:8080" });
 * const { allowed } = await prism.agentAuthorize({ ... });
 * ```
 */
export function createClient(config?: ClientConfig): PrismClient {
  return new PrismClient(config);
}
