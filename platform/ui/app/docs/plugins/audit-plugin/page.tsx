export default function DocsPluginsAudit() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-sm font-medium mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          Plugins
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">Audit Trail Plugin</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          The Audit Trail plugin creates an immutable, HMAC-signed record of every authorization decision. Records are stored in PostgreSQL and optionally streamed to an S3-compatible bucket for long-term retention.
        </p>
      </div>

      <div className="space-y-12">

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Record Structure</h2>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">JSON</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`{
  "trace_id": "01HZJ4P7K2G...",
  "timestamp": "2025-01-15T12:34:56Z",
  "agent_id": "gpt-4-agent",
  "action": "delete_user",
  "confidence": 0.82,
  "decision": "require_review",
  "reviewer": "alice@company.com",
  "final_decision": "allow",
  "policy_version": "v2.3.1",
  "hmac": "sha256:a3f9b1..."
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">S3 Export</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">Configure the S3 sink to stream audit records to any S3-compatible storage (AWS S3, MinIO, Cloudflare R2).</p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">Environment variables</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 leading-loose">{`# Enable S3 export
AUDIT_S3_ENABLED=true
AUDIT_S3_BUCKET=my-audit-bucket
AUDIT_S3_REGION=us-east-1
AUDIT_S3_PREFIX=lelu/audit/

# Credentials (or use IAM roles in AWS)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# For MinIO / Cloudflare R2
AUDIT_S3_ENDPOINT=https://my-minio:9000`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Querying Audit Records</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">Use the Platform REST API to query audit records by trace ID or time range.</p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">curl</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`# Get by trace ID
curl -H "Authorization: Bearer $LELU_API_KEY" \\
  http://localhost:9090/api/v1/audit?trace_id=01HZJ4P7K2G

# Get last 100 records
curl -H "Authorization: Bearer $LELU_API_KEY" \\
  "http://localhost:9090/api/v1/audit?limit=100&order=desc"`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">HMAC Verification</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">Each record includes an HMAC-SHA256 signature to detect tampering. Verify with the <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">AUDIT_HMAC_SECRET</code> environment variable.</p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">Python</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`import hmac, hashlib, json

def verify_record(record: dict, secret: str) -> bool:
    expected = record.pop("hmac")
    payload = json.dumps(record, sort_keys=True).encode()
    actual = "sha256:" + hmac.new(
        secret.encode(), payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, actual)`}</pre>
          </div>
        </section>

      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a href="/docs/plugins/confidence-plugin" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Previous: Confidence Plugin
        </a>
        <a href="/docs/plugins/rate-limit" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Next: Rate Limiting
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  );
}
