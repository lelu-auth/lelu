"use client";

import LeluHero from "@/components/LeluHero";
import LeluFeatures from "@/components/LeluFeatures";
import CodeShowcase from "@/components/CodeShowcase";
import QuickstartStrip from "@/components/QuickstartStrip";
import IntegrationMarquee from "@/components/IntegrationMarquee";

const Home = () => {
  return (
    <main className="relative bg-[#FAFAFA] dark:bg-[#0B0B0C] flex justify-center items-center flex-col overflow-hidden mx-auto">
      <div className="max-w-7xl w-full">
        <LeluHero />
      </div>
      <div className="w-full">
        <IntegrationMarquee />
      </div>
      <div className="max-w-7xl w-full">
        <LeluFeatures />
        <CodeShowcase />
        <QuickstartStrip />
      </div>
    </main>
  );
};

export default Home;
