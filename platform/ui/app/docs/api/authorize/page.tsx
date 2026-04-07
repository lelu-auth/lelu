export default function DocsApiAuthorize() {
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
          POST /api/v1/authorize
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          The core endpoint for requesting authorization. AI agents call this endpoint before
          performing any sensitive action.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Request</h2>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5 flex items-center gap-2">
              <span className="text-xs font-bold text-green-400">POST</span>
              <span className="text-xs text-zinc-400 font-mono">/api/v1/authorize</span>
            </div>
            <div className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
              <pre>
                <code>{`{
  "agent_id": "string",      // Required: Unique identifier for the AI agent
  "action": "string",        // Required: The action the agent wants to perform
  "resource": "string",      // Required: The target resource
  "confidence": 0.85,        // Required: Float between 0.0 and 1.0
  "context": {               // Optional: Additional context for policy evaluation
    "reason": "string",
    "user_id": "string"
  }
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Response</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            The response indicates whether the action is allowed, denied, or requires human
            approval.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Allowed (200 OK)
              </h3>
              <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
                <div className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
                  <pre>
                    <code>{`{
  "status": "allow",
  "request_id": "req_12345abcde"
}`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Requires Approval (202 Accepted)
              </h3>
              <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
                <div className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
                  <pre>
                    <code>{`{
  "status": "requires_approval",
  "request_id": "req_67890fghij",
  "message": "Action queued for human review."
}`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Denied (403 Forbidden)
              </h3>
              <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
                <div className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
                  <pre>
                    <code>{`{
  "status": "deny",
  "request_id": "req_13579klmno",
  "message": "Confidence score too low for requested action."
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a
          href="/docs/audit-trail"
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
          Previous: Audit Trail
        </a>
        <a
          href="/docs/api/queue"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Next: Queue API
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
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
