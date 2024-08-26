"use client";

import { motion, type AnimationProps } from "framer-motion";

import { cn } from "@/lib/utils";
import { IconSparkles, IconStar } from "@tabler/icons-react";

const animationProps = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
} as AnimationProps;
interface ShinyButtonProps {
  text: string;
  className?: string;
  onClick?: () => void;
}
const ShinyButton = ({
  text = "shiny-button",
  className,
  onClick,
}: ShinyButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        `inline-flex h-10 hover:animate-shimmer items-center justify-center rounded-md border border-purple-800 bg-[linear-gradient(110deg,#2c0ba3,45%,#805AD5,55%,#2c0ba3)] bg-[length:200%_100%] px-6 font-medium text-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-purple-50`,
        className
      )}
    >
      {text}
      <IconSparkles className="ml-1" />
    </button>
  );
};

export default ShinyButton;
