export default function DocsGuidesProduction() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 text-sm font-medium mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Guides
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">Production Deployment</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          A checklist and deep-dive for running Lelu reliably in production — covering HTTPS, secrets management, Engine scaling, and observability.
        </p>
      </div>

      <div className="space-y-12">

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">Pre-Launch Checklist</h2>
          <div className="space-y-3">
            {[
              { done: false, text: "TLS terminated at load balancer or ingress for all services (ops)" },
              { done: false, text: "LELU_API_KEY rotated from default and stored in a secret manager (ops)" },
              { done: false, text: "DATABASE_URL uses sslmode=require in production" },
              { done: false, text: "Redis uses TLS (rediss://) or a private network" },
              { done: false, text: "Engine replicas ≥ 2 for high availability" },
              { done: true,  text: "Health checks configured on /healthz for Engine, Platform, MCP, and UI" },
              { done: false, text: "Audit retention configured (S3/object-store lifecycle, 1+ year)" },
              { done: false, text: "Structured logs exported to your log platform" },
              { done: true,  text: "OPA/Rego policies are version-controlled before deploy" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${item.done ? "bg-emerald-500" : "border-2 border-zinc-300 dark:border-zinc-600"}`}>
                  {item.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{item.text}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            In Docker Compose healthchecks, prefer <span className="font-mono">127.0.0.1</span> over <span className="font-mono">localhost</span> to avoid container-local hostname resolution edge cases.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Scaling the Engine</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">The Engine is stateless — scale horizontally by running multiple replicas behind a load balancer. All state lives in Redis.</p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">docker-compose.override.yml</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`services:
  engine:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: "1"
          memory: 512M
      restart_policy:
        condition: on-failure
        delay: 5s`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Secrets Management</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">Never store secrets in environment files committed to source control. Use one of these patterns in production:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "AWS Secrets Manager", desc: "Use the AWS SSM Parameter Store or Secrets Manager and inject via IAM role at runtime." },
              { name: "Kubernetes Secrets", desc: "Mount as environment variables from an encrypted Secret object — use Sealed Secrets or External Secrets Operator." },
              { name: "HashiCorp Vault", desc: "Use Vault Agent Injector to automatically inject secrets into pods at startup." },
            ].map((s) => (
              <div key={s.name} className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                <h4 className="font-semibold text-zinc-900 dark:text-white text-sm mb-1">{s.name}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Observability</h2>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">Key metrics to alert on</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 leading-loose">{`lelu_http_requests_total{method="POST",path="/v1/agent/authorize",status="200"}
  # Request volume and status-code anomalies

lelu_http_request_duration_seconds{method="POST",path="/v1/agent/authorize"}
  # Latency SLO / p95 / p99

lelu_auth_decisions_total{type="agent",allowed="false"}
  # Deny-rate spikes and confidence policy pressure`}</pre>
          </div>
        </section>

      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a href="/docs/plugins/rate-limit" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Previous: Rate Limiting
        </a>
        <a href="/docs/guides/testing" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Next: Testing Policies
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  );
}
