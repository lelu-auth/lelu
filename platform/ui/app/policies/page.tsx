import { listPolicies } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const policies = await listPolicies();

  return (
    <>
      <header className="header">
        <div>
          <h1>Policies</h1>
          <p className="subtitle">YAML RBAC policies managed by the Prism control plane</p>
        </div>
        <div className="actions">
          <button className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Policy
          </button>
        </div>
      </header>

      {policies.length === 0 ? (
        <div className="empty">No policies found.</div>
      ) : (
        <div className="grid">
          {policies.map((p) => (
            <div key={p.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{p.name}</div>
                  <div className="text-muted text-sm" style={{ marginTop: "0.25rem" }}>
                    v{p.version} &bull; updated {new Date(p.updated_at).toLocaleString()}
                  </div>
                </div>
                <span
                  className="font-mono text-muted"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    fontSize: "0.75rem",
                  }}
                >
                  id: {p.id.slice(0, 8)}
                </span>
              </div>
              <pre style={{ margin: 0, padding: '1rem', background: 'var(--bg-base)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                {p.content}
              </pre>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
