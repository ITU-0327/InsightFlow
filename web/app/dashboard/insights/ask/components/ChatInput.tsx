import React from "react";
import ShinyButton from "@/components/ShinyButton";

type ChatInputProps = {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  loading: boolean;
};

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  loading,
}) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your query..."
        className="flex-1 p-2 rounded-xl border border-gray-300 focus:outline-none focus:border-purple-500"
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />
      <ShinyButton
        text={loading ? "Asking..." : "Ask"}
        onClick={onSend}
        className="p-2 cursor-pointer min-w-[100px]"
      />
    </div>
  );
};
