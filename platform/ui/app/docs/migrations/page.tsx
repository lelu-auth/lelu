export default function DocsMigrations() {
  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
          Migrations
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4 tracking-tight">Database Migrations</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Prism manages its own schema through idempotent SQL statements that run at Platform startup. This page explains the migration strategy, how to apply manual changes, and how to roll back safely.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 flex gap-3 mb-10">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Prism does not use a migration framework like Flyway or golang-migrate. Migrations are idempotent <code className="font-mono">ALTER TABLE ... IF NOT EXISTS</code> statements embedded in the Platform source.
        </p>
      </div>

      <div className="space-y-12">

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">How Auto-Migration Works</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">On every startup, the Platform runs a sequence of idempotent SQL statements defined in <code className="text-sm px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">internal/db/db.go</code>. Each statement is safe to run multiple times.</p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">internal/db/db.go (excerpt)</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`// Run at startup — all statements are idempotent
migrations := []string{
    \`CREATE TABLE IF NOT EXISTS policies (...)\`,
    \`ALTER TABLE policies ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT ''\`,
    \`CREATE INDEX IF NOT EXISTS idx_audit_trace ON audit_trails(trace_id)\`,
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Adding a New Column</h2>
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <ol className="space-y-4">
              {[
                {
                  title: "Edit db.go",
                  code: `ALTER TABLE your_table\n  ADD COLUMN IF NOT EXISTS new_column TEXT DEFAULT '';`,
                  lang: "SQL",
                },
                {
                  title: "Restart the Platform",
                  code: `docker compose restart platform`,
                  lang: "terminal",
                },
                {
                  title: "Verify",
                  code: `docker compose exec postgres psql -U prism -c\n  "\\d your_table"`,
                  lang: "terminal",
                },
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-white text-sm mb-2">{step.title}</p>
                    <div className="bg-zinc-900 dark:bg-black rounded-lg border border-zinc-800 overflow-hidden">
                      <div className="px-3 py-1.5 border-b border-zinc-800 bg-zinc-950">
                        <span className="text-xs text-zinc-500 font-mono">{step.lang}</span>
                      </div>
                      <pre className="p-3 font-mono text-xs text-zinc-300 overflow-x-auto">{step.code}</pre>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Zero-Downtime Migrations</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">To avoid locking tables in production, follow these rules:</p>
          <div className="space-y-3">
            {[
              { rule: "Add columns as nullable or with a DEFAULT", detail: "PostgreSQL can add NOT NULL columns with DEFAULT values without rewriting the table in PG 11+." },
              { rule: "Never rename or drop columns in a single deploy", detail: "Rename: add new column → backfill → update code → drop old column across 3 deploys." },
              { rule: "Create indexes CONCURRENTLY", detail: "Use CREATE INDEX CONCURRENTLY to avoid locking reads/writes on large tables." },
              { rule: "Test on a staging replica first", detail: "Restore from a production backup and run the migration on a copy before applying to production." },
            ].map((item) => (
              <div key={item.rule} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <p className="font-semibold text-zinc-900 dark:text-white text-sm mb-1">{item.rule}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">Manual Rollback</h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">Since Prism auto-migrates forward only, rollbacks must be done manually. Always back up before migrating.</p>
          <div className="bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 dark:border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 dark:border-white/10 bg-zinc-950 dark:bg-white/5">
              <span className="text-xs text-zinc-500 font-mono">Restore from backup</span>
            </div>
            <pre className="p-4 font-mono text-sm text-zinc-300 overflow-x-auto">{`# Take a pre-migration backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# If migration fails, restore
psql $DATABASE_URL < backup_20250115_120000.sql`}</pre>
          </div>
        </section>

      </div>

      <div className="flex justify-start items-center pt-12 mt-12 border-t border-zinc-200 dark:border-white/10">
        <a href="/docs/guides/testing" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Previous: Testing Policies
        </a>
      </div>
    </div>
  );
}
