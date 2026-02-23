export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-20">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-sm text-zinc-600 dark:text-zinc-300 mb-4">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          Prism Engine v1.0 is live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Confidence-Aware <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-800 dark:from-zinc-500 dark:to-zinc-200">
            Authorization
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The first authorization engine that understands uncertainty. 
          Write policies that adapt to AI confidence scores, human-in-the-loop approvals, and risk levels.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <a href="/docs" className="w-full sm:w-auto px-8 py-3 rounded-lg bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
            Get Started
          </a>
          <a href="/policies" className="w-full sm:w-auto px-8 py-3 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white font-medium hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors border border-zinc-200 dark:border-white/10">
            View Policies
          </a>
        </div>
      </div>

      {/* Bento Box Feature Grid */}
      <div className="max-w-6xl w-full mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Large Feature */}
        <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-200/50 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-white/10 flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700 dark:text-white">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">AI-Native Policies</h3>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
              Evaluate authorization requests with built-in confidence thresholds. Automatically route low-confidence AI actions to human approvers.
            </p>
          </div>
          
          <div className="mt-8 relative z-10 bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 p-4 font-mono text-sm overflow-hidden">
            <div className="flex gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <pre className="text-zinc-300">
              <code>
<span className="text-pink-400">allow</span> {"{"}
  input.action == <span className="text-green-400">"execute_trade"</span>
  input.confidence {">="} <span className="text-orange-400">0.95</span>
{"}"}

<span className="text-pink-400">require_approval</span> {"{"}
  input.action == <span className="text-green-400">"execute_trade"</span>
  input.confidence {"<"} <span className="text-orange-400">0.95</span>
{"}"}
              </code>
            </pre>
          </div>
        </div>

        {/* Small Feature 1 */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl p-8 flex flex-col relative group">
          <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-white/10 flex items-center justify-center mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700 dark:text-white">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">Immutable Audit</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Every decision, confidence score, and human approval is cryptographically logged to S3 for compliance.
          </p>
        </div>

        {/* Small Feature 2 */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl p-8 flex flex-col relative group">
          <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-white/10 flex items-center justify-center mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700 dark:text-white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">Sub-millisecond</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Built on Go and Open Policy Agent (OPA) for blazing fast evaluation at the edge.
          </p>
        </div>

        {/* Medium Feature */}
        <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8 relative group">
          <div className="flex-1">
            <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-white/10 flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-700 dark:text-white">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Model Context Protocol</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Seamlessly integrate with Claude, Cursor, and other AI agents using our native MCP server. Give your agents secure access to your infrastructure.
            </p>
          </div>
          <div className="w-full sm:w-64 h-48 bg-zinc-200 dark:bg-black rounded-xl border border-zinc-300 dark:border-white/10 flex items-center justify-center">
            <div className="text-zinc-500 dark:text-zinc-600 font-mono text-sm">npx @prism/mcp</div>
          </div>
        </div>

      </div>
    </div>
  );
}
