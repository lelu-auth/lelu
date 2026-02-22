import { listPolicies } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const policies = await listPolicies();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Policies</h1>
          <p className="text-zinc-400">YAML RBAC policies managed by the Prism control plane</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Policy
          </button>
        </div>
      </header>

      {policies.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/20">No policies found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((p) => (
            <div key={p.id} className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-semibold text-lg text-zinc-100">{p.name}</div>
                  <div className="text-zinc-500 text-xs mt-1">
                    v{p.version} &bull; updated {new Date(p.updated_at).toLocaleString()}
                  </div>
                </div>
                <span className="font-mono text-zinc-400 bg-zinc-800/50 border border-zinc-700/50 rounded px-2 py-0.5 text-xs">
                  id: {p.id.slice(0, 8)}
                </span>
              </div>
              <pre className="m-0 p-4 bg-black rounded-lg border border-zinc-800 text-sm text-zinc-300 overflow-x-auto flex-1">
                {p.content}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
