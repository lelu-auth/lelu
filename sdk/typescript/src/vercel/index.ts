/**
 * Vercel AI SDK integration for Prism — Confidence-Aware Auth.
 *
 * Wraps a Vercel AI SDK `tool()` definition with a Prism authorization
 * gate. The wrapped tool runs the original `execute` function only when
 * Prism allows it; otherwise it returns a structured refusal object that
 * the model can inspect and self-correct on.
 *
 * @example
 * ```ts
 * import { tool } from 'ai';
 * import { z } from 'zod';
 * import { PrismClient } from 'prizm-engine';
 * import { secureTool } from 'prizm-engine/vercel';
 *
 * const prism = new PrismClient({ baseUrl: 'http://localhost:8082' });
 *
 * const refundTool = secureTool({
 *   client: prism,
 *   actor: 'invoice_bot',
 *   action: 'invoice:refund',
 *   confidence: 0.92,
 *   tool: tool({
 *     description: 'Process a customer refund',
 *     parameters: z.object({ invoiceId: z.string() }),
 *     execute: async ({ invoiceId }) => ({ refunded: invoiceId }),
 *   }),
 * });
 *
 * // Use in streamText / generateText:
 * const result = await streamText({
 *   model: openai('gpt-4o'),
 *   tools: { refundTool },
 * });
 * ```
 */

import { PrismClient } from "../client.js";

// ─── Minimal Vercel AI SDK tool type ──────────────────────────────────────────

/**
 * The minimal shape of a Vercel AI SDK `tool()` return value.
 * We keep this local to avoid a hard dependency on `ai`.
 */
export interface VercelTool<TArgs = unknown, TResult = unknown> {
  description?: string;
  parameters: unknown;
  execute?: (args: TArgs, options?: unknown) => Promise<TResult>;
}

// ─── Denied / Review result shape ─────────────────────────────────────────────

export interface PrismDeniedResult {
  /** Always `false` when the tool was blocked. */
  allowed: false;
  /** Human/LLM-readable denial reason. */
  reason: string;
  /** Whether the action is queued for human review. */
  requiresHumanReview: boolean;
  /** The downgraded scope when confidence caused a downgrade. */
  downgradedScope?: string;
}

// ─── Options ──────────────────────────────────────────────────────────────────

export interface SecureToolOptions<TArgs = unknown, TResult = unknown> {
  /** Configured Prism client. */
  client: PrismClient;
  /** The agent actor / scope registered in Prism policy. */
  actor: string;
  /** The permission string being checked. */
  action: string;
  /**
   * LLM confidence score (0.0–1.0). Can be a static number or a function
   * receiving the parsed tool arguments, allowing dynamic confidence based
   * on the actual call. Defaults to `1.0`.
   */
  confidence?: number | ((args: TArgs) => number);
  /** Optional user ID the agent is acting on behalf of. */
  actingFor?: string;
  /** The original Vercel AI SDK tool to wrap. */
  tool: VercelTool<TArgs, TResult>;
}

// ─── secureTool ───────────────────────────────────────────────────────────────

/**
 * Wraps a Vercel AI SDK `tool()` with Prism Confidence-Aware Auth.
 *
 * Returns a new tool object with the same `description` and `parameters`
 * but with an `execute` function that gates through Prism first.
 *
 * On denial the tool returns a `PrismDeniedResult` object (not a throw) so
 * the model sees a structured response it can reason about.
 */
export function secureTool<TArgs = unknown, TResult = unknown>(
  opts: SecureToolOptions<TArgs, TResult>
): VercelTool<TArgs, TResult | PrismDeniedResult> {
  const { client, actor, action, actingFor } = opts;

  return {
    description: opts.tool.description,
    parameters: opts.tool.parameters,

    async execute(
      args: TArgs,
      options?: unknown
    ): Promise<TResult | PrismDeniedResult> {
      // Resolve confidence — static number or dynamic function.
      const confidence =
        typeof opts.confidence === "function"
          ? opts.confidence(args)
          : (opts.confidence ?? 1.0);

      let decision;
      try {
        decision = await client.agentAuthorize({
          actor,
          action,
          context: { confidence, actingFor },
        });
      } catch (err) {
        // Fail open with a structured denial so the model can handle it.
        return {
          allowed: false,
          reason: `Prism authorization check failed: ${String(err)}`,
          requiresHumanReview: false,
        };
      }

      // ── Human review required ──────────────────────────────────────────
      if (decision.requiresHumanReview) {
        return {
          allowed: false,
          reason:
            `Action '${action}' for agent '${actor}' is queued for human review. ` +
            `Reason: ${decision.reason}. Confidence: ${(confidence * 100).toFixed(0)}%.`,
          requiresHumanReview: true,
        };
      }

      // ── Hard deny ─────────────────────────────────────────────────────
      if (!decision.allowed) {
        return {
          allowed: false,
          reason:
            `Action '${action}' was denied for agent '${actor}'. ` +
            `Reason: ${decision.reason}.`,
          requiresHumanReview: false,
          downgradedScope: decision.downgradedScope,
        };
      }

      // ── Authorized — run original execute ─────────────────────────────
      if (!opts.tool.execute) {
        throw new Error(
          `[Prism] secureTool: the wrapped tool '${action}' has no execute function.`
        );
      }
      return opts.tool.execute(args, options);
    },
  };
}
