export default function DocsConceptSkills() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Concepts
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">Skills</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Skills are pre-built authorization policy patterns for common agent workflows. Use them as starting points, then tailor thresholds and scopes for your workload.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Included skills</h2>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-white/10 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5">
                  <th className="text-left px-4 py-3 font-semibold text-zinc-900 dark:text-white">Skill</th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-900 dark:text-white">File</th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-900 dark:text-white">Use case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                <tr>
                  <td className="px-4 py-3 text-zinc-900 dark:text-white font-medium">Tool Call Guard</td>
                  <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-300">config/skills/tool-call.rego</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">Read-only knowledge/tool access with confidence-aware review.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-zinc-900 dark:text-white font-medium">Ticket Triage</td>
                  <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-300">config/skills/ticket-triage.rego</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">Support ticket classification with approval fallback.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-zinc-900 dark:text-white font-medium">Payment Guardrail</td>
                  <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-300">config/skills/payment-guardrail.rego</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">Refund/payments actions with strict confidence thresholds.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">How to use a skill</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Copy one of the templates into your active Rego policy and adjust actions, resources, and confidence thresholds.
          </p>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">example</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`# Use a skill as your active policy
export REGO_POLICY_PATH=./config/skills/ticket-triage.rego
export REGO_POLICY_QUERY=data.lelu.authz

# Start Lelu
make run-engine`}</pre>
          </div>
        </section>
      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a href="/docs/concepts/cli" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Previous: CLI &amp; MCP
        </a>
        <a href="/docs/confidence" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Next: Confidence Scores
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  );
}
