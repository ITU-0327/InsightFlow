"use client";
import MagicSparkleButton from "@/components/MagicSparkleButton";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import Logo from "@/components/ui/logo";
import React from "react";

const GetStarted = () => {
  return (
    <div className="w-10/12">
      <BackgroundGradient className="w-full rounded-[22px] p-1 bg-gradient-to-tr via-white  from-blue-300 to-purple-300 dark:bg-zinc-900">
        <div className="w-full flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-tr via-white  from-blue-100 to-purple-100">
          <Logo className="text-xl" />
          <p className="font-medium text-lg text-gray-600 text-center">
            Supercharge your user research—upload, analyze, and unlock insights
            in minutes with InsightFlow.
          </p>
          <MagicSparkleButton />
        </div>
      </BackgroundGradient>
    </div>
  );
};

export default GetStarted;
