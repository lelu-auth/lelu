import { listAuditEvents } from "@/lib/api";
import { AuditTable } from "@/components/AuditTable";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: { actor?: string; action?: string; decision?: string };
}) {
  const events = await listAuditEvents({
    actor: searchParams.actor,
    action: searchParams.action,
    decision: searchParams.decision,
    limit: 100,
  });

  const total = events.length;
  const allowed  = events.filter((e) => e.decision === "allowed").length;
  const denied   = events.filter((e) => e.decision === "denied").length;
  const review   = events.filter((e) => e.decision === "human_review").length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Audit Log</h1>
          <p className="text-zinc-600 dark:text-zinc-400">SOC 2-ready immutable event trail</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-200 rounded-md text-sm font-medium transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Export CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Total Events</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{total}</div>
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
              <polyline points="16 7 22 7 22 13"></polyline>
            </svg>
            +12% this week
          </div>
        </div>
        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Allowed</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{allowed}</div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Stable
          </div>
        </div>
        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Denied</div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">{denied}</div>
          <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
              <polyline points="16 17 22 17 22 11"></polyline>
            </svg>
            -5% this week
          </div>
        </div>
        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Human Review</div>
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{review}</div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Stable
          </div>
        </div>
      </div>

      <form method="GET" className="flex flex-col md:flex-row gap-3 mb-8 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            name="actor"
            defaultValue={searchParams.actor}
            placeholder="Filter by actor..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            name="action"
            defaultValue={searchParams.action}
            placeholder="Filter by action..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
        <select
          name="decision"
          defaultValue={searchParams.decision ?? ""}
          className="flex-1 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none"
        >
          <option value="">All decisions</option>
          <option value="allowed">Allowed</option>
          <option value="denied">Denied</option>
          <option value="human_review">Human review</option>
        </select>
        <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors">
          Filter
        </button>
      </form>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/30">
        <AuditTable events={events} />
      </div>
    </div>
  );
}