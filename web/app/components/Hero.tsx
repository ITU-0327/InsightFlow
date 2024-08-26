"use client";

import { Cover } from "@/components/ui/cover";
import Logo from "@/components/ui/logo";
import { IconArrowDown } from "@tabler/icons-react";
import React from "react";

const Hero = () => {
  return (
    <div className="w-full h-[50%]">
      <div className="relative flex flex-col gap-4 items-center justify-center px-4">
        <Logo
          size={30}
          className="border p-2 rounded-full shadow-sm bg-white"
        />
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold max-w-7xl mx-auto text-center mt-2 relative z-20 py-3 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-500 dark:from-neutral-800 dark:via-white dark:to-white">
          Go from data to user insights
          <div className="mt-3">
            at{"   "} <Cover className="cursor-pointer"> lightning speed</Cover>
          </div>
        </h1>
        <div className="font-light text-neutral-700 md:text-2xl text-center dark:text-neutral-200 ">
          Turn your user surveys , feedback , reviews and interviews into{" "}
          <span className="font-base text-neutral-700 border-b-2 border-indigo-700">
            actionable insights
          </span>{" "}
          instantly
        </div>
        <div className="text-xl text-neutral-700 font-light mt-20 flex flex-col items-center gap-6">
          <p>Find out how</p>
          <IconArrowDown className="animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
