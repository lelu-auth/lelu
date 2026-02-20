type Decision = "allowed" | "denied" | "human_review" | string;

export function Badge({ decision }: { decision: Decision }) {
  const cls =
    decision === "allowed"
      ? "badge-allowed"
      : decision === "denied"
      ? "badge-denied"
      : "badge-review";
  
  const label = decision === "human_review" ? "Review" : decision.charAt(0).toUpperCase() + decision.slice(1);
  
  return <span className={`badge ${cls}`}>{label}</span>;
}
