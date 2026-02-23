import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import * as http from "http";
import { z } from "zod";

// ─── Config ───────────────────────────────────────────────────────────────────

export interface PrismMcpConfig {
  /** Prism Engine base URL. Default: http://localhost:8082 */
  engineUrl?: string;
  /** Prism Engine API key */
  apiKey?: string;
  /** Request timeout in ms. Default: 10_000 */
  timeoutMs?: number;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function call<T>(
  method: "GET" | "POST" | "DELETE",
  baseUrl: string,
  apiKey: string | undefined,
  timeoutMs: number,
  path: string,
  body?: unknown
): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      throw new Error(
        `Prism Engine error ${res.status}: ${(json["error"] as string) ?? JSON.stringify(json)}`
      );
    }
    return json as T;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Server factory ───────────────────────────────────────────────────────────

export function createPrismMcpServer(cfg: PrismMcpConfig = {}): McpServer {
  const baseUrl  = (cfg.engineUrl  ?? process.env["PRISM_ENGINE_URL"] ?? "http://localhost:8082").replace(/\/$/, "");
  const apiKey   = cfg.apiKey      ?? process.env["PRISM_API_KEY"];
  const timeout  = cfg.timeoutMs   ?? 10_000;

  const post = <T>(path: string, body: unknown) =>
    call<T>("POST", baseUrl, apiKey, timeout, path, body);

  const get = <T>(path: string) =>
    call<T>("GET", baseUrl, apiKey, timeout, path);

  const del = <T>(path: string) =>
    call<T>("DELETE", baseUrl, apiKey, timeout, path);

  // ── MCP Server ──────────────────────────────────────────────────────────────

  const server = new McpServer({
    name:    "prism",
    version: "1.0.0",
  });

  // ── Tool: agent_authorize ──────────────────────────────────────────────────
  server.tool(
    "prism_agent_authorize",
    "Ask the Prism Engine whether an AI agent is allowed to perform an action. " +
    "Prism evaluates the action against your OPA policy using the agent's live confidence score. " +
    "Returns allowed/denied/requires_human_review along with a trace ID for auditing.",
    {
      actor:      z.string().describe("The agent or bot performing the action, e.g. 'invoice_bot'"),
      action:     z.string().describe("The action being requested, e.g. 'delete_records'"),
      resource:   z.string().optional().describe("Optional resource the action targets, e.g. 'invoice:42'"),
      confidence: z.number().min(0).max(1).describe("Agent's current confidence score (0–1)"),
      actingFor:  z.string().optional().describe("User ID the agent is acting on behalf of"),
      scope:      z.string().optional().describe("Requested permission scope, e.g. 'read:invoices'"),
    },
    async ({ actor, action, resource, confidence, actingFor, scope }) => {
      const data = await post<{
        allowed: boolean;
        reason: string;
        trace_id: string;
        requires_human_review: boolean;
        confidence_used: number;
        downgraded_scope?: string;
      }>("/v1/agent/authorize", {
        actor,
        action,
        resource,
        confidence,
        acting_for: actingFor,
        scope,
      });

      const status = data.requires_human_review
        ? "REQUIRES_HUMAN_REVIEW"
        : data.allowed
        ? "ALLOWED"
        : "DENIED";

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                status,
                allowed:              data.allowed,
                requires_human_review: data.requires_human_review,
                reason:               data.reason,
                trace_id:             data.trace_id,
                confidence_used:      data.confidence_used,
                ...(data.downgraded_scope ? { downgraded_scope: data.downgraded_scope } : {}),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // ── Tool: authorize (human) ────────────────────────────────────────────────
  server.tool(
    "prism_authorize",
    "Check whether a human user is permitted to perform an action. " +
    "Use prism_agent_authorize instead when the actor is an AI agent.",
    {
      userId:   z.string().describe("The user performing the action"),
      action:   z.string().describe("The action being requested"),
      resource: z.string().optional().describe("Optional resource identifier"),
    },
    async ({ userId, action, resource }) => {
      const data = await post<{
        allowed: boolean;
        reason: string;
        trace_id: string;
      }>("/v1/authorize", { user_id: userId, action, resource });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                allowed:  data.allowed,
                reason:   data.reason,
                trace_id: data.trace_id,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // ── Tool: mint_token ───────────────────────────────────────────────────────
  server.tool(
    "prism_mint_token",
    "Mint a short-lived scoped JWT for an AI agent. The token expires after ttlSeconds (default 60 s). " +
    "Use this when you need to grant an agent temporary credentials for a specific scope rather than calling authorize on every action.",
    {
      scope:      z.string().describe("Permission scope to grant, e.g. 'read:invoices write:comments'"),
      actingFor:  z.string().optional().describe("User ID the agent is acting on behalf of"),
      ttlSeconds: z.number().int().min(1).max(3600).default(60).describe("Token lifetime in seconds (default 60, max 3600)"),
    },
    async ({ scope, actingFor, ttlSeconds }) => {
      const data = await post<{
        token: string;
        token_id: string;
        expires_at: number;
      }>("/v1/tokens/mint", {
        scope,
        acting_for: actingFor,
        ttl_seconds: ttlSeconds,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                token:      data.token,
                token_id:   data.token_id,
                expires_at: new Date(data.expires_at * 1000).toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // ── Tool: revoke_token ─────────────────────────────────────────────────────
  server.tool(
    "prism_revoke_token",
    "Immediately revoke a JIT token by its ID. Use this when a task is complete or when suspicious activity is detected.",
    {
      tokenId: z.string().describe("The token ID returned by prism_mint_token"),
    },
    async ({ tokenId }) => {
      const data = await del<{ success: boolean }>(`/v1/tokens/${encodeURIComponent(tokenId)}`);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: data.success }, null, 2),
          },
        ],
      };
    }
  );

  // ── Tool: health ───────────────────────────────────────────────────────────
  server.tool(
    "prism_health",
    "Check whether the Prism Engine is reachable and healthy. Returns the engine status and version.",
    {},
    async () => {
      const data = await get<{ status: string; version?: string }>("/healthz");

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { healthy: data.status === "ok", status: data.status, version: data.version },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  return server;
}

// ─── Stdio runner ─────────────────────────────────────────────────────────────

export async function runStdio(cfg?: PrismMcpConfig): Promise<void> {
  const server    = createPrismMcpServer(cfg);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// ─── HTTP/SSE runner ──────────────────────────────────────────────────────────

export async function runHttp(cfg?: PrismMcpConfig, port = 3001): Promise<void> {
  const transports: Record<string, SSEServerTransport> = {};

  const httpServer = http.createServer(async (req, res) => {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

    // Health probe (used by Docker healthcheck)
    if (req.url === "/healthz" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", service: "prism-mcp" }));
      return;
    }

    // SSE endpoint — agent opens GET /sse to establish a session
    if (req.url === "/sse" && req.method === "GET") {
      const server    = createPrismMcpServer(cfg);
      const transport = new SSEServerTransport("/messages", res);
      transports[transport.sessionId] = transport;
      res.on("close", () => { delete transports[transport.sessionId]; });
      await server.connect(transport);
      return;
    }

    // Messages endpoint — agent POSTs to /messages?sessionId=<id>
    if (req.url?.startsWith("/messages") && req.method === "POST") {
      const sessionId = new URL(req.url, "http://x").searchParams.get("sessionId") ?? "";
      const transport = transports[sessionId];
      if (!transport) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "session not found" }));
        return;
      }
      await transport.handlePostMessage(req, res);
      return;
    }

    res.writeHead(404);
    res.end();
  });

  await new Promise<void>((resolve) => httpServer.listen(port, "0.0.0.0", resolve));
  console.error(`[prism-mcp] HTTP/SSE server listening on http://0.0.0.0:${port}`);
  console.error(`[prism-mcp]   SSE endpoint  : GET  /sse`);
  console.error(`[prism-mcp]   Post endpoint : POST /messages?sessionId=<id>`);
  console.error(`[prism-mcp]   Health check  : GET  /healthz`);

  // Keep alive
  await new Promise<void>((_, reject) => httpServer.on("error", reject));
}
