"use client";
import React, { useState } from "react";
import { ragChatAction } from "../actions";
import { getProjects } from "../../actions";
import { useAuth } from "../../hooks/use-auth";
import { InsightNote } from "../insight.model";
import NoteCard from "../components/NoteCard";

// Define types for message objects
type Message = {
  text: string;
  sources: InsightNote[];
  sender: "user" | "bot";
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
          sources: [],
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
    <div className="flex flex-col h-[600px] bg-gray-100 p-4 max-w-[800px] m-auto rounded-md">
      {/* Chat display area */}
      <div className="flex-1 overflow-y-auto p-2 mb-4 bg-white rounded shadow">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 rounded mb-2 ${
              message.sender === "user"
                ? "bg-purple-100 text-right"
                : "bg-gray-200"
            }`}
          >
            {message.text}
            {message.sources.map((note) => (
              <NoteCard note={note} />
            ))}
          </div>
        ))}
      </div>

      {/* Input area (chat-like search bar) */}
      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your query..."
          className="flex-1 p-2 rounded-l border border-gray-300 focus:outline-none focus:border-blue-500"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="p-2 bg-purple-500 text-white rounded-r hover:bg-purple-600 cursor-pointer min-w-[100px]"
          disabled={loading}
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </div>
    </div>
  );
};

export default Page;
