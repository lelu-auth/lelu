import { AuditEvent } from "@/lib/api";

function confClass(c: number) {
  if (c >= 0.9) return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10 border-green-200 dark:border-green-400/20";
  if (c >= 0.7) return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10 border-yellow-200 dark:border-yellow-400/20";
  return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10 border-red-200 dark:border-red-400/20";
}

export function AuditTable({ events }: { events: AuditEvent[] }) {
  if (!events.length) return <div className="p-8 text-center text-zinc-500">No audit events found.</div>;
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
          <tr>
            <th className="px-6 py-4 font-medium">ID</th>
            <th className="px-6 py-4 font-medium">Trace</th>
            <th className="px-6 py-4 font-medium">Actor</th>
            <th className="px-6 py-4 font-medium">Action</th>
            <th className="px-6 py-4 font-medium">Decision</th>
            <th className="px-6 py-4 font-medium">Confidence</th>
            <th className="px-6 py-4 font-medium">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/50">
          {events.map((e) => (
            <tr key={e.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
              <td className="px-6 py-4 font-mono text-zinc-500">{e.id}</td>
              <td className="px-6 py-4 font-mono">
                <a href={`/traces/${e.trace_id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                  {e.trace_id.slice(0, 8)}&hellip;
                </a>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                    🤖
                  </div>
                  <span className="text-zinc-900 dark:text-zinc-200 font-medium">{e.actor}</span>
                </div>
              </td>
              <td className="px-6 py-4 font-mono text-zinc-700 dark:text-zinc-300">{e.action}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    e.decision === "allowed"
                      ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20"
                      : e.decision === "denied"
                      ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20"
                      : "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20"
                  }`}
                >
                  {e.decision === "human_review" ? "Review" : e.decision.charAt(0).toUpperCase() + e.decision.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full border ${confClass(e.confidence_score)}`}
                      style={{ width: `${Math.round(e.confidence_score * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 min-w-[32px]">
                    {(e.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-sm whitespace-nowrap">
                {new Date(e.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}