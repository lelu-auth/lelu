import type { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismClient } from "../client";

export interface AuthorizeOptions {
  /** Base URL of the Prism engine (default: http://localhost:8080) */
  baseUrl?: string;
  /** API key for the Prism engine */
  apiKey?: string;
  /** HTTP header that carries the actor identifier (default: x-actor) */
  actorHeader?: string;
  /** Confidence score to pass to the engine (default: 1.0) */
  confidence?: number;
  /** Explicit PrismClient instance (overrides baseUrl/apiKey) */
  client?: PrismClient;
}

/**
 * Express middleware factory that calls the Prism engine and either calls
 * `next()` (allowed) or returns a 403 JSON response (denied / human_review).
 *
 * ```ts
 * import express from "express";
 * import { authorize } from "@prism/sdk/express";
 *
 * const app = express();
 * app.get("/sensitive", authorize("files.read", { confidence: 0.9 }), handler);
 * ```
 */
export function authorize(action: string, opts: AuthorizeOptions = {}): RequestHandler {
  const client =
    opts.client ??
    new PrismClient({
      baseUrl: opts.baseUrl ?? process.env["PRISM_BASE_URL"] ?? "http://localhost:8080",
      apiKey: opts.apiKey ?? process.env["PRISM_API_KEY"],
    });

  const actorHeader = opts.actorHeader ?? "x-actor";
  const confidence = opts.confidence ?? 1.0;

  return async function prismAuthorize(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const actor = (req.headers[actorHeader] as string | undefined) ?? "anonymous";

    try {
      const decision = await client.agentAuthorize({ actor, action, confidence });

      if (decision.allowed) {
        // Attach decision to request for downstream handlers
        (req as Request & { prismDecision: typeof decision }).prismDecision = decision;
        next();
        return;
      }

      res.status(403).json({
        error: "forbidden",
        decision: decision.decision,
        reason: decision.reason ?? "denied by policy",
        actor,
        action,
      });
    } catch (err) {
      res.status(503).json({
        error: "prism_unavailable",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };
}
