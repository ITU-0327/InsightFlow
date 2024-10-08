"use client";
import React, { useState } from "react";
import { Tag, getFileIcon, getFileType, getTagColour } from "@/app/utils";
import { InsightNote } from "../insight.model";
import BaseCard from "@/components/ui/card";
import useClipboard from "../../hooks/use-copy-to-clipboard";
import { IconCopy, IconCopyCheck, IconEye } from "@tabler/icons-react";
import Modal from "./Modal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NoteCardProps {
  note: InsightNote;
  className?: string;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, className }) => {
  const fileType = getFileType(note.source);
  const { copied, copyToClipboard } = useClipboard();
  const icon = getFileIcon(fileType);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const handleViewClick = () => {
    setModalOpen(true); // Open the modal when clicking
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Close the modal
  };

  return (
    <BaseCard className={cn("m-3 max-w-md h-auto p-4", className)}>
      <div className="text-gray-700 mb-5">
        <p className="text-lg">{note.note}</p>
      </div>

      <div className="flex flex-wrap space-x-2">
        {note.tags.map((tag, index) => (
          <span
            key={index}
            className={cn(
              `text-xs font-bold px-2.5 py-0.5 rounded-md m-1`,
              `${getTagColour(tag as Tag).bg} ${getTagColour(tag as Tag).text}`
            )}
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center space-x-4 my-2">
        <span className="text-sm font-semibold text-gray-800">
          From: {note.source}
        </span>
        <span className="text-gray-500">{icon}</span>
      </div>

      <div className="flex items-center space-x-2 mt-4 w-full justify-between">
        <div
          className="text-xs flex items-center gap-1 border border-gray-300 p-1 rounded-md hover:cursor-pointer hover:bg-gray-100"
          onClick={handleViewClick}
        >
          <IconEye size={16} />
          View Detail
        </div>
        <button
          className={`${copied ? "bg-purple-500" : "bg-purple-100"} ${
            copied ? "text-purple-100" : "text-purple-500"
          } px-2 py-1 font-medium text-xs rounded-md flex items-center space-x-1`}
          onClick={() => copyToClipboard(note.note)}
        >
          {copied ? <IconCopyCheck size={16} /> : <IconCopy size={16} />}
          <span>{copied ? "Copied!" : "Copy Note"}</span>
        </button>
      </div>

      {/* Modal component with animation */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        content={
          <motion.div
            className="max-h-[550px] p-4 bg-white rounded-md shadow-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <p>{note.fullText}</p>
          </motion.div>
        }
      />
      {/* Background overlay */}
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleCloseModal} // Close modal on background click
        />
      )}
    </BaseCard>
  );
};

export default NoteCard;
