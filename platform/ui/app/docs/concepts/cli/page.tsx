"use client";

import { useState } from "react";

export default function DocsConceptCli() {
  const [quickTab, setQuickTab] = useState<"Cursor" | "Claude Code" | "Open Code" | "Manual">("Cursor");
  const [configTab, setConfigTab] = useState<"SSE (Docker)" | "stdio (npx)" | "Claude Code">("SSE (Docker)");

  const quickAddCommands: Record<typeof quickTab, string> = {
    Cursor: "npx @prism/mcp add --cursor",
    "Claude Code": "npx @prism/mcp add --claude",
    "Open Code": "npx @prism/mcp add --open-code",
    Manual: "npx @prism/mcp start --transport stdio --engine-url http://localhost:8080 --api-key YOUR_API_KEY",
  };

  const configSnippets: Record<typeof configTab, string> = {
    "SSE (Docker)": `{
  "mcpServers": {
    "prism": {
      "url": "http://localhost:3001/sse"
    }
  }
}`,
    "stdio (npx)": `{
  "mcpServers": {
    "prism": {
      "command": "npx",
      "args": ["@prism/mcp", "start", "--transport", "stdio"],
      "env": {
        "PRISM_ENGINE_URL": "http://localhost:8080",
        "PRISM_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}`,
    "Claude Code": "claude mcp add --transport http prism http://localhost:3001/sse",
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Concepts
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">CLI &amp; MCP</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          The Prism CLI provides tools for local development, policy testing, and running the Model Context Protocol (MCP) server for seamless integration with AI assistants like Cursor and Claude.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Installation</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            The CLI is distributed as an npm package. You can run it directly using <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">npx</code> or install it globally.
          </p>
          
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">terminal</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300">
              {`npm install -g @prism/cli`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Model Context Protocol (MCP)</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Prism ships a standalone MCP server (<code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">@prism/mcp</code>) that exposes policy-aware authorization tools over both stdio (for local AI clients) and HTTP/SSE (for networked or Docker deployments). When an AI assistant calls a tool, Prism evaluates your Rego policy and can pause execution to request human approval.
          </p>

          {/* Docker (recommended) */}
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Docker (recommended)</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            The MCP server is included in the Prism <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">docker-compose.yml</code>. Start it alongside the engine:
          </p>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-4">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">terminal</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
              {`docker compose up -d mcp

# Health check
curl http://localhost:3001/healthz
# {"status":"ok","service":"prism-mcp"}

# SSE endpoint for AI clients
# http://localhost:3001/sse`}
            </pre>
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">
            The container connects to the engine over the internal Docker network (<code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">http://engine:8080</code>) and listens on port <strong>3001</strong>. Configure your API key via the <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">PRISM_API_KEY</code> environment variable.
          </p>

          {/* npx / local */}
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">npx (local stdio)</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            For local development with Cursor or Claude Desktop, run the MCP server directly via npx in stdio mode:
          </p>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">terminal</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
              {`npx @prism/mcp start --transport stdio \\
  --engine-url http://localhost:8080 \\
  --api-key YOUR_API_KEY`}
            </pre>
          </div>

          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Client setup</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Use CLI quick-add for your client, or choose manual configuration for full control:
          </p>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-4">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {(["Cursor", "Claude Code", "Open Code", "Manual"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setQuickTab(tab)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        quickTab === tab ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
              {quickAddCommands[quickTab]}
            </pre>
          </div>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {(["SSE (Docker)", "stdio (npx)", "Claude Code"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setConfigTab(tab)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        configTab === tab ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
              {configSnippets[configTab]}
            </pre>
          </div>

          {/* Available tools */}
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Available MCP tools</h3>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5">
                  <th className="text-left px-4 py-3 font-semibold text-zinc-900 dark:text-white">Tool</th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-900 dark:text-white">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                {[
                  ["prism_agent_authorize", "Confidence-aware authorization for an AI agent action"],
                  ["prism_authorize", "Authorize a human user action against the active policy"],
                  ["prism_mint_token", "Issue a short-lived JIT token for a specific action"],
                  ["prism_revoke_token", "Revoke a previously issued token"],
                  ["prism_health", "Check that the Prism engine is reachable"],
                ].map(([tool, desc]) => (
                  <tr key={tool}>
                    <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400 whitespace-nowrap">{tool}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Policy Testing</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            You can test your Rego policies locally before deploying them to the Platform.
          </p>
          
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">terminal</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
              {`# Evaluate a policy against a mock request
prism policy eval ./policy.rego \\
  --action "delete_db" \\
  --confidence 0.85

# Output:
# Result: requires_approval
# Reason: Confidence 0.85 is below threshold 0.95 for action 'delete_db'`}
            </pre>
          </div>
        </section>
      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a href="/docs/concepts/client" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Previous: Client SDK
        </a>
        <a href="/docs/confidence" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Next: Confidence Scores
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  );
}
