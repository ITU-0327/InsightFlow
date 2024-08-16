"use client";
import React from "react";
import Link from "next/link";
import { IconMap, IconMessage, IconSearch } from "@tabler/icons-react";
import { usePathname } from "next/navigation";

const SegmentedControl = () => {
  const pathname = usePathname();
  return (
    <div className="border-2 border-purple-400 rounded-md overflow-hidden text-sm max-w-md min-w-[400px]">
      <div className="flex gap-2 p-2">
        <Link
          href="/dashboard/insights/"
          className={`flex-1 py-2 text-center ${
            pathname === "/dashboard/insights"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md border-2 border-purple-400"
              : "bg-transparent text-gray-600"
          } transition-colors duration-300 flex items-center justify-center gap-2`}
        >
          <IconSearch className="h-5 w-5" />
          Explore
        </Link>
        <Link
          href="/dashboard/insights/ask"
          className={`flex-1 py-2 text-center   ${
            pathname === "/dashboard/insights/ask"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-2 rounded-md border-purple-400"
              : "bg-transparent text-gray-600"
          } transition-colors duration-300 flex items-center justify-center gap-2`}
        >
          <IconMessage className="h-5 w-5" />
          ask
        </Link>
        <Link
          href="/dashboard/insights/themes"
          className={`flex-1 py-2 text-center   ${
            pathname === "/dashboard/insights/themes"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-2 rounded-md border-purple-400"
              : "bg-transparent text-gray-600"
          } transition-colors duration-300 flex items-center justify-center gap-2`}
        >
          <IconMap className="h-5 w-5" />
          Themes
        </Link>
      </div>
    </div>
  );
};

export default SegmentedControl;
