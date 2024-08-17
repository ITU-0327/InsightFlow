import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InsightNote } from "../../insight.model";
import NoteCard from "../../components/NoteCard";
import { cn } from "@/lib/utils";

interface ThemeAccordionProps {
  theme: string;
  notes: InsightNote[];
  className?: string;
}

const pastelGradientLightColors = [
  "via-pink-100",
  "via-blue-100",
  "via-green-100",
  "via-yellow-100",
  "via-purple-100",
  "via-teal-100",
  "via-indigo-100",
  "via-red-100",
  "via-orange-100",
  "via-gray-100",
];

const ThemeAccordion: React.FC<ThemeAccordionProps> = ({
  theme,
  notes,
  className,
}) => {
  const [open, setOpen] = useState(false);

  const randomColor = useMemo(() => {
    const randomIndex = Math.floor(
      Math.random() * pastelGradientLightColors.length
    );
    return pastelGradientLightColors[randomIndex];
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        staggerChildren: 0.2, // Adjust the delay between cards
      },
    },
    exit: { opacity: 0, height: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className={cn(
        "rounded-2xl mb-4 border-t-2 border-neutral-100 max-w-screen-xl shadow-md",
        className
      )}
    >
      <div
        onClick={() => setOpen(!open)}
        className={`w-full p-4 cursor-pointer rounded-t-lg text-left bg-gradient-to-b from-transparent ${randomColor} to-gray-100 focus:outline-none`}
      >
        <h3 className="text-lg font-semibold">{theme}</h3>
        <span className="text-sm text-gray-800">
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="p-4 bg-gray-100 overflow-scroll flex flex-row gap-2 max-h-svh"
          >
            {notes.map((note, index) => (
              <motion.div key={index} variants={itemVariants}>
                <NoteCard note={note} className="h-min" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeAccordion;