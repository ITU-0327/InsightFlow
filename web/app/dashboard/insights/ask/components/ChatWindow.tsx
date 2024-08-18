import React from "react";
import { MessageCard } from "./MessageCard";
import { Message } from "../Chatbox";

type ChatWindowProps = {
  messages: Message[];
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 mb-4 bg-white rounded shadow-lg">
      {messages.map((message, index) => (
        <MessageCard key={index} message={message} index={index} />
      ))}
    </div>
  );
};
