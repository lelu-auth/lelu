"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function OnThisPage() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from the page
    const elements = Array.from(document.querySelectorAll("h2[id], h3[id]"));
    const extractedHeadings = elements.map((element) => ({
      id: element.id,
      text: element.textContent || "",
      level: parseInt(element.tagName.substring(1)),
    }));
    setHeadings(extractedHeadings);

    // Intersection Observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 1,
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
    };
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto overscroll-contain py-6 px-4 no-scrollbar">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3">
          On this page
        </div>
        <nav>
          <ul className="space-y-2 text-sm border-l border-zinc-200 dark:border-white/10">
            {headings.map((heading) => {
              const isActive = activeId === heading.id;
              return (
                <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}>
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(heading.id)?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className={[
                      "block py-1 px-3 -ml-px border-l-2 transition-all duration-150",
                      isActive
                        ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-medium"
                        : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-600",
                    ].join(" ")}
                  >
                    {heading.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
