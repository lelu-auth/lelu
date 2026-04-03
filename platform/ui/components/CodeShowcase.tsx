"use client";
import React, { useRef } from "react";
import { FiTerminal, FiCheck, FiCopy, FiCode } from "react-icons/fi";
import { SiPython, SiTypescript, SiGo } from "react-icons/si";
import { motion, useScroll, useTransform } from "framer-motion";

const ProfessionalStepTwo = () => {
  const [activeLang, setActiveLang] = React.useState("ts");

  const langs = [
    {
      id: "ts",
      label: "TypeScript",
      icon: <SiTypescript className="w-4 h-4 text-[#3178c6]" />,
      cmd: "npm install lelu-agent-auth",
    },
    {
      id: "py",
      label: "Python",
      icon: <SiPython className="w-4 h-4 text-[#ffe873]" />,
      cmd: "pip install lelu-auth-sdk",
    },
    {
      id: "go",
      label: "Go",
      icon: <SiGo className="w-4 h-4 text-[#00ADD8]" />,
      cmd: "go get github.com/lelu-auth/lelu",
    },
  ];

  const activeData = langs.find((l) => l.id === activeLang);

  return (
    <div className="w-full relative rounded-xl p-[1px] overflow-hidden group">
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex flex-col w-full h-full bg-zinc-100 dark:bg-[#0F111A] rounded-xl border border-zinc-200 dark:border-white/5 overflow-hidden">
        {/* Header Tabs */}
        <div className="flex px-2 pt-2 bg-zinc-200/50 dark:bg-white/[0.02] border-b border-zinc-200 dark:border-white/5 gap-1 overflow-x-auto scrollbar-hide">
          {langs.map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveLang(l.id)}
              className={`flex items-center gap-2 px-4 py-2 border-t-2 transition-all rounded-t-lg select-none ${
                activeLang === l.id
                  ? "border-[#6366f1] bg-zinc-100 dark:bg-[#0F111A] text-zinc-900 dark:text-white shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.1)]"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/5"
              }`}
            >
              <div
                className={
                  activeLang === l.id
                    ? "opacity-100"
                    : "opacity-50 grayscale hover:grayscale-0 transition-opacity"
                }
              >
                {l.icon}
              </div>
              <span className="text-sm font-medium">{l.label}</span>
            </button>
          ))}
          <div className="flex-1 border-b border-zinc-200 dark:border-transparent"></div>
        </div>

        <div className="flex items-center justify-between p-4 bg-transparent">
          <pre className="font-mono text-sm text-zinc-800 dark:text-zinc-300 overflow-x-auto flex-1">
            <code className="flex items-center gap-1">
              <span className="text-purple select-none">❯ </span>
              <span>{activeData?.cmd}</span>
            </code>
          </pre>
          <FiCopy className="w-4 h-4 text-zinc-400 hover:text-purple cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
  );
};

