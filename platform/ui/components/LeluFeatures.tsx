"use client";
import React from "react";
import { stats, features } from "@/data";
import { Button } from "./ui/MovingBorders";
import { motion } from "framer-motion";

const LeluFeatures = () => {
  return (
    <div className="w-full mt-24 md:mt-32 font-sans relative z-10 overflow-hidden" id="features">
      {/* STATS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto flex flex-wrap justify-center md:justify-between items-center gap-12 md:gap-8 px-4 mb-32 py-10 border-y border-zinc-200 dark:border-white/10 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.02] to-transparent relative"
      >
        {stats.map((s, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col items-center justify-center space-y-2 relative z-10"
          >
            <h3 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#CBACF9] to-[#393BB2] drop-shadow-sm">
              {s.value}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium tracking-wide uppercase text-sm">
              {s.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* FEATURES HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="heading">
          Security infrastructure for your <span className="text-purple">agents.</span>
        </h1>
        <p className="text-center text-lg text-zinc-600 dark:text-white-200 max-w-2xl mx-auto mt-4 mb-16">
          A comprehensive suite to monitor, control, and audit autonomous workflows.
        </p>
      </motion.div>

      {/* FEATURES GRID */}
      <div className="w-full grid lg:grid-cols-4 grid-cols-1 gap-10 max-w-7xl mx-auto px-4">
        {features.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className={`flex w-full ${card.className || "md:col-span-2"}`}
          >
            <Button
              duration={Math.floor(Math.random() * 10000) + 10000}
              borderRadius="1.75rem"
              containerClassName="w-full"
              className="flex-1 w-full text-black dark:text-white border-neutral-200 dark:border-slate-800 transition-all hover:scale-[1.02]"
            >
              <div className="flex lg:flex-row flex-col lg:items-center p-3 py-6 md:p-5 lg:p-10 gap-4 h-full w-full">
                <img src={card.thumbnail} alt={card.title} className="lg:w-32 md:w-20 w-16" />
                <div className="lg:ms-5 flex flex-col justify-center">
                  <h1 className="text-start text-xl md:text-2xl font-bold">{card.title}</h1>
                  <p className="text-start dark:text-white-100 text-zinc-600 mt-3 font-semibold">
                    {card.desc}
                  </p>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LeluFeatures;
