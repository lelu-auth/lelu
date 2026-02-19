import { listPolicies } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PoliciesPage() {
  const policies = await listPolicies();

  return (
    <>
      <h1>Policies</h1>
      <p className="subtitle">YAML RBAC policies managed by the Prism control plane</p>

      {policies.length === 0 ? (
        <div className="empty">No policies found.</div>
      ) : (
        policies.map((p) => (
          <div key={p.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
                  v{p.version} &bull; updated {new Date(p.updated_at).toLocaleString()}
                </div>
              </div>
              <span
                style={{
                  background: "#1e1e2a",
                  border: "1px solid #2d2d3a",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "0.7rem",
                  fontFamily: "monospace",
                  color: "#94a3b8",
                }}
              >
                id: {p.id.slice(0, 8)}
              </span>
            </div>
            <pre>{p.content}</pre>
          </div>
        ))
      )}
    </>
  );
}
