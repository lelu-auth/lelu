type Decision = "allowed" | "denied" | "human_review" | string;

export function Badge({ decision }: { decision: Decision }) {
  const cls =
    decision === "allowed"
      ? "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20"
      : decision === "denied"
        ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20"
        : "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20";

  const label =
    decision === "human_review" ? "Review" : decision.charAt(0).toUpperCase() + decision.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      {label}
    </span>
  );
}
