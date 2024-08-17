"use client";
import React, { useState } from "react";
import { ragChatAction } from "../actions";
import { getProjects } from "../../actions";
import { useAuth } from "../../hooks/use-auth";
import { InsightNote } from "../insight.model";
import NoteCard from "../components/NoteCard";
import ShinyButton from "@/components/ShinyButton";
import { MessageCard } from "./components/MessageCard";

// Define types for message objects
export type Message = {
  text: string;
  sources: InsightNote[];
  sender: "user" | "bot";
};
const convertToInsightNotes = (sources: Record<string, any>): InsightNote[] => {
  return Object.entries(sources).map(([key, value]) => {
    return {
      note: value.note, // Assuming 'note' refers to the filename
      tags: value.tags, // Assuming no tags are provided; adjust as needed
      fullText: value.note, // Assuming 'fullText' refers to the file path
      source: value.file_name,
    };
  });
};

const Page: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (input.trim() === "") return;

    // Add the user's input as a new message
    const newMessages: Message[] = [
      ...messages,
      { text: input, sources: [], sender: "user" },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Call the ragChatAction to get the response
      const auth = await useAuth();
      const projects = await getProjects(auth?.userId);
      if (projects.length === 0) {
        console.log("No projects found");
        setLoading(false);
        return;
      }

      const projectId = projects[0].id!;
      const response = await ragChatAction(projectId, input);
      // JSON.stringify(response.metadata)
      console.log(response);
      setMessages([
        ...newMessages,
        {
          text: `${response.response}`,
          sources: convertToInsightNotes(response.metadata),
          sender: "bot",
        },
      ]);
    } catch (error) {
      console.error("Error in sending message:", error);
      setMessages([
        ...newMessages,
        {
          text: "Error: Unable to fetch response.",
          sources: [],
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-100 p-10 max-w-[1000px] m-auto rounded-lg shadow-sm">
      {/* Chat display area */}
      <div className="flex-1 overflow-y-auto p-4 mb-4 bg-white rounded shadow-lg">
        {messages.map((message, index) => (
          <MessageCard message={message} index={index} />
        ))}
      </div>

      {/* Input area (chat-like search bar) */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your query..."
          className="flex-1 p-2 rounded-xl border border-gray-300 focus:outline-none focus:border-purple-500"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <ShinyButton
          text={loading ? "Asking..." : "Ask"}
          onClick={handleSend}
          className="p-2 cursor-pointer min-w-[100px]"
        />
      </div>
    </div>
  );
};

export default Page;
