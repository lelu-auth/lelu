export default function DocsPluginsConfidence() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-sm font-medium mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          Plugins
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">Confidence Score Plugin</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          The Confidence Score plugin computes a dynamic trust score for each AI agent based on its history of approved, denied, and escalated actions. Scores drive policy routing — low-confidence agents are automatically sent for human review.
        </p>
      </div>

      <div className="space-y-12">

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { score: "0.9 – 1.0", label: "High", color: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300", desc: "Auto-allow" },
              { score: "0.5 – 0.9", label: "Medium", color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300", desc: "Human review" },
              { score: "0 – 0.5", label: "Low", color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300", desc: "Auto-deny by default" },
            ].map((band) => (
              <div key={band.label} className={`border rounded-xl p-4 ${band.color}`}>
                <div className="font-mono text-lg font-bold mb-1">{band.score}</div>
                <div className="font-semibold text-sm mb-1">{band.label}</div>
                <div className="text-xs opacity-80">{band.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Scores are computed as a rolling exponential moving average over the last 100 actions. The decay factor is configurable.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Rego Integration</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">The Engine injects the current agent confidence score into every Rego evaluation as <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">input.confidence</code>.</p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">policy/auth.rego</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`package lelu.authz

import future.keywords

# Require human approval for low-confidence agents
default allow := false
default require_review := false

allow {
  input.confidence >= 0.9
}

require_review {
  input.confidence >= 0.5
  input.confidence < 0.9
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Configuration Options</h2>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">Environment variables</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 leading-loose">{`# Minimum confidence to auto-allow (default: 0.9)
CONFIDENCE_AUTO_ALLOW_THRESHOLD=0.9

# Minimum confidence to require review (default: 0.5)
CONFIDENCE_REVIEW_THRESHOLD=0.5

# EMA decay factor (default: 0.1 = ~10 action window)
CONFIDENCE_EMA_DECAY=0.1

# Starting score for new agents (default: 0.7)
CONFIDENCE_INITIAL_SCORE=0.7`}</pre>
          </div>
        </section>

      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a href="/docs/databases" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Previous: Databases
        </a>
        <a href="/docs/plugins/audit-plugin" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Next: Audit Plugin
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  );
}
