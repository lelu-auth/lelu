"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Bot,
  Workflow,
  Zap,
  Lock,
  LayoutDashboard,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Hero = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative pt-16 pb-24 md:pt-28 md:pb-32 overflow-visible">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          {/* Top Badge - Improved Original Pill Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50/50 px-3 py-1 text-sm text-zinc-600 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
              Lelu Engine v1.0 — Now Open Source
            </div>
          </motion.div>

          {/* Main Title & Description */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl"
          >
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-black dark:text-white mb-8 leading-[1.1]">
              The Definitive <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                AI Agent Foundry.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-12 leading-relaxed">
              Architect, connect, and scale logic-driven AI agents. The missing authorization layer
              that secures every tool call and workflow with real-time policy enforcement.
            </p>
          </motion.div>

          {/* CTA Buttons - Following Default Codebase Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-5 mb-24"
          >
            <Link
              href="/docs/quickstart"
              className="inline-flex items-center justify-center rounded-full bg-black px-10 py-4 text-sm font-medium text-white shadow-xl transition-all hover:scale-105 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 active:scale-95"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>

            <Link
              href="/api-key"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-4 text-sm font-medium text-white shadow-xl transition-all hover:scale-105 hover:from-indigo-700 hover:to-purple-700 active:scale-95"
            >
              <Lock className="w-4 h-4 mr-2" />
              Get API Key
            </Link>

            <a
              href="https://github.com/lelu-auth/lelu"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white/50 px-10 py-4 text-sm font-medium text-zinc-900 backdrop-blur-md transition-all hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              GitHub
            </a>
          </motion.div>

          {/* Premium "How it Works" Flow Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-5xl relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 blur-3xl -z-10 rounded-[3rem]" />

            <div className="bg-white/40 dark:bg-black/40 border border-zinc-200/50 dark:border-white/[0.05] rounded-[2.5rem] p-12 backdrop-blur-2xl shadow-2xl overflow-hidden group">
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-4 h-full min-h-[400px]">
                {/* Node 1: AI Agent */}
                <div className="flex flex-col items-center gap-6 w-full lg:w-1/4 text-center">
                  <div className="relative h-24 w-24 rounded-[2rem] bg-white dark:bg-zinc-800 shadow-2xl flex items-center justify-center border border-zinc-100 dark:border-white/10 group-hover:-translate-y-2 transition-transform duration-500">
                    <Bot className="w-10 h-10 text-indigo-500" />
                    <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-white dark:border-zinc-800 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 uppercase tracking-widest text-[10px]">
                      Source
                    </h4>
                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 italic font-mono">
                      "agent-x-3004"
                    </p>
                  </div>
                </div>

                {/* Animated Connector 1 */}
                <div className="hidden lg:flex flex-1 items-center justify-center relative">
                  <svg className="w-full h-8 overflow-visible">
                    <path
                      d="M 0 4 H 200"
                      stroke="rgba(120, 113, 108, 0.2)"
                      strokeWidth="1"
                      fill="none"
                      strokeDasharray="4 4"
                    />
                    <motion.path
                      d="M 0 4 H 200"
                      stroke="#6366f1"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </svg>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute h-6 w-6 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20"
                  >
                    <Lock className="w-3 h-3 text-indigo-500" />
                  </motion.div>
                </div>

                {/* Node 2: Lelu Engine (Security Gate) */}
                <div className="flex flex-col items-center gap-8 w-full lg:w-1/3 text-center">
                  <div className="relative h-32 w-32 rounded-[2.5rem] bg-indigo-600 shadow-[0_0_50px_rgba(79,70,229,0.3)] flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform duration-500 rotate-x-2">
                    <ShieldCheck className="w-14 h-14 text-white" />
                    <div className="absolute inset-0 rounded-[2.5rem] border-2 border-white/30 animate-ping opacity-20" />
                  </div>
                  <div>
                    <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 mb-3 rounded-full hover:bg-indigo-500/20 transition-colors cursor-default">
                      Authorization Engine
                    </Badge>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                      Policy evaluation complete. <br />
                      Action: <span className="text-emerald-500 font-bold">ALLOW</span>
                    </p>
                  </div>
                </div>

                {/* Animated Connector 2 */}
                <div className="hidden lg:flex flex-1 items-center justify-center relative">
                  <svg className="w-full h-8 overflow-visible">
                    <path
                      d="M 0 4 H 200"
                      stroke="rgba(120, 113, 108, 0.2)"
                      strokeWidth="1"
                      fill="none"
                      strokeDasharray="4 4"
                    />
                    <motion.path
                      d="M 0 4 H 200"
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                    />
                  </svg>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                    className="absolute h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20"
                  >
                    <Zap className="w-3 h-3 text-purple-500" />
                  </motion.div>
                </div>

                {/* Node 3: Tool/Action Output */}
                <div className="flex flex-col items-center gap-6 w-full lg:w-1/4 text-center">
                  <div className="relative h-24 w-24 rounded-[2rem] bg-white dark:bg-zinc-800 shadow-2xl flex items-center justify-center border border-zinc-100 dark:border-white/10 group-hover:translate-y-2 transition-transform duration-500">
                    <Workflow className="w-10 h-10 text-purple-500" />
                    <div className="absolute -top-1 -left-1 h-6 w-6 rounded-full bg-indigo-500 border-4 border-white dark:border-zinc-800" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1 uppercase tracking-widest text-[10px]">
                      Secure Output
                    </h4>
                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 italic font-mono">
                      "refund:process"
                    </p>
                  </div>
                </div>
              </div>

              {/* Internal Glass Highlight */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none opacity-50 skew-x-12 translate-x-32 group-hover:translate-x-16 transition-transform duration-1000" />
            </div>

            {/* Bottom Insight Hint */}
            <div className="mt-12 flex items-center gap-3 text-sm text-zinc-500 justify-center animate-pulse">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Suspicious behavior automatically triggers human review</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
