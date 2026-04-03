"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MovingBorder } from "./MovingBorders";
import { ThemeToggle } from "../ThemeToggle";
import { FaGithub } from "react-icons/fa6";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;
      if (scrollYProgress.get() < 0.05) {
        setVisible(true);
      } else if (direction < 0) {
        setVisible(true);
      } else {
        setVisible(false);
        setIsMobileMenuOpen(false);
      }
    }
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibilityVariants = {
    hidden: { y: -80, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <>
      {/* ─── DESKTOP: Centered horizontal pill ─────────────────────────── */}
      <motion.div
        variants={visibilityVariants}
        animate={visible ? "visible" : "hidden"}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn(
          "hidden md:flex fixed z-[5000] top-10 inset-x-0 mx-auto items-center justify-center",
          className,
        )}
      >
        <div className="relative p-[1px] overflow-hidden" style={{ borderRadius: "12px" }}>
          {/* Moving glow border */}
          <div className="absolute inset-0">
            <MovingBorder duration={3500} rx="30%" ry="30%">
              <div className="h-20 w-20 opacity-[0.8] bg-[radial-gradient(#CBACF9_40%,transparent_60%)]" />
            </MovingBorder>
          </div>
          {/* Glass content */}
          <div
            className="relative flex items-center justify-center gap-6 px-10 py-5 bg-white/70 dark:bg-[#111928]/75 backdrop-blur-[16px] saturate-[180%] border border-black/5 dark:border-white/10"
            style={{ borderRadius: "12px" }}
          >
            {navItems.map((navItem, idx) => (
              <Link
                key={idx}
                href={navItem.link}
                className="text-zinc-600 dark:text-neutral-300 hover:text-zinc-900 dark:hover:text-white text-sm transition-colors whitespace-nowrap"
              >
                {navItem.name}
              </Link>
            ))}
            <div className="flex items-center gap-3 border-l border-black/10 dark:border-white/10 pl-4 ml-1">
              <ThemeToggle />
              <a
                href="https://github.com/lelu-auth/lelu"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <FaGithub className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── MOBILE: Hamburger pinned to top-right corner ──────────────── */}
      <motion.div
        variants={visibilityVariants}
        animate={visible ? "visible" : "hidden"}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="md:hidden fixed z-[5000] top-8 right-5"
      >
        {/* Outer glow shell — not overflow-hidden so menu can expand */}
        <div className="relative p-[1px]" style={{ borderRadius: "16px" }}>
          {/* Moving glow border */}
          <div className="absolute inset-0 rounded-[16px] overflow-hidden pointer-events-none">
            <MovingBorder duration={3500} rx="50%" ry="50%">
              <div className="h-14 w-14 opacity-[0.9] bg-[radial-gradient(#CBACF9_40%,transparent_60%)]" />
            </MovingBorder>
          </div>

          {/* Glass container that expands cleanly */}
          <motion.div
            layout
            className="relative overflow-hidden bg-white/80 dark:bg-[#111928]/85 backdrop-blur-[20px] saturate-[180%] border border-black/5 dark:border-white/10"
            style={{ borderRadius: "14px" }}
          >
            {/* Hamburger row */}
            <div className="flex items-center justify-end px-2 py-2">
              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle menu"
                className="group relative p-2.5 rounded-xl"
              >
                <span className="absolute inset-0 rounded-xl bg-purple/0 group-hover:bg-purple/10 transition-colors duration-300" />
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="relative text-zinc-900 dark:text-white"
                >
                  {isMobileMenuOpen ? (
                    <RiCloseLine className="w-6 h-6 drop-shadow-sm dark:drop-shadow-[0_0_8px_#CBACF9]" />
                  ) : (
                    <RiMenu3Line className="w-6 h-6 drop-shadow-sm dark:drop-shadow-[0_0_8px_#CBACF9]" />
                  )}
                </motion.div>
              </button>
            </div>

            {/* Smooth expanding menu */}
            <AnimatePresence initial={false}>
              {isMobileMenuOpen && (
                <motion.div
                  key="mobile-menu"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="flex flex-col items-stretch gap-0.5 px-3 pb-4 min-w-[180px]">
                    <div className="w-full h-px bg-white/10 mb-2" />
                    {navItems.map((navItem, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.045, duration: 0.18 }}
                      >
                        <Link
                          href={navItem.link}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2 w-full py-2.5 px-3 rounded-lg text-sm text-zinc-600 dark:text-neutral-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          {navItem.icon && <span className="text-purple">{navItem.icon}</span>}
                          {navItem.name}
                        </Link>
                      </motion.div>
                    ))}
                    <div className="w-full h-px bg-white/10 my-2" />
                    <div className="flex items-center justify-center gap-5 py-1">
                      <ThemeToggle />
                      <a
                        href="https://github.com/lelu-auth/lelu"
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-400 hover:text-white transition-colors"
                        aria-label="GitHub"
                      >
                        <FaGithub className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};
