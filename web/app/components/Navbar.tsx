"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export type NavItem = {
  name: string;
  link: string;
};
//you handle routing logic. Code is not complex, just play with it and you gonna figure out how it works.
export const NavBar: React.FC<{ tabs: NavItem[] }> = ({ tabs }) => {
  const fired = useRef(false);
  const defaultSelectedTabIndex = 0;
  const [currentLink, setCurrentLink] = useState<{
    index: number;
    left: undefined | number;
    width: undefined | number;
  }>({
    index: defaultSelectedTabIndex,
    left: undefined,
    width: undefined,
  });

  /**
   * TailwindCSS scans your codebase and based on that generates styles
   * TailwindCSS does not allow to concatenate class names, so just wrote down all possible combinations (you can add more if you need, you got the idea)
   * read https://tailwindcss.com/docs/content-configuration#dynamic-class-names
   * you can not do like this - `[&:nth-child(${child})]:bg-neutral-950` it won't work
   */
  const defaultSelectedTabStyles = [
    "[&:nth-child(1)]:dark:bg-white [&:nth-child(1)]:bg-gradient-to-r from-indigo-700 to-purple-500",
    "[&:nth-child(2)]:dark:bg-white [&:nth-child(2)]:bg-neutral-950",
    "[&:nth-child(3)]:dark:bg-white [&:nth-child(3)]:bg-neutral-950",
    "[&:nth-child(4)]:dark:bg-white [&:nth-child(4)]:bg-neutral-950",
  ];

  useEffect(() => {
    setCurrentLink(() => ({
      left: document.getElementById("uuu-btn-" + defaultSelectedTabIndex)
        ?.offsetLeft,
      width: document
        .getElementById("uuu-btn-" + defaultSelectedTabIndex)
        ?.getBoundingClientRect().width,
      index: defaultSelectedTabIndex,
    }));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }} // Start with opacity 0 and positioned 50px above
      animate={{ opacity: 1, y: 0 }} // Animate to full opacity and original position
      transition={{ duration: 1 }} // Adjust the duration of the animation
    >
      <div
        className={
          "w-fit relative border dark:border-neutral-800 border-neutral-300 rounded-full flex gap-5 items-center justify-center p-2 bg-white/40 backdrop-blur-2xl"
        }
      >
        {tabs.map((item, i) => (
          <Link
            href={item.link}
            key={i}
            id={"uuu-btn-" + i}
            onClick={() => {
              fired.current = true;
              setCurrentLink(() => ({
                left: document.getElementById("uuu-btn-" + i)?.offsetLeft,
                width: document
                  .getElementById("uuu-btn-" + i)
                  ?.getBoundingClientRect().width,
                index: i,
              }));
            }}
            className={twMerge(
              "cursor-pointer p-3 font-medium transition-colors duration-200 flex items-center justify-center rounded-full h-fit px-2 py-2 text-nowrap",
              currentLink.index === i && "dark:text-neutral-900 text-white",
              fired.current
                ? ""
                : defaultSelectedTabStyles[defaultSelectedTabIndex]
            )}
          >
            {item.name}
          </Link>
        ))}
        <div className={"absolute inset-0 h-full p-2 -z-[1] overflow-hidden"}>
          <div className={"relative h-full w-full overflow-hidden"}>
            <div
              style={{
                left: `calc(${currentLink.left || 0}px - 0.75rem + 0.25rem)`,
                width: `${currentLink.width || 0}px`,
              }}
              className={twMerge(
                `transition-[color,left,width] duration-300 absolute top-1/2 -translate-y-1/2 h-full rounded-full -z-[1]`,
                //just skips animation on page load
                fired.current
                  ? "dark:bg-white bg-gradient-to-tr from-indigo-700 to-purple-500"
                  : "bg-white"
              )}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
