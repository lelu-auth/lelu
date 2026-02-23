export default function DocsAdaptersRedis() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-medium mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/></svg>
          Database Adapter
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">Redis</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Redis is used by the Prism Engine as a high-speed queue and cache for in-flight authorization requests, confidence scores, and human-in-the-loop state. It is not used for durable storage — all long-lived data lives in PostgreSQL.
        </p>
      </div>

      <div className="space-y-12">

        {/* Example Usage */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Example Usage</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Point the Engine at a running Redis instance via the <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">REDIS_URL</code> environment variable.
          </p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">.env</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`# Standard Redis
REDIS_URL=redis://localhost:6379

# Redis with password
REDIS_URL=redis://:yourpassword@localhost:6379

# TLS (production)
REDIS_URL=rediss://localhost:6380`}</pre>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3">
            For production, use <code className="font-mono text-xs px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">rediss://</code> (double-s) to enable TLS.
          </p>
        </section>

        {/* Key space */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Key Space</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            All Prism keys are namespaced under <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">prism:</code> to avoid collisions with other applications sharing the same Redis instance.
          </p>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Key pattern</th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Purpose</th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">TTL</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["prism:queue:{requestId}",      "Fan-out queue for pending human-review requests",     "24 h"],
                  ["prism:decision:{requestId}",   "Cached allow/deny result for polling clients",        "5 min"],
                  ["prism:confidence:{agentId}",   "Rolling EMA confidence score per agent",              "1 h"],
                  ["prism:ratelimit:{agentId}",    "Sliding-window request counter per agent",            "1 min"],
                ].map(([key, purpose, ttl]) => (
                  <tr key={key} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-800 dark:text-zinc-200">{key}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{purpose}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{ttl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Persistence */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Persistence</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Redis is used for ephemeral state, but enabling AOF (Append-Only File) prevents pending approvals from being lost on restart.
          </p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden mb-4">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">redis.conf</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300">{`appendonly yes
appendfsync everysec`}</pre>
          </div>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Mode</th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["No persistence (default)", "✅ Fine for dev / staging"],
                  ["RDB snapshots",            "⚠️ Coarse recovery only"],
                  ["AOF (everysec)",           "✅ Recommended for production"],
                  ["AOF (always)",             "✅ Maximum durability, lower throughput"],
                ].map(([mode, status]) => (
                  <tr key={mode} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{mode}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Cluster / Sentinel */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">High Availability</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: "Redis Sentinel",
                desc: "Automatic failover with a primary + replica topology. Set REDIS_SENTINEL_MASTER and REDIS_SENTINEL_NODES.",
                badge: "Supported",
                badgeColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
              },
              {
                name: "Redis Cluster",
                desc: "Horizontal sharding. All prism:* keys must map to the same hash slot — prefix keys with {prism} to force this.",
                badge: "Supported",
                badgeColor: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
              },
              {
                name: "Upstash Redis",
                desc: "Serverless Redis. Use the REDIS_URL from the Upstash console. TLS is enabled by default.",
                badge: "Compatible",
                badgeColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
              },
              {
                name: "Valkey",
                desc: "Drop-in Redis alternative. Fully compatible — no configuration changes needed.",
                badge: "Compatible",
                badgeColor: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
              },
            ].map((item) => (
              <div key={item.name} className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">{item.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.badgeColor}`}>{item.badge}</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Additional info */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Additional Information</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Redis is the only required infrastructure dependency for the Engine. If Redis is unavailable, the Engine will reject all requests with a <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">503 Service Unavailable</code> until connectivity is restored. Monitor queue depth with the <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">prism_engine_queue_depth</code> Prometheus metric.
          </p>
        </section>

      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a href="/docs/databases/postgresql" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Previous: PostgreSQL
        </a>
        <a href="/docs/plugins/confidence-plugin" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Next: Confidence Plugin
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  );
}
