"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavItem = { 
  href: string; 
  label: string;
  icon?: React.ReactNode;
};

type NavSection = { 
  title: string; 
  items: NavItem[];
  icon?: React.ReactNode;
  defaultOpen?: boolean;
};

const sections: NavSection[] = [
  {
    title: "Get Started",
    defaultOpen: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    items: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/installation", label: "Installation" },
      { href: "/llms.txt", label: "LLMs.txt" },
    ],
  },
  {
    title: "Concepts",
    defaultOpen: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
        <path d="M12 2v10l8.66 5"/>
      </svg>
    ),
    items: [
      { href: "/docs/concepts/architecture", label: "Architecture" },
      { href: "/docs/concepts/api", label: "API" },
      { href: "/docs/concepts/client", label: "Client SDK" },
      { href: "/docs/concepts/cli", label: "CLI & MCP" },
      { href: "/docs/concepts/skills", label: "Skills" },
    ],
  },
  {
    title: "Features",
    defaultOpen: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    items: [
      { href: "/docs/confidence", label: "Confidence Scores" },
      { href: "/docs/human-in-loop", label: "Human-in-the-loop" },
      { href: "/docs/audit-trail", label: "Audit Trail" },
      { href: "/docs/sso", label: "SSO & Authentication" },
    ],
  },
  {
    title: "API Reference",
    defaultOpen: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>
      </svg>
    ),
    items: [
      { href: "/docs/api/authorize", label: "/authorize" },
      { href: "/docs/api/queue", label: "/queue" },
      { href: "/docs/api/agent", label: "Agent SDK" },
    ],
  },
  {
    title: "Integrations",
    defaultOpen: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    items: [
      { href: "/docs/integrations/backend", label: "Backend" },
      { href: "/docs/integrations/nextjs", label: "Next.js" },
      { href: "/docs/integrations/react", label: "React / Frontend" },
      { href: "/docs/integrations/mobile", label: "Mobile" },
    ],
  },
  {
    title: "Databases",
    defaultOpen: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    items: [
      { href: "/docs/databases", label: "Overview" },
      { href: "/docs/databases/postgresql", label: "PostgreSQL" },
      { href: "/docs/databases/redis", label: "Redis" },
    ],
  },
  {
    title: "Plugins",
    defaultOpen: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v6M12 18v4M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M18 12h4M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/>
      </svg>
    ),
    items: [
      { href: "/docs/plugins/confidence-plugin", label: "Confidence Score" },
      { href: "/docs/plugins/audit-plugin", label: "Audit Trail" },
      { href: "/docs/plugins/rate-limit", label: "Rate Limiting" },
    ],
  },
  {
    title: "Guides",
    defaultOpen: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    items: [
      { href: "/docs/guides/production", label: "Production" },
      { href: "/docs/guides/testing", label: "Testing Policies" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((section) => {
      initial[section.title] = section.defaultOpen ?? false;
    });
    return initial;
  });

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const active = root.querySelector(".docs-sidebar-link.is-active") as HTMLAnchorElement | null;
    if (!active) return;
    active.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [pathname]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className="hidden md:block w-64 shrink-0 border-r border-zinc-200 dark:border-white/[0.08]">
      <div ref={scrollRef} className="docs-sidebar-scroll sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto overscroll-contain py-6 pr-3">
        <nav className="space-y-1">
          {sections.map((section) => {
            const isOpen = openSections[section.title];
            const hasActiveItem = section.items.some((item) => pathname === item.href);
            
            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 rounded-md transition-colors group"
                >
                  <span className="text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                    {section.icon}
                  </span>
                  <span className="flex-1 text-left">{section.title}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-zinc-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  >
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
                
                {isOpen && (
                  <ul className="mt-1 ml-6 space-y-0.5 text-sm border-l border-zinc-200 dark:border-zinc-800 pl-3">
                    {section.items.map((item) => {
                      const active = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <a
                            href={item.href}
                            className={[
                              "docs-sidebar-link block px-2 py-1.5 rounded-md transition-colors",
                              active
                                ? "is-active text-blue-600 dark:text-blue-400 font-medium"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5",
                            ].join(" ")}
                          >
                            {item.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
