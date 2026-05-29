export default function DocsTypeScriptSDK() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
          SDK
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
          TypeScript SDK
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          The official TypeScript SDK for Lelu — works with Node.js, Deno, Bun, edge runtimes,
          and any AI framework that calls tools.
        </p>
      </div>

      <div className="space-y-12">
        {/* Install */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Install</h2>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">npm</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300">{`npm install lelu-agent-auth`}</pre>
          </div>
        </section>

        {/* Quick start */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Quick start</h2>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">agent.ts</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`import { createClient } from "lelu-agent-auth";

const lelu = createClient({ apiKey: process.env.LELU_API_KEY });

const result = await lelu.authorize({ tool: "delete_records" });

if (result.allowed) {
  console.log("Proceeding autonomously");
} else if (result.computed) {
  // Platform returned a safe alternative
  console.log("Safe alternative:", result.safeTool);
  console.log("With args:", result.safeArgs);
} else if (result.decision === "human_review") {
  console.log("Queued for review — ID:", result.requestId);
} else {
  console.log("Denied:", result.reason);
}`}</pre>
          </div>
        </section>

        {/* Four decisions */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Four decision outcomes</h2>
          <div className="space-y-3">
            {[
              { decision: "allow", color: "emerald", desc: "Agent proceeds autonomously. result.allowed === true." },
              { decision: "compute", color: "violet", desc: "Platform returns a safe alternative. Use result.safeTool and result.safeArgs." },
              { decision: "human_review", color: "amber", desc: "Action queued for human approval. result.decision === \"human_review\"." },
              { decision: "deny", color: "red", desc: "Action blocked. Check result.reason for explanation." },
            ].map(({ decision, color, desc }) => (
              <div key={decision} className={`flex gap-3 p-4 rounded-xl border bg-${color}-50 dark:bg-${color}-900/10 border-${color}-200 dark:border-${color}-800/30`}>
                <code className={`text-sm font-mono font-bold text-${color}-700 dark:text-${color}-400 shrink-0 pt-0.5`}>{decision}</code>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vercel AI SDK */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Vercel AI SDK integration</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Use <code className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">secureTool()</code> to
            wrap any Vercel AI SDK tool with Lelu authorization.
          </p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">tools.ts</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`import { secureTool } from "lelu-agent-auth";
import { tool } from "ai";

const deleteRecords = secureTool({
  client: lelu,
  actor: "billing_agent",
  action: "records:delete",
  confidence: 0.9,
  tool: tool({
    description: "Delete records from the database",
    parameters: z.object({ table: z.string() }),
    execute: async ({ table }) => deleteTable(table),
  }),
});`}</pre>
          </div>
        </section>

        {/* AuthDecision fields */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">AuthDecision fields</h2>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Field</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {[
                  ["decision", "\"allow\" | \"deny\" | \"human_review\" | \"compute\"", "The authorization decision"],
                  ["allowed", "boolean", "true when decision === \"allow\""],
                  ["computed", "boolean", "true when decision === \"compute\""],
                  ["safeTool", "string?", "Safe alternative tool (compute only)"],
                  ["safeArgs", "Record<string, unknown>?", "Replacement args (compute only)"],
                  ["reason", "string", "Human-readable explanation"],
                  ["rule", "string", "Rule that matched"],
                  ["requestId", "string", "Unique request ID for audit trail"],
                  ["latencyMs", "number", "Evaluation latency in milliseconds"],
                ].map(([field, type_, desc]) => (
                  <tr key={field} className="bg-white dark:bg-zinc-900/30">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-900 dark:text-white">{field}</td>
                    <td className="px-4 py-3 font-mono text-xs text-violet-600 dark:text-violet-400">{type_}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* npm */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">Package</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Available on npm as{" "}
            <a href="https://www.npmjs.com/package/lelu-agent-auth" target="_blank" rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-mono text-sm">
              lelu-agent-auth
            </a>
            . Current version: <code className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">0.0.17</code>
          </p>
        </section>
      </div>

      <div className="flex justify-end items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a href="/docs/integrations/python"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Python SDK
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
