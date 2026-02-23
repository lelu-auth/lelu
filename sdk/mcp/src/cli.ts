#!/usr/bin/env node
/**
 * @prism/mcp CLI
 *
 * Usage:
 *   npx @prism/mcp start [options]
 *
 * Options:
 *   --engine-url  <url>   Prism Engine base URL (default: http://localhost:8082)
 *   --api-key     <key>   Prism Engine API key  (or set PRISM_API_KEY env var)
 *   --timeout     <ms>    Request timeout in ms  (default: 10000)
 *
 * Environment variables:
 *   PRISM_ENGINE_URL   Prism Engine base URL
 *   PRISM_API_KEY      Prism Engine API key
 */

import { runStdio, runHttp } from "./server.js";

// ─── Minimal arg parser ───────────────────────────────────────────────────────

function parseArgs(argv: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg?.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        result[key] = next;
        i++;
      } else {
        result[key] = "true";
      }
    }
  }
  return result;
}

function printHelp() {
  console.error(`
@prism/mcp — Model Context Protocol server for Prism

Usage:
  npx @prism/mcp start [options]

Options:
  --engine-url <url>    Prism Engine base URL (default: http://localhost:8082)
  --api-key    <key>    Prism Engine API key  (or PRISM_API_KEY env var)
  --timeout    <ms>     Request timeout in ms  (default: 10000)
  --transport  <mode>   Transport mode: stdio | http  (default: stdio)
  --port       <port>   HTTP port when --transport=http  (default: 3001)

Tools exposed to the AI agent:
  prism_agent_authorize   Authorize an agent action (confidence-aware)
  prism_authorize         Authorize a human user action
  prism_mint_token        Mint a short-lived scoped JWT
  prism_revoke_token      Revoke a JIT token immediately
  prism_health            Check Engine health

Examples:
  # Start with defaults (Engine on localhost:8082, no auth)
  npx @prism/mcp start

  # Start with a custom Engine URL and API key
  npx @prism/mcp start --engine-url http://prism.internal:8082 --api-key sk_live_xxx

  # Cursor / Claude Desktop config (settings.json or claude_desktop_config.json):
  # {
  #   "mcpServers": {
  #     "prism": {
  #       "command": "npx",
  #       "args": ["@prism/mcp", "start"],
  #       "env": {
  #         "PRISM_ENGINE_URL": "http://localhost:8082",
  #         "PRISM_API_KEY": "your_key"
  #       }
  #     }
  #   }
  # }
`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    process.exit(command ? 0 : 1);
  }

  if (command !== "start") {
    console.error(`Unknown command: ${command}\nRun "npx @prism/mcp --help" for usage.`);
    process.exit(1);
  }

  const flags = parseArgs(args.slice(1));

  const engineUrl  = flags["engine-url"] ?? process.env["PRISM_ENGINE_URL"] ?? "http://localhost:8082";
  const apiKey     = flags["api-key"]    ?? process.env["PRISM_API_KEY"];
  const timeoutMs  = flags["timeout"]    ? parseInt(flags["timeout"], 10) : 10_000;
  const transport  = flags["transport"]  ?? process.env["MCP_TRANSPORT"] ?? "stdio";
  const port       = flags["port"]       ? parseInt(flags["port"], 10)
                   : process.env["MCP_PORT"] ? parseInt(process.env["MCP_PORT"], 10)
                   : 3001;

  if (isNaN(timeoutMs) || timeoutMs < 1) {
    console.error("--timeout must be a positive integer (milliseconds)");
    process.exit(1);
  }

  if (transport !== "stdio" && transport !== "http") {
    console.error(`--transport must be 'stdio' or 'http', got: ${transport}`);
    process.exit(1);
  }

  // Log to stderr so it doesn't pollute the MCP stdio stream
  console.error(`[prism-mcp] Starting MCP server`);
  console.error(`[prism-mcp]   Engine URL : ${engineUrl}`);
  console.error(`[prism-mcp]   API key    : ${apiKey ? "***" + apiKey.slice(-4) : "(none)"}`);
  console.error(`[prism-mcp]   Timeout    : ${timeoutMs}ms`);
  console.error(`[prism-mcp]   Transport  : ${transport}${transport === "http" ? ` (port ${port})` : ""}`);

  try {
    if (transport === "http") {
      await runHttp({ engineUrl, apiKey, timeoutMs }, port);
    } else {
      console.error(`[prism-mcp] Listening on stdio…`);
      await runStdio({ engineUrl, apiKey, timeoutMs });
    }
  } catch (err) {
    console.error("[prism-mcp] Fatal error:", err);
    process.exit(1);
  }
}

main();
