export default function DocsApiAgent() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm font-medium mb-6">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          API Reference
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
          Agent API
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Endpoints for managing AI agents within Lelu. Register new agents and retrieve their
          reputation scores.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
            Register an Agent
          </h2>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5 flex items-center gap-2">
              <span className="text-xs font-bold text-green-400">POST</span>
              <span className="text-xs text-zinc-400 font-mono">/api/v1/agents</span>
            </div>
            <div className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
              <pre>
                <code>{`// Request Body
{
  "name": "Customer Support Bot",
  "description": "Handles tier 1 support tickets",
  "model": "gpt-4" // Optional
}

// Response (201 Created)
{
  "id": "agent_abc123",
  "name": "Customer Support Bot",
  "api_key": "sk_live_...", // Only shown once!
  "created_at": "2023-10-27T10:00:00Z"
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
            Get Agent Reputation
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Retrieve an agent's current reputation score, which is calculated based on its history
            of approved vs. denied requests.
          </p>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5 flex items-center gap-2">
              <span className="text-xs font-bold text-blue-400">GET</span>
              <span className="text-xs text-zinc-400 font-mono">/api/v1/agents/:id/reputation</span>
            </div>
            <div className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
              <pre>
                <code>{`// Response (200 OK)
{
  "agent_id": "agent_abc123",
  "reputation_score": 0.92,
  "total_requests": 150,
  "approved_requests": 138,
  "denied_requests": 12
}`}</code>
              </pre>
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a
          href="/docs/api/queue"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Previous: Queue API
        </a>
        <div className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 dark:text-zinc-600">
          End of Documentation
        </div>
      </div>
    </div>
  );
}
