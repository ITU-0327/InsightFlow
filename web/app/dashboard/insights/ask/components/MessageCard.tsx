"use client";
import { useState } from "react";
import { Message } from "../page";
import NoteCard from "../../components/NoteCard";
import { IconLink } from "@tabler/icons-react";

export function MessageCard({
  message,
  index,
}: {
  message: Message;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      key={index}
      className={`p-2 rounded-md mb-2 ${
        message.sender === "user" ? "bg-purple-100 text-right" : "bg-gray-200"
      }`}
    >
      {message.text}
      <div className="m-2 text-sm font-bold">
        {message.sources.length > 0 && (
          <div
            className="text-xs flex items-center gap-1 border bg-gray-50 border-gray-300  shadow-sm p-1 rounded-md hover:cursor-pointer hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            <IconLink size={16} />
            View Source
          </div>
        )}
      </div>
      {isOpen && (
        <div className="flex overflow-scroll max-h-svh">
          {message.sources.length > 0 &&
            message.sources.map((note) => (
              <NoteCard note={note} className="h-min" />
            ))}
        </div>
      )}
    </div>
  );
}
