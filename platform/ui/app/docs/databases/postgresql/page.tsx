export default function DocsAdaptersPostgres() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm font-medium mb-6">
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
          Database Adapter
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">
          PostgreSQL
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          PostgreSQL is the primary data store for the Lelu Platform. It persists policies, audit
          trails, API tokens, and tenant records. The Platform connects via a standard{" "}
          <code className="font-mono text-base px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
            DATABASE_URL
          </code>{" "}
          connection string.
        </p>
      </div>

      <div className="space-y-12">
        {/* Example Usage */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
            Example Usage
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Make sure PostgreSQL is running and accessible. Pass the connection string as an
            environment variable to the Platform service.
          </p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5 flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">.env</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`DATABASE_URL=postgres://lelu:password@localhost:5432/lelu?sslmode=disable`}</pre>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3">
            For production use{" "}
            <code className="font-mono text-xs px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
              sslmode=require
            </code>{" "}
            and provision the database user with minimal permissions.
          </p>
        </section>

        {/* Schema & Migration */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
            Schema &amp; Migration
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Lelu manages its own schema through idempotent SQL that runs automatically on Platform
            startup. No external migration tool is required.
          </p>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                    Feature
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Auto-migration on startup", "✅ Supported"],
                  ["Schema generation", "✅ Supported"],
                  ["Manual migration", "✅ Supported"],
                  ["Multi-tenant schemas", "✅ Supported"],
                ].map(([feat, status]) => (
                  <tr
                    key={feat}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{feat}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            To add a new column, append an idempotent{" "}
            <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
              ALTER TABLE
            </code>{" "}
            statement to the migrations slice in{" "}
            <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
              internal/db/db.go
            </code>{" "}
            and restart the Platform.
          </p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">internal/db/db.go</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`migrations := []string{
    \`CREATE TABLE IF NOT EXISTS policies (
        id          TEXT PRIMARY KEY,
        tenant_id   TEXT NOT NULL DEFAULT '',
        content     TEXT NOT NULL,
        version     TEXT NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW()
    )\`,
    \`ALTER TABLE policies
        ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''\`,
    \`CREATE INDEX IF NOT EXISTS idx_policies_tenant
        ON policies(tenant_id)\`,
}`}</pre>
          </div>
        </section>

        {/* Tables */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
            Schema Overview
          </h2>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                    Table
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
                    Key columns
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["policies", "OPA policy bundles", "id, tenant_id, content, version"],
                  [
                    "audit_trails",
                    "Immutable HMAC-signed decision log",
                    "trace_id, decision, hmac, reviewer",
                  ],
                  ["tokens", "Hashed API keys + metadata", "id, hash, description, created_at"],
                  ["tenants", "Tenant registry (multi-tenant mode)", "id, name, created_at"],
                ].map(([table, desc, cols]) => (
                  <tr
                    key={table}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                      {table}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{desc}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-500">
                      {cols}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Non-default schema */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
            Use a Non-Default Schema
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            By default Lelu uses the{" "}
            <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
              public
            </code>{" "}
            schema. To isolate Lelu tables in a dedicated schema (e.g.{" "}
            <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
              lelu
            </code>
            ), use the{" "}
            <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
              search_path
            </code>{" "}
            option.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">
                Option 1 — Connection string (recommended)
              </h3>
              <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
                <pre className="p-4 font-mono text-sm text-zinc-300">{`DATABASE_URL=postgres://lelu:password@localhost:5432/lelu?options=-c%20search_path%3Dlelu`}</pre>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">
                Option 2 — Set default schema for the DB user
              </h3>
              <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
                <pre className="p-4 font-mono text-sm text-zinc-300">{`ALTER USER lelu SET search_path TO lelu;`}</pre>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <h4 className="font-semibold text-zinc-900 dark:text-white text-sm mb-3">
              Prerequisites
            </h4>
            <div className="bg-zinc-900 dark:bg-black rounded-lg overflow-hidden">
              <pre className="p-4 font-mono text-xs text-zinc-300">{`CREATE SCHEMA IF NOT EXISTS lelu;
GRANT ALL PRIVILEGES ON SCHEMA lelu TO lelu;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA lelu TO lelu;
ALTER DEFAULT PRIVILEGES IN SCHEMA lelu GRANT ALL ON TABLES TO lelu;`}</pre>
            </div>
          </div>
        </section>

        {/* Zero-downtime migrations */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
            Zero-Downtime Migrations
          </h2>
          <div className="space-y-3">
            {[
              {
                rule: "Add columns as nullable or with DEFAULT",
                detail:
                  "PostgreSQL 11+ can add NOT NULL + DEFAULT columns without a full table rewrite.",
              },
              {
                rule: "Never rename/drop in a single deploy",
                detail:
                  "Add the new column → backfill → update app code → drop old column across separate deploys.",
              },
              {
                rule: "Create indexes CONCURRENTLY",
                detail: "Prevents locking reads/writes on large tables during index creation.",
              },
              {
                rule: "Back up before every migration",
                detail:
                  "Run pg_dump before applying changes so you can restore if something goes wrong.",
              },
            ].map((item) => (
              <div
                key={item.rule}
                className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800"
              >
                <p className="font-semibold text-zinc-900 dark:text-white text-sm mb-1">
                  {item.rule}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">Backup &amp; restore</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300">{`# Backup before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore if something goes wrong
psql $DATABASE_URL < backup_20260223_120000.sql`}</pre>
          </div>
        </section>

        {/* Additional info */}
        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
            Additional Information
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            For performance tuning, connection pooling with <strong>PgBouncer</strong> (transaction
            mode) is recommended in high-throughput deployments. Point read-heavy endpoints such as
            the audit trail API to a <strong>read replica</strong> to offload the primary.
          </p>
        </section>
      </div>

      <div className="flex justify-between items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a
          href="/docs/databases"
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
          Previous: Databases Overview
        </a>
        <a
          href="/docs/databases/redis"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Next: Redis
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
