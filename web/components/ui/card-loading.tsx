import { cn } from "@/lib/utils";
import React from "react";

const LoadingCard = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "border border-neutral-300 shadow rounded-md p-4 w-full mx-auto",
        className
      )}
    >
      <div className="animate-pulse flex">
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 bg-slate-200 rounded"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-slate-200 rounded col-span-2"></div>
              <div className="h-2 bg-slate-200 rounded col-span-1"></div>
            </div>
            <div className="h-2 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingCard;
