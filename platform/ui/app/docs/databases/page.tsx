export default function DocsDatabases() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12" />
            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
          </svg>
          Databases
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
          Databases
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Lelu uses two data stores: <strong>PostgreSQL</strong> for durable state (policies, audit
          trails, users) and <strong>Redis</strong> as a high-speed queue for the Engine. This page
          covers configuration, connection strings, and performance tuning.
        </p>
      </div>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">
            PostgreSQL (Platform)
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            The Platform service uses PostgreSQL to persist all long-lived data. The schema is
            managed by the Platform startup code — no separate migration tool is required.
          </p>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">Environment variable</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300">{`DATABASE_URL=postgres://lelu:password@localhost:5432/lelu?sslmode=disable`}</pre>
          </div>

          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Tables</h3>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                    Table
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                    Purpose
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["policies", "OPA policy bundles per tenant"],
                  ["audit_trails", "Immutable log of every Engine decision with HMAC signature"],
                  ["tokens", "API key hashes and metadata"],
                  ["tenants", "Tenant registry (multi-tenant mode)"],
                ].map(([table, purpose]) => (
                  <tr
                    key={table}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                      {table}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">
            Redis (Engine Queue)
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            The Engine uses Redis as a queue and cache for in-flight authorization requests,
            confidence scores, and human-in-the-loop polling state.
          </p>

          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">Environment variable</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300">{`REDIS_URL=redis://localhost:6379`}</pre>
          </div>

          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Key patterns</h3>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                    Pattern
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                    TTL
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["lelu:queue:{requestId}", "Fan-out queue for pending requests — TTL 24 h"],
                  ["lelu:decision:{requestId}", "Cached allow/deny result — TTL 5 min"],
                  ["lelu:confidence:{agentId}", "Rolling confidence score per agent — TTL 1 h"],
                ].map(([pattern, desc]) => (
                  <tr
                    key={pattern}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                      {pattern}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
            Production Tips
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Connection pooling",
                desc: "Set max_connections in PostgreSQL and use PgBouncer in transaction mode for the Platform service.",
              },
              {
                title: "Redis persistence",
                desc: "Enable AOF persistence (appendonly yes) so pending approvals survive a Redis restart.",
              },
              {
                title: "Read replicas",
                desc: "Point audit trail read API endpoints to a PostgreSQL read replica to avoid locking the primary.",
              },
              {
                title: "TLS",
                desc: "Use sslmode=require in the DATABASE_URL and rediss:// (TLS) for the Redis URL in production.",
              },
            ].map((tip) => (
              <div
                key={tip.title}
                className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4"
              >
                <h4 className="font-semibold text-zinc-900 dark:text-white text-sm mb-1">
                  {tip.title}
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a
          href="/docs/integrations/mobile"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Previous: Mobile
        </a>
        <a
          href="/docs/plugins/confidence-plugin"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Next: Confidence Plugin
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
