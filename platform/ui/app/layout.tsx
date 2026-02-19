import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prism — Trace Explorer",
  description: "Confidence-Aware Auth audit trail",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <a href="/" className="nav-brand">🔐 Prism</a>
          <div className="nav-links">
            <a href="/">Audit Log</a>
            <a href="/policies">Policies</a>
          </div>
        </nav>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
