import { cn } from "@/lib/utils";
import { IconInfinity, IconSparkles } from "@tabler/icons-react";
import React from "react";

const Logo = ({ size = 30, className = "" }) => {
  return (
    <div className={cn("flex", className)}>
      <div>
        <IconInfinity className="mx-1 text-indigo-700" size={size} />
      </div>

      <div className="flex items-center">
        <h1
          className={cn(
            "mr-1 font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-500",
            {
              [`text-${size === 30 ? "xl" : "base"}`]: true, // Adjusts the text size based on icon size
            }
          )}
        >
          InsightFlow
        </h1>
        <IconSparkles className="text-purple-500" size={size * 0.8} />
      </div>
    </div>
  );
};

export default Logo;
