"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { heroStats } from "@/data";

const LeluMonogram = ({ flip = false }: { flip?: boolean }) => (
  <svg
    width="120"
    height="140"
    viewBox="0 0 120 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={flip ? { transform: "scaleX(-1) rotate(6deg)" } : { transform: "rotate(-6deg)" }}
    aria-hidden="true"
  >
    {/* Back face */}
    <rect x="28" y="8" width="52" height="10" rx="2" fill="#3A3A3C" />
    <rect x="70" y="8" width="10" height="88" rx="2" fill="#2A2A2C" />
    {/* Side face — depth illusion */}
    <polygon points="28,18 80,18 90,8 38,8" fill="#222224" />
    <polygon points="80,18 80,96 90,86 90,8" fill="#1A1A1C" />
    {/* Front vertical bar */}
    <rect x="18" y="18" width="14" height="88" rx="2" fill="#E8B339" />
    {/* Front horizontal bar (foot of L) */}
    <rect x="18" y="92" width="62" height="14" rx="2" fill="#E8B339" />
    {/* Bottom depth */}
    <polygon points="18,106 80,106 90,96 28,96" fill="#C49A30" />
    {/* Highlight edge */}
    <rect x="18" y="18" width="3" height="88" rx="1" fill="#F5D070" opacity="0.6" />
    <rect x="18" y="92" width="62" height="3" rx="1" fill="#F5D070" opacity="0.4" />
    {/* Ground shadow */}
    <ellipse cx="54" cy="128" rx="38" ry="6" fill="#000" opacity="0.18" />
  </svg>
);

const LeluHero = () => {
  return (
    <div className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23888' stroke-width='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Announcement chip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-[#E7E5E4] dark:border-[#222224] bg-white dark:bg-[#141416] px-4 py-1.5 text-[13px] text-zinc-600 dark:text-zinc-400 mb-10"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-lelu-amber animate-pulse" />
          Lelu Engine v1.0 is live
        </motion.div>

        {/* Bookend logo + headline row */}
        <div className="flex items-center justify-center gap-4 md:gap-8 w-full max-w-5xl mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="hidden md:block flex-shrink-0"
          >
            <LeluMonogram />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-[2.6rem] sm:text-6xl lg:text-7xl font-semibold tracking-tight text-[#0A0A0A] dark:text-white leading-[1.06] lowercase"
          >
            authorization &amp; security for ai agents.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="hidden md:block flex-shrink-0"
          >
            <LeluMonogram flip />
          </motion.div>
        </div>

        {/* Sub-copy */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mb-8 leading-relaxed"
        >
          Gate every action. Route the risky ones to humans. Audit everything.
        </motion.p>

        {/* CTA pair */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 mb-12"
        >
          <Link
            href="/docs/quickstart"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get Started →
          </Link>
          <Link
            href="/api-key"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E7E5E4] dark:border-[#222224] bg-transparent text-[#0A0A0A] dark:text-white px-6 py-2.5 text-sm font-medium hover:bg-[#F5F5F4] dark:hover:bg-[#141416] transition-colors"
          >
            Get API Key
          </Link>
        </motion.div>

        {/* Stat row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-x-8 gap-y-2"
        >
          {heroStats.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-[#0A0A0A] dark:text-white">{s.value}</span>
              <span>{s.label}</span>
              {i < heroStats.length - 1 && (
                <span className="ml-8 text-[#E7E5E4] dark:text-[#222224] select-none">·</span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LeluHero;
