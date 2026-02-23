export default function DocsConceptCli() {
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
            Prism natively supports MCP, allowing you to wrap any existing MCP tools with Prism's confidence-aware authorization layer. When an AI assistant (like Cursor) tries to use a tool, Prism intercepts the call, evaluates the policy, and can pause the assistant to ask for human approval.
          </p>
          
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">Starting the MCP Server</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">
              {`# Start the Prism MCP server, pointing it to your Engine
npx @prism/cli mcp start \\
  --engine-url http://localhost:8082 \\
  --api-key YOUR_API_KEY`}
            </pre>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Cursor Integration:</strong> To use Prism in Cursor, go to Settings &gt; Features &gt; MCP, add a new server, select "command", and enter <code className="bg-blue-100 dark:bg-blue-800/50 px-1 rounded font-mono">npx @prism/cli mcp start</code>.
            </div>
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
