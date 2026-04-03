"use client";

import React from "react";
import { gridItems } from "@/data";
import { BentoGrid, BentoGridItem } from "./ui/BentoGrid";
import { motion } from "framer-motion";

const LeluGrid = () => {
  return (
    <section id="advanced-features" className="w-full py-24 relative z-10">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 px-4"
      >
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 dark:text-white text-zinc-900">
          Advanced{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CBACF9] to-[#393BB2]">
            Features
          </span>
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          AI-powered analytics and monitoring for production deployments.
        </p>
      </motion.div>

      {/* BENTO GRID */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <BentoGrid className="w-full max-w-7xl mx-auto">
          {gridItems.map((item, i) => (
            <BentoGridItem
              id={item.id}
              key={item.id}
              title={item.title}
              description={item.description}
              className={item.className}
              img={item.img}
              imgClassName={item.imgClassName}
              titleClassName={item.titleClassName}
              spareImg={item.spareImg}
            />
          ))}
        </BentoGrid>
      </motion.div>
    </section>
  );
};

export default LeluGrid;
