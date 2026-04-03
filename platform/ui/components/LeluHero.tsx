import { FaLocationArrow } from "react-icons/fa6";
import MagicButton from "./ui/MagicButton";
import { Spotlight } from "./ui/Spotlight";
import { TextGenerateEffect } from "./ui/TextGenerateEffect";
import HeroGlobe from "./ui/HeroGlobe";
import Link from "next/link";
import { FaGithub } from "react-icons/fa6";
import { FiBook, FiKey, FiCheckCircle } from "react-icons/fi";

const LeluHero = () => {
  return (
    <div className="pb-16 pt-20 md:pt-28 relative">
      <div>
        <Spotlight className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen" fill="white" />
        <Spotlight className="h-[80vh] w-[50vw] top-10 left-full" fill="purple" />
        <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="blue" />
      </div>

      <div className="h-screen w-full dark:bg-black-100 bg-white absolute top-0 left-0 flex items-center justify-center overflow-hidden">
        {/* Huge Globe placed underneath the mask */}
        <HeroGlobe />

        <div
          className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black-100
         bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
        />
      </div>

      <div className="flex justify-center relative mt-10 mb-20 z-10 pointer-events-none">
        <div className="max-w-[89vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          {/* Release Badge */}
          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white/50 px-4 py-1.5 text-sm text-zinc-900 backdrop-blur-md dark:border-white/10 dark:bg-black/40 dark:text-zinc-300 md:mb-6 mb-4 pointer-events-auto">
            <span className="flex h-2 w-2 rounded-full bg-purple mr-2 animate-pulse"></span>
            Lelu Engine v1.0 is live
          </div>

          <TextGenerateEffect
            words="Authorization & Security for AI Agents"
            className="text-center text-[40px] md:text-6xl lg:text-7xl max-w-4xl tracking-tighter"
          />

          <p className="text-center md:tracking-wide mt-4 mb-4 text-sm md:text-lg lg:text-xl dark:text-zinc-400 text-zinc-900 max-w-2xl">
            Lelu helps companies safely deploy autonomous AI systems. Control what agents can do,
            route risky actions to humans, and maintain complete audit trails—all in real-time.
          </p>

          {/* Target Audience Pills */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-900 dark:text-zinc-400 max-w-2xl mb-10">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5 text-emerald-500" />
              <span>For development teams building AI agents</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCheckCircle className="w-5 h-5 text-emerald-500" />
              <span>Open source & production-ready</span>
            </div>
          </div>

          {/* Button Group */}
          <div className="flex flex-col md:flex-row flex-wrap gap-4 w-full justify-center items-center mt-4 pointer-events-auto">
            <Link href="/docs/quickstart">
              <MagicButton title="Get Started" icon={<FaLocationArrow />} position="right" />
            </Link>

            <Link href="/api-key">
              <MagicButton title="Get API Key" icon={<FiKey />} position="left" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeluHero;
