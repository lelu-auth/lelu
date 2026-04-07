import { DocsEnhancements } from "@/components/docs/DocsEnhancements";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { OnThisPage } from "@/components/docs/OnThisPage";
import LeluFooter from "@/components/LeluFooter";
import type { ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#09090B]">
      <div className="docs-page flex-1 flex max-w-screen-2xl mx-auto w-full">
        <DocsSidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pt-24 md:pt-32 pb-8 px-6 lg:px-12">
          <div className="max-w-[800px] mx-auto">{children}</div>
        </main>

        <OnThisPage />
        <DocsEnhancements />
      </div>
    </div>
  );
}
