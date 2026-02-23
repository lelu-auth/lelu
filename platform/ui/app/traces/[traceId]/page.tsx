import { getTrace } from "@/lib/api";
import { AuditTable } from "@/components/AuditTable";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function TracePage({
  params,
}: {
  params: { traceId: string };
}) {
  const trace = await getTrace(params.traceId);

  const avgConf =
    trace.events.length > 0
      ? trace.events.reduce((s, e) => s + e.confidence_score, 0) / trace.events.length
      : 0;

  const decisions = Array.from(new Set(trace.events.map((e) => e.decision)));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <a href="/audit" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Audit Log
      </a>

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Trace Detail</h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-mono text-sm">{params.traceId}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Events</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{trace.events.length}</div>
        </div>
        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Avg Confidence</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{(avgConf * 100).toFixed(0)}%</div>
        </div>
        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 flex flex-col items-start gap-2">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Decisions</div>
          <div className="flex gap-2 flex-wrap">
            {decisions.map((d) => (
              <Badge key={d} decision={d} />
            ))}
          </div>
        </div>
      </div>

      {trace.events.length > 0 && (
        <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 mb-10">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Actors involved</div>
          <div className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mt-2">
            {Array.from(new Set(trace.events.map((e) => e.actor))).join(", ")}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Events</h2>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/30">
        <AuditTable events={trace.events} />
      </div>
    </div>
  );
}