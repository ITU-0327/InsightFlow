"use client";
import MagicSparkleButton from "@/components/MagicSparkleButton";
import Logo from "@/components/ui/logo";
import React from "react";

const GetStarted = () => {
  return (
    <div className="w-9/12 p-[1px] rounded-2xl bg-gradient-to-tr from-blue-200 to-purple-300">
      <div className="w-full flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-tr via-white  from-blue-100 to-purple-100">
        <Logo className="text-xl" />
        <p className="font-medium text-lg text-gray-600">
          Supercharge your user research—upload, analyze, and unlock insights in
          minutes with InsightFlow.
        </p>
        <MagicSparkleButton />
      </div>
    </div>
  );
};

export default GetStarted;
