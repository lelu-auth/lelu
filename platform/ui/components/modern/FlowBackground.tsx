"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

const FlowBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (clientX - left) / width;
      const y = (clientY - top) / height;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const bgX = useSpring((mousePosition.x - 0.5) * -30, { stiffness: 100, damping: 30 });
  const bgY = useSpring((mousePosition.y - 0.5) * -30, { stiffness: 100, damping: 30 });

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
      style={{ height: "100%" }}
    >
      {/* Background Layer to ensure visibility */}
      <div className="absolute inset-0 bg-white dark:bg-[#000000] -z-10" />

      {/* Modern Grid & Diagonal Lines */}
      <motion.div
        style={{ x: bgX, y: bgY }}
        className="absolute inset-[-20%] opacity-[0.6] dark:opacity-[0.4]"
      >
        {/* Sharp Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Diagonal Aniqui-style Lines */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern
              id="diagonal-lines"
              x="0"
              y="0"
              width="100"
              height="200"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M -100 200 L 200 -100"
                stroke="rgba(128,128,128,0.15)"
                strokeWidth="0.5"
                fill="none"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
        </svg>

        {/* Dynamic Glow Blobs */}
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[30%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
      </motion.div>

      {/* Interactive Floating Particles */}
      <svg className="absolute inset-0 w-full h-full opacity-40">
        <defs>
          <filter id="glow-svg">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {[...Array(8)].map((_, i) => (
          <motion.circle
            key={i}
            cx={`${10 + i * 12}%`}
            cy={`${20 + (i % 3) * 20}%`}
            r="1.5"
            fill="#8b5cf6"
            filter="url(#glow-svg)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.4, 0],
              scale: [0, 1.2, 0],
              y: [0, -50, 0],
              transition: {
                duration: 6 + i,
                repeat: Infinity,
                delay: i * 2,
                ease: "easeInOut",
              },
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default FlowBackground;
