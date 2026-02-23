export default function DocsAuditTrail() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Core Concepts
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">Audit Trail</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Prism maintains a comprehensive, immutable audit log of every authorization decision made by the engine. This is crucial for compliance, debugging, and understanding agent behavior.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">What is Logged?</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Every time an agent requests authorization, Prism records a detailed event. This includes both approved and denied requests, as well as requests that were queued for human review.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
              <h3 className="font-medium text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Request Details
              </h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>• Agent ID</li>
                <li>• Action requested</li>
                <li>• Target resource</li>
                <li>• Provided confidence score</li>
                <li>• Request context/reasoning</li>
              </ul>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
              <h3 className="font-medium text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Decision Details
              </h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>• Final decision (allow/deny/queue)</li>
                <li>• Timestamp</li>
                <li>• Policies evaluated</li>
                <li>• Human reviewer ID (if applicable)</li>
                <li>• Review timestamp (if applicable)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Viewing the Audit Trail</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            The Prism Platform provides a dedicated "Audit" page where you can search, filter, and inspect all authorization events.
          </p>
          
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400 dark:text-zinc-500 mb-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">Interactive Audit Dashboard</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
              Navigate to the "Audit" section in the Prism UI to view the complete history of agent actions.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Storage Backends</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            By default, Prism stores audit logs in its PostgreSQL database. For long-term retention and compliance, you can configure Prism to sync logs to external storage.
          </p>
          
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5 flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">docker-compose.yml</span>
            </div>
            <div className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
              <pre><code>{`services:
  engine:
    image: prism-engine:latest
    environment:
      # Enable S3 sync for audit logs
      - PRISM_S3_BUCKET=my-company-audit-logs
      - AWS_REGION=us-east-1
      - AWS_ACCESS_KEY_ID=\${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=\${AWS_SECRET_ACCESS_KEY}`}</code></pre>
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a href="/docs/human-in-loop" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Previous: Human-in-the-Loop
        </a>
        <a href="/docs/api/authorize" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Next: API Reference
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  );
}