import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: {
    default: "Lelu Engine",
    template: "%s | Lelu Engine",
  },
  description: "Confidence-Aware Auth audit trail",
  applicationName: "Lelu Engine",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans min-h-screen selection:bg-black/10 dark:selection:bg-white/30 flex flex-col transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-white/[0.06] transition-colors duration-300">
            <div className="max-w-screen-2xl mx-auto px-6">
              <div className="flex items-center justify-between h-16">
                <a href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity text-black dark:text-white">
                  <img src="/logo.svg" alt="Lelu logo" className="w-7 h-7 rounded-md" />
                  Lelu
                </a>
                <div className="flex items-center gap-8">
                  <Navigation />
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <a href="https://github.com/lelu-auth/lelu" target="_blank" rel="noreferrer" className="hidden sm:flex hover:text-black dark:hover:text-white transition-colors items-center gap-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-white/10 text-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-200 dark:border-white/[0.08] py-12 mt-20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-zinc-800 dark:text-zinc-300">
                <img src="/logo.svg" alt="Lelu logo" className="w-6 h-6 rounded" />
                Lelu Engine
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-zinc-500 justify-center">
                <a href="/docs" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">Documentation</a>
                <a href="https://github.com/lelu-auth/lelu" target="_blank" rel="noreferrer" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">GitHub</a>
                <a href="https://x.com/LeluAuth" target="_blank" rel="noreferrer" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">X (Twitter)</a>
                <a href="https://discord.gg/bSPWAUSf" target="_blank" rel="noreferrer" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">Discord</a>
                <a href="https://www.linkedin.com/company/leluauth" target="_blank" rel="noreferrer" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">LinkedIn</a>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
