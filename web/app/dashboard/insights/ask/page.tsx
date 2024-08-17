"use client";
import React, { useState } from "react";
import { ragChatAction } from "../actions";
import { getProjects } from "../../actions";
import { useAuth } from "../../hooks/use-auth";
import { InsightNote } from "../insight.model";
import NoteCard from "../components/NoteCard";
import ShinyButton from "@/components/ShinyButton";
import { MessageCard } from "./components/MessageCard";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";

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
      <ChatWindow messages={messages} />
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
        loading={loading}
      />
    </div>
  );
};

export default Page;
