"use client";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Cover } from "@/components/ui/cover";
import Logo from "@/components/ui/logo";
import { motion } from "framer-motion";
import React from "react";

const Hero = () => {
  return (
    <div className="w-full">
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-4 items-center justify-center px-4"
        >
          <Logo
            size={30}
            className="border p-3 rounded-full shadow-sm bg-white"
          />
          <h1 className="text-4xl md:text-7xl lg:text-6xl font-bold max-w-7xl mx-auto text-center mt-2 relative z-20 py-3 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-500 dark:from-neutral-800 dark:via-white dark:to-white">
            Go from data to product insights
            <div className="mt-3">
              at{"   "} <Cover> lightning speed</Cover>
            </div>
          </h1>
          <div className="font-light text-base md:text-xl dark:text-neutral-200 ">
            Turn your user surveys , feedback , reviews and interviews into
            actionable insights instantly
          </div>
        </motion.div>
      </AuroraBackground>
    </div>
  );
};

export default Hero;
