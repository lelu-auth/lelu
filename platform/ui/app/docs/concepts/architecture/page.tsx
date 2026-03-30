export default function DocsConceptArchitecture() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Concepts
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">Architecture</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Lelu is designed with a strict separation between the data plane (Engine) and the control plane (Platform). This ensures high availability, low latency, and secure policy evaluation.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 id="split-architecture" className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">The Split Architecture</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            To ensure that authorization checks never block your AI agents, Lelu splits its responsibilities into two distinct services:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600 dark:text-purple-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">The Engine (Data Plane)</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                A lightweight, high-performance Go service that evaluates Rego policies in memory. It handles all <code className="text-xs bg-zinc-200 dark:bg-zinc-800 px-1 rounded">/authorize</code> requests from your agents. It uses Redis for fast queueing and caching.
              </p>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">The Platform (Control Plane)</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                A Go API and Next.js UI that manages policies, human-in-the-loop approvals, and the audit trail. It uses PostgreSQL for persistent storage and syncs policies down to the Engine.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 id="data-flow" className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Data Flow</h2>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 p-6 overflow-hidden">
            <ol className="relative border-l-2 border-zinc-800 ml-3 space-y-6">
              <li className="pl-6">
                <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5"></div>
                <h4 className="text-sm font-semibold text-white mb-1">1. Policy Sync</h4>
                <p className="text-sm text-zinc-400">The Platform pushes updated Rego policies to the Engine via a secure gRPC/HTTP stream.</p>
              </li>
              <li className="pl-6">
                <div className="absolute w-3 h-3 bg-purple-500 rounded-full -left-[7px] top-1.5"></div>
                <h4 className="text-sm font-semibold text-white mb-1">2. Authorization Request</h4>
                <p className="text-sm text-zinc-400">An AI agent calls the Engine's <code className="text-xs bg-zinc-800 px-1 rounded">/authorize</code> endpoint. The Engine evaluates the policy in &lt;2ms.</p>
              </li>
              <li className="pl-6">
                <div className="absolute w-3 h-3 bg-yellow-500 rounded-full -left-[7px] top-1.5"></div>
                <h4 className="text-sm font-semibold text-white mb-1">3. Human-in-the-loop (If needed)</h4>
                <p className="text-sm text-zinc-400">If confidence is low, the Engine pushes the request to Redis. The Platform reads from Redis and displays it in the UI for human approval.</p>
              </li>
              <li className="pl-6">
                <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1.5"></div>
                <h4 className="text-sm font-semibold text-white mb-1">4. Audit Logging</h4>
                <p className="text-sm text-zinc-400">Every decision is asynchronously batched and sent to the Platform (and optionally S3) for immutable audit logging.</p>
              </li>
            </ol>
          </div>
        </section>
      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a href="/docs/installation" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Previous: Installation
        </a>
        <a href="/docs/concepts/api" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Next: API
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  );
}