const steps = [
  {
    number: "01",
    title: "One-Command Setup",
    subtitle: "Recommended",
    description:
      "Install SDK and start all services with Docker automatically. Includes engine, platform, UI, and database.",
    content: (
      <div className="w-full relative rounded-xl p-[1px] overflow-hidden group">
        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative bg-zinc-100 dark:bg-[#0F111A] rounded-xl border border-zinc-200 dark:border-white/5 overflow-hidden flex flex-col w-full h-full">
          <div className="px-4 py-2 border-b border-zinc-200 dark:border-white/5 bg-zinc-200/50 dark:bg-white/[0.02] flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
            <span className="ml-2 text-xs text-zinc-500 font-mono">terminal</span>
          </div>
          <pre className="p-4 font-mono text-sm text-zinc-800 dark:text-zinc-300 overflow-x-auto flex-1">
            <code className="flex flex-col gap-1">
              <span>
                <span className="text-purple select-none">❯ </span>npm install lelu-agent-auth
              </span>
              <span>
                <span className="text-purple select-none">❯ </span>npx lelu-agent-auth init
              </span>
            </code>
          </pre>
          <div className="px-4 py-3 bg-white/40 dark:bg-black-200/40 border-t border-zinc-200 dark:border-white/5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <FiCheck className="w-4 h-4 text-purple" /> Opens browser to http://localhost:3002 when
            ready
          </div>
        </div>
      </div>
    ),
    icon: <FiTerminal className="w-6 h-6 text-[#393BB2] dark:text-[#CBACF9]" />,
    gradient: "from-[#CBACF9] to-[#393BB2]",
  },
  {
    number: "02",
    title: "Or Install SDK Only",
    subtitle: "Advanced",
    description:
      "Install language-specific SDKs natively into your environment without global Docker services.",
    content: <ProfessionalStepTwo />,
    icon: <FiCode className="w-6 h-6 text-[#393BB2] dark:text-[#CBACF9]" />,
    gradient: "from-[#393BB2] to-[#CBACF9]",
  },
  {
    number: "03",
    title: "Secure Your Actions",
    subtitle: "Implement",
    description:
      "Wrap high-risk agent capabilities. Lelu validates actions locally or escalates to human review instantly.",
    content: (
      <div className="w-full relative rounded-xl p-[1px] overflow-hidden group">
        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative bg-zinc-50 dark:bg-[#0F111A] rounded-xl border border-zinc-200 dark:border-white/5 overflow-hidden flex flex-col w-full h-full">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 px-4 py-3 bg-zinc-200/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1.5 mr-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
              </div>
              <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-2 bg-white/50 dark:bg-white/5 px-2 py-0.5 rounded border border-zinc-200 dark:border-white/5">
                <span className="text-[#3178c6]">ts</span> agent.ts
              </div>
            </div>
            <FiCopy className="w-4 h-4 text-zinc-400 hover:text-purple cursor-pointer transition-colors" />
          </div>
          <div className="p-5 md:p-6 overflow-x-auto text-xs md:text-sm">
            <pre className="font-mono leading-relaxed">
              <code className="text-zinc-800 dark:text-zinc-300">
                <span className="text-[#c678dd] dark:text-purple-400">import</span> {"{ "}LeluClient
                {" }"} <span className="text-[#c678dd] dark:text-purple-400">from</span>{" "}
                <span className="text-[#98c379] dark:text-emerald-400">'lelu-agent-auth'</span>;
                <br />
                <span className="text-[#c678dd] dark:text-purple-400">import</span> {"{ "}OpenAI
                {" }"} <span className="text-[#c678dd] dark:text-purple-400">from</span>{" "}
                <span className="text-[#98c379] dark:text-emerald-400">'openai'</span>;<br />
                <br />
                <span className="text-zinc-500 italic">// Initialize Lelu client</span>
                <br />
                <span className="text-[#61afef] dark:text-blue-400">const</span> lelu ={" "}
                <span className="text-[#61afef] dark:text-blue-400">new</span> LeluClient({"{"}
                <br />
                {"  "}baseUrl:{" "}
                <span className="text-[#98c379] dark:text-emerald-400">
                  'https://lelu-engine.onrender.com'
                </span>
                ,<br />
                {"  "}apiKey: process.env.
                <span className="text-[#e5c07b] dark:text-amber-400">LELU_API_KEY</span>
                <br />
                {"}"});
                <br />
                <br />
                <span className="text-zinc-500 italic">// Secure your agent actions</span>
                <br />
                <span className="text-[#61afef] dark:text-blue-400">const</span> decision ={" "}
                <span className="text-[#c678dd] dark:text-purple-400">await</span>{" "}
                lelu.agentAuthorize({"{"}
                <br />
                {"  "}actor:{" "}
                <span className="text-[#98c379] dark:text-emerald-400">"billing-agent"</span>,<br />
                {"  "}action:{" "}
                <span className="text-[#98c379] dark:text-emerald-400">"refund:process"</span>,
                <br />
                {"  "}resource: {"{ "}orderId:{" "}
                <span className="text-[#98c379] dark:text-emerald-400">"12345"</span>
                {" }"},<br />
                {"  "}context: {"{ "}confidence:{" "}
                <span className="text-[#d19a66] dark:text-amber-400">0.85</span>
                {" }"}
                <br />
                {"}"});
                <br />
              </code>
            </pre>
          </div>
        </div>
      </div>
    ),
    icon: <FiCheck className="w-6 h-6 text-[#393BB2] dark:text-[#CBACF9]" />,
    gradient: "from-[#CBACF9] to-[#393BB2]",
  },
];

const CodeShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div
      ref={containerRef}
      className="w-full relative mt-20 md:mt-32 px-4 z-10 max-w-5xl mx-auto font-sans"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] bg-purple/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 dark:text-white text-zinc-900">
          Get Started in{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CBACF9] to-[#393BB2]">
            2 Minutes
          </span>
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
          From zero to policy-protected agents. See how easy it is to integrate Lelu into your
          autonomous workflows.
        </p>
      </motion.div>

      <div className="relative w-full">
        {/* Continuous Line Background */}
        <div className="absolute left-6 md:left-[50%] top-0 bottom-0 w-1 rounded-full bg-zinc-200 dark:bg-white/5 transform md:-translate-x-1/2 overflow-hidden">
          {/* Scroll Driven Glowing Line Fill */}
          <motion.div
            style={{ height: lineHeight }}
            className="w-full rounded-full bg-gradient-to-b from-[#CBACF9] via-[#393BB2] to-[#CBACF9] dark:opacity-70 opacity-100 origin-top"
          />
        </div>

        <div className="flex flex-col gap-12 md:gap-24">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isEven ? -50 : 50, y: 50 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                className="relative flex flex-col md:flex-row items-start md:items-center w-full"
              >
                {/* Center Node */}
                <div className="absolute left-6 md:left-1/2 w-12 h-12 rounded-full border-[4px] border-white dark:border-[#09090b] shadow-xl z-20 flex items-center justify-center bg-white dark:bg-black-100 transform -translate-x-1/2 md:-translate-y-1/2 mt-6 md:mt-0">
                  <div
                    className={`absolute inset-[-2px] rounded-full bg-gradient-to-br ${step.gradient} animate-[spin_3s_linear_infinite] [mask-image:linear-gradient(white,transparent)] opacity-50`}
                  ></div>
                  <div className="z-10 relative bg-white dark:bg-black-100 w-full h-full rounded-full flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>

                {/* Content Container */}
                <div
                  className={`w-full md:w-1/2 pl-20 md:px-12 flex flex-col ${isEven ? "md:pr-16 md:items-end md:text-right" : "md:pl-16 md:ml-auto md:items-start md:text-left"} mt-0 relative z-10`}
                >
                  <div className="mb-6 max-w-lg w-full">
                    <span
                      className={`inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${step.gradient} text-white shadow-lg shadow-purple/20`}
                    >
                      Step {step.number} • {step.subtitle}
                    </span>
                    <h3 className="text-2xl font-bold dark:text-white text-zinc-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base">
                      {step.description}
                    </p>
                  </div>

                  {/* Actual Step UI */}
                  <div className="w-full shadow-2xl rounded-xl">{step.content}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CodeShowcase;
