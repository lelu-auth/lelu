"use client";

import dynamic from "next/dynamic";
import LeluHero from "@/components/LeluHero";
import CodeShowcase from "@/components/CodeShowcase";
const LeluGrid = dynamic(() => import("@/components/LeluGrid"), { ssr: false });
import LeluFeatures from "@/components/LeluFeatures";

const Home = () => {
  return (
    <main className="relative bg-white dark:bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        <LeluHero />
        <CodeShowcase />
        <LeluFeatures />
        <LeluGrid />
      </div>
    </main>
  );
};

export default Home;
