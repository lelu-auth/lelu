"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"ts" | "py">("ts");

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30">
      <main className="max-w-6xl mx-auto px-6 py-24 flex flex-col items-center text-center">
        {/* Hero Section */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          v1.0.0 is now available
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          The most comprehensive <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Authorization Engine
          </span> <br />
          for AI Agents
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Prizm Engine provides confidence-aware access control, human-in-the-loop approvals, and SOC 2-ready audit trails for your autonomous agents.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/audit" className="px-8 py-3 rounded-md bg-white text-black font-semibold hover:bg-zinc-200 transition-colors">
            View Audit Log
          </Link>
          <a href="https://github.com/Abenezer0923/Prism#readme" target="_blank" rel="noreferrer" className="px-8 py-3 rounded-md bg-zinc-900 border border-zinc-800 text-white font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            GitHub
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-32 text-left w-full">
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-zinc-100">Confidence-Aware</h3>
            <p className="text-zinc-400 leading-relaxed">Dynamically adjust permissions based on the AI agent's confidence level. Require human approval for low-confidence actions.</p>
          </div>
          
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-zinc-100">Human-in-the-loop</h3>
            <p className="text-zinc-400 leading-relaxed">Seamlessly route sensitive or low-confidence requests to a human approval queue before execution.</p>
          </div>
          
          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-zinc-100">SOC 2 Audit Trail</h3>
            <p className="text-zinc-400 leading-relaxed">Immutable, cryptographically verifiable logs of every decision made by the engine, ready for compliance.</p>
          </div>
        </div>

        {/* Code Showcase */}
        <div className="mt-32 w-full max-w-4xl text-left">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Start</h2>
            <p className="text-zinc-400">Install the SDK for your preferred language.</p>
          </div>
          
          <div className="rounded-xl overflow-hidden border border-zinc-800 bg-[#0d0d0d] shadow-2xl">
            <div className="flex items-center px-4 py-3 bg-zinc-900/80 border-b border-zinc-800">
              <div className="flex gap-2 mr-6">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex gap-4 text-sm font-medium">
                <button 
                  className={`px-2 py-1 rounded transition-colors ${activeTab === "ts" ? "text-white bg-zinc-800" : "text-zinc-500 hover:text-zinc-300"}`}
                  onClick={() => setActiveTab("ts")}
                >
                  TypeScript
                </button>
                <button 
                  className={`px-2 py-1 rounded transition-colors ${activeTab === "py" ? "text-white bg-zinc-800" : "text-zinc-500 hover:text-zinc-300"}`}
                  onClick={() => setActiveTab("py")}
                >
                  Python
                </button>
              </div>
            </div>
            
            <div className="p-6 font-mono text-sm overflow-x-auto">
              <div className="text-zinc-500 mb-4 select-none">
                <span className="text-pink-500 mr-2">$</span> 
                <span className="text-zinc-300">{activeTab === "ts" ? "npm install prizm-engine" : "pip install prizm-engine"}</span>
              </div>
              <pre className="text-zinc-300 leading-relaxed">
                <code>
{activeTab === "ts" ? <><span className="text-purple-400">import</span> {"{ PrismClient }"} <span className="text-purple-400">from</span> <span className="text-green-400">"prizm-engine"</span>;

<span className="text-purple-400">const</span> client = <span className="text-purple-400">new</span> <span className="text-yellow-300">PrismClient</span>({"{ "}
  endpoint: <span className="text-green-400">"http://localhost:8080"</span>,
{"}"});

<span className="text-purple-400">const</span> decision = <span className="text-purple-400">await</span> client.<span className="text-blue-400">authorizeAgent</span>({"{ "}
  actor: <span className="text-green-400">"agent-123"</span>,
  action: <span className="text-green-400">"s3:DeleteObject"</span>,
  resource: {"{ bucket: "} <span className="text-green-400">"prod-data"</span> {"}"},
  confidence: <span className="text-orange-400">0.85</span>,
{"}"});

<span className="text-purple-400">if</span> (decision.allowed) {"{ "}
  console.<span className="text-blue-400">log</span>(<span className="text-green-400">"Action approved!"</span>);
{"} "} <span className="text-purple-400">else if</span> (decision.requires_human_review) {"{ "}
  console.<span className="text-blue-400">log</span>(<span className="text-green-400">"Sent to human approval queue."</span>);
{"}"}</> : <><span className="text-purple-400">from</span> prizm_engine <span className="text-purple-400">import</span> PrismClient

client = <span className="text-yellow-300">PrismClient</span>(endpoint=<span className="text-green-400">"http://localhost:8080"</span>)

decision = client.<span className="text-blue-400">authorize_agent</span>(
    actor=<span className="text-green-400">"agent-123"</span>,
    action=<span className="text-green-400">"s3:DeleteObject"</span>,
    resource={"{\"bucket\": "} <span className="text-green-400">"prod-data"</span>{"}"},
    confidence=<span className="text-orange-400">0.85</span>
)

<span className="text-purple-400">if</span> decision.allowed:
    <span className="text-blue-400">print</span>(<span className="text-green-400">"Action approved!"</span>)
<span className="text-purple-400">elif</span> decision.requires_human_review:
    <span className="text-blue-400">print</span>(<span className="text-green-400">"Sent to human approval queue."</span>)</>}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Ecosystem Section */}
        <div className="mt-32 mb-24 w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ecosystem</h2>
            <p className="text-zinc-400">Integrates seamlessly with your favorite tools.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
              <h3 className="text-lg font-semibold mb-2 text-zinc-200">LangChain</h3>
              <p className="text-sm text-zinc-400">Use our pre-built LangChain tools to secure your agents.</p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
              <h3 className="text-lg font-semibold mb-2 text-zinc-200">AutoGPT</h3>
              <p className="text-sm text-zinc-400">Drop-in plugin for AutoGPT to add confidence-aware auth.</p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
              <h3 className="text-lg font-semibold mb-2 text-zinc-200">VS Code</h3>
              <p className="text-sm text-zinc-400">Manage policies and approve requests directly from your editor.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
