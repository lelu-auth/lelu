"use client";

import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/docs") {
      return pathname.startsWith("/docs");
    }
    return pathname === path;
  };

  return (
    <div className="hidden md:flex items-center gap-1 text-sm font-medium">
      <a
        href="/about"
        className={`px-3 py-2 transition-colors rounded-md ${
          isActive("/about")
            ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-white/10"
            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/5"
        }`}
      >
        About
      </a>
      <a
        href="/docs"
        className={`px-3 py-2 transition-colors rounded-md ${
          isActive("/docs")
            ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-white/10"
            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/5"
        }`}
      >
        Docs
      </a>
      <a
        href="/audit"
        className={`px-3 py-2 transition-colors rounded-md ${
          isActive("/audit")
            ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-white/10"
            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/5"
        }`}
      >
        Audit Log
      </a>
      <a
        href="/policies"
        className={`px-3 py-2 transition-colors rounded-md ${
          isActive("/policies")
            ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-white/10"
            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/5"
        }`}
      >
        Policies
      </a>
      <a
        href="/policies/safety"
        className={`px-3 py-2 transition-colors rounded-md ${
          isActive("/policies/safety")
            ? "text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-white/10"
            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/5"
        }`}
      >
        Safety
      </a>
    </div>
  );
}
