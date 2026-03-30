"use client";

import { useState } from "react";

export default function DocsPage() {
  const [cliTab, setCliTab] = useState<"Cursor" | "Claude Code" | "Open Code" | "Manual">("Cursor");
  const [manualTab, setManualTab] = useState<"Claude Code" | "Open Code" | "Manual">("Claude Code");

  const cliCommands: Record<typeof cliTab, string> = {
    Cursor: "npx @lelu/mcp add --cursor",
    "Claude Code": "npx @lelu/mcp add --claude",
    "Open Code": "npx @lelu/mcp add --open-code",
    Manual: "npx @lelu/mcp start --transport stdio",
  };

  const manualCommands: Record<typeof manualTab, string> = {
    "Claude Code": "claude mcp add --transport http lelu http://localhost:3003/sse",
    "Open Code": "open-code mcp add --transport http lelu http://localhost:3003/sse",
    Manual: `{
  "mcpServers": {
    "lelu": {
      "url": "http://localhost:3003/sse"
    }
  }
}`,
  };

  return (
    <div>
      <div className="mb-12">
        <h1 id="introduction" className="text-5xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
          Introduction
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Lelu is a policy engine for AI-driven systems. It combines Rego-based authorization, confidence-aware decisioning, human approval queues, and auditable enforcement so teams can ship AI agents without giving up control.
        </p>
      </div>

      {/* Generate API Key CTA */}
      <div className="mb-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-2 border-indigo-200 dark:border-indigo-800/50 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Get Your Free API Key</h2>
              <p className="text-base text-zinc-600 dark:text-zinc-400 mb-4">
                Start testing Lelu instantly with no signup required. Generate an anonymous API key and get 500 requests per day.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="/api-key" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Generate API Key
                </a>
                <a 
                  href="/docs/quickstart" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-lg font-semibold border-2 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                >
                  View Quickstart
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-indigo-200 dark:border-indigo-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-white">Instant Access</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">No email required</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-lg">🔒</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-white">Privacy First</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Completely anonymous</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-white">500 Requests/Day</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Perfect for testing</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 id="features" className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">Features</h2>
      <p className="text-base text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
        Lelu includes the core building blocks needed to govern AI actions in production, with simple defaults for development and stronger controls for enterprise workloads.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        <div className="p-5 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
          <h3 className="font-semibold text-base text-zinc-900 dark:text-white mb-2">Framework Agnostic</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Works with any AI framework or model provider. Integrate with OpenAI, Anthropic, or custom agents.</p>
        </div>
        <div className="p-5 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
          <h3 className="font-semibold text-base text-zinc-900 dark:text-white mb-2">Confidence-Aware Policies</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Author policies that branch on confidence score instead of binary allow/deny only.</p>
        </div>
        <div className="p-5 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
          <h3 className="font-semibold text-base text-zinc-900 dark:text-white mb-2">Human-in-the-Loop</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Automatically queue risky operations for reviewers before execution.</p>
        </div>
        <div className="p-5 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
          <h3 className="font-semibold text-base text-zinc-900 dark:text-white mb-2">Account & Session Management</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Track agent reputation, detect anomalies, and monitor behavioral patterns.</p>
        </div>
        <div className="p-5 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
          <h3 className="font-semibold text-base text-zinc-900 dark:text-white mb-2">Observability & Tracing</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">OpenTelemetry integration with AI agent semantic conventions.</p>
        </div>
        <div className="p-5 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
          <h3 className="font-semibold text-base text-zinc-900 dark:text-white mb-2">Multi-Agent Coordination</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Support for delegation chains and swarm operations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        <a href="/docs/installation" className="group p-6 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 hover:border-zinc-400 dark:hover:border-white/20 transition-all">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-white/10 flex items-center justify-center mb-4 group-hover:bg-zinc-200 dark:group-hover:bg-white/20 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700 dark:text-zinc-300"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <h3 className="font-semibold text-base text-zinc-900 dark:text-white mb-2">Installation</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Get started with Lelu in less than 5 minutes.</p>
        </a>

        <a href="/docs/concepts/architecture" className="group p-6 rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/30 hover:border-zinc-400 dark:hover:border-white/20 transition-all">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-white/10 flex items-center justify-center mb-4 group-hover:bg-zinc-200 dark:group-hover:bg-white/20 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700 dark:text-zinc-300"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2v10l8.66 5"/></svg>
          </div>
          <h3 className="font-semibold text-base text-zinc-900 dark:text-white mb-2">Architecture</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Learn how Lelu works under the hood.</p>
        </a>
      </div>

      <h2 id="why-lelu" className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">Why Lelu?</h2>
      <p className="text-base text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
        Traditional authorization systems (like RBAC or ABAC) are binary: a user either has permission or they don't. But AI agents operate on probabilities. When an AI agent tries to execute a trade, delete a database, or send an email, you don't just want to know <em>if</em> it has permission—you want to know <em>how confident</em> it is.
      </p>
      
      <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/10 rounded-lg p-8 mb-16">
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">How Lelu Works</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-white/10 flex items-center justify-center shrink-0 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              1
            </div>
            <div>
              <h4 className="font-medium text-base text-zinc-900 dark:text-white mb-1">Confidence-Aware Policies</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Evaluate authorization requests with built-in confidence thresholds. Write rules that adapt to the AI's self-reported certainty.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-white/10 flex items-center justify-center shrink-0 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              2
            </div>
            <div>
              <h4 className="font-medium text-base text-zinc-900 dark:text-white mb-1">Human-in-the-Loop</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Automatically queue risky or low-confidence actions for human review. The AI pauses until a human approves or denies the request.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-white/10 flex items-center justify-center shrink-0 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              3
            </div>
            <div>
              <h4 className="font-medium text-base text-zinc-900 dark:text-white mb-1">Audit Trail</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Every decision, confidence score, and human approval is logged immutably for compliance and debugging.</p>
            </div>
          </div>
        </div>
      </div>

      <h2 id="architecture" className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Architecture</h2>
      
      <div className="bg-zinc-900 dark:bg-black rounded-lg border border-zinc-800 dark:border-white/10 p-6 mb-16 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="flex-1 space-y-3 text-sm">
            <div className="flex items-center gap-3 bg-zinc-800/50 dark:bg-zinc-800/30 p-3 rounded border border-zinc-700/50 dark:border-zinc-700/30">
              <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-xs">🤖</div>
              <div className="text-zinc-300 dark:text-zinc-400">AI Agent proposes action (Conf: 85%)</div>
            </div>
            <div className="flex justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
            </div>
            <div className="flex items-center gap-3 bg-zinc-800/50 dark:bg-zinc-800/30 p-3 rounded border border-zinc-700/50 dark:border-zinc-700/30">
              <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="text-zinc-300 dark:text-zinc-400">Lelu Engine evaluates policy</div>
            </div>
            <div className="flex justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-green-500/10 p-2.5 rounded border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="text-xs text-green-400">Allow (&gt;90%)</div>
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/10 p-2.5 rounded border border-yellow-500/20">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="text-xs text-yellow-400">Review (&lt;90%)</div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-72 bg-zinc-950 dark:bg-zinc-950/50 rounded border border-zinc-800 dark:border-zinc-800/50 p-4 font-mono text-xs text-zinc-400">
            <div className="text-pink-400 mb-2">allow {"{"}</div>
            <div className="pl-4 mb-1">input.action == <span className="text-green-400">"trade"</span></div>
            <div className="pl-4 mb-2">input.confidence {">="} <span className="text-orange-400">0.90</span></div>
            <div className="text-pink-400 mb-4">{"}"}</div>
            
            <div className="text-pink-400 mb-2">require_approval {"{"}</div>
            <div className="pl-4 mb-1">input.action == <span className="text-green-400">"trade"</span></div>
            <div className="pl-4 mb-2">input.confidence {"<"} <span className="text-orange-400">0.90</span></div>
            <div className="text-pink-400">{"}"}</div>
          </div>
        </div>
      </div>

      <h2 id="mcp" className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">Model Context Protocol</h2>
      <p className="text-base text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
        Lelu provides an MCP server so you can use it with any AI model that supports the Model Context Protocol (MCP).
      </p>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4 flex gap-3 mb-8">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p className="text-sm text-blue-900 dark:text-blue-200">
          We provide a first-party MCP, powered by <a href="https://github.com/modelcontextprotocol/servers" className="underline hover:text-blue-700 dark:hover:text-blue-100">fastmcp</a>. You can alternatively use <a href="https://github.com/zckly/mcp-server-lelu" className="underline hover:text-blue-700 dark:hover:text-blue-100">zckly/mcp-server-lelu</a> and other MCP providers.
        </p>
      </div>

      <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">CLI Options</h3>
      <p className="text-base text-zinc-600 dark:text-zinc-400 mb-4">
        Use the Lelu CLI to easily add the MCP server to your preferred client:
      </p>

      {/* Tab-like interface */}
      <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-8">
        <div className="flex items-center px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
          <div className="flex gap-2">
            <button onClick={() => setCliTab("Cursor")} className={`px-3 py-1 text-xs rounded transition-colors ${cliTab === "Cursor" ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              Cursor
            </button>
            <button onClick={() => setCliTab("Claude Code")} className={`px-3 py-1 text-xs rounded transition-colors ${cliTab === "Claude Code" ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              Claude Code
            </button>
            <button onClick={() => setCliTab("Open Code")} className={`px-3 py-1 text-xs rounded transition-colors ${cliTab === "Open Code" ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              Open Code
            </button>
            <button onClick={() => setCliTab("Manual")} className={`px-3 py-1 text-xs rounded transition-colors ${cliTab === "Manual" ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              Manual
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 17l6-6-6-6M12 19h8"/>
            </svg>
            <span>terminal</span>
          </div>
          <pre className="font-mono text-sm text-zinc-300">
            {cliCommands[cliTab]}
          </pre>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Manual Configuration</h3>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
        Alternatively, you can manually configure the MCP server for each client with the Lelu SSE endpoint:
      </p>

      {/* Manual config tabs */}
      <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
        <div className="flex items-center px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
          <div className="flex gap-2">
            <button onClick={() => setManualTab("Claude Code")} className={`px-3 py-1 text-xs rounded transition-colors ${manualTab === "Claude Code" ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              Claude Code
            </button>
            <button onClick={() => setManualTab("Open Code")} className={`px-3 py-1 text-xs rounded transition-colors ${manualTab === "Open Code" ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              Open Code
            </button>
            <button onClick={() => setManualTab("Manual")} className={`px-3 py-1 text-xs rounded transition-colors ${manualTab === "Manual" ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}>
              Manual
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 17l6-6-6-6M12 19h8"/>
            </svg>
            <span>terminal</span>
          </div>
          <pre className="font-mono text-sm text-zinc-300 leading-relaxed">
            {manualCommands[manualTab]}
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        <a href="/docs/concepts/cli" className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-colors">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">AI Tooling</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Use Lelu tools from Cursor, Claude, or any MCP-compatible client.</p>
        </a>
        <a href="/llms.txt" className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-colors">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">LLMs.txt</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Lelu supports the LLMs.txt standard for AI-friendly documentation.</p>
        </a>
        <a href="/docs/concepts/skills" className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-colors">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Skills</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Pre-built authorization patterns for common AI agent workflows.</p>
        </a>
        <a href="/docs/concepts/cli" className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-colors">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">MCP</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Model Context Protocol support for seamless AI integration.</p>
        </a>
        <a href="/docs/concepts/cli" className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-colors">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">CLI Options</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Command-line setup for Cursor, Claude Code, Open Code, and local development.</p>
        </a>
        <a href="/docs/concepts/cli" className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-colors">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Manual Configuration</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Full control over Lelu configuration for advanced use cases.</p>
        </a>
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-zinc-200 dark:border-white/10">
        <div className="text-sm text-zinc-500">Last updated: Today</div>
        <a href="/docs/installation" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Next: Installation
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  );
}