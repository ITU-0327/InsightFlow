"use client";
import React, { useState } from "react";
import { getProjects } from "../../actions";
import { useAuth } from "../../hooks/use-auth";
import { InsightNote } from "../insight.model";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";
import { cn } from "@/lib/utils";

// Define types for message objects
export type Message = {
  text: string;
  sources: InsightNote[];
  sender: "user" | "bot";
};

const convertToInsightNotes = (sources: Record<string, any>): InsightNote[] => {
  if (!sources) return [];
  return Object.entries(sources).map(([key, value]) => {
    return {
      note: value.note, // Assuming 'note' refers to the filename
      tags: value.tags, // Assuming no tags are provided; adjust as needed
      fullText: value.note, // TODO: replace with text_content
      source: value.file_name,
    };
  });
};

interface ChatBoxProps {
  onSend?: (projectId: string, input: string) => Promise<any>;
  onSendToPersona?: (
    projectId: string,
    input: string,
    personaId: string
  ) => Promise<any>;
  className?: string;
  chatWithPersonaId?: string;
  chatMessages?: Message[];
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  onSend,
  onSendToPersona,
  className,
  chatWithPersonaId,
  chatMessages,
}) => {
  const [messages, setMessages] = useState<Message[]>(chatMessages || []);
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
      // Call the onSend function passed as a prop
      const auth = await useAuth();
      const projects = await getProjects(auth?.userId);
      if (projects.length === 0) {
        console.log("No projects found");
        setLoading(false);
        return;
      }

      const projectId = projects[0].id!;
      let response;
      if (!chatWithPersonaId && onSend) {
        response = await onSend(projectId, input);
      } else {
        response = await onSendToPersona!(projectId, input, chatWithPersonaId!);
      }
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
    <div
      className={cn(
        "flex flex-col h-[600px] bg-gray-100 p-10 max-w-[1000px] m-auto rounded-lg shadow-sm",
        className
      )}
    >
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
