type Decision = "allowed" | "denied" | "human_review" | string;

export function Badge({ decision }: { decision: Decision }) {
  const cls =
    decision === "allowed"
      ? "badge-allowed"
      : decision === "denied"
      ? "badge-denied"
      : "badge-review";
  return <span className={`badge ${cls}`}>{decision}</span>;
}
