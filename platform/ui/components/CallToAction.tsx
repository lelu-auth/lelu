"use client";
import React from "react";
import Link from "next/link";
import { FaLocationArrow } from "react-icons/fa6";
import { FiBook } from "react-icons/fi";
import MagicButton from "./ui/MagicButton";

const CallToAction = () => {
  return (
    <div className="mt-32 mb-20 text-center px-4">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white/50 p-12 md:p-20 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black-100/50 max-w-6xl mx-auto">
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 dark:text-white text-zinc-900">
            Ready to secure your AI agents?
          </h2>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get started with Lelu in minutes. Deploy locally with Docker or use our cloud-hosted
            solution to maintain complete control over your autonomous workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto">
            <Link href="/docs/quickstart">
              <MagicButton title="Start Building" icon={<FaLocationArrow />} position="right" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white/80 px-8 py-4 text-sm font-bold text-zinc-900 backdrop-blur-md transition-all hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 shadow-sm hover:shadow-md"
            >
              <FiBook className="w-5 h-5 mr-2" />
              View Documentation
            </Link>
          </div>
        </div>

        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-full opacity-40 dark:opacity-30 pointer-events-none">
          <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#3b82f6]/30 blur-[100px]" />
          <div className="absolute bottom-[-50%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#CBACF9]/30 blur-[100px]" />
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
