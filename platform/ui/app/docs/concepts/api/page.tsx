export default function DocsConceptApi() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Concepts
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">API</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Prism provides a comprehensive REST API for both the Engine (data plane) and the Platform (control plane). This guide explains the core concepts behind our API design.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Base URLs</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Because Prism is split into two services, there are two distinct base URLs you will interact with depending on your goal.
          </p>
          
          <div className="space-y-4">
            <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5 flex items-center gap-2">
                <span className="text-xs font-bold text-purple-400">Engine API</span>
                <span className="text-xs text-zinc-500 font-mono">Default: http://localhost:8082</span>
              </div>
              <div className="p-4 text-sm text-zinc-300">
                Used by your AI agents to request authorization (<code className="text-xs bg-zinc-800 px-1 rounded font-mono">/api/v1/authorize</code>). This API is optimized for extreme low latency.
              </div>
            </div>
            
            <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5 flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400">Platform API</span>
                <span className="text-xs text-zinc-500 font-mono">Default: http://localhost:9090</span>
              </div>
              <div className="p-4 text-sm text-zinc-300">
                Used by the UI and administrators to manage policies, view audit logs, and approve queued requests.
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Authentication</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            All API requests must be authenticated using a Bearer token in the <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">Authorization</code> header.
          </p>
          
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">Example Request</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
              {`curl -X POST http://localhost:8082/api/v1/authorize \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"action": "read", "confidence": 0.95}'`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Standard Response Format</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Prism APIs return JSON responses. Successful requests return a 2xx status code. Errors return 4xx or 5xx status codes with a standard error object.
          </p>
          
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">Error Response (400 Bad Request)</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
              {`{
  "error": {
    "code": "invalid_request",
    "message": "The 'confidence' field must be between 0.0 and 1.0"
  }
}`}
            </pre>
          </div>
        </section>
      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a href="/docs/concepts/architecture" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Previous: Architecture
        </a>
        <a href="/docs/concepts/client" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Next: Client SDK
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  );
}
