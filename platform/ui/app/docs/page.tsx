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
    "Claude Code": "claude mcp add --transport http lelu http://localhost:3001/sse",
    "Open Code": "open-code mcp add --transport http lelu http://localhost:3001/sse",
    Manual: `{
  "mcpServers": {
    "lelu": {
      "url": "http://localhost:3001/sse"
    }
  }
}`,
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Lelu Engine Overview
        </div>
        <h1 id="introduction" className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">Introduction</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Lelu is a policy engine for AI-driven systems. It combines Rego-based authorization, confidence-aware decisioning, human approval queues, and auditable enforcement so teams can ship AI agents without giving up control.
        </p>
      </div>

      <h2 id="features" className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Features</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
        Lelu includes the core building blocks needed to govern AI actions in production, with simple defaults for development and stronger controls for enterprise workloads.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Confidence-aware policies</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Author policies that branch on confidence score instead of binary allow/deny only.</p>
        </div>
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Human-in-the-loop approvals</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Automatically queue risky operations for reviewers before execution.</p>
        </div>
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Token lifecycle control</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Mint short-lived tokens for approved actions and revoke them when needed.</p>
        </div>
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Audit-ready trail</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Track every decision and approval with immutable, compliance-friendly records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        <a href="/docs/installation" className="group p-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600 dark:text-purple-400"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Installation</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Get started with Lelu in less than 5 minutes.</p>
        </a>

        <a href="/docs/concepts/architecture" className="group p-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2v10l8.66 5"/></svg>
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Architecture</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Learn how Lelu works under the hood.</p>
        </a>
      </div>

      <div className="h-px w-full bg-zinc-200 dark:bg-white/10 my-10"></div>

      <h2 id="why-lelu" className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">The Problem with Traditional Auth</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
        Traditional authorization systems (like RBAC or ABAC) are binary: a user either has permission or they don't. But AI agents operate on probabilities. When an AI agent tries to execute a trade, delete a database, or send an email, you don't just want to know <em>if</em> it has permission—you want to know <em>how confident</em> it is.
      </p>
      
      <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl p-8 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6 relative z-10">The Lelu Advantage</h3>
        <div className="space-y-6 relative z-10">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600 dark:text-green-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <h4 className="font-medium text-zinc-900 dark:text-white mb-1">Confidence-Aware Policies</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Evaluate authorization requests with built-in confidence thresholds. Write rules that adapt to the AI's self-reported certainty.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600 dark:text-yellow-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <h4 className="font-medium text-zinc-900 dark:text-white mb-1">Human-in-the-loop</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Automatically queue risky or low-confidence actions for human review. The AI pauses until a human approves or denies the request.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600 dark:text-purple-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <h4 className="font-medium text-zinc-900 dark:text-white mb-1">Cryptographic Audit Trail</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Every decision, confidence score, and human approval is cryptographically hashed and stored immutably in S3 for SOC2 compliance.</p>
            </div>
          </div>
        </div>
      </div>

      <h2 id="architecture" className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">How it Works</h2>
      
      <div className="bg-zinc-900 dark:bg-black rounded-2xl border border-zinc-800 dark:border-white/10 p-6 mb-12 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
              <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">🤖</div>
              <div className="text-sm text-zinc-300">AI Agent proposes action (Conf: 85%)</div>
            </div>
            <div className="flex justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
            </div>
            <div className="flex items-center gap-3 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
              <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="text-sm text-zinc-300">Lelu Engine evaluates Rego policy</div>
            </div>
            <div className="flex justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="text-xs text-green-400">Allow (&gt;90%)</div>
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="text-xs text-yellow-400">Review (&lt;90%)</div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-64 bg-zinc-950 rounded-xl border border-zinc-800 p-4 font-mono text-xs text-zinc-400">
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

      <h2 id="mcp" className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">MCP</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
        Lelu provides an MCP server so you can use it with any AI model that supports the Model Context Protocol (MCP).
      </p>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex gap-3 mb-6">
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
        <p className="text-sm text-blue-800 dark:text-blue-300">
          We provide a first-party MCP, powered by <a href="https://github.com/modelcontextprotocol/servers" className="underline hover:text-blue-600 dark:hover:text-blue-200">fastmcp</a>. You can alternatively use <a href="https://github.com/zckly/mcp-server-lelu" className="underline hover:text-blue-600 dark:hover:text-blue-200">zckly/mcp-server-lelu</a> and other MCP providers.
        </p>
      </div>

      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">CLI Options</h3>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
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