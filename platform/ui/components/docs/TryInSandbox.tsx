interface Props {
  tool: string;
  context?: string;
}

export function TryInSandbox({ tool, context }: Props) {
  const params = new URLSearchParams({ tool });
  if (context) params.set("context", context);
  const href = `/sandbox?${params.toString()}`;

  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      Try <code className="font-mono text-xs bg-emerald-100 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded">{tool}</code> in sandbox
    </a>
  );
}
