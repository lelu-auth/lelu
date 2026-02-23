import { DocsEnhancements } from "@/components/docs/DocsEnhancements";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import type { ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-page flex min-h-[calc(100vh-73px)] max-w-[1400px] mx-auto">
      <DocsSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 py-8 px-6 md:px-12">
        {children}
      </main>

      <DocsEnhancements />
    </div>
  );
}