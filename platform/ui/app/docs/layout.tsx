import { DocsEnhancements } from "@/components/docs/DocsEnhancements";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { OnThisPage } from "@/components/docs/OnThisPage";
import type { ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-page flex min-h-[calc(100vh-65px)] max-w-screen-2xl mx-auto bg-white dark:bg-[#09090B]">
      <DocsSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 py-8 px-6 lg:px-12">
        <div className="max-w-[800px] mx-auto">
          {children}
        </div>
      </main>

      <OnThisPage />
      <DocsEnhancements />
    </div>
  );
}