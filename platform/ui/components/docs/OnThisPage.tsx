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
    const elements = Array.from(document.querySelectorAll("h2[id], h3[id]"));
    setHeadings(
      elements.map((el) => ({
        id: el.id,
        text: el.textContent || "",
        level: parseInt(el.tagName.substring(1)),
      })),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 1 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:block w-[220px] shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto overscroll-contain py-8 px-6 no-scrollbar">
      <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#737373] mb-4">
        ≡ On this page
      </p>
      <nav>
        <ul className="space-y-2.5">
          {headings.map((heading) => {
            const active = activeId === heading.id;
            return (
              <li key={heading.id} className={heading.level === 3 ? "pl-3" : ""}>
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
                    "flex items-center gap-2.5 text-[13px] leading-snug transition-all duration-150",
                    active
                      ? "text-[#0A0A0A] dark:text-white font-semibold"
                      : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white font-normal",
                  ].join(" ")}
                >
                  {active && (
                    <span className="inline-block w-[2px] h-3.5 bg-[#0A0A0A] dark:bg-white rounded-full shrink-0" />
                  )}
                  <span className={active ? "" : "pl-[10px]"}>{heading.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
